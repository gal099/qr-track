-- Migration 002: Create scans table
-- Created: 2026-02-12

CREATE TABLE scans (
    id SERIAL PRIMARY KEY,
    qr_code_id INTEGER NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20),
    browser VARCHAR(50)
);

-- Indexes for analytics queries
CREATE INDEX idx_scans_qr_code_id ON scans(qr_code_id);
CREATE INDEX idx_scans_scanned_at ON scans(scanned_at DESC);

-- Validation constraints
ALTER TABLE scans
    ADD CONSTRAINT check_device_type_enum
        CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown') OR device_type IS NULL);
