CREATE TABLE sales (
    id VARCHAR(36) PRIMARY KEY,
    customer_name VARCHAR(150),
    status VARCHAR(20) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_sales_status CHECK (status IN ('COMPLETED'))
);

CREATE TABLE sale_items (
    id VARCHAR(36) PRIMARY KEY,
    sale_id VARCHAR(36) NOT NULL REFERENCES sales(id),
    product_id VARCHAR(36) NOT NULL REFERENCES products(id),
    product_name_snapshot VARCHAR(150) NOT NULL,
    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX idx_sales_created_at ON sales (created_at DESC);
CREATE INDEX idx_sale_items_sale_id ON sale_items (sale_id);
