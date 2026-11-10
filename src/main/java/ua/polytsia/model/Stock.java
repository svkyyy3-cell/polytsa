package ua.polytsia.model;

/** Availability state of a product. */
public enum Stock {
    IN_STOCK("Є в наявності"),
    LOW("Закінчується"),
    OUT("Немає в наявності");

    private final String label;

    Stock(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public boolean purchasable() {
        return this != OUT;
    }
}
