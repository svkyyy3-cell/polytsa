package ua.polytsia.service;

import ua.polytsia.model.Product;
import ua.polytsia.model.Review;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Product reviews.
 *
 * <p>Each product ships with an aggregated rating and review count. The historical reviews behind those numbers
 * are generated deterministically from the product id, so any page of reviews is stable across restarts
 * and consistent with the rating histogram. Reviews submitted on the site are kept in memory and shown first.
 */
public final class ReviewService {

    public static final int PAGE_SIZE = 5;

    private final Map<Integer, List<Review>> submitted = new ConcurrentHashMap<>();

    private static final String[] NAMES = {
            "Олександр", "Марина", "Андрій", "Ірина", "Дмитро", "Олена", "Сергій", "Наталія", "Тарас", "Юлія",
            "Максим", "Оксана", "Богдан", "Катерина", "Віталій", "Анастасія", "Роман", "Світлана", "Ігор", "Христина",
            "Володимир", "Тетяна", "Євген", "Дарина", "Остап", "Софія", "Назар", "Людмила", "Артем", "Вікторія"};

    private static final String[] SURNAME_INITIALS = {"К.", "М.", "П.", "Ш.", "Б.", "Л.", "Г.", "Т.", "С.", "Д.", "Р.", "В."};

    private static final String[][] TEXTS = {
            // 1 star
            {"Розчарований. Через тиждень користування з'явилися проблеми, довелося оформлювати повернення. Магазин повернув гроші без питань, але від товару очікував більшого.",
                    "Не відповідає опису, якість значно гірша, ніж очікував за такі гроші."},
            // 2 stars
            {"Є суттєві недоліки, які в огляді не згадують. За цю ціну можна знайти щось краще.",
                    "Загалом працює, але дрібні недоліки дратують щодня. Друге таке не купив би."},
            // 3 stars
            {"Нормально, але без вау-ефекту. За свої гроші — середньо, відмінну оцінку поставити не можу.",
                    "Свої функції виконує, проте є нюанси. Якщо буде знижка — можна брати.",
                    "Посередньо. Деякі речі зроблені добре, деякі — не дуже. Повертати не буду."},
            // 4 stars
            {"Хороший товар, користуюсь уже місяць. Є дрібні зауваження, але загалом задоволений покупкою.",
                    "Все працює як треба, якість гарна. Мінус бал за ціну — могло б бути трохи дешевше.",
                    "Задоволений, рекомендую. Доставка Новою поштою прийшла на наступний день.",
                    "Добра річ за свої гроші. Трохи довелося розбиратися з налаштуваннями, але далі все чудово."},
            // 5 stars
            {"Чудова покупка! Все працює бездоганно, якість на висоті. Окреме дякую магазину за швидку доставку і акуратне пакування.",
                    "Брав по акції — дуже задоволений. Оригінал, офіційна гарантія, все як в описі.",
                    "Користуюсь кілька місяців — жодного нарікання. Однозначно рекомендую друзям.",
                    "Перевершило очікування. Довго обирав між кількома варіантами і не пошкодував.",
                    "Все супер! Замовив увечері — наступного дня вже забрав у відділенні. Товар відмінний.",
                    "Якість відмінна, виглядає ще краще, ніж на фото. Ціна приємно здивувала."}};

    private static final String[] PROS = {"Якість збірки", "Швидка доставка", "Ціна", "Зовнішній вигляд", "Зручність",
            "Надійність", "Офіційна гарантія", "Комплектація"};
    private static final String[] CONS = {"Ціна могла б бути нижчою", "Немає в комплекті чохла", "Маркий корпус",
            "Немає", "Трохи важкий", "Коротка інструкція"};

    /** Share of reviews for each star value (index 0 = 1 star) that yields the product's base rating. */
    public static double[] shares(double rating) {
        double[] w = new double[5];
        double sum = 0;
        for (int k = 1; k <= 5; k++) {
            w[k - 1] = Math.exp(-Math.pow(k - rating, 2) * 1.8);
            sum += w[k - 1];
        }
        for (int k = 0; k < 5; k++) w[k] /= sum;
        return w;
    }

