-- V2: Seed additional catalog products (Apple Watch Ultra 2 & AirPods Max)
INSERT INTO inventory (id, sku_code, product_name, available_quantity, reserved_quantity, unit_price)
VALUES 
    (gen_random_uuid(), 'WATCH-ULTRA-2', 'Apple Watch Ultra 2 GPS + Cellular', 40, 0, 3499.00),
    (gen_random_uuid(), 'AIRPODS-MAX', 'Apple AirPods Max USB-C', 50, 0, 2199.00)
ON CONFLICT (sku_code) DO NOTHING;
