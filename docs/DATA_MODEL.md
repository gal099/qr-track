# Data Model

## Entity-Relationship Overview

The QR Track application has a simple, two-table relational model:

- **`qr_codes`**: Stores QR code metadata (target URL, colors, short code)
- **`scans`**: Stores individual scan events for analytics (timestamp, device, location)

**Relationship:** One QR code can have many scans (1:N)

```
┌─────────────────┐         ┌─────────────────┐
│   qr_codes      │         │     scans       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │───────┐ │ id (PK)         │
│ short_code      │       └─│ qr_code_id (FK) │
│ target_url      │         │ scanned_at      │
│ fg_color        │         │ user_agent      │
│ bg_color        │         │ ip_address      │
│ created_at      │         │ country         │
│ scan_count      │         │ city            │
└─────────────────┘         │ device_type     │
                            │ browser         │
                            └─────────────────┘
```

**Design Principles:**
- Normalized schema (no data duplication)
- Use `TEXT` for URLs (no length limit)
- Use `VARCHAR` for short strings (colors, codes)
- Use `TIMESTAMP WITH TIME ZONE` for all timestamps
- Use `SERIAL` or `UUID` for primary keys
- Add indexes on foreign keys and frequently queried columns

---

## Entities

### Entity 1: `qr_codes`

**Description:** Stores metadata for each generated QR code, including the target URL, customization options, and the unique short code used for redirects.

**Fields:**

| Field Name   | Type                     | Required | Description                                      |
|--------------|--------------------------|----------|--------------------------------------------------|
| `id`         | `SERIAL` or `UUID`       | Yes      | Primary key, auto-incrementing or UUID           |
| `short_code` | `VARCHAR(21)`            | Yes      | Unique short code for URL (e.g., "abc123xyz")    |
| `target_url` | `TEXT`                   | Yes      | The destination URL the QR code points to        |
| `fg_color`   | `VARCHAR(7)`             | Yes      | Foreground color in hex format (e.g., "#000000") |
| `bg_color`   | `VARCHAR(7)`             | Yes      | Background color in hex format (e.g., "#FFFFFF") |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Yes    | Timestamp when the QR code was created           |
| `scan_count` | `INTEGER`                | Yes      | Denormalized count of scans (for performance)    |

**Relationships:**
- **Has many:** `scans` (one QR code can have multiple scan events)

**Indexes:**
- `idx_qr_codes_short_code` on `short_code` (UNIQUE) — Fast lookups for redirects
- `idx_qr_codes_created_at` on `created_at` — For sorting/filtering by creation date

