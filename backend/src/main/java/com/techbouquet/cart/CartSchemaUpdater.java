package com.techbouquet.cart;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class CartSchemaUpdater implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(CartSchemaUpdater.class);
    private final JdbcTemplate jdbcTemplate;

    public CartSchemaUpdater(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS delivery_pincode varchar(6) DEFAULT '' NOT NULL");
            jdbcTemplate.update("UPDATE cart_items SET delivery_pincode = '' WHERE delivery_pincode IS NULL");

            List<String> uniqueConstraintNames = jdbcTemplate.queryForList(
                    "SELECT tc.constraint_name " +
                            "FROM information_schema.table_constraints tc " +
                            "WHERE tc.table_name = 'cart_items' AND tc.constraint_type = 'UNIQUE'",
                    String.class
            );
            for (String constraintName : uniqueConstraintNames) {
                jdbcTemplate.execute("ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS " + constraintName);
            }

            jdbcTemplate.execute(
                    "WITH ranked AS (" +
                            " SELECT id, cart_id, product_id, delivery_pincode, quantity, addons_json, updated_at," +
                            " ROW_NUMBER() OVER (PARTITION BY cart_id, product_id, delivery_pincode ORDER BY updated_at DESC, id DESC) AS rn," +
                            " SUM(quantity) OVER (PARTITION BY cart_id, product_id, delivery_pincode) AS total_qty," +
                            " FIRST_VALUE(addons_json) OVER (PARTITION BY cart_id, product_id, delivery_pincode ORDER BY updated_at DESC, id DESC) AS latest_addons" +
                            " FROM cart_items" +
                            ")" +
                            " UPDATE cart_items c" +
                            " SET quantity = ranked.total_qty, addons_json = ranked.latest_addons" +
                            " FROM ranked" +
                            " WHERE c.id = ranked.id AND ranked.rn = 1"
            );

            jdbcTemplate.execute(
                    "DELETE FROM cart_items c USING (" +
                            " SELECT id FROM (" +
                            "   SELECT id, ROW_NUMBER() OVER (PARTITION BY cart_id, product_id, delivery_pincode ORDER BY updated_at DESC, id DESC) AS rn" +
                            "   FROM cart_items" +
                            " ) ranked_delete WHERE rn > 1" +
                            ") duplicates WHERE c.id = duplicates.id"
            );

            jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS cart_items_unique_delivery_idx ON cart_items(cart_id, product_id, delivery_pincode)");
            log.info("Cart schema check complete (delivery_pincode column).");
        } catch (Exception ex) {
            log.warn("Cart schema update failed: delivery_pincode column", ex);
        }
    }
}
