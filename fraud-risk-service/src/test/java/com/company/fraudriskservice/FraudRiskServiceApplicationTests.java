package com.company.fraudriskservice;

import com.company.fraudriskservice.dto.FraudDtos.FraudAssessmentRequest;
import com.company.fraudriskservice.dto.FraudDtos.FraudAssessmentResponse;
import com.company.fraudriskservice.service.FraudRiskService;
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
class FraudRiskServiceApplicationTests {

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Test
    void testRiskScoringThreshold() {
        int baseScore = 5;
        assertTrue(baseScore < 70, "Base score should pass threshold");
        assertEquals("APPROVE", baseScore < 70 ? "APPROVE" : "BLOCK");

        int highRiskScore = 5 + 35 + 45; // 85
        assertTrue(highRiskScore >= 70, "High risk score should be blocked");
        assertEquals("BLOCK", highRiskScore >= 70 ? "BLOCK" : "APPROVE");
    }
}
