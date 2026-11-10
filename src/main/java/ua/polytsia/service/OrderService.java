package ua.polytsia.service;

import ua.polytsia.model.Product;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Pattern;

/**
 * Cart pricing and order placement. Prices always come from the catalog, never from the client.
 */
public final class OrderService {

    public static final int FREE_DELIVERY_FROM = 1000;
    public static final int BRANCH_COST = 79;
    public static final int COURIER_COST = 129;
    public static final int UKRPOSHTA_COST = 55;
    public static final int MAX_QTY = 10;

    private static final Pattern PHONE = Pattern.compile("^\\+?380\\d{9}$");
    private static final Map<String, String> DELIVERY = Map.of(
            "pickup", "Самовивіз з магазину «Полиця»",
            "branch", "Нова пошта — відділення або поштомат",
            "courier", "Кур'єр на адресу",
            "ukrposhta", "Укрпошта");
    private static final Map<String, String> PAYMENT = Map.of(
            "cod", "Оплата під час отримання",
            "card", "Карткою онлайн",
            "installment", "Розстрочка 0% (10 платежів)");

    private final CatalogService catalog;
    private final Map<String, Map<String, Object>> orders = new ConcurrentHashMap<>();

    public OrderService(CatalogService catalog) {
        this.catalog = catalog;
    }

    /** A requested cart line from the client. */
    public record Line(int productId, int qty) {
    }

    /** Prices a cart. Unknown products are dropped, quantities are clamped. */
    public Map<String, Object> quote(List<Line> lines, String delivery) {
        List<Map<String, Object>> items = new ArrayList<>();
        int subtotal = 0;
        int savings = 0;
        int count = 0;
        boolean hasUnavailable = false;
        for (Line l : lines) {
            Optional<Product> op = catalog.product(l.productId());
            if (op.isEmpty()) continue;
            Product p = op.get();
            int qty = Math.max(1, Math.min(MAX_QTY, l.qty()));
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("product", catalog.card(p));
            item.put("qty", qty);
            item.put("available", p.stock().purchasable());
            item.put("lineTotal", p.price() * qty);
            items.add(item);
            if (p.stock().purchasable()) {
                subtotal += p.price() * qty;
                count += qty;
                if (p.onSale()) savings += (p.oldPrice() - p.price()) * qty;
            } else {
                hasUnavailable = true;
            }
        }
        int deliveryCost = deliveryCost(delivery, subtotal);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("items", items);
        out.put("count", count);
        out.put("subtotal", subtotal);
        out.put("savings", savings);
        out.put("delivery", delivery);
        out.put("deliveryCost", deliveryCost);
        out.put("total", subtotal + deliveryCost);
        out.put("freeDeliveryFrom", FREE_DELIVERY_FROM);
        out.put("hasUnavailable", hasUnavailable);
        out.put("maxQty", MAX_QTY);
        return out;
    }

    static int deliveryCost(String delivery, int subtotal) {
        if (delivery == null || "pickup".equals(delivery) || subtotal == 0) return 0;
        if (subtotal >= FREE_DELIVERY_FROM && !"ukrposhta".equals(delivery)) return 0;
        return switch (delivery) {
            case "courier" -> COURIER_COST;
            case "ukrposhta" -> UKRPOSHTA_COST;
            default -> BRANCH_COST;
        };
    }

    /** Result of placing an order: either the order or field errors. */
    public record Result(Map<String, Object> order, Map<String, String> errors) {
    }

    public Result place(List<Line> lines, Map<String, Object> customer, String delivery, String payment,
                        Map<String, Object> address) {
        Map<String, String> errors = new LinkedHashMap<>();
        String name = str(customer.get("name"));
        String surname = str(customer.get("surname"));
        String phone = str(customer.get("phone")).replaceAll("[\\s()-]", "");
        String email = str(customer.get("email"));
        String city = str(address.get("city"));
        String point = str(address.get("point"));

        if (name.length() < 2) errors.put("name", "Вкажіть ім'я");
        if (surname.length() < 2) errors.put("surname", "Вкажіть прізвище");
        if (!PHONE.matcher(phone).matches()) errors.put("phone", "Вкажіть номер у форматі +380 XX XXX XX XX");
        if (!email.isEmpty() && !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) errors.put("email", "Перевірте email");
        if (delivery == null || !DELIVERY.containsKey(delivery)) errors.put("delivery", "Оберіть спосіб доставки");
        if (payment == null || !PAYMENT.containsKey(payment)) errors.put("payment", "Оберіть спосіб оплати");
        if (city.length() < 2) errors.put("city", "Вкажіть місто");
        if (!"pickup".equals(delivery) && point.length() < 2) {
            errors.put("point", "courier".equals(delivery) ? "Вкажіть адресу доставки" : "Вкажіть відділення");
        }

        Map<String, Object> quote = quote(lines, delivery);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) quote.get("items");
        List<Map<String, Object>> buyable = items.stream().filter(i -> Boolean.TRUE.equals(i.get("available"))).toList();
        if (buyable.isEmpty()) errors.put("cart", "У кошику немає товарів, доступних для замовлення");
        if ("installment".equals(payment) && (int) quote.get("subtotal") < 3000) {
            errors.put("payment", "Розстрочка доступна для замовлень від 3 000 ₴");
        }
        if (!errors.isEmpty()) return new Result(null, errors);

        String number;
        do {
            number = String.valueOf(ThreadLocalRandom.current().nextLong(100_000_000L, 999_999_999L));
        } while (orders.containsKey(number));

        Map<String, Object> order = new LinkedHashMap<>();
        order.put("number", number);
        order.put("createdAt", LocalDateTime.now().withNano(0).toString());
        order.put("status", "Прийнято");
        order.put("customer", Map.of("name", name, "surname", surname, "phone", phone, "email", email));
        order.put("delivery", Map.of("method", delivery, "label", DELIVERY.get(delivery), "city", city,
                "point", point, "date", CatalogService.dateLabel(LocalDate.now().plusDays("courier".equals(delivery) ? 2 : 1))));
        order.put("payment", Map.of("method", payment, "label", PAYMENT.get(payment)));
        order.put("items", buyable);
        order.put("subtotal", quote.get("subtotal"));
        order.put("savings", quote.get("savings"));
        order.put("deliveryCost", quote.get("deliveryCost"));
        order.put("total", quote.get("total"));
        orders.put(number, order);
        return new Result(order, null);
    }

    public Optional<Map<String, Object>> order(String number) {
        return Optional.ofNullable(orders.get(number));
    }

    private static String str(Object o) {
        return o == null ? "" : o.toString().trim();
    }
}
