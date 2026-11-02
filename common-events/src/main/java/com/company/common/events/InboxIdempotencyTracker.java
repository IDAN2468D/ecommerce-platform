package com.company.common.events;

import java.time.Duration;
import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Predicate;

/**
 * High-performance Consumer Idempotency Tracker (Inbox Pattern) with 24-hour TTL.
 * Combines a fast local concurrent TTL registry with an optional external atomic store
 * (Redis SETNX with 24h TTL or MongoDB 'processed_events' collection).
 */
public class InboxIdempotencyTracker {

    private static final Duration DEFAULT_TTL = Duration.ofHours(24);
    private static final int MAX_LOCAL_ENTRIES = 10_000;

    private final String consumerGroup;
    private final Map<String, Instant> processedCache = new ConcurrentHashMap<>();

    public InboxIdempotencyTracker(String consumerGroup) {
        this.consumerGroup = consumerGroup;
    }

    /**
     * Attempts to mark an event as processed if it has not been seen within the 24h TTL window.
     *
     * @param event           The Kafka event payload
     * @param explicitEventId Optional X-Event-Id header from Kafka
     * @param externalStore   Optional external store check (returns true if newly stored in Redis/DB, false if duplicate)
     * @return true if this is a NEW event that should be processed; false if it is a DUPLICATE and must be skipped.
     */
    public boolean tryAcquire(Object event, String explicitEventId, Predicate<String> externalStore) {
        String eventKey = EventIdempotencyKeyResolver.resolveEventId(consumerGroup, event, explicitEventId);
        return tryAcquireByKey(eventKey, externalStore);
    }

    public boolean tryAcquire(Object event) {
        return tryAcquire(event, null, null);
    }

    public boolean tryAcquireByKey(String eventKey, Predicate<String> externalStore) {
        Instant now = Instant.now();
        evictExpiredIfNeeded(now);

        Instant previous = processedCache.get(eventKey);
        if (previous != null && Duration.between(previous, now).compareTo(DEFAULT_TTL) < 0) {
            return false; // Duplicate detected in L1 cache
        }

        if (externalStore != null) {
            boolean acquiredExternally = externalStore.test(eventKey);
            if (!acquiredExternally) {
                processedCache.put(eventKey, now);
                return false; // Duplicate detected in Redis / MongoDB processed_events
            }
        }

        processedCache.put(eventKey, now);
        return true;
    }

    private void evictExpiredIfNeeded(Instant now) {
        if (processedCache.size() < MAX_LOCAL_ENTRIES) {
            return;
        }
        Iterator<Map.Entry<String, Instant>> it = processedCache.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, Instant> entry = it.next();
            if (Duration.between(entry.getValue(), now).compareTo(DEFAULT_TTL) >= 0) {
                it.remove();
            }
        }
    }
}

