package br.com.benditopercal.inventory.dto;

import br.com.benditopercal.inventory.InventoryItemType;
import br.com.benditopercal.inventory.InventoryMovementType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record InventoryMovementRequest(
        @NotNull InventoryItemType itemType,
        @NotBlank String itemId,
        @NotNull InventoryMovementType movementType,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal quantity,
        @NotBlank @Size(max = 255) String reason
) {}
