package com.company.groupbuy.controller;

import com.company.groupbuy.domain.GroupBuySquad;
import com.company.groupbuy.dto.JoinGroupBuyRequest;
import com.company.groupbuy.service.GroupBuyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/group-buy")
@RequiredArgsConstructor
@Tag(name = "Social Group Buying & Referrals", description = "Collaborative group discount squads and affiliate referral attribution")
public class GroupBuyController {

    private final GroupBuyService groupBuyService;

    @GetMapping
    @Operation(summary = "List all active Social Group Buy squads")
    public ResponseEntity<List<GroupBuySquad>> getAllSquads() {
        return ResponseEntity.ok(groupBuyService.getAllSquads());
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Join a Social Group Buy squad and unlock group discount when target is reached")
    public ResponseEntity<GroupBuySquad> joinSquad(
            @PathVariable String id,
            @Valid @RequestBody JoinGroupBuyRequest request) {
        return ResponseEntity.ok(groupBuyService.joinSquad(id, request));
    }
}
