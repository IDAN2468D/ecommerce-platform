package com.company.flashsale.repository;

import com.company.flashsale.domain.FlashSaleCampaign;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleCampaignRepository extends MongoRepository<FlashSaleCampaign, String> {
    Optional<FlashSaleCampaign> findByCampaignCode(String campaignCode);
    List<FlashSaleCampaign> findByStatusOrderByEndsAtAsc(String status);
}
