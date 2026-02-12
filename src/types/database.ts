// Database entity types matching PostgreSQL schema

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

// API response types
export interface ScanAnalytics {
  total_scans: number;
  scans_by_date: { date: string; count: number }[];
  device_breakdown: { device_type: string; count: number }[];
  browser_breakdown: { browser: string; count: number }[];
  location_breakdown: { country: string; city: string; count: number }[];
}

export interface GenerateQRResponse {
  id: number;
  short_code: string;
  short_url: string;
  qr_code_data_url: string;
  analytics_url: string;
}
