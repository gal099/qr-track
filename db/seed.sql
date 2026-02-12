-- Sample data for testing QR Track application
-- Run this after running schema.sql or migrations

-- Insert sample QR codes
INSERT INTO qr_codes (short_code, target_url, fg_color, bg_color) VALUES
('abc123xyz', 'https://example.com', '#000000', '#FFFFFF'),
('def456uvw', 'https://google.com', '#FF0000', '#FFFF00'),
('ghi789rst', 'https://github.com', '#0000FF', '#E0E0E0');

-- Insert sample scans
INSERT INTO scans (qr_code_id, scanned_at, user_agent, device_type, browser, country, city) VALUES
(1, NOW() - INTERVAL '1 day', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)', 'mobile', 'Safari', 'US', 'San Francisco'),
(1, NOW() - INTERVAL '12 hours', 'Mozilla/5.0 (Windows NT 10.0)', 'desktop', 'Chrome', 'US', 'New York'),
(1, NOW() - INTERVAL '2 hours', 'Mozilla/5.0 (Linux; Android 11)', 'mobile', 'Chrome', 'UK', 'London'),
(2, NOW() - INTERVAL '5 hours', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'desktop', 'Safari', 'CA', 'Toronto'),
(2, NOW() - INTERVAL '1 hour', 'Mozilla/5.0 (iPad; CPU OS 15_0)', 'tablet', 'Safari', 'US', 'Austin');
