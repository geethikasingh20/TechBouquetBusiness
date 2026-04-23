package com.techbouquet.product;

import java.math.BigDecimal;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ProductSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(ProductSeeder.class);
    private final ProductRepository productRepository;

    public ProductSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByActiveTrue();
        log.info("ProductSeeder startup totalProducts={} activeProducts={}", totalProducts, activeProducts);

        // Seed only when catalog visible to users is empty.
        if (activeProducts > 0) {
            log.info("ProductSeeder skipped because active catalog already exists.");
            return;
        }
        log.info("ProductSeeder seeding default catalog...");

        seedProduct(
                "Sunrise Rose Bouquet",
                "Fresh roses with baby breath and greens.",
                new BigDecimal("1299"),
                new BigDecimal("4.8"),
                "Bouquets",
                "Fresh Flowers",
                List.of(
                        "https://freshknots.in/wp-content/uploads/2022/12/2.jpg",
                        "https://freshknots.in/wp-content/uploads/2022/12/3-540x540.jpg"
                )
        );

        seedProduct(
                "Pastel Tulip Wrap",
                "Soft pastel tulips in kraft wrap.",
                new BigDecimal("999"),
                new BigDecimal("3"),
                "Bouquets",
                "Fresh Flowers",
                List.of(
                        "https://www.atfleurs.com/cdn/shop/files/oLV3Ge7Ez4BqZcDO5OQ3um7CZXQKYi4NMAluHGLa.png?v=1772017536",
                        "https://www.atfleurs.com/cdn/shop/files/ydXHv9iFDM1Yr3sOaxeY4hTCK3QOCj0FIDR000p5.png?v=1772017539"
                )
        );

        seedProduct(
                "Peace Lily Plant",
                "Low maintenance indoor plant.",
                new BigDecimal("799"),
                new BigDecimal("4.6"),
                "Plants",
                "Decoration Plants",
                List.of(
                        "https://m.media-amazon.com/images/I/61M5cotkK+L._AC_UF1000,1000_QL80_.jpg"
                )
        );

        seedProduct(
                "Celebration Gift Hamper",
                "Snacks, chocolates, and a greeting card.",
                new BigDecimal("1599"),
                new BigDecimal("4.9"),
                "Gift Hampers",
                "Gift Hampers",
                List.of(
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7NDNDjMFXe2hGAvYg1i2iKKQlIA3YX1qdmA&s"
                )
        );

        seedProduct(
                "Chocolate Truffle Cake",
                "Rich chocolate cake for celebrations.",
                new BigDecimal("899"),
                new BigDecimal("4.5"),
                "Cakes",
                "Cakes",
                List.of(
                        "https://theobroma.in/cdn/shop/files/DutchTruffleCakeonekg.jpg?v=1711125197"
                )
        );

         seedProduct(
                "Red rose bouquet",
                "Red rose bouquet for expressing love",
                new BigDecimal("999"),
                new BigDecimal("4"),
                "Bouquets",
                "Fresh Flowers",
                List.of(
                        "https://tse3.mm.bing.net/th/id/OIP.y1Au71wsTqb-WaBhSyR_hQHaK0?rs=1&pid=ImgDetMain&o=7&rm=3"
                )
        );
        log.info("ProductSeeder completed. activeProductsNow={}", productRepository.countByActiveTrue());
    }

    private void seedProduct(String name,
                             String description,
                             BigDecimal price,
                             BigDecimal rating,
                             String category,
                             String subcategory,
                             List<String> imageUrls) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setRating(rating);
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
