package com.company.flashsale.controller;

import com.company.flashsale.domain.FlashSaleCampaign;
import com.company.flashsale.dto.ClaimFlashDropRequest;
import com.company.flashsale.dto.PlaceBidRequest;
import com.company.flashsale.service.FlashSaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/flash-sales")
@RequiredArgsConstructor
@Tag(name = "Flash Sales & Live Auctions", description = "Atomic flash drop reservations and real-time live auction bidding")
public class FlashSaleController {

    private final FlashSaleService flashSaleService;

    @GetMapping
    @Operation(summary = "List all active Flash Drops and Live Auctions")
    public ResponseEntity<List<FlashSaleCampaign>> getAllCampaigns() {
        return ResponseEntity.ok(flashSaleService.getAllCampaigns());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific Flash Drop or Auction by ID or code")
    public ResponseEntity<FlashSaleCampaign> getCampaign(@PathVariable String id) {
        return ResponseEntity.ok(flashSaleService.getCampaign(id));
    }

    @PostMapping("/{id}/claim")
    @Operation(summary = "Atomically claim a unit in a limited Flash Drop")
    public ResponseEntity<FlashSaleCampaign> claimFlashDrop(
            @PathVariable String id,
            @Valid @RequestBody ClaimFlashDropRequest request) {
        return ResponseEntity.ok(flashSaleService.claimFlashDrop(id, request));
    }

    @PostMapping("/{id}/bid")
    @Operation(summary = "Place a real-time bid on a Live Auction")
    public ResponseEntity<FlashSaleCampaign> placeBid(
            @PathVariable String id,
            @Valid @RequestBody PlaceBidRequest request) {
        return ResponseEntity.ok(flashSaleService.placeAuctionBid(id, request));
    }
}
