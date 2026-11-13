package com.company.wallet.controller;

import com.company.wallet.domain.MultiCurrencyWalletCard;
import com.company.wallet.dto.IssueWalletGiftCardRequest;
import com.company.wallet.service.DigitalWalletGiftcardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
@Tag(name = "Smart Multi-Currency Wallet & Gift Cards", description = "Double-entry multi-currency (ILS/USD/EUR) wallet balance & 8% bonus gift cards")
public class DigitalWalletGiftcardController {

    private final DigitalWalletGiftcardService walletService;

    @GetMapping
    @Operation(summary = "List all multi-currency wallet balances and active gift cards")
    public ResponseEntity<List<MultiCurrencyWalletCard>> getAllCards() {
        return ResponseEntity.ok(walletService.getAllCards());
    }

    @PostMapping("/giftcard")
    @Operation(summary = "Issue a multi-currency digital gift card or wallet top-up with instant VIP bonus")
    public ResponseEntity<MultiCurrencyWalletCard> issueGiftCard(@Valid @RequestBody IssueWalletGiftCardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(walletService.issueGiftCard(request));
    }
}
