CREATE TABLE inventory (
    id UUID PRIMARY KEY,
    sku_code VARCHAR(64) NOT NULL UNIQUE,
    product_name VARCHAR(128) NOT NULL,
    available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY,
    reservation_id VARCHAR(128) NOT NULL,
    sku_code VARCHAR(64) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_sku ON inventory(sku_code);
CREATE INDEX idx_reservations_res_id ON inventory_reservations(reservation_id);

-- Pre-seeded initial catalog stock
INSERT INTO inventory (id, sku_code, product_name, available_quantity, reserved_quantity, unit_price)
VALUES 
    (gen_random_uuid(), 'IPHONE-16-PRO-256', 'Apple iPhone 16 Pro 256GB Desert Titanium', 50, 0, 4899.00),
    (gen_random_uuid(), 'CASE-CLEAR-MAGSAFE', 'Clear Case with MagSafe for iPhone 16', 100, 0, 150.00),
    (gen_random_uuid(), 'MACBOOK-PRO-M3', 'Apple MacBook Pro 14 M3 Pro 18GB 512GB', 25, 0, 8999.00),
    (gen_random_uuid(), 'AIRPODS-PRO-2', 'Apple AirPods Pro (2nd generation) USB-C', 80, 0, 899.00),
    (gen_random_uuid(), 'SKU-LAPTOP-PRO', 'Dell XPS 15 OLED Intel Core i9 32GB', 30, 0, 6500.00),
    (gen_random_uuid(), 'SKU-MOUSE-WIRELESS', 'Logitech MX Master 3S Wireless Mouse', 120, 0, 250.00);
