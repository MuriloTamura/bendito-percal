CREATE TABLE categories (
                            id VARCHAR(36) PRIMARY KEY,
                            name VARCHAR(150) NOT NULL UNIQUE,
                            active BOOLEAN NOT NULL DEFAULT TRUE,
                            created_at TIMESTAMP NOT NULL DEFAULT now()
);