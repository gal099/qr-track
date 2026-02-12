-- QR Track Database Schema
-- PostgreSQL 15+
-- Complete schema for fresh database installations

-- Table: qr_codes
-- Stores metadata for each generated QR code
CREATE TABLE qr_codes (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(21) UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    fg_color VARCHAR(7) NOT NULL DEFAULT '#000000',
    bg_color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    scan_count INTEGER DEFAULT 0 NOT NULL
);

-- Indexes for qr_codes
CREATE UNIQUE INDEX idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX idx_qr_codes_created_at ON qr_codes(created_at DESC);

-- Constraints for qr_codes
ALTER TABLE qr_codes
    ADD CONSTRAINT check_fg_color_format CHECK (fg_color ~ '^#[0-9A-Fa-f]{6}$'),
    ADD CONSTRAINT check_bg_color_format CHECK (bg_color ~ '^#[0-9A-Fa-f]{6}$'),
    ADD CONSTRAINT check_target_url_not_empty CHECK (LENGTH(target_url) > 0);

-- Table: scans
-- Stores individual scan events for analytics
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

-- Indexes for scans
CREATE INDEX idx_scans_qr_code_id ON scans(qr_code_id);
CREATE INDEX idx_scans_scanned_at ON scans(scanned_at DESC);

-- Constraints for scans
ALTER TABLE scans
    ADD CONSTRAINT check_device_type_enum
        CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown') OR device_type IS NULL);

-- Optional: Trigger to automatically update scan_count
-- Uncomment if you want denormalized scan counts updated automatically
-- CREATE OR REPLACE FUNCTION increment_scan_count()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     UPDATE qr_codes
--     SET scan_count = scan_count + 1
--     WHERE id = NEW.qr_code_id;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER trigger_increment_scan_count
-- AFTER INSERT ON scans
-- FOR EACH ROW
-- EXECUTE FUNCTION increment_scan_count();
