package ua.polytsia.web;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import ua.polytsia.model.Product;
import ua.polytsia.service.CatalogService;
import ua.polytsia.service.OrderService;
import ua.polytsia.service.ReviewService;
import ua.polytsia.util.Json;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * JSON API under {@code /api}.
 *
 * <pre>
 * GET  /api/home                         homepage sections
 * GET  /api/categories                   category tree
 * GET  /api/products?...                 listing with filters, sorting, paging and facets
 * GET  /api/products/{id}                product details
 * GET  /api/products/{id}/reviews?page=  reviews page
 * POST /api/products/{id}/reviews        submit a review
 * GET  /api/search/suggest?q=            typeahead
 * POST /api/cart/quote                   price a cart
 * POST /api/orders                       place an order
 * GET  /api/orders/{number}              order details
 * </pre>
 */
public final class ApiHandler implements HttpHandler {

    private static final Logger LOG = Logger.getLogger(ApiHandler.class.getName());
    private static final Pattern PRODUCT = Pattern.compile("^/api/products/(\\d+)$");
    private static final Pattern REVIEWS = Pattern.compile("^/api/products/(\\d+)/reviews$");
    private static final Pattern ORDER = Pattern.compile("^/api/orders/(\\d+)$");
    private static final int MAX_BODY = 64 * 1024;

    private final CatalogService catalog;
    private final ReviewService reviews;
    private final OrderService orders;

    public ApiHandler(CatalogService catalog, ReviewService reviews, OrderService orders) {
        this.catalog = catalog;
        this.reviews = reviews;
        this.orders = orders;
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        try {
            route(ex);
        } catch (BadRequest e) {
            send(ex, 400, Map.of("error", e.getMessage()));
        } catch (Exception e) {
            LOG.log(Level.SEVERE, "API error on " + ex.getRequestURI(), e);
            send(ex, 500, Map.of("error", "Внутрішня помилка сервера"));
        } finally {
            ex.close();
        }
    }

    private void route(HttpExchange ex) throws IOException {
        String path = ex.getRequestURI().getPath();
        String method = ex.getRequestMethod();
        Map<String, String> q = query(ex.getRequestURI().getRawQuery());
        Matcher m;

        if ("GET".equals(method)) {
            switch (path) {
                case "/api/home" -> {
                    send(ex, 200, catalog.home());
                    return;
                }
                case "/api/categories" -> {
                    send(ex, 200, catalog.categoryTree());
                    return;
                }
                case "/api/products" -> {
                    send(ex, 200, catalog.list(filter(q)));
                    return;
                }
                case "/api/search/suggest" -> {
                    send(ex, 200, catalog.suggest(q.get("q")));
                    return;
                }
                case "/api/health" -> {
                    send(ex, 200, Map.of("status", "ok"));
                    return;
                }
                case "/api/config" -> {
                    // DEMO_MODE=false hides the "demo store" banner once real content is in place.
                    send(ex, 200, Map.of("demo", !"false".equalsIgnoreCase(System.getenv("DEMO_MODE"))));
                    return;
                }
                default -> {
                }
            }
            if ((m = PRODUCT.matcher(path)).matches()) {
                Product p = productOr404(ex, m.group(1));
                if (p != null) send(ex, 200, catalog.details(p));
                return;
            }
            if ((m = REVIEWS.matcher(path)).matches()) {
                Product p = productOr404(ex, m.group(1));
                if (p != null) send(ex, 200, reviews.page(p, intParam(q, "page", 1)));
                return;
            }
            if ((m = ORDER.matcher(path)).matches()) {
                var order = orders.order(m.group(1));
                if (order.isPresent()) send(ex, 200, order.get());
                else send(ex, 404, Map.of("error", "Замовлення не знайдено"));
                return;
            }
        } else if ("POST".equals(method)) {
            if ((m = REVIEWS.matcher(path)).matches()) {
                Product p = productOr404(ex, m.group(1));
                if (p == null) return;
                Map<String, Object> b = body(ex);
                String err = reviews.submit(p, str(b.get("author")), (int) num(b.get("rating")), str(b.get("text")),
                        str(b.get("pros")), str(b.get("cons")));
                if (err != null) {
                    send(ex, 422, Map.of("error", err));
                } else {
                    Map<String, Object> out = new LinkedHashMap<>(reviews.page(p, 1));
                    out.put("rating", Math.round(reviews.rating(p) * 10) / 10.0);
                    out.put("histogram", reviews.histogram(p));
                    send(ex, 201, out);
                }
                return;
            }
            switch (path) {
                case "/api/cart/quote" -> {
                    Map<String, Object> b = body(ex);
                    send(ex, 200, orders.quote(lines(b.get("items")), str(b.get("delivery"))));
                    return;
                }
                case "/api/orders" -> {
                    Map<String, Object> b = body(ex);
                    OrderService.Result r = orders.place(lines(b.get("items")), map(b.get("customer")),
                            str(b.get("delivery")), str(b.get("payment")), map(b.get("address")));
                    if (r.errors() != null) send(ex, 422, Map.of("error", "Перевірте дані замовлення", "fields", r.errors()));
                    else send(ex, 201, r.order());
                    return;
                }
                default -> {
                }
            }
        } else {
            send(ex, 405, Map.of("error", "Метод не підтримується"));
            return;
        }
        send(ex, 404, Map.of("error", "Не знайдено"));
    }

