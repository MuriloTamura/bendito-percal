CREATE TABLE production_orders (
                                   id VARCHAR(36) PRIMARY KEY,
                                   product_id VARCHAR(36) NOT NULL REFERENCES products(id),
                                   product_name_snapshot VARCHAR(150) NOT NULL,
                                   quantity_produced NUMERIC(12,3) NOT NULL,
                                   status VARCHAR(20) NOT NULL,
                                   created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE production_order_items (
                                        id VARCHAR(36) PRIMARY KEY,
                                        production_order_id VARCHAR(36) NOT NULL REFERENCES production_orders(id),
                                        raw_material_id VARCHAR(36) NOT NULL REFERENCES raw_materials(id),
                                        raw_material_name_snapshot VARCHAR(150) NOT NULL,
                                        quantity_consumed NUMERIC(12,3) NOT NULL
);