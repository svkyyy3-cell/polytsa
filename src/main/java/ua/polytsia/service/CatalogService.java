package ua.polytsia.service;

import ua.polytsia.data.CatalogData;
import ua.polytsia.model.Banner;
import ua.polytsia.model.Category;
import ua.polytsia.model.Product;
import ua.polytsia.model.Stock;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * Read side of the store: categories, product listing with filters and facets, search and product details.
 */
public final class CatalogService {

    public static final Locale UK = Locale.forLanguageTag("uk");

    private final List<Category> categories;
    private final Map<String, Category> categoryBySlug;
    private final List<Product> products;
    private final Map<Integer, Product> productById;
    private final ReviewService reviews;

    /** Ukrainian spellings mapped to the Latin product-name tokens they mean. */
    private static final Map<String, String> ALIASES = Map.ofEntries(
            Map.entry("айфон", "iphone"), Map.entry("iфон", "iphone"), Map.entry("макбук", "macbook"),
            Map.entry("айпад", "ipad"), Map.entry("аймак", "imac"), Map.entry("самсунг", "samsung"),
            Map.entry("сяомі", "xiaomi"), Map.entry("ксіаомі", "xiaomi"), Map.entry("редмі", "redmi"),
            Map.entry("соні", "sony"), Map.entry("сони", "sony"), Map.entry("ейрподс", "airpods"),
            Map.entry("аірподс", "airpods"), Map.entry("плейстейшн", "playstation"), Map.entry("пс5", "ps5"),
            Map.entry("найк", "nike"), Map.entry("лего", "lego"), Map.entry("шанель", "chanel"),
            Map.entry("джбл", "jbl"), Map.entry("епл", "apple"), Map.entry("еппл", "apple"),
            Map.entry("кенон", "canon"), Map.entry("нікон", "nikon"), Map.entry("логітек", "logitech"),
            Map.entry("асус", "asus"), Map.entry("делл", "dell"), Map.entry("дрон", "квадрокоптер"),
            Map.entry("телефон", "смартфон"), Map.entry("ноут", "ноутбук"), Map.entry("годинник", "годинник"),
            Map.entry("телек", "телевізор"), Map.entry("тв", "телевізор"), Map.entry("приставка", "консоль"),
            Map.entry("пилосос", "пилосос"), Map.entry("парфуми", "парфум"), Map.entry("духи", "парфум"));

    public CatalogService(ReviewService reviews) {
        this.reviews = reviews;
        this.categories = CatalogData.categories();
        this.categoryBySlug = categories.stream().collect(Collectors.toMap(Category::slug, c -> c, (a, b) -> a, LinkedHashMap::new));
        this.products = CatalogData.products();
        this.productById = products.stream().collect(Collectors.toMap(Product::id, p -> p));
    }

    public Optional<Product> product(int id) {
        return Optional.ofNullable(productById.get(id));
    }

    public Optional<Category> category(String slug) {
        return Optional.ofNullable(categoryBySlug.get(slug));
    }

    // ------------------------------------------------------------ categories

    /** Category tree: groups with their leaf children and product counts. */
    public List<Map<String, Object>> categoryTree() {
        List<Map<String, Object>> tree = new ArrayList<>();
        for (Category g : categories) {
            if (g.parent() != null) continue;
            List<Map<String, Object>> children = new ArrayList<>();
            for (Category c : categories) {
                if (g.slug().equals(c.parent())) {
                    children.add(categoryView(c));
                }
            }
            Map<String, Object> m = categoryView(g);
            m.put("children", children);
            tree.add(m);
        }
        return tree;
    }

    private Map<String, Object> categoryView(Category c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("slug", c.slug());
        m.put("name", c.name());
        m.put("parent", c.parent());
        m.put("image", c.image());
        m.put("icon", c.icon());
        m.put("count", products.stream().filter(inCategory(c.slug())).count());
        return m;
    }

    private Predicate<Product> inCategory(String slug) {
        Category c = categoryBySlug.get(slug);
        if (c == null) return p -> false;
        if (c.parent() != null) return p -> p.category().equals(slug);
        return p -> {
            Category leaf = categoryBySlug.get(p.category());
            return leaf != null && slug.equals(leaf.parent());
        };
    }

