-- Migration 001: Create qr_codes table
-- Created: 2026-02-12

CREATE TABLE qr_codes (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(21) UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    fg_color VARCHAR(7) NOT NULL DEFAULT '#000000',
    bg_color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    scan_count INTEGER DEFAULT 0 NOT NULL
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX idx_qr_codes_created_at ON qr_codes(created_at DESC);

-- Validation constraints
ALTER TABLE qr_codes
    ADD CONSTRAINT check_fg_color_format CHECK (fg_color ~ '^#[0-9A-Fa-f]{6}$'),
    ADD CONSTRAINT check_bg_color_format CHECK (bg_color ~ '^#[0-9A-Fa-f]{6}$'),
    ADD CONSTRAINT check_target_url_not_empty CHECK (LENGTH(target_url) > 0);
