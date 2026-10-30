package com.company.inventoryservice.repository;

import com.company.inventoryservice.domain.entity.InventoryReservationEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReservationRepository extends MongoRepository<InventoryReservationEntity, UUID> {
    List<InventoryReservationEntity> findByReservationId(String reservationId);
}
