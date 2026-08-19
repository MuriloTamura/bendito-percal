package br.com.benditopercal.inventory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "inventory_movements")
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryItemType itemType;

    @Column(nullable = false, length = 36)
    private String itemId;

    @Column(nullable = false, length = 150)
    private String itemNameSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private InventoryMovementType movementType;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;

    @Column(nullable = false, length = 255)
    private String reason;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal balanceAfterMovement;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected InventoryMovement() {}

    public InventoryMovement(InventoryItemType itemType,
                             String itemId,
                             String itemNameSnapshot,
                             InventoryMovementType movementType,
                             BigDecimal quantity,
                             String reason,
                             BigDecimal balanceAfterMovement) {
        this.itemType = itemType;
        this.itemId = itemId;
        this.itemNameSnapshot = itemNameSnapshot;
        this.movementType = movementType;
        this.quantity = quantity;
        this.reason = reason;
        this.balanceAfterMovement = balanceAfterMovement;
    }

    public String getId() { return id; }
    public InventoryItemType getItemType() { return itemType; }
    public String getItemId() { return itemId; }
    public String getItemNameSnapshot() { return itemNameSnapshot; }
    public InventoryMovementType getMovementType() { return movementType; }
    public BigDecimal getQuantity() { return quantity; }
    public String getReason() { return reason; }
    public BigDecimal getBalanceAfterMovement() { return balanceAfterMovement; }
    public Instant getCreatedAt() { return createdAt; }
}
