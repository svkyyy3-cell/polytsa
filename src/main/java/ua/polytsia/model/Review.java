package ua.polytsia.model;

/** A customer review. {@code date} is an ISO-8601 date string. */
public record Review(String author, int rating, String date, String text, String pros, String cons, boolean verified) {
}
