ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(32);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) DEFAULT 0.00;

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    discount_type VARCHAR(16) NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
    max_discount_cap NUMERIC(10, 2),
    max_uses INTEGER NOT NULL DEFAULT 1000,
    current_uses INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 years'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coupon_code ON coupons(code);

-- Insert initial coupons
INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_cap, max_uses, current_uses, valid_from, valid_until, is_active)
VALUES 
    (gen_random_uuid(), 'WELCOME10', 'PERCENTAGE', 10.00, 0.00, 500.00, 10000, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '10 years', true),
    (gen_random_uuid(), 'SUPER500', 'FIXED_AMOUNT', 500.00, 3000.00, NULL, 5000, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '10 years', true),
    (gen_random_uuid(), 'VIP20', 'PERCENTAGE', 20.00, 5000.00, 1500.00, 2000, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '10 years', true)
ON CONFLICT (code) DO NOTHING;
