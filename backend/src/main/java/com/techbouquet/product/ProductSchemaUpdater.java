package com.techbouquet.product;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ProductSchemaUpdater implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(ProductSchemaUpdater.class);
    private final JdbcTemplate jdbcTemplate;

    public ProductSchemaUpdater(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 5.0");
            log.info("Product schema check complete (rating column).");
        } catch (Exception ex) {
            log.warn("Product schema update failed: rating column", ex);
        }
    }
}
