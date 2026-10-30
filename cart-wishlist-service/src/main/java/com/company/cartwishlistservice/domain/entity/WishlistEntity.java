package com.company.cartwishlistservice.domain.entity;

import com.company.cartwishlistservice.domain.model.WishlistItem;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "wishlists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistEntity {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed(unique = true)
    private String customerId;

    @Builder.Default
    private List<WishlistItem> items = new ArrayList<>();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
