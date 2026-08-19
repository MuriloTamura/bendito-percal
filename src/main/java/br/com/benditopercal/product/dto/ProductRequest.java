package br.com.benditopercal.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank String name,
        @NotBlank String categoryId,
        @NotBlank String unitId,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal salePrice,
        @DecimalMin(value = "0", inclusive = true) BigDecimal minimumStock
) {}