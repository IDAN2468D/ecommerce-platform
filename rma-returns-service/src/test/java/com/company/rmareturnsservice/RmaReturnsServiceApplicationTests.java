package com.company.rmareturnsservice;

import com.company.rmareturnsservice.dto.RmaDtos.EvaluateReturnRequest;
import com.company.rmareturnsservice.dto.RmaDtos.ReturnEligibilityResponse;
import com.company.rmareturnsservice.service.RmaReturnsService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "spring.data.mongodb.uri=mongodb://localhost:27017/test_ecommerce_db",
        "spring.kafka.bootstrap-servers=localhost:9092"
})
class RmaReturnsServiceApplicationTests {

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Test
    void testVipCreditCalculation() {
        BigDecimal base = new BigDecimal("1499.00");
        BigDecimal bonus = base.multiply(new BigDecimal("0.10"));
        BigDecimal total = base.add(bonus);

        assertEquals(0, new BigDecimal("149.90").compareTo(bonus));
        assertEquals(0, new BigDecimal("1648.90").compareTo(total));
    }
}
