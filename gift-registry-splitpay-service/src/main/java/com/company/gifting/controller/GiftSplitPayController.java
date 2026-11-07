package com.company.gifting.controller;

import com.company.gifting.domain.SocialGiftCampaign;
import com.company.gifting.dto.ContributeGiftRequest;
import com.company.gifting.service.GiftSplitPayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gifting")
@RequiredArgsConstructor
@Tag(name = "Social Gifting & Multi-Payer Split", description = "Crowdfunded group gifts and automatic SAGA order dispatch when target is met")
public class GiftSplitPayController {

    private final GiftSplitPayService giftSplitPayService;

    @GetMapping
    @Operation(summary = "List all active Social Gift campaigns")
    public ResponseEntity<List<SocialGiftCampaign>> getAllCampaigns() {
        return ResponseEntity.ok(giftSplitPayService.getAllCampaigns());
    }

    @PostMapping("/{id}/contribute")
    @Operation(summary = "Contribute towards a Social Gift campaign and add a greeting card")
    public ResponseEntity<SocialGiftCampaign> contribute(
            @PathVariable String id,
            @Valid @RequestBody ContributeGiftRequest request) {
        return ResponseEntity.ok(giftSplitPayService.contribute(id, request));
    }
}
