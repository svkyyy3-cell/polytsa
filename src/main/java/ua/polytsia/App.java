package ua.polytsia;

import com.sun.net.httpserver.HttpServer;
import ua.polytsia.service.CatalogService;
import ua.polytsia.service.OrderService;
import ua.polytsia.service.ReviewService;
import ua.polytsia.web.ApiHandler;
import ua.polytsia.web.SiteHandler;
import ua.polytsia.web.StaticHandler;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

/**
 * Entry point. Starts the store on {@code PORT} (default 8080) using the JDK's built-in HTTP server.
 */
public final class App {

    private App() {
    }

    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));

        ReviewService reviews = new ReviewService();
        CatalogService catalog = new CatalogService(reviews);
        OrderService orders = new OrderService(catalog);

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/", new ApiHandler(catalog, reviews, orders));
        SiteHandler site = new SiteHandler();
        server.createContext("/robots.txt", site);
        server.createContext("/sitemap.xml", site);
        server.createContext("/", new StaticHandler());
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();
        System.out.println("Polytsia store is running at http://localhost:" + port);
    }
}
