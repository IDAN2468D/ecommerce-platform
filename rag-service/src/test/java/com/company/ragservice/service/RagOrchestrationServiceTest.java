package com.company.ragservice.service;

import com.company.ragservice.config.GeminiProperties;
import com.company.ragservice.dto.*;
import com.company.ragservice.entity.CatalogVectorDocument;
import com.company.ragservice.repository.CatalogVectorRepository;
import com.company.ragservice.repository.VectorSearchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RagOrchestrationServiceTest {

    @Mock
    private EmbeddingService embeddingService;

    @Mock
    private VectorSearchRepository vectorSearchRepository;

    @Mock
    private CatalogVectorRepository catalogVectorRepository;

    @Mock
    private GeminiGenerationService geminiGenerationService;

    @Mock
    private AgenticToolsService agenticToolsService;

    @Mock
    private GeminiProperties geminiProperties;

    private RagOrchestrationService ragOrchestrationService;

    @BeforeEach
    void setUp() {
        ragOrchestrationService = new RagOrchestrationService(
                embeddingService,
                vectorSearchRepository,
                catalogVectorRepository,
                geminiGenerationService,
                agenticToolsService,
                geminiProperties
        );
    }

    @Test
    void processQuery_executesAgenticToolsAndHybridSearch() {
        CatalogVectorDocument doc = CatalogVectorDocument.builder()
                .skuCode("SONY-WH-1000XM5")
                .title("אוזניות אלחוטיות Sony WH-1000XM5 ביטול רעשים")
                .category("אוזניות ושמע")
                .price(1450.00)
                .inStock(true)
                .availableQuantity(12)
                .averageRating(4.9)
                .textChunk("אוזניות דגל עם ביטול רעשים")
                .build();

        when(embeddingService.generateEmbedding(anyString())).thenReturn(List.of(0.1f, 0.2f, 0.3f));
        when(vectorSearchRepository.searchSimilar(anyList(), eq("אוזניות"), eq(2000.0), eq(4.5), eq(true), eq(4)))
                .thenReturn(List.of(new VectorSearchRepository.ScoredDocument(doc, 0.94)));

        ExecutedActionDto action = ExecutedActionDto.builder()
                .toolName("addToCartTool")
                .status("SUCCESS")
                .summary("המוצר SONY-WH-1000XM5 נוסף לסל")
                .payload(Map.of("skuCode", "SONY-WH-1000XM5", "quantity", 1))
                .build();

        when(geminiGenerationService.generateAgenticAnswer(anyString(), anyString(), anyList(), eq("usr_demo"), any()))
                .thenReturn(new GeminiGenerationService.AgenticGenerationResult(
                        "הוספתי את אוזניות Sony WH-1000XM5 לסל הקניות שלך!",
                        List.of(action)
                ));
        when(geminiProperties.getModel()).thenReturn("gemini-3.5-flash-lite");

        RagQueryRequest req = RagQueryRequest.builder()
                .query("תוסיף לי לסל את האוזניות של סוני")
                .conversationId("conv_test")
                .customerId("usr_demo")
                .category("אוזניות")
                .maxPrice(2000.0)
                .minRating(4.5)
                .onlyInStock(true)
                .topK(4)
                .build();

        RagQueryResponse res = ragOrchestrationService.processQuery(req);

        assertNotNull(res);
        assertEquals(1, res.executedActions().size());
        assertEquals("addToCartTool", res.executedActions().get(0).toolName());
        assertEquals(1, res.citations().size());
        assertEquals("SONY-WH-1000XM5", res.citations().get(0).skuCode());
    }

    @Test
    void compareProducts_returnsStructuredComparativeVerdict() {
        CatalogVectorDocument doc1 = CatalogVectorDocument.builder()
                .skuCode("MACBOOK-PRO-M3")
                .title("מחשב נייד Apple MacBook Pro 16 M3 Max")
                .price(14490.00)
                .inStock(true)
                .averageRating(4.9)
                .build();
        CatalogVectorDocument doc2 = CatalogVectorDocument.builder()
                .skuCode("SKU-LAPTOP-PRO")
                .title("מחשב נייד Dell XPS 15 OLED")
                .price(8990.00)
                .inStock(true)
                .averageRating(4.7)
                .build();

        when(catalogVectorRepository.findBySkuCode("MACBOOK-PRO-M3")).thenReturn(Optional.of(doc1));
        when(catalogVectorRepository.findBySkuCode("SKU-LAPTOP-PRO")).thenReturn(Optional.of(doc2));
        when(geminiGenerationService.generateProductComparisonVerdict(anyList(), anyList(), eq("עריכת וידאו"), anyLong()))
                .thenReturn(ProductComparisonResponse.builder()
                        .skus(List.of("MACBOOK-PRO-M3", "SKU-LAPTOP-PRO"))
                        .userUseCase("עריכת וידאו")
                        .recommendedSku("MACBOOK-PRO-M3")
                        .recommendedProductTitle("Apple MacBook Pro 16 M3 Max")
                        .verdictSummary("MacBook Pro מוביל בביצועי עריכת וידאו")
                        .categoryWinners(Map.of("ביצועים", "MACBOOK-PRO-M3"))
                        .tradeOffs(List.of())
                        .model("gemini-3.5-flash-lite")
                        .latencyMs(42L)
                        .build());

        ProductComparisonResponse res = ragOrchestrationService.compareProducts(
                new ProductComparisonRequest(List.of("MACBOOK-PRO-M3", "SKU-LAPTOP-PRO"), "עריכת וידאו")
        );

        assertNotNull(res);
        assertEquals("MACBOOK-PRO-M3", res.recommendedSku());
        assertTrue(res.verdictSummary().contains("MacBook Pro"));
    }

    @Test
    void multimodalSearch_extractsVisualFeaturesAndReturnsVectorMatches() {
        CatalogVectorDocument doc = CatalogVectorDocument.builder()
                .skuCode("SONY-WH-1000XM5")
                .title("אוזניות אלחוטיות Sony WH-1000XM5")
                .price(1450.00)
                .inStock(true)
                .averageRating(4.9)
                .build();

        when(geminiGenerationService.extractProductDescriptionFromImage(anyString(), anyString(), anyString()))
                .thenReturn(new GeminiGenerationService.VisionExtractionResult(
                        "אוזניות קשת אלחוטיות עם ביטול רעשים אקטיבי Sony",
                        List.of("ANC", "Bluetooth 5.3", "Sony")
                ));
        when(embeddingService.generateEmbedding(anyString())).thenReturn(List.of(0.1f, 0.2f));
        when(vectorSearchRepository.searchSimilar(anyList(), isNull(), isNull(), isNull(), eq(true), eq(4)))
                .thenReturn(List.of(new VectorSearchRepository.ScoredDocument(doc, 0.91)));
        when(geminiGenerationService.generateGroundedAnswer(anyString(), anyString(), anyList()))
                .thenReturn("זיהיתי אוזניות Sony WH-1000XM5 בתמונה.");
        when(geminiProperties.getModel()).thenReturn("gemini-3.5-flash-lite");

        MultimodalSearchResponse res = ragOrchestrationService.multimodalSearch(
                MultimodalSearchRequest.builder()
                        .imageBase64("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")
                        .mimeType("image/png")
                        .queryText("אוזניות")
                        .topK(4)
                        .build()
        );

        assertNotNull(res);
        assertFalse(res.detectedFeatures().isEmpty());
        assertEquals(1, res.matches().size());
        assertEquals("SONY-WH-1000XM5", res.matches().get(0).skuCode());
    }
}
