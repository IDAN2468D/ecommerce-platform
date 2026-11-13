package com.company.creator.controller;

import com.company.creator.domain.CreatorLiveCampaign;
import com.company.creator.dto.CreateCreatorCampaignRequest;
import com.company.creator.service.CreatorAffiliateLiveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/creators")
@RequiredArgsConstructor
@Tag(name = "Live Shopping & Creator Affiliate Hub", description = "Live creator product drops, 15% viewer promo codes & 10% automated affiliate commission")
public class CreatorAffiliateLiveController {

    private final CreatorAffiliateLiveService creatorService;

    @GetMapping
    @Operation(summary = "List all active Live Shopping rooms and Creator Affiliate campaigns")
    public ResponseEntity<List<CreatorLiveCampaign>> getAllCampaigns() {
        return ResponseEntity.ok(creatorService.getAllCampaigns());
    }

    @PostMapping("/campaigns")
    @Operation(summary = "Launch a new Creator Live Shopping Drop with automated promo code & affiliate payout")
    public ResponseEntity<CreatorLiveCampaign> createCampaign(@Valid @RequestBody CreateCreatorCampaignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(creatorService.createCampaign(request));
    }
}
