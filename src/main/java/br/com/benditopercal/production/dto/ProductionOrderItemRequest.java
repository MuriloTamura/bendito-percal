package br.com.benditopercal.production.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductionOrderItemRequest(
        @NotBlank String rawMaterialId,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal quantityConsumed
) {}