    public int count(Product p) {
        return p.baseReviews() + submitted.getOrDefault(p.id(), List.of()).size();
    }

    public double rating(Product p) {
        List<Review> own = submitted.getOrDefault(p.id(), List.of());
        double total = p.baseRating() * p.baseReviews();
        for (Review r : own) total += r.rating();
        int n = p.baseReviews() + own.size();
        return n == 0 ? 0 : total / n;
    }

    /** Number of reviews per star value, 5 stars first. */
    public List<Map<String, Object>> histogram(Product p) {
        double[] s = shares(p.baseRating());
        int[] counts = new int[5];
        int assigned = 0;
        for (int k = 0; k < 5; k++) {
            counts[k] = (int) Math.floor(s[k] * p.baseReviews());
            assigned += counts[k];
        }
        counts[4] += p.baseReviews() - assigned;
        for (Review r : submitted.getOrDefault(p.id(), List.of())) counts[r.rating() - 1]++;
        List<Map<String, Object>> out = new ArrayList<>();
        for (int k = 5; k >= 1; k--) out.add(Map.of("stars", k, "count", counts[k - 1]));
        return out;
    }

    public Map<String, Object> page(Product p, int page) {
        List<Review> own = submitted.getOrDefault(p.id(), List.of());
        int total = count(p);
        int pages = Math.max(1, (int) Math.ceil(total / (double) PAGE_SIZE));
        int pg = Math.max(1, Math.min(page, pages));
        List<Review> items = new ArrayList<>();
        for (int i = (pg - 1) * PAGE_SIZE; i < Math.min(total, pg * PAGE_SIZE); i++) {
            items.add(i < own.size() ? own.get(own.size() - 1 - i) : generated(p, i - own.size()));
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("items", items);
        out.put("page", pg);
        out.put("pages", pages);
        out.put("total", total);
        return out;
    }

    private Review generated(Product p, int index) {
        Random rnd = new Random(p.id() * 100_003L + index * 7919L);
        double[] s = shares(p.baseRating());
        double roll = rnd.nextDouble();
        int stars = 5;
        double acc = 0;
        for (int k = 4; k >= 0; k--) {
            acc += s[k];
            if (roll < acc) {
                stars = k + 1;
                break;
            }
        }
        String[] pool = TEXTS[stars - 1];
        String name = NAMES[rnd.nextInt(NAMES.length)] + " " + SURNAME_INITIALS[rnd.nextInt(SURNAME_INITIALS.length)];
        // Older reviews further down the list: roughly a few days apart, never in the future.
        LocalDate date = LocalDate.now().minusDays(1 + index * 3L + rnd.nextInt(3));
        String pros = stars >= 3 ? PROS[rnd.nextInt(PROS.length)] + ", " + PROS[rnd.nextInt(PROS.length)].toLowerCase(CatalogService.UK) : null;
        String cons = stars <= 4 || rnd.nextBoolean() ? CONS[rnd.nextInt(CONS.length)] : null;
        if (pros != null && pros.split(", ")[0].equalsIgnoreCase(pros.split(", ")[1])) pros = pros.split(", ")[0];
        return new Review(name, stars, date.toString(), pool[rnd.nextInt(pool.length)], pros, cons, rnd.nextInt(10) < 8);
    }

    /** Validates and stores a new review. Returns an error message, or null on success. */
    public String submit(Product p, String author, int rating, String text, String pros, String cons) {
        String a = author == null ? "" : author.trim();
        String t = text == null ? "" : text.trim();
        if (rating < 1 || rating > 5) return "Оцініть товар від 1 до 5 зірок";
        if (a.length() < 2 || a.length() > 60) return "Вкажіть ваше ім'я";
        if (t.length() < 10) return "Відгук має містити щонайменше 10 символів";
        if (t.length() > 2000) return "Відгук задовгий (максимум 2000 символів)";
        submitted.computeIfAbsent(p.id(), k -> new CopyOnWriteArrayList<>())
                .add(new Review(a, rating, LocalDate.now().toString(), t, blankToNull(pros), blankToNull(cons), false));
        return null;
    }

    private static String blankToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t.length() > 300 ? t.substring(0, 300) : t;
    }
}
