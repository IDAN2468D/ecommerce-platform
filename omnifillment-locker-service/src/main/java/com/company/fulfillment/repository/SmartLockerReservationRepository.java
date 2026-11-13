package com.company.fulfillment.repository;

import com.company.fulfillment.domain.SmartLockerReservation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SmartLockerReservationRepository extends MongoRepository<SmartLockerReservation, String> {
}
