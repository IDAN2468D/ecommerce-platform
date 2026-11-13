package com.company.installation.repository;

import com.company.installation.domain.FieldInstallationBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FieldInstallationBookingRepository extends MongoRepository<FieldInstallationBooking, String> {
}
