package com.company.configurator;

import com.company.configurator.domain.CustomRigBuild;
import com.company.configurator.dto.CreateCustomBuildRequest;
import com.company.configurator.repository.CustomRigBuildRepository;
import com.company.configurator.service.CustomConfiguratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomConfiguratorServiceTest {

    @Mock
    private CustomRigBuildRepository buildRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private CustomConfiguratorService configuratorService;

    @BeforeEach
    void setUp() {
        configuratorService = new CustomConfiguratorService(buildRepository, kafkaTemplate);
    }

    @Test
    void createBuild_Applies14PercentDiscountFor4Components() {
        when(buildRepository.save(any(CustomRigBuild.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateCustomBuildRequest req = CreateCustomBuildRequest.builder()
                .customerId("cust_99")
                .rigProfileType("GAMING_PRO")
                .selectedSkus(List.of("SKU-1", "SKU-2", "SKU-3", "SKU-4"))
                .baseComponentsTotalILS(BigDecimal.valueOf(10000.00))
                .build();

        CustomRigBuild build = configuratorService.createBuild(req);
        assertEquals(100, build.getCompatibilityScorePct());
        assertEquals(14, build.getAssemblyDiscountPct());
        assertEquals(BigDecimal.valueOf(8600.00).setScale(2), build.getFinalBuildPriceILS());
    }
}
