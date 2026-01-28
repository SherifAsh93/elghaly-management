
-- Wood Items Table
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,
    type VARCHAR(100),
    length DECIMAL(10, 2),
    width DECIMAL(10, 2),
    thickness DECIMAL(10, 2),
    origin VARCHAR(100),
    bundles INTEGER DEFAULT 0,
    boards_per_bundle INTEGER DEFAULT 0,
    buy_price DECIMAL(15, 2),
    sell_price DECIMAL(15, 2)
);

-- Sales Table
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id),
    item_name VARCHAR(255),
    quantity DECIMAL(10, 2),
    unit_type VARCHAR(20), -- 'bundle' or 'board'
    unit_price DECIMAL(15, 2),
    total_price DECIMAL(15, 2),
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_name VARCHAR(255)
);

-- Purchases Table
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id),
    quantity_bundles INTEGER,
    cost DECIMAL(15, 2),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    supplier VARCHAR(255)
);

-- Clients Table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT
);

-- Employees Table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    salary DECIMAL(15, 2),
    advances DECIMAL(15, 2) DEFAULT 0
);
