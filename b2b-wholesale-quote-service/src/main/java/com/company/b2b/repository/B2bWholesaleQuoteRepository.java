package com.company.b2b.repository;

import com.company.b2b.domain.B2bWholesaleQuote;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface B2bWholesaleQuoteRepository extends MongoRepository<B2bWholesaleQuote, String> {
}
