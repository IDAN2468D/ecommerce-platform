package com.company.wallet.repository;

import com.company.wallet.domain.MultiCurrencyWalletCard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MultiCurrencyWalletCardRepository extends MongoRepository<MultiCurrencyWalletCard, String> {
}
