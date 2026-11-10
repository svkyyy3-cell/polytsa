package ua.polytsia.web;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Serves the single-page frontend from the classpath {@code /static} folder.
 * Any path that is not a file falls back to {@code index.html}, so client-side routes work on reload.
 */
public final class StaticHandler implements HttpHandler {

    private static final Map<String, String> TYPES = Map.of(
            "html", "text/html; charset=utf-8",
            "css", "text/css; charset=utf-8",
            "js", "text/javascript; charset=utf-8",
            "json", "application/json; charset=utf-8",
            "svg", "image/svg+xml",
            "jpg", "image/jpeg",
            "png", "image/png",
            "webp", "image/webp",
            "ico", "image/x-icon",
            "woff2", "font/woff2");

    @Override
    public void handle(HttpExchange ex) throws IOException {
        try {
            if (!"GET".equals(ex.getRequestMethod()) && !"HEAD".equals(ex.getRequestMethod())) {
                ex.sendResponseHeaders(405, -1);
                return;
            }
            String path = ex.getRequestURI().getPath();
            if (path.contains("..")) {
                ex.sendResponseHeaders(400, -1);
                return;
            }
            String ext = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1).toLowerCase() : "";
            byte[] bytes = TYPES.containsKey(ext) ? read("/static" + path) : null;
            String type;
            if (bytes != null) {
                type = TYPES.get(ext);
                // Images never change; code and styles are revalidated on each load.
                ex.getResponseHeaders().set("Cache-Control",
                        type.startsWith("image/") || type.startsWith("font/") ? "public, max-age=604800" : "no-cache");
            } else if (!ext.isEmpty()) {
                byte[] msg = "Not found".getBytes(StandardCharsets.UTF_8);
                ex.sendResponseHeaders(404, msg.length);
                try (OutputStream os = ex.getResponseBody()) {
                    os.write(msg);
                }
                return;
            } else {
                bytes = read("/static/index.html");
                type = TYPES.get("html");
                ex.getResponseHeaders().set("Cache-Control", "no-cache");
            }
            if (bytes == null) {
                ex.sendResponseHeaders(500, -1);
                return;
            }
            ex.getResponseHeaders().set("Content-Type", type);
            ex.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
            if ("HEAD".equals(ex.getRequestMethod())) {
                ex.sendResponseHeaders(200, -1);
                return;
            }
            ex.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = ex.getResponseBody()) {
                os.write(bytes);
            }
        } finally {
            ex.close();
        }
    }

    private static byte[] read(String resource) throws IOException {
        try (InputStream in = StaticHandler.class.getResourceAsStream(resource)) {
            return in == null ? null : in.readAllBytes();
        }
    }
}
