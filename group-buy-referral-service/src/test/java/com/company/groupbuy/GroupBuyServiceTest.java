package com.company.groupbuy;

import com.company.groupbuy.domain.GroupBuySquad;
import com.company.groupbuy.dto.JoinGroupBuyRequest;
import com.company.groupbuy.repository.GroupBuySquadRepository;
import com.company.groupbuy.service.GroupBuyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupBuyServiceTest {

    @Mock
    private GroupBuySquadRepository squadRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private GroupBuyService groupBuyService;

    @BeforeEach
    void setUp() {
        groupBuyService = new GroupBuyService(squadRepository, kafkaTemplate);
    }

    @Test
    void joinSquad_UnlocksGroupDiscountWhenTargetParticipantsReached() {
        GroupBuySquad squad = GroupBuySquad.builder()
                .id("sq_1")
                .squadCode("SQUAD-TEST")
                .targetParticipants(5)
                .currentParticipants(4)
                .status("OPEN")
                .participantNames(new ArrayList<>())
                .build();

        when(squadRepository.findById("sq_1")).thenReturn(Optional.of(squad));
        when(squadRepository.save(any(GroupBuySquad.class))).thenAnswer(inv -> inv.getArgument(0));

        JoinGroupBuyRequest req = JoinGroupBuyRequest.builder()
                .customerId("usr_demo")
                .customerName("עידן קזם")
                .build();

        GroupBuySquad updated = groupBuyService.joinSquad("sq_1", req);
        assertEquals(5, updated.getCurrentParticipants());
        assertEquals("UNLOCKED", updated.getStatus());
        assertTrue(updated.getParticipantNames().contains("עידן קזם"));
    }
}