    // ------------------------------------------------------------ helpers

    private Product productOr404(HttpExchange ex, String id) throws IOException {
        try {
            var p = catalog.product(Integer.parseInt(id));
            if (p.isPresent()) return p.get();
        } catch (NumberFormatException ignored) {
            // fall through to 404
        }
        send(ex, 404, Map.of("error", "Товар не знайдено"));
        return null;
    }

    private CatalogService.Filter filter(Map<String, String> q) {
        List<String> brands = list(q.get("brand"));
        List<Integer> ids = null;
        if (q.containsKey("ids")) {
            ids = new ArrayList<>();
            for (String s : list(q.get("ids"))) {
                try {
                    ids.add(Integer.parseInt(s));
                } catch (NumberFormatException ignored) {
                    // skip malformed id
                }
            }
        }
        String query = q.get("q");
        String category = q.get("category");
        return new CatalogService.Filter(
                category == null || category.isBlank() ? null : category,
                query == null || query.isBlank() ? null : query.trim(),
                brands.isEmpty() ? null : brands,
                q.containsKey("minPrice") ? intParam(q, "minPrice", 0) : null,
                q.containsKey("maxPrice") ? intParam(q, "maxPrice", Integer.MAX_VALUE) : null,
                q.containsKey("rating") ? doubleParam(q, "rating") : null,
                "1".equals(q.get("available")),
                "1".equals(q.get("onSale")),
                q.get("sort"),
                intParam(q, "page", 1),
                intParam(q, "size", 24),
                ids);
    }

    private static List<String> list(String v) {
        if (v == null || v.isBlank()) return List.of();
        return Arrays.stream(v.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private static int intParam(Map<String, String> q, String k, int def) {
        try {
            return q.containsKey(k) ? Integer.parseInt(q.get(k).trim()) : def;
        } catch (NumberFormatException e) {
            throw new BadRequest("Некоректний параметр " + k);
        }
    }

    private static double doubleParam(Map<String, String> q, String k) {
        try {
            return Double.parseDouble(q.get(k).trim());
        } catch (NumberFormatException e) {
            throw new BadRequest("Некоректний параметр " + k);
        }
    }

    private static Map<String, String> query(String raw) {
        Map<String, String> m = new HashMap<>();
        if (raw == null) return m;
        for (String pair : raw.split("&")) {
            if (pair.isEmpty()) continue;
            int i = pair.indexOf('=');
            String k = URLDecoder.decode(i < 0 ? pair : pair.substring(0, i), StandardCharsets.UTF_8);
            String v = i < 0 ? "" : URLDecoder.decode(pair.substring(i + 1), StandardCharsets.UTF_8);
            m.put(k, v);
        }
        return m;
    }

    private static Map<String, Object> body(HttpExchange ex) throws IOException {
        try (InputStream in = ex.getRequestBody()) {
            byte[] bytes = in.readNBytes(MAX_BODY + 1);
            if (bytes.length > MAX_BODY) throw new BadRequest("Запит завеликий");
            Object parsed = Json.parse(new String(bytes, StandardCharsets.UTF_8));
            return map(parsed);
        } catch (IllegalArgumentException e) {
            throw new BadRequest("Некоректний JSON");
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> map(Object o) {
        return o instanceof Map<?, ?> m ? (Map<String, Object>) m : Map.of();
    }

    private static List<OrderService.Line> lines(Object o) {
        List<OrderService.Line> out = new ArrayList<>();
        if (o instanceof List<?> l) {
            for (Object item : l) {
                Map<String, Object> m = map(item);
                out.add(new OrderService.Line((int) num(m.get("id")), (int) num(m.get("qty"))));
            }
        }
        return out;
    }

    private static double num(Object o) {
        if (o instanceof Number n) return n.doubleValue();
        try {
            return o == null ? 0 : Double.parseDouble(o.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private static String str(Object o) {
        return o == null ? null : Objects.toString(o);
    }

    static void send(HttpExchange ex, int status, Object body) throws IOException {
        byte[] bytes = Json.write(body).getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        ex.getResponseHeaders().set("Cache-Control", "no-store");
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static final class BadRequest extends RuntimeException {
        private static final long serialVersionUID = 1L;

        BadRequest(String message) {
            super(message);
        }
    }
}
