package br.com.benditopercal.production.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record ProductionOrderRequest(
        @NotBlank String productId,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal quantityProduced,
        @NotEmpty @Valid List<ProductionOrderItemRequest> items
) {}