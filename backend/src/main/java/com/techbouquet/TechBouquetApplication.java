package com.techbouquet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class TechBouquetApplication {
    public static void main(String[] args) {
        SpringApplication.run(TechBouquetApplication.class, args);
    }
}
