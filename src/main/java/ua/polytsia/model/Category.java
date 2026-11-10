package ua.polytsia.model;

/**
 * Catalog category. Top-level groups have a null parent; leaf categories point to their group.
 */
public record Category(String slug, String name, String parent, String image, String icon) {
}