    /** Breadcrumb path for a category slug, from group to leaf. */
    public List<Map<String, Object>> path(String slug) {
        List<Map<String, Object>> out = new ArrayList<>();
        Category c = categoryBySlug.get(slug);
        while (c != null) {
            out.add(0, Map.of("slug", c.slug(), "name", c.name()));
            c = c.parent() == null ? null : categoryBySlug.get(c.parent());
        }
        return out;
    }

    // ------------------------------------------------------------ listing

    /** Filter parameters for a product listing. Null / empty values mean "no constraint". */
    public record Filter(String category, String query, List<String> brands, Integer minPrice, Integer maxPrice,
                         Double minRating, boolean availableOnly, boolean onSale, String sort, int page, int size,
                         List<Integer> ids) {
    }

    public Map<String, Object> list(Filter f) {
        // The base set is everything that matches the scope (category + search),
        // so facets can show counts for options the shopper has not selected yet.
        List<Product> base = products.stream()
                .filter(p -> f.category() == null || inCategory(f.category()).test(p))
                .filter(p -> f.query() == null || matches(p, f.query()))
                .filter(p -> f.ids() == null || f.ids().contains(p.id()))
                .toList();

        Predicate<Product> brandP = p -> f.brands() == null || f.brands().isEmpty() || f.brands().contains(p.brand());
        Predicate<Product> priceP = p -> (f.minPrice() == null || p.price() >= f.minPrice())
                && (f.maxPrice() == null || p.price() <= f.maxPrice());
        Predicate<Product> ratingP = p -> f.minRating() == null || rating(p) >= f.minRating();
        Predicate<Product> stockP = p -> !f.availableOnly() || p.stock().purchasable();
        Predicate<Product> saleP = p -> !f.onSale() || p.onSale();

        List<Product> filtered = base.stream()
                .filter(brandP).filter(priceP).filter(ratingP).filter(stockP).filter(saleP)
                .sorted(comparator(f.sort(), f.ids()))
                .toList();

        int size = Math.max(1, Math.min(f.size(), 60));
        int pages = Math.max(1, (int) Math.ceil(filtered.size() / (double) size));
        int page = Math.max(1, Math.min(f.page(), pages));
        List<Map<String, Object>> items = filtered.stream()
                .skip((long) (page - 1) * size).limit(size).map(this::card).toList();

        Map<String, Object> facets = new LinkedHashMap<>();
        // Each facet counts against all other active filters, but not its own.
        Map<String, Long> brandCounts = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        base.stream().filter(priceP).filter(ratingP).filter(stockP).filter(saleP)
                .forEach(p -> brandCounts.merge(p.brand(), 1L, Long::sum));
        for (Product p : base) brandCounts.putIfAbsent(p.brand(), 0L);
        facets.put("brands", brandCounts.entrySet().stream()
                .map(e -> Map.of("name", e.getKey(), "count", e.getValue())).toList());
        facets.put("priceMin", base.stream().mapToInt(Product::price).min().orElse(0));
        facets.put("priceMax", base.stream().mapToInt(Product::price).max().orElse(0));
        List<Map<String, Object>> ratings = new ArrayList<>();
        for (double r : new double[]{4.8, 4.5, 4.0}) {
            long n = base.stream().filter(brandP).filter(priceP).filter(stockP).filter(saleP)
                    .filter(p -> rating(p) >= r).count();
            ratings.add(Map.of("value", r, "count", n));
        }
        facets.put("ratings", ratings);
        facets.put("available", base.stream().filter(brandP).filter(priceP).filter(ratingP).filter(saleP)
                .filter(p -> p.stock().purchasable()).count());
        facets.put("onSale", base.stream().filter(brandP).filter(priceP).filter(ratingP).filter(stockP)
                .filter(Product::onSale).count());

        // Leaf categories present in the result scope, for the "refine by category" chips.
        Map<String, Long> catCounts = new LinkedHashMap<>();
        for (Category c : categories) {
            if (c.parent() == null) continue;
            long n = base.stream().filter(p -> p.category().equals(c.slug())).count();
            if (n > 0) catCounts.put(c.slug(), n);
        }
        facets.put("categories", catCounts.entrySet().stream()
                .map(e -> Map.of("slug", e.getKey(), "name", categoryBySlug.get(e.getKey()).name(), "count", e.getValue()))
                .toList());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("items", items);
        out.put("total", filtered.size());
        out.put("page", page);
        out.put("pages", pages);
        out.put("facets", facets);
        if (f.category() != null) {
            category(f.category()).ifPresent(c -> {
                out.put("category", categoryView(c));
                out.put("path", path(c.slug()));
            });
        }
        return out;
    }

