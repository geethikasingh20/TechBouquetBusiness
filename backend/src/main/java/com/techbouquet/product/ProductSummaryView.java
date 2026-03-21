package com.techbouquet.product;

import java.math.BigDecimal;

public interface ProductSummaryView {
    Long getId();
    String getName();
    BigDecimal getPrice();
    BigDecimal getRating();
    String getCategory();
    String getSubcategory();
    String getImageUrl();
}
