package br.com.benditopercal.inventory.dto;

import br.com.benditopercal.inventory.InventoryItemType;
import br.com.benditopercal.inventory.InventoryMovement;
import br.com.benditopercal.inventory.InventoryMovementType;

import java.math.BigDecimal;
import java.time.Instant;

public record InventoryMovementResponse(
        String id,
        InventoryItemType itemType,
        String itemId,
        String itemName,
        InventoryMovementType movementType,
        BigDecimal quantity,
        String reason,
        BigDecimal balanceAfterMovement,
        Instant createdAt
) {
    public static InventoryMovementResponse from(InventoryMovement movement) {
        return new InventoryMovementResponse(
                movement.getId(),
                movement.getItemType(),
                movement.getItemId(),
                movement.getItemNameSnapshot(),
                movement.getMovementType(),
                movement.getQuantity(),
                movement.getReason(),
                movement.getBalanceAfterMovement(),
                movement.getCreatedAt()
        );
    }
}