    private Comparator<Product> comparator(String sort, List<Integer> ids) {
        if (sort == null || sort.isBlank()) {
            if (ids != null) return Comparator.comparingInt(p -> ids.indexOf(p.id()));
            sort = "popular";
        }
        Comparator<Product> available = Comparator.comparing(p -> p.stock() == Stock.OUT);
        Comparator<Product> c = switch (sort) {
            case "cheap" -> Comparator.comparingInt(Product::price);
            case "expensive" -> Comparator.comparingInt(Product::price).reversed();
            case "new" -> Comparator.comparingInt(Product::ageDays);
            case "rating" -> Comparator.comparingDouble(this::rating).reversed()
                    .thenComparing(Comparator.comparingInt(this::reviewCount).reversed());
            case "discount" -> Comparator.comparingInt(Product::discountPercent).reversed();
            default -> Comparator.comparingInt(Product::popularity).reversed();
        };
        // Products that cannot be bought always go to the end of the list.
        return available.thenComparing(c);
    }

    // ------------------------------------------------------------ search

    private String haystack(Product p) {
        Category leaf = categoryBySlug.get(p.category());
        Category group = leaf == null ? null : categoryBySlug.get(leaf.parent());
        return (p.name() + " " + p.brand() + " " + (leaf == null ? "" : leaf.name()) + " "
                + (group == null ? "" : group.name())).toLowerCase(UK);
    }

    private boolean matches(Product p, String query) {
        String hay = haystack(p);
        for (String token : query.toLowerCase(UK).split("[\\s,]+")) {
            if (token.isBlank()) continue;
            String alias = ALIASES.get(token);
            if (alias == null) {
                for (Map.Entry<String, String> e : ALIASES.entrySet()) {
                    if (token.length() >= 3 && e.getKey().startsWith(token)) {
                        alias = e.getValue();
                        break;
                    }
                }
            }
            if (!hay.contains(token) && (alias == null || !hay.contains(alias))) return false;
        }
        return true;
    }

    /** Typeahead suggestions: matching categories and the top matching products. */
    public Map<String, Object> suggest(String q) {
        String query = q == null ? "" : q.trim();
        Map<String, Object> out = new LinkedHashMap<>();
        if (query.length() < 2) {
            out.put("products", List.of());
            out.put("categories", List.of());
            return out;
        }
        List<Product> found = products.stream().filter(p -> matches(p, query))
                .sorted(comparator("popular", null)).toList();
        out.put("products", found.stream().limit(6).map(this::card).toList());
        Map<String, Long> cats = found.stream().collect(Collectors.groupingBy(Product::category, LinkedHashMap::new, Collectors.counting()));
        String lower = query.toLowerCase(UK);
        for (Category c : categories) {
            if (c.parent() != null && c.name().toLowerCase(UK).contains(lower)) cats.putIfAbsent(c.slug(), 0L);
        }
        out.put("categories", cats.keySet().stream().limit(4)
                .map(s -> Map.of("slug", s, "name", categoryBySlug.get(s).name())).toList());
        out.put("total", found.size());
        return out;
    }

    // ------------------------------------------------------------ views

    public double rating(Product p) {
        return reviews.rating(p);
    }

    public int reviewCount(Product p) {
        return reviews.count(p);
    }

