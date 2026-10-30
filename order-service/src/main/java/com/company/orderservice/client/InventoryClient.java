package com.company.orderservice.client;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

import java.util.List;

@HttpExchange("/internal/v1/inventory")
public interface InventoryClient {

    @PostExchange("/reserve")
    InventoryReservationResponse reserveStock(@RequestBody List<StockCheckItem> items);

    @PostExchange("/release")
    void releaseStock(@RequestBody InventoryReleaseRequest request);

    record StockCheckItem(String skuCode, int quantity) {}

    record InventoryReservationResponse(
        boolean available,
        String reservationId,
        String failureReason
    ) {}

    record InventoryReleaseRequest(
        String reservationId,
        List<StockCheckItem> items
    ) {}
}
