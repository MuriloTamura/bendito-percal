package br.com.benditopercal.product.dto;

import br.com.benditopercal.product.Product;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
        String id,
        String name,
        String categoryId,
        String categoryName,
        String unitId,
        String unitAbbreviation,
        BigDecimal salePrice,
        BigDecimal quantityInStock,
        BigDecimal minimumStock,
        boolean active,
        Instant createdAt
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getUnit().getId(),
                product.getUnit().getAbbreviation(),
                product.getSalePrice(),
                product.getQuantityInStock(),
                product.getMinimumStock(),
                product.isActive(),
                product.getCreatedAt()
        );
    }
}