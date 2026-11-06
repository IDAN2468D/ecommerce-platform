package com.company.subscription.dto;

import com.company.subscription.domain.BillingInterval;
import com.company.subscription.domain.SubscriptionItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubscriptionRequest {
    @NotBlank
    private String customerId;
    private String customerEmail;
    private String planName;
    @NotNull
    private BillingInterval billingInterval;
    @NotEmpty
    private List<SubscriptionItem> items;
    private String paymentMethodToken;
    private String shippingAddress;
}
