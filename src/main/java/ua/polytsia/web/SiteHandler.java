package ua.polytsia.web;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import ua.polytsia.data.CatalogData;
import ua.polytsia.model.Category;
import ua.polytsia.model.Product;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

/**
 * Files that search engines look for at the site root: {@code /robots.txt} and {@code /sitemap.xml}.
 *
 * <p>The public address is taken from the {@code SITE_URL} environment variable when it is set
 * (for example {@code https://polytsia.com.ua}); otherwise it is worked out from the request,
 * which is correct behind hosting proxies such as Render's.
 */
public final class SiteHandler implements HttpHandler {

    private static final List<String> INFO_PAGES = List.of("delivery", "payment", "credit", "warranty", "returns", "about", "contacts");

    @Override
    public void handle(HttpExchange ex) throws IOException {
        try {
            String path = ex.getRequestURI().getPath();
            String base = baseUrl(ex);
            switch (path) {
                case "/robots.txt" -> send(ex, "text/plain; charset=utf-8", robots(base));
                case "/sitemap.xml" -> send(ex, "application/xml; charset=utf-8", sitemap(base));
                default -> ex.sendResponseHeaders(404, -1);
            }
        } finally {
            ex.close();
        }
    }

    static String baseUrl(HttpExchange ex) {
        String configured = System.getenv("SITE_URL");
        if (configured != null && !configured.isBlank()) return configured.replaceAll("/+$", "");
        String proto = ex.getRequestHeaders().getFirst("X-Forwarded-Proto");
        String host = ex.getRequestHeaders().getFirst("X-Forwarded-Host");
        if (host == null) host = ex.getRequestHeaders().getFirst("Host");
        if (host == null || !host.matches("[A-Za-z0-9.:\\[\\]-]+")) host = "localhost";
        if (proto == null || !(proto.equals("http") || proto.equals("https"))) proto = "http";
        return proto + "://" + host;
    }

    private static String robots(String base) {
        return """
                User-agent: *
                Disallow: /cart
                Disallow: /checkout
                Disallow: /order/
                Disallow: /account
                Disallow: /wishlist
                Disallow: /api/

                Sitemap: %s/sitemap.xml
                """.formatted(base);
    }

    private static String sitemap(String base) {
        String today = LocalDate.now().toString();
        StringBuilder sb = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
                .append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        url(sb, base + "/", today, "1.0");
        url(sb, base + "/catalog", today, "0.8");
        for (Category c : CatalogData.categories()) url(sb, base + "/catalog/" + c.slug(), today, "0.8");
        for (Product p : CatalogData.products()) url(sb, base + "/product/" + p.id(), today, "0.7");
        for (String s : INFO_PAGES) url(sb, base + "/info/" + s, today, "0.3");
        return sb.append("</urlset>\n").toString();
    }

    private static void url(StringBuilder sb, String loc, String date, String priority) {
        sb.append("  <url><loc>").append(loc.replace("&", "&amp;")).append("</loc><lastmod>").append(date)
                .append("</lastmod><priority>").append(priority).append("</priority></url>\n");
    }

    private static void send(HttpExchange ex, String type, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", type);
        ex.getResponseHeaders().set("Cache-Control", "public, max-age=3600");
        ex.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }
}
