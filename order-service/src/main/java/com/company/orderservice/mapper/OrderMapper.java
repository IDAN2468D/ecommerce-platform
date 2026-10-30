package com.company.orderservice.mapper;

import com.company.orderservice.domain.entity.OrderEntity;
import com.company.orderservice.domain.entity.OrderItemEntity;
import com.company.orderservice.dto.response.OrderResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    @Mapping(target = "orderId", source = "id")
    @Mapping(target = "items", source = "items")
    OrderResponse toResponse(OrderEntity entity);

    List<OrderResponse> toResponseList(List<OrderEntity> entities);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "skuCode", source = "skuCode")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "unitPrice", source = "unitPrice")
    OrderResponse.OrderItemResponse toItemResponse(OrderItemEntity itemEntity);
}
