package com.techbouquet.product;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ProductSeeder implements CommandLineRunner {
    private final ProductRepository productRepository;

    public ProductSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }

        seedProduct(
                "Sunrise Rose Bouquet",
                "Fresh roses with baby breath and greens.",
                new BigDecimal("1299"),
                "Bouquets",
                "Fresh Flowers",
                List.of(
                        "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedProduct(
                "Pastel Tulip Wrap",
                "Soft pastel tulips in kraft wrap.",
                new BigDecimal("999"),
                "Bouquets",
                "Fresh Flowers",
                List.of(
                        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedProduct(
                "Peace Lily Plant",
                "Low maintenance indoor plant.",
                new BigDecimal("799"),
                "Plants",
                "Decoration Plants",
                List.of(
                        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedProduct(
                "Celebration Gift Hamper",
                "Snacks, chocolates, and a greeting card.",
                new BigDecimal("1599"),
                "Gift Hampers",
                "Gift Hampers",
                List.of(
                        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedProduct(
                "Chocolate Truffle Cake",
                "Rich chocolate cake for celebrations.",
                new BigDecimal("899"),
                "Cakes",
                "Cakes",
                List.of(
                        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=80"
                )
        );
    }

    private void seedProduct(String name,
                             String description,
                             BigDecimal price,
                             String category,
                             String subcategory,
                             List<String> imageUrls) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setCategory(category);
        product.setSubcategory(subcategory);

        for (int i = 0; i < imageUrls.size(); i++) {
            ProductImage image = new ProductImage();
            image.setUrl(imageUrls.get(i));
            image.setAltText(name);
            image.setSortOrder(i);
            image.setProduct(product);
            product.getImages().add(image);
        }

        productRepository.save(product);
    }
}