**Validation Rules:**
- `short_code`: Must be unique, 21 characters, alphanumeric (a-zA-Z0-9, underscore, hyphen allowed)
- `target_url`: Must be a valid URL (http:// or https://)
- `fg_color`: Must match regex `^#[0-9A-Fa-f]{6}$`
- `bg_color`: Must match regex `^#[0-9A-Fa-f]{6}$`
- `scan_count`: Defaults to 0, incremented on each scan (or computed via COUNT query)

**Default Values:**
- `created_at`: `NOW()`
- `scan_count`: `0`

**Notes:**
- `scan_count` is denormalized for performance (avoid COUNT(*) on every dashboard load)
- Updated via trigger or application logic on each scan insert
- Alternatively, can be computed dynamically (trade-off: slower queries, simpler schema)

---

### Entity 2: `scans`

**Description:** Stores individual scan events for analytics. Each row represents a single scan of a QR code with metadata about the user's device, location, and time.

**Fields:**

| Field Name    | Type                     | Required | Description                                      |
|---------------|--------------------------|----------|--------------------------------------------------|
| `id`          | `SERIAL` or `UUID`       | Yes      | Primary key, auto-incrementing or UUID           |
| `qr_code_id`  | `INTEGER` or `UUID`      | Yes      | Foreign key referencing `qr_codes.id`            |
| `scanned_at`  | `TIMESTAMP WITH TIME ZONE` | Yes    | Timestamp when the QR code was scanned           |
| `user_agent`  | `TEXT`                   | No       | Raw user agent string (e.g., "Mozilla/5.0...")   |
| `ip_address`  | `VARCHAR(45)`            | No       | IPv4 or IPv6 address (hashed or truncated)       |
| `country`     | `VARCHAR(2)`             | No       | ISO 3166-1 alpha-2 country code (e.g., "US")     |
| `city`        | `VARCHAR(100)`           | No       | City name (e.g., "San Francisco")                |
| `device_type` | `VARCHAR(20)`            | No       | Device category: "mobile", "tablet", "desktop"   |
| `browser`     | `VARCHAR(50)`            | No       | Browser name (e.g., "Chrome", "Safari")          |

**Relationships:**
- **Belongs to:** `qr_codes` (via `qr_code_id` foreign key)

**Indexes:**
- `idx_scans_qr_code_id` on `qr_code_id` — Fast lookups for analytics queries
- `idx_scans_scanned_at` on `scanned_at` — For time-series queries (scans over time)
- `idx_scans_country` on `country` — For geographic analytics (optional, add if slow)

**Validation Rules:**
- `qr_code_id`: Must reference an existing `qr_codes.id`
- `scanned_at`: Must be a valid timestamp (defaults to NOW())
- `ip_address`: IPv4 (15 chars max) or IPv6 (45 chars max), optionally hashed for privacy
- `country`: 2-character ISO code or NULL
- `city`: Free-form text or NULL
- `device_type`: One of "mobile", "tablet", "desktop", "unknown", or NULL
- `browser`: Free-form text (parsed from user agent) or NULL

**Default Values:**
- `scanned_at`: `NOW()`

**Notes:**
- **Privacy consideration**: Store hashed or truncated IP addresses (e.g., `192.168.1.xxx`) to comply with GDPR
- **User agent parsing**: Parse on insert (server-side) to populate `device_type` and `browser`
- **Geolocation**: Use Vercel Edge headers or third-party API to populate `country` and `city`
- **Nullable fields**: Device/location data may be unavailable (e.g., VPN, bot traffic) → allow NULL

---

## Database Schema (SQL)

### Table: `qr_codes`

```sql
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

-- Constraints
ALTER TABLE qr_codes
    ADD CONSTRAINT check_fg_color_format CHECK (fg_color ~ '^#[0-9A-Fa-f]{6}$'),
    ADD CONSTRAINT check_bg_color_format CHECK (bg_color ~ '^#[0-9A-Fa-f]{6}$'),
    ADD CONSTRAINT check_target_url_not_empty CHECK (LENGTH(target_url) > 0);
```

### Table: `scans`

```sql
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
CREATE INDEX idx_scans_country ON scans(country); -- Optional, add if geographic queries are slow

-- Constraints
ALTER TABLE scans
    ADD CONSTRAINT check_device_type_enum
        CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown') OR device_type IS NULL);
```

### Optional: Trigger to Update `scan_count`

**Option 1: Use a trigger** (automatically increment `scan_count` on insert into `scans`)

```sql
CREATE OR REPLACE FUNCTION increment_scan_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE qr_codes
    SET scan_count = scan_count + 1
    WHERE id = NEW.qr_code_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_scan_count
AFTER INSERT ON scans
FOR EACH ROW
EXECUTE FUNCTION increment_scan_count();
```

**Option 2: Compute dynamically** (remove `scan_count` column, use `COUNT(*)` in queries)

```sql
-- Query to get scan count for a QR code:
SELECT
    qr.id,
    qr.short_code,
    qr.target_url,
    COUNT(s.id) AS scan_count
FROM qr_codes qr
LEFT JOIN scans s ON qr.id = s.qr_code_id
WHERE qr.id = $1
GROUP BY qr.id;
```

**Recommendation for MVP:** Use Option 2 (dynamic COUNT) for simplicity. Add denormalized `scan_count` later if queries become slow (unlikely at <10k scans per QR code).

---

## Data Access Patterns

### Query 1: Generate QR Code (INSERT)

**Frequency:** High (user-initiated)

**Query:**
```sql
INSERT INTO qr_codes (short_code, target_url, fg_color, bg_color)
VALUES ($1, $2, $3, $4)
RETURNING id, short_code, created_at;
```

**Optimization:**
- Unique index on `short_code` ensures no duplicates
- Use transaction to check uniqueness + insert (or retry on conflict)

**Alternative (upsert with conflict handling):**
```sql
INSERT INTO qr_codes (short_code, target_url, fg_color, bg_color)
VALUES ($1, $2, $3, $4)
ON CONFLICT (short_code) DO NOTHING
RETURNING id, short_code;
-- If RETURNING is empty, generate new short_code and retry
```

---

### Query 2: Redirect (SELECT + INSERT)

**Frequency:** Very High (every QR code scan)

**Query 1 (Lookup target URL):**
```sql
SELECT id, target_url
FROM qr_codes
WHERE short_code = $1
LIMIT 1;
```

**Optimization:**
- UNIQUE index on `short_code` makes this O(log n)
- Expected latency: <10ms for 10k rows

**Query 2 (Record scan event - asynchronous):**
```sql
INSERT INTO scans (qr_code_id, scanned_at, user_agent, ip_address, country, city, device_type, browser)
VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7);
```

**Optimization:**
- Run asynchronously (non-blocking) to avoid slowing down redirect
- Index on `qr_code_id` for fast JOINs in analytics queries

---

### Query 3: Get Analytics for a QR Code

**Frequency:** Medium (user views dashboard)

**Query (Total Scans + Breakdown):**
```sql
-- Total scans
SELECT COUNT(*) AS total_scans
FROM scans
WHERE qr_code_id = $1;

-- Scans over time (daily)
SELECT
    DATE(scanned_at) AS date,
    COUNT(*) AS scan_count
FROM scans
WHERE qr_code_id = $1
GROUP BY DATE(scanned_at)
ORDER BY date ASC;

-- Device breakdown
SELECT
    device_type,
    COUNT(*) AS count
FROM scans
WHERE qr_code_id = $1
GROUP BY device_type;

-- Browser breakdown
SELECT
    browser,
    COUNT(*) AS count
FROM scans
WHERE qr_code_id = $1
GROUP BY browser
ORDER BY count DESC
LIMIT 10;

-- Geographic breakdown
SELECT
    country,
    city,
    COUNT(*) AS count
FROM scans
WHERE qr_code_id = $1
GROUP BY country, city
ORDER BY count DESC
LIMIT 20;
```

**Optimization:**
- Index on `qr_code_id` ensures fast filtering
- Index on `scanned_at` speeds up time-series queries
- For large datasets (>10k scans), consider caching aggregated results (Redis, 5-minute TTL)

**Alternative (Single Query with CTEs):**
```sql
WITH scan_stats AS (
    SELECT
        qr_code_id,
        scanned_at,
        device_type,
        browser,
        country,
        city
    FROM scans
    WHERE qr_code_id = $1
)
SELECT
    (SELECT COUNT(*) FROM scan_stats) AS total_scans,
    (SELECT json_agg(daily) FROM (
        SELECT DATE(scanned_at) AS date, COUNT(*) AS count
        FROM scan_stats
        GROUP BY DATE(scanned_at)
        ORDER BY date ASC
    ) daily) AS scans_by_date,
    (SELECT json_agg(device) FROM (
        SELECT device_type, COUNT(*) AS count
        FROM scan_stats
        GROUP BY device_type
    ) device) AS device_breakdown;
```

---

### Query 4: List Recent QR Codes (Optional - Post-MVP)

**Frequency:** Low (if we add "My QR Codes" page)

**Query:**
```sql
SELECT
    id,
    short_code,
    target_url,
    fg_color,
    bg_color,
    created_at,
    scan_count
FROM qr_codes
ORDER BY created_at DESC
LIMIT 20 OFFSET $1;
```

**Optimization:**
- Index on `created_at DESC` for fast sorting
- Pagination with `LIMIT` and `OFFSET`

---

## Data Migration Strategy

### For MVP (Manual SQL Migrations)

**Approach:**
1. Write migration SQL files (e.g., `001_create_qr_codes.sql`, `002_create_scans.sql`)
2. Run manually via `psql` or Vercel Postgres dashboard
3. Track applied migrations in a `migrations` table (optional)

**Example Migration Table:**
```sql
CREATE TABLE schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Apply Migration:**
```bash
# Run migration file
psql $POSTGRES_URL -f migrations/001_create_qr_codes.sql

# Record migration
psql $POSTGRES_URL -c "INSERT INTO schema_migrations (version) VALUES (1);"
```

### For Post-MVP (Prisma Migrations or dbmate)

**Prisma Migrate:**
```bash
npx prisma migrate dev --name create_qr_codes
npx prisma migrate deploy  # Apply to production
```

**dbmate (Go-based migration tool):**
```bash
dbmate new create_qr_codes
dbmate up  # Apply pending migrations
```

**Recommendation:** Start with manual SQL for MVP (2 tables = 2 migration files). Add Prisma later if schema changes frequently.

---

## Backup & Recovery

### Vercel Postgres Backups (Automatic)

**Free Tier:**
- Daily automatic backups (retained for 7 days)
- Point-in-time recovery available on paid plans

**Manual Backups:**
```bash
# Export database to SQL file
pg_dump $POSTGRES_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $POSTGRES_URL < backup_20260101.sql
```

### Disaster Recovery Plan

1. **Daily Backups:** Vercel handles automatically
2. **Weekly Manual Backups:** Export to S3 or local storage (optional)
3. **Pre-Deployment Backup:** Always backup before schema changes
4. **Rollback Procedure:**
   - Restore from most recent backup
   - Replay recent transactions (if logged)

### Data Retention Policy

- **QR Codes:** Retain indefinitely (or until user requests deletion)
- **Scans:** Retain for 1 year (or indefinitely if storage allows)
- **Logs:** Retain for 30 days (Vercel default)

---

## TypeScript Interfaces (Application Layer)

**For type safety, define TypeScript interfaces matching database schema:**

```typescript
// types/database.ts

export interface QRCode {
  id: number;
  short_code: string;
  target_url: string;
  fg_color: string;
  bg_color: string;
  created_at: Date;
  scan_count: number;
}

export interface Scan {
  id: number;
  qr_code_id: number;
  scanned_at: Date;
  user_agent: string | null;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  device_type: 'mobile' | 'tablet' | 'desktop' | 'unknown' | null;
  browser: string | null;
}

export interface ScanAnalytics {
  total_scans: number;
  scans_by_date: { date: string; count: number }[];
  device_breakdown: { device_type: string; count: number }[];
  browser_breakdown: { browser: string; count: number }[];
  location_breakdown: { country: string; city: string; count: number }[];
}
```

---

## Sample Data (For Testing)

```sql
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
(2, NOW() - INTERVAL '5 hours', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'desktop', 'Safari', 'CA', 'Toronto');
```

---

## Schema Version Control

**Recommendation:** Store SQL migration files in `db/migrations/` directory:

```
db/
├── migrations/
│   ├── 001_create_qr_codes_table.sql
│   ├── 002_create_scans_table.sql
│   └── 003_add_scan_count_trigger.sql
└── schema.sql  # Full schema for fresh installs
```

**schema.sql (Full Schema for Documentation):**
```sql
-- Complete schema in a single file (for reference)
-- Apply migrations sequentially in production

-- ... (combine all CREATE TABLE statements from above)
```

---

## Future Schema Enhancements (Post-MVP)

If we add authentication or advanced features:

1. **Users Table:**
   ```sql
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       email VARCHAR(255) UNIQUE NOT NULL,
       password_hash VARCHAR(255),
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   ALTER TABLE qr_codes ADD COLUMN user_id INTEGER REFERENCES users(id);
   ```

2. **QR Code Templates:**
   ```sql
   CREATE TABLE templates (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100),
       fg_color VARCHAR(7),
       bg_color VARCHAR(7),
       is_public BOOLEAN DEFAULT true
   );
   ```

3. **Custom Short Codes (Vanity URLs):**
   ```sql
   ALTER TABLE qr_codes ADD COLUMN is_custom BOOLEAN DEFAULT false;
   -- User-provided short_code if is_custom = true
   ```

4. **QR Code Expiration:**
   ```sql
   ALTER TABLE qr_codes ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
   CREATE INDEX idx_qr_codes_expires_at ON qr_codes(expires_at);
   ```

---

## Summary

**Data Model Characteristics:**
- ✅ Simple, normalized schema (2 tables)
- ✅ Clear 1:N relationship (QR codes → scans)
- ✅ Optimized for analytics queries (indexes on `qr_code_id`, `scanned_at`)
- ✅ Privacy-conscious (hashed/truncated IPs, minimal PII)
- ✅ Scales to 10k QR codes and 100k scans without issues
- ✅ Easy to extend (add columns or tables as needed)

**Total Storage Estimate (MVP):**
- 100 QR codes × 200 bytes = 20 KB
- 1,000 scans × 300 bytes = 300 KB
- **Total: ~320 KB** (well within Vercel Postgres free tier: 256 MB)
