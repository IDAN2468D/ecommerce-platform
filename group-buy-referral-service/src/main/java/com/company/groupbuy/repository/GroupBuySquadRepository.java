package com.company.groupbuy.repository;

import com.company.groupbuy.domain.GroupBuySquad;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupBuySquadRepository extends MongoRepository<GroupBuySquad, String> {
    Optional<GroupBuySquad> findBySquadCode(String squadCode);
}
