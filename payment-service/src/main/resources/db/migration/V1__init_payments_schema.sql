CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY,
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    customer_id VARCHAR(64) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(32) NOT NULL,
    gateway_transaction_id VARCHAR(128),
    payment_method_token VARCHAR(128),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_refunds (
    id UUID PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES payment_transactions(id),
    refund_amount NUMERIC(12, 2) NOT NULL,
    reason TEXT,
    refund_status VARCHAR(32) NOT NULL DEFAULT 'SUCCEEDED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_customer ON payment_transactions(customer_id);
CREATE INDEX idx_payments_idempotency ON payment_transactions(idempotency_key);
