package com.company.gifting.repository;

import com.company.gifting.domain.SocialGiftCampaign;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SocialGiftRepository extends MongoRepository<SocialGiftCampaign, String> {
    Optional<SocialGiftCampaign> findByCampaignCode(String campaignCode);
}
