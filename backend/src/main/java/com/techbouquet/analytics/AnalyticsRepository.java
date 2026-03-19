package com.techbouquet.analytics;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalyticsRepository extends JpaRepository<AnalyticsEvent, Long> {
}
