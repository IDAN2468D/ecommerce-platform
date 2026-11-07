package com.company.bnpl.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bnpl_installment_plans")
public class BnplInstallmentPlan {

    @Id
    private String id;

    @Indexed(unique = true)
    private String planNumber;

    @Indexed
    private String customerId;

    private String orderId;
    private String productSummary;

    private BigDecimal totalOrderAmount;
    private BigDecimal remainingBalance;
    private int totalInstallments;
    private int paidInstallments;
    private BigDecimal aprPercent; // 0.0% for 4-pay VIP

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, DEFAULTED

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private List<InstallmentTranche> schedule = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InstallmentTranche {
        private int installmentNumber;
        private BigDecimal amount;
        private Instant dueDate;
        private String status; // PAID, SCHEDULED
        private Instant paidAt;
        private String transactionRef;
    }
}
