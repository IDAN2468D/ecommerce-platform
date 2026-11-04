package com.company.rmareturnsservice.kafka;

import com.company.common.events.ReturnApprovedEvent;
import com.company.common.events.ReturnRequestedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RmaKafkaPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishReturnRequested(ReturnRequestedEvent event) {
        log.info("Publishing ReturnRequestedEvent: RMA={}, Order={}, SKU={}", 
                event.rmaNumber(), event.orderId(), event.skuCode());
        kafkaTemplate.send("return-events", event.rmaNumber(), event);
    }

    public void publishReturnApproved(ReturnApprovedEvent event) {
        log.info("Publishing ReturnApprovedEvent: RMA={}, Resolution={}, Refund={}, Bonus={}", 
                event.rmaNumber(), event.resolutionType(), event.refundAmount(), event.bonusCredit());
        kafkaTemplate.send("return-events", event.rmaNumber(), event);
    }
}
