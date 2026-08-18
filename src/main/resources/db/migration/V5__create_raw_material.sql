CREATE TABLE raw_materials (
                               id VARCHAR(36) PRIMARY KEY,
                               name VARCHAR(150) NOT NULL,
                               category_id VARCHAR(36) NOT NULL REFERENCES categories(id),
                               unit_id VARCHAR(36) NOT NULL REFERENCES units(id),
                               quantity_in_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
                               minimum_stock NUMERIC(12,3),
                               active BOOLEAN NOT NULL DEFAULT TRUE,
                               created_at TIMESTAMP NOT NULL DEFAULT now()
);