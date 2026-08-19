package br.com.benditopercal.production.dto;

import br.com.benditopercal.production.ProductionOrder;
import br.com.benditopercal.production.ProductionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProductionOrderResponse(
        String id,
        String productId,
        String productName,
        BigDecimal quantityProduced,
        ProductionStatus status,
        Instant createdAt,
        List<ItemResponse> items
) {
    public record ItemResponse(String rawMaterialId, String rawMaterialName, BigDecimal quantityConsumed) {}

    public static ProductionOrderResponse from(ProductionOrder order) {
        return new ProductionOrderResponse(
                order.getId(),
                order.getProduct().getId(),
                order.getProductNameSnapshot(),
                order.getQuantityProduced(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getItems().stream()
                        .map(item -> new ItemResponse(
                                item.getRawMaterial().getId(),
                                item.getRawMaterialNameSnapshot(),
                                item.getQuantityConsumed()))
                        .toList()
        );
    }
}