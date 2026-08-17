CREATE TABLE units (
                       id VARCHAR(36) PRIMARY KEY,
                       name VARCHAR(50) NOT NULL UNIQUE,
                       abbreviation VARCHAR(10) NOT NULL UNIQUE
);