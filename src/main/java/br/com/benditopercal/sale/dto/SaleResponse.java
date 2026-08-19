package br.com.benditopercal.sale.dto;

import br.com.benditopercal.sale.Sale;
import br.com.benditopercal.sale.SaleStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record SaleResponse(
        String id,
        String customerName,
        SaleStatus status,
        BigDecimal totalAmount,
        Instant createdAt,
        List<ItemResponse> items
) {
    public record ItemResponse(
            String productId,
            String productName,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal
    ) {}

    public static SaleResponse from(Sale sale) {
        return new SaleResponse(
                sale.getId(),
                sale.getCustomerName(),
                sale.getStatus(),
                sale.getTotalAmount(),
                sale.getCreatedAt(),
                sale.getItems().stream()
                        .map(item -> new ItemResponse(
                                item.getProduct().getId(),
                                item.getProductNameSnapshot(),
                                item.getQuantity(),
                                item.getUnitPrice(),
                                item.getSubtotal()
                        ))
                        .toList()
        );
    }
}
