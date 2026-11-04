package com.company.rmareturnsservice.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "return_requests")
public class ReturnRequestEntity {
    @Id
    private String id;
    @Indexed(unique = true)
    private String rmaNumber;
    private UUID orderId;
    private String customerId;
    private String skuCode;
    private String reasonCategory; // DEFECTIVE, WRONG_ITEM, CHANGED_MIND, SIZE_COMFORT
    private String resolutionType; // INSTANT_VIP_CREDIT, DIRECT_EXCHANGE, ORIGINAL_PAYMENT_REFUND
    private String status;         // REQUESTED, VISION_VERIFIED, APPROVED, COMPLETED, REJECTED
    private BigDecimal baseAmount;
    private BigDecimal bonusAmount;
    private BigDecimal totalCreditAmount;
    private String dhlReturnTracking;
    private String pickupWindow;
    private String calendarPickupEventUrl;
    private Instant createdAt;
    private Instant updatedAt;
}
