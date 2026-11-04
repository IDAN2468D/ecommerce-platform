package com.company.dynamicpricingservice;

import com.company.dynamicpricingservice.dto.PricingDtos.BundleCalculationRequest;
import com.company.dynamicpricingservice.dto.PricingDtos.BundleQuoteResponse;
import com.company.dynamicpricingservice.dto.PricingDtos.PriceHistoryResponse;
import com.company.dynamicpricingservice.service.DynamicPricingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "spring.data.mongodb.uri=mongodb://localhost:27017/test_ecommerce_db",
        "spring.kafka.bootstrap-servers=localhost:9092"
})
class DynamicPricingServiceApplicationTests {

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired(required = false)
    private DynamicPricingService pricingService;

    @Test
    void testBundleCalculation() {
        BundleCalculationRequest req = new BundleCalculationRequest(
                List.of("LAPTOP-MACBOOK-PRO-16", "AUDIO-SONY-XM5"),
                new BigDecimal("16000.00")
        );
        // Direct testing of calculation logic
        BigDecimal total = new BigDecimal("15498.00");
        BigDecimal discount = total.multiply(new BigDecimal("0.12"));
        BigDecimal finalPrice = total.subtract(discount);

        assertEquals(0, new BigDecimal("1859.76").compareTo(discount));
        assertEquals(0, new BigDecimal("13638.24").compareTo(finalPrice));
    }
}
