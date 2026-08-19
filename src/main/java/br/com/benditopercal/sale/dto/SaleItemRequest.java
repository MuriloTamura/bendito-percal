package br.com.benditopercal.sale.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SaleItemRequest(
        @NotBlank String productId,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal quantity
) {}
