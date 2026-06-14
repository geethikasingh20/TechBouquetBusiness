package com.techbouquet.address;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class AddressSchemaUpdater implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(AddressSchemaUpdater.class);
    private final JdbcTemplate jdbcTemplate;

    public AddressSchemaUpdater(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE addresses ALTER COLUMN label SET NOT NULL");

            jdbcTemplate.execute(
                    "WITH ranked AS (" +
                            " SELECT id, customer_id, label," +
                            " ROW_NUMBER() OVER (PARTITION BY customer_id, label ORDER BY id DESC) AS rn" +
                            " FROM addresses" +
                            ")" +
                            " DELETE FROM addresses a" +
                            " USING ranked r" +
                            " WHERE a.id = r.id AND r.rn > 1"
            );

            List<String> uniqueIndexes = jdbcTemplate.queryForList(
                    "SELECT indexname FROM pg_indexes WHERE tablename = 'addresses' AND indexname = 'uk_addresses_customer_label'",
                    String.class
            );
            if (uniqueIndexes.isEmpty()) {
                jdbcTemplate.execute(
                        "CREATE UNIQUE INDEX uk_addresses_customer_label ON addresses(customer_id, label)"
                );
            }

            log.info("Address schema check complete (customer_id + label uniqueness).");
        } catch (Exception ex) {
            log.warn("Address schema update failed: customer_id + label uniqueness", ex);
        }
    }
}
