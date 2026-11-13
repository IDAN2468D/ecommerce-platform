package com.company.configurator.repository;

import com.company.configurator.domain.CustomRigBuild;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomRigBuildRepository extends MongoRepository<CustomRigBuild, String> {
}
