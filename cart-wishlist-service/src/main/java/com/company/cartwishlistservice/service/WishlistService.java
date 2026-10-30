package com.company.cartwishlistservice.service;

import com.company.cartwishlistservice.domain.entity.WishlistEntity;
import com.company.cartwishlistservice.domain.model.WishlistItem;
import com.company.cartwishlistservice.dto.CartDtos.*;
import com.company.cartwishlistservice.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {

    private final WishlistRepository wishlistRepository;

    public WishlistResponse getWishlist(String customerId) {
        log.info("Fetching wishlist for customer: {}", customerId);
        WishlistEntity wishlist = wishlistRepository.findByCustomerId(customerId)
                .orElseGet(() -> WishlistEntity.builder()
                        .id(UUID.randomUUID())
                        .customerId(customerId)
                        .items(new ArrayList<>())
                        .build());

        List<WishlistItemDto> dtoList = wishlist.getItems().stream()
                .map(item -> new WishlistItemDto(
                        item.getSkuCode(),
                        item.getProductName(),
                        item.getUnitPrice(),
                        item.getImageUrl(),
                        item.getAddedAt()
                )).toList();

        return new WishlistResponse(customerId, dtoList, dtoList.size());
    }

    @Transactional
    public WishlistResponse addToWishlist(String customerId, AddToWishlistRequest request) {
        log.info("Adding to wishlist for customer: {}, sku: {}", customerId, request.skuCode());
        WishlistEntity wishlist = wishlistRepository.findByCustomerId(customerId)
                .orElseGet(() -> WishlistEntity.builder()
                        .id(UUID.randomUUID())
                        .customerId(customerId)
                        .items(new ArrayList<>())
                        .build());

        boolean exists = wishlist.getItems().stream().anyMatch(i -> i.getSkuCode().equals(request.skuCode()));
        if (!exists) {
            wishlist.getItems().add(WishlistItem.builder()
                    .skuCode(request.skuCode())
                    .productName(request.productName() != null ? request.productName() : request.skuCode())
                    .unitPrice(request.unitPrice())
                    .imageUrl(request.imageUrl())
                    .addedAt(Instant.now())
                    .build());
            wishlist.setUpdatedAt(Instant.now());
            wishlistRepository.save(wishlist);
        }

        return getWishlist(customerId);
    }

    @Transactional
    public WishlistResponse removeFromWishlist(String customerId, String skuCode) {
        log.info("Removing from wishlist for customer: {}, sku: {}", customerId, skuCode);
        Optional<WishlistEntity> wishlistOpt = wishlistRepository.findByCustomerId(customerId);
        if (wishlistOpt.isPresent()) {
            WishlistEntity wishlist = wishlistOpt.get();
            wishlist.getItems().removeIf(i -> i.getSkuCode().equals(skuCode));
            wishlist.setUpdatedAt(Instant.now());
            wishlistRepository.save(wishlist);
        }
        return getWishlist(customerId);
    }
}
