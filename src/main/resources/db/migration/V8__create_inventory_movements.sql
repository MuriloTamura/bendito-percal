CREATE TABLE inventory_movements (
    id VARCHAR(36) PRIMARY KEY,
    item_type VARCHAR(20) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    item_name_snapshot VARCHAR(150) NOT NULL,
    movement_type VARCHAR(10) NOT NULL,
    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    reason VARCHAR(255) NOT NULL,
    balance_after_movement NUMERIC(12,3) NOT NULL CHECK (balance_after_movement >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_inventory_item_type CHECK (item_type IN ('PRODUCT', 'RAW_MATERIAL')),
    CONSTRAINT ck_inventory_movement_type CHECK (movement_type IN ('ENTRY', 'EXIT'))
);

CREATE INDEX idx_inventory_movements_item
    ON inventory_movements (item_type, item_id, created_at DESC);

CREATE INDEX idx_inventory_movements_created_at
    ON inventory_movements (created_at DESC);
