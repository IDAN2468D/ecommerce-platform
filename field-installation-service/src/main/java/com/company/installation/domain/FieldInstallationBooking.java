package com.company.installation.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "field_installation_bookings")
public class FieldInstallationBooking {

    @Id
    private String id;

    @Indexed(unique = true)
    private String bookingCode;

    private String customerId;
    private String skuCode;
    private String productName;
    private String installationType;
    private String city;
    private String assignedTechnicianName;
    private String scheduledWindow;

    private boolean syncedWithDeliverySaga;
    private BigDecimal baseServiceFeeILS;
    private BigDecimal vipDiscountILS;
    private BigDecimal finalInstallationFeeILS;

    @Builder.Default
    private String status = "TECHNICIAN_DISPATCH_SCHEDULED";

    @Builder.Default
    private Instant createdAt = Instant.now();
}
