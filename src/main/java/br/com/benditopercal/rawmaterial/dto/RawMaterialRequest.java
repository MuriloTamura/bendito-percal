package br.com.benditopercal.rawmaterial.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record RawMaterialRequest(
        @NotBlank String name,
        @NotBlank String categoryId,
        @NotBlank String unitId,
        @DecimalMin(value = "0", inclusive = true) BigDecimal minimumStock
) {}