package com.company.creator.repository;

import com.company.creator.domain.CreatorLiveCampaign;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CreatorLiveCampaignRepository extends MongoRepository<CreatorLiveCampaign, String> {
}
