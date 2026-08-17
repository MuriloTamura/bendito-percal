CREATE TABLE users (
                       id VARCHAR(36) PRIMARY KEY,
                       email VARCHAR(150) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       name VARCHAR(150) NOT NULL,
                       role VARCHAR(20) NOT NULL,
                       active BOOLEAN NOT NULL DEFAULT TRUE,
                       created_at TIMESTAMP NOT NULL DEFAULT now()
);