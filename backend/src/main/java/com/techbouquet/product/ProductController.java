package com.techbouquet.product;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private static final Logger log = LoggerFactory.getLogger(ProductController.class);
    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<Product> list() {
        List<Product> products = productRepository.findAllActiveWithImages();
        log.info("Products list size={}", products.size());
        return products;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> get(@PathVariable Long id) {
        return productRepository.findActiveByIdWithImages(id)
                .map(product -> {
                    log.info("Product detail id={} found", id);
                    return ResponseEntity.ok(product);
                })
                .orElseGet(() -> {
                    log.info("Product detail id={} not_found", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam("q") String query) {
        List<Product> results = productRepository.findByNameContainingIgnoreCaseAndActiveTrue(query);
        log.info("Product search q='{}' results={}", query, results.size());
        return results;
    }
}
