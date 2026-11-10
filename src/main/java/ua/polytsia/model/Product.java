package ua.polytsia.model;

import java.util.List;

/**
 * Immutable catalog product.
 *
 * @param oldPrice    previous price in UAH, or 0 when the product is not discounted
 * @param baseRating  aggregated rating before reviews submitted on the site
 * @param baseReviews number of reviews before reviews submitted on the site
 * @param popularity  sales rank weight; higher sells better
 * @param ageDays     days since the product appeared in the catalog (for "new" sorting)
 */
public record Product(
        int id,
        String slug,
        String name,
        String brand,
        String category,
        int price,
        int oldPrice,
        double baseRating,
        int baseReviews,
        Stock stock,
        List<String> images,
        String description,
        List<Spec> specs,
        int popularity,
        int ageDays) {

    public boolean onSale() {
        return oldPrice > price;
    }

    public int discountPercent() {
        return onSale() ? (int) Math.round((oldPrice - price) * 100.0 / oldPrice) : 0;
    }
}
