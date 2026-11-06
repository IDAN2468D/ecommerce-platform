package com.company.subscription.domain;

public enum BillingInterval {
    WEEKLY(7, 10),
    BI_WEEKLY(14, 12),
    MONTHLY(30, 15),
    QUARTERLY(90, 18),
    ANNUAL(365, 20);

    private final int days;
    private final int defaultDiscountPercent;

    BillingInterval(int days, int defaultDiscountPercent) {
        this.days = days;
        this.defaultDiscountPercent = defaultDiscountPercent;
    }

    public int getDays() {
        return days;
    }

    public int getDefaultDiscountPercent() {
        return defaultDiscountPercent;
    }
}
