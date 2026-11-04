package com.company.fraudriskservice.kafka;

import com.company.common.events.FraudCheckPassedEvent;
import com.company.common.events.FraudFlaggedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FraudKafkaPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishFraudPassed(FraudCheckPassedEvent event) {
        log.info("Publishing FraudCheckPassedEvent: Assessment={}, Order={}, Score={}",
                event.assessmentId(), event.orderId(), event.riskScore());
        kafkaTemplate.send("fraud-events", event.assessmentId(), event);
    }

    public void publishFraudFlagged(FraudFlaggedEvent event) {
        log.warn("Publishing FraudFlaggedEvent: Assessment={}, Order={}, Score={}, Reasons={}",
                event.assessmentId(), event.orderId(), event.riskScore(), event.reasons());
        kafkaTemplate.send("fraud-events", event.assessmentId(), event);
    }
}
