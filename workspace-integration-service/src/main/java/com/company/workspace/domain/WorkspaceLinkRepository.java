package com.company.workspace.domain;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WorkspaceLinkRepository extends MongoRepository<WorkspaceLinkEntity, UUID> {
}
