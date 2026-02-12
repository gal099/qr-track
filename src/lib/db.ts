import { sql } from '@vercel/postgres';
import type { QRCode, Scan } from '@/types/database';

/**
 * Database utility functions for QR Track
 * Uses @vercel/postgres for edge-compatible database access
 */

// QR Code queries
export async function createQRCode(
  shortCode: string,
  targetUrl: string,
  fgColor: string,
  bgColor: string
): Promise<QRCode> {
  const result = await sql<QRCode>`
    INSERT INTO qr_codes (short_code, target_url, fg_color, bg_color)
    VALUES (${shortCode}, ${targetUrl}, ${fgColor}, ${bgColor})
    RETURNING *
  `;

  return result.rows[0];
}

export async function getQRCodeByShortCode(
  shortCode: string
): Promise<QRCode | null> {
  const result = await sql<QRCode>`
    SELECT * FROM qr_codes
    WHERE short_code = ${shortCode}
    LIMIT 1
  `;

  return result.rows[0] || null;
}

export async function getQRCodeById(id: number): Promise<QRCode | null> {
  const result = await sql<QRCode>`
    SELECT * FROM qr_codes
    WHERE id = ${id}
    LIMIT 1
  `;

  return result.rows[0] || null;
}

// Scan queries
export async function createScan(scan: {
  qr_code_id: number;
  user_agent: string | null;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO scans (
      qr_code_id,
      user_agent,
      ip_address,
      country,
      city,
      device_type,
      browser
    )
    VALUES (
      ${scan.qr_code_id},
      ${scan.user_agent},
      ${scan.ip_address},
      ${scan.country},
      ${scan.city},
      ${scan.device_type},
      ${scan.browser}
    )
  `;
}

// Analytics queries
export async function getTotalScans(qrCodeId: number): Promise<number> {
  const result = await sql<{ count: string }>`
    SELECT COUNT(*) as count
    FROM scans
    WHERE qr_code_id = ${qrCodeId}
  `;

  return parseInt(result.rows[0].count);
}

export async function getScansByDate(
  qrCodeId: number
): Promise<{ date: string; count: number }[]> {
  const result = await sql<{ date: string; count: string }>`
    SELECT
      DATE(scanned_at) as date,
      COUNT(*) as count
    FROM scans
    WHERE qr_code_id = ${qrCodeId}
    GROUP BY DATE(scanned_at)
    ORDER BY date ASC
  `;

  return result.rows.map((row) => ({
    date: row.date,
    count: parseInt(row.count),
  }));
}

export async function getDeviceBreakdown(
  qrCodeId: number
): Promise<{ device_type: string; count: number }[]> {
  const result = await sql<{ device_type: string; count: string }>`
    SELECT
      COALESCE(device_type, 'unknown') as device_type,
      COUNT(*) as count
    FROM scans
    WHERE qr_code_id = ${qrCodeId}
    GROUP BY device_type
  `;

  return result.rows.map((row) => ({
    device_type: row.device_type,
    count: parseInt(row.count),
  }));
}

export async function getBrowserBreakdown(
  qrCodeId: number
): Promise<{ browser: string; count: number }[]> {
  const result = await sql<{ browser: string; count: string }>`
    SELECT
      COALESCE(browser, 'unknown') as browser,
      COUNT(*) as count
    FROM scans
    WHERE qr_code_id = ${qrCodeId}
    GROUP BY browser
    ORDER BY count DESC
    LIMIT 10
  `;

  return result.rows.map((row) => ({
    browser: row.browser,
    count: parseInt(row.count),
  }));
}

export async function getLocationBreakdown(
  qrCodeId: number
): Promise<{ country: string; city: string; count: number }[]> {
  const result = await sql<{ country: string; city: string; count: string }>`
    SELECT
      COALESCE(country, 'unknown') as country,
      COALESCE(city, 'unknown') as city,
      COUNT(*) as count
    FROM scans
    WHERE qr_code_id = ${qrCodeId}
    GROUP BY country, city
    ORDER BY count DESC
    LIMIT 20
  `;

  return result.rows.map((row) => ({
    country: row.country,
    city: row.city,
    count: parseInt(row.count),
  }));
}
