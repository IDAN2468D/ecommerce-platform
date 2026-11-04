package com.company.rmareturnsservice.repository;

import com.company.rmareturnsservice.domain.entity.ReturnInspectionEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnInspectionRepository extends MongoRepository<ReturnInspectionEntity, String> {
    List<ReturnInspectionEntity> findByRmaNumber(String rmaNumber);
}