    /** Compact product representation used by product cards. */
    public Map<String, Object> card(Product p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.id());
        m.put("slug", p.slug());
        m.put("name", p.name());
        m.put("brand", p.brand());
        m.put("category", p.category());
        m.put("price", p.price());
        m.put("oldPrice", p.onSale() ? p.oldPrice() : null);
        m.put("discount", p.discountPercent());
        m.put("rating", Math.round(rating(p) * 10) / 10.0);
        m.put("reviews", reviewCount(p));
        m.put("stock", p.stock());
        m.put("stockLabel", p.stock().label());
        m.put("image", p.images().get(0));
        m.put("hoverImage", p.images().size() > 1 ? p.images().get(1) : null);
        String badge = null;
        if (p.popularity() >= 90) badge = "top";
        else if (p.ageDays() <= 150) badge = "new";
        m.put("badge", badge);
        return m;
    }

    /** Full product representation for the product page. */
    public Map<String, Object> details(Product p) {
        Map<String, Object> m = card(p);
        m.put("images", p.images());
        m.put("description", p.description());
        m.put("specs", p.specs());
        m.put("path", path(p.category()));
        m.put("ratingHistogram", reviews.histogram(p));
        m.put("delivery", delivery(p));
        m.put("similar", similar(p, 12));
        m.put("installment", p.price() >= 3000 ? (int) Math.ceil(p.price() / 10.0) : null);
        return m;
    }

    public List<Map<String, Object>> similar(Product p, int limit) {
        Category leaf = categoryBySlug.get(p.category());
        String group = leaf == null ? null : leaf.parent();
        return products.stream()
                .filter(o -> o.id() != p.id())
                .filter(o -> o.category().equals(p.category())
                        || (group != null && group.equals(categoryBySlug.get(o.category()).parent())))
                .sorted(Comparator.<Product, Boolean>comparing(o -> !o.category().equals(p.category()))
                        .thenComparing(comparator("popular", null)))
                .limit(limit).map(this::card).toList();
    }

    private List<Map<String, Object>> delivery(Product p) {
        LocalDate today = LocalDate.now();
        boolean free = p.price() >= OrderService.FREE_DELIVERY_FROM;
        List<Map<String, Object>> out = new ArrayList<>();
        out.add(deliveryOption("pickup", "Самовивіз з магазинів «Полиця»", "Безкоштовно", dateLabel(today.plusDays(1))));
        out.add(deliveryOption("branch", "Самовивіз з Нової пошти", free ? "Безкоштовно" : "за тарифами перевізника",
                dateLabel(today.plusDays(1))));
        out.add(deliveryOption("courier", "Кур'єр на вашу адресу", free ? "Безкоштовно" : OrderService.COURIER_COST + " ₴",
                dateLabel(today.plusDays(2))));
        out.add(deliveryOption("ukrposhta", "Укрпошта", "за тарифами перевізника", dateLabel(today.plusDays(3))));
        return out;
    }

    private static Map<String, Object> deliveryOption(String id, String name, String price, String date) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("price", price);
        m.put("date", date);
        return m;
    }

    static String dateLabel(LocalDate d) {
        LocalDate today = LocalDate.now();
        if (d.equals(today.plusDays(1))) return "завтра";
        String dow = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, UK);
        String month = d.getMonth().getDisplayName(TextStyle.FULL, UK);
        return dow + ", " + d.getDayOfMonth() + " " + month;
    }

    // ------------------------------------------------------------ homepage

    public Map<String, Object> home() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("slides", CatalogData.heroSlides());
        m.put("promos", CatalogData.promoTiles());
        m.put("categories", categoryTree());
        m.put("featured", ids(46, 8, 24, 21, 1, 50, 34, 11, 13, 25, 39, 47).stream().map(this::card).toList());
        m.put("bestsellers", products.stream().sorted(comparator("popular", null)).limit(12).map(this::card).toList());
        m.put("discounts", products.stream().filter(Product::onSale).filter(p -> p.stock().purchasable())
                .sorted(comparator("discount", null)).limit(12).map(this::card).toList());
        m.put("recommended", ids(27, 31, 6, 67, 65, 33, 17, 55, 62, 26, 37, 52).stream().map(this::card).toList());
        m.put("brands", brands());
        return m;
    }

    private List<Product> ids(int... ids) {
        List<Product> l = new ArrayList<>();
        for (int id : ids) product(id).ifPresent(l::add);
        return l;
    }

    public List<Map<String, Object>> brands() {
        Map<String, Long> counts = products.stream().collect(Collectors.groupingBy(Product::brand, Collectors.counting()));
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
                .limit(12)
                .map(e -> Map.<String, Object>of("name", e.getKey(), "count", e.getValue()))
                .toList();
    }
}
