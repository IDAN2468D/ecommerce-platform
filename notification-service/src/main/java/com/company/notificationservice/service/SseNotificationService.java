package com.company.notificationservice.service;

import io.micrometer.tracing.Tracer;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SseNotificationService {

    private static final Long DEFAULT_TIMEOUT = 30 * 60 * 1000L; // 30 minutes
    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @Autowired(required = false)
    private Tracer tracer;

    public SseEmitter subscribe(String customerId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        emitters.computeIfAbsent(customerId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(customerId, emitter));
        emitter.onTimeout(() -> removeEmitter(customerId, emitter));
        emitter.onError(e -> removeEmitter(customerId, emitter));

        String traceId = resolveCurrentTraceId();
        try {
            emitter.send(SseEmitter.event()
                    .id(traceId)
                    .name("CONNECTED")
                    .data(Map.of(
                            "message", "Connected to live SSE notification stream",
                            "customerId", customerId,
                            "traceId", traceId
                    )));
            log.info("Client connected to SSE stream for customer: {} [traceId={}]", customerId, traceId);
        } catch (IOException e) {
            removeEmitter(customerId, emitter);
        }

        return emitter;
    }

    public void dispatchNotification(String customerId, String eventType, Object payload) {
        String traceId = resolveCurrentTraceId();
        Object enrichedPayload = enrichWithTraceContext(payload, traceId);

        List<SseEmitter> customerEmitters = emitters.get(customerId);
        if (customerEmitters != null && !customerEmitters.isEmpty()) {
            log.info("Dispatching SSE event '{}' to {} listeners for customer {} [traceId={}]",
                    eventType, customerEmitters.size(), customerId, traceId);
            for (SseEmitter emitter : customerEmitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .id(traceId)
                            .name(eventType)
                            .data(enrichedPayload));
                } catch (Exception e) {
                    removeEmitter(customerId, emitter);
                }
            }
        }
        if (!"usr_demo".equals(customerId)) {
            List<SseEmitter> demoEmitters = emitters.get("usr_demo");
            if (demoEmitters != null && !demoEmitters.isEmpty()) {
                for (SseEmitter emitter : demoEmitters) {
                    try {
                        emitter.send(SseEmitter.event()
                                .id(traceId)
                                .name(eventType)
                                .data(enrichedPayload));
                    } catch (Exception e) {
                        removeEmitter("usr_demo", emitter);
                    }
                }
            }
        }
    }

    private Object enrichWithTraceContext(Object payload, String traceId) {
        if (payload instanceof Map<?, ?> map) {
            Map<Object, Object> enriched = new LinkedHashMap<>(map);
            enriched.putIfAbsent("traceId", traceId);
            return enriched;
        }
        return payload;
    }

    private String resolveCurrentTraceId() {
        if (tracer != null && tracer.currentSpan() != null) {
            return tracer.currentSpan().context().traceId();
        }
        String mdcTrace = MDC.get("traceId");
        if (mdcTrace != null && !mdcTrace.isBlank()) {
            return mdcTrace;
        }
        return UUID.randomUUID().toString().replace("-", "");
    }

    private void removeEmitter(String customerId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(customerId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                emitters.remove(customerId);
            }
        }
    }
}
