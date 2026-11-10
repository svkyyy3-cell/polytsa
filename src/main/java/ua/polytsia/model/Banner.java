package ua.polytsia.model;

/** Homepage promotional slide or tile. {@code theme} is one of: green, dark, light, mint. */
public record Banner(String title, String subtitle, String cta, String link, String image, String theme, String label) {
}
