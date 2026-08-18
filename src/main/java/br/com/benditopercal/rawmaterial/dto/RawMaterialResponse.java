package br.com.benditopercal.rawmaterial.dto;

import br.com.benditopercal.rawmaterial.RawMaterial;

import java.math.BigDecimal;
import java.time.Instant;

public record RawMaterialResponse(
        String id,
        String name,
        String categoryId,
        String categoryName,
        String unitId,
        String unitAbbreviation,
        BigDecimal quantityInStock,
        BigDecimal minimumStock,
        boolean active,
        Instant createdAt
) {
    public static RawMaterialResponse from(RawMaterial rawMaterial) {
        return new RawMaterialResponse(
                rawMaterial.getId(),
                rawMaterial.getName(),
                rawMaterial.getCategory().getId(),
                rawMaterial.getCategory().getName(),
                rawMaterial.getUnit().getId(),
                rawMaterial.getUnit().getAbbreviation(),
                rawMaterial.getQuantityInStock(),
                rawMaterial.getMinimumStock(),
                rawMaterial.isActive(),
                rawMaterial.getCreatedAt()
        );
    }
}