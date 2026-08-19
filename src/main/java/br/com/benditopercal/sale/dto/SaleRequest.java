package br.com.benditopercal.sale.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SaleRequest(
        @Size(max = 150) String customerName,
        @NotEmpty List<@Valid SaleItemRequest> items
) {}
