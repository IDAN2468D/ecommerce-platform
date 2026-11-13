package com.company.rental.repository;

import com.company.rental.domain.EquipmentRentalContract;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentRentalContractRepository extends MongoRepository<EquipmentRentalContract, String> {
}
