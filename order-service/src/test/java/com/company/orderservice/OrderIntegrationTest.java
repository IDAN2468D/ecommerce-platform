package com.company.orderservice;

import com.company.orderservice.domain.entity.OrderEntity;
import com.company.orderservice.domain.enums.OrderStatus;
import com.company.orderservice.dto.request.CreateOrderRequest;
import com.company.orderservice.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    private static WireMockServer wireMockServer;
    private static MongoDBContainer mongoDBContainer;
    private static KafkaContainer kafkaContainer;

    @DynamicPropertySource
    static void registerDynamicContainers(DynamicPropertyRegistry registry) {
        boolean forceTestcontainers = Boolean.parseBoolean(
                System.getProperty("testcontainers.enabled",
                        System.getenv().getOrDefault("TESTCONTAINERS_ENABLED", "false")));
        if ((forceTestcontainers || !isPortOpen("localhost", 27017)) && isDockerAvailable()) {
            mongoDBContainer = new MongoDBContainer(DockerImageName.parse("mongo:7.0"));
            mongoDBContainer.start();
            registry.add("spring.data.mongodb.uri",
                    () -> mongoDBContainer.getReplicaSetUrl("orders_test_db") + "&uuidRepresentation=standard");

            kafkaContainer = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.6.0"));
            kafkaContainer.start();
            registry.add("spring.kafka.bootstrap-servers", kafkaContainer::getBootstrapServers);
        }
    }

    private static boolean isPortOpen(String host, int port) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 300);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private static boolean isDockerAvailable() {
        try {
            return DockerClientFactory.instance().isDockerAvailable();
        } catch (Throwable t) {
            return false;
        }
    }

    @BeforeAll
    static void startWireMock() {
        wireMockServer = new WireMockServer(WireMockConfiguration.wireMockConfig().port(9999));
        wireMockServer.start();
        WireMock.configureFor("localhost", 9999);
    }

    @AfterAll
    static void stopWireMock() {
        if (wireMockServer != null && wireMockServer.isRunning()) {
            wireMockServer.stop();
        }
        if (kafkaContainer != null && kafkaContainer.isRunning()) {
            kafkaContainer.stop();
        }
        if (mongoDBContainer != null && mongoDBContainer.isRunning()) {
            mongoDBContainer.stop();
        }
    }

    @BeforeEach
    void resetState() {
        wireMockServer.resetAll();
        orderRepository.deleteAll();
    }

    @Test
    @DisplayName("End-to-End: Full order creation lifecycle with WireMock inventory and payment")
    void fullOrderLifecycle_Success() throws Exception {
        // 1. Stub Inventory Reservation
        wireMockServer.stubFor(WireMock.post(WireMock.urlEqualTo("/internal/v1/inventory/reserve"))
                .willReturn(WireMock.aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withStatus(200)
                        .withBody("""
                                {
                                  "available": true,
                                  "reservationId": "res_e2e_12345"
                                }
                                """)));

        // 2. Stub Payment Charge
        wireMockServer.stubFor(WireMock.post(WireMock.urlEqualTo("/internal/v1/payments/charge"))
                .willReturn(WireMock.aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withStatus(200)
                        .withBody("""
                                {
                                  "success": true,
                                  "transactionId": "tx_e2e_987654",
                                  "status": "SUCCEEDED"
                                }
                                """)));

        CreateOrderRequest request = new CreateOrderRequest(
                "ILS",
                "pm_token_e2e",
                List.of(
                        new CreateOrderRequest.OrderItemRequest("SKU-LAPTOP-PRO", 1, new BigDecimal("6500.00")),
                        new CreateOrderRequest.OrderItemRequest("SKU-MOUSE-WIRELESS", 1, new BigDecimal("250.00"))
                )
        );

        String idempotencyKey = UUID.randomUUID().toString();

        // 3. Execute POST /api/v1/orders
        String responseContent = mockMvc.perform(post("/api/v1/orders")
                        .with(jwt().jwt(builder -> builder.subject("customer_alice")))
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").isNotEmpty())
                .andExpect(jsonPath("$.customerId").value("customer_alice"))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.totalAmount").value(6750.00))
                .andExpect(jsonPath("$.currency").value("ILS"))
                .andExpect(jsonPath("$.paymentTransactionId").value("tx_e2e_987654"))
                .andExpect(jsonPath("$.items").isArray())
                .andReturn().getResponse().getContentAsString();

        // 4. Verify in DB
        Optional<OrderEntity> orderInDb = orderRepository.findByIdempotencyKey(idempotencyKey);
        assertThat(orderInDb).isPresent();
        assertThat(orderInDb.get().getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(orderInDb.get().getItems()).hasSize(2);

        UUID orderId = orderInDb.get().getId();

        // 5. Query order by ID (GET /api/v1/orders/{id})
        mockMvc.perform(get("/api/v1/orders/" + orderId)
                        .with(jwt().jwt(builder -> builder.subject("customer_alice"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(orderId.toString()))
                .andExpect(jsonPath("$.customerId").value("customer_alice"))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        // 6. Test Idempotency: Repeating same POST returns the same order without re-calling payment or inventory
        wireMockServer.resetRequests();

        mockMvc.perform(post("/api/v1/orders")
                        .with(jwt().jwt(builder -> builder.subject("customer_alice")))
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(orderId.toString()))
                .andExpect(jsonPath("$.paymentTransactionId").value("tx_e2e_987654"));

        wireMockServer.verify(0, WireMock.postRequestedFor(WireMock.urlEqualTo("/internal/v1/inventory/reserve")));
        wireMockServer.verify(0, WireMock.postRequestedFor(WireMock.urlEqualTo("/internal/v1/payments/charge")));
    }
}
