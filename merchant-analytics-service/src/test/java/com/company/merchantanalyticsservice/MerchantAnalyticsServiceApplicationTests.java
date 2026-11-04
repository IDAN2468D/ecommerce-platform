package com.company.merchantanalyticsservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "spring.data.mongodb.uri=mongodb://localhost:27017/test_ecommerce_db",
        "spring.kafka.bootstrap-servers=localhost:9092"
})
class MerchantAnalyticsServiceApplicationTests {

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Test
    void testDepletionFormula() {
        int currentStock = 4;
        double dailyBurnRate = 1.6;
        double daysUntilDepletion = currentStock / Math.max(dailyBurnRate, 0.5);

        assertEquals(2.5, daysUntilDepletion, 0.001);
    }
}
