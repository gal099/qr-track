import { nanoid } from 'nanoid';
import UAParser from 'ua-parser-js';

/**
 * Generate a cryptographically secure short code for URLs
 * @param length - Length of the short code (default: 10)
 * @returns Random alphanumeric string
 */
export function generateShortCode(length: number = 10): string {
  return nanoid(length);
}

/**
 * Parse user agent string to extract device type and browser
 * @param userAgent - User agent string from request
 * @returns Parsed device and browser information
 */
export function parseUserAgent(userAgent: string | null): {
  device_type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser: string;
} {
  if (!userAgent) {
    return { device_type: 'unknown', browser: 'unknown' };
  }

  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const browser = parser.getBrowser();

  // Determine device type
  let device_type: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';
  if (device.type === 'mobile') {
    device_type = 'mobile';
  } else if (device.type === 'tablet') {
    device_type = 'tablet';
  } else if (!device.type || device.type === 'console' || device.type === 'wearable') {
    device_type = 'desktop'; // Assume desktop if no specific device type
  } else {
    device_type = 'desktop';
  }

  const browserName = browser.name || 'unknown';

  return {
    device_type,
    browser: browserName,
  };
}

/**
 * Truncate IP address for privacy (GDPR compliance)
 * Removes the last octet of IPv4 addresses
 * @param ip - IP address string
 * @returns Truncated IP address
 */
export function truncateIP(ip: string | null): string | null {
  if (!ip) return null;

  // IPv4: Remove last octet (e.g., 192.168.1.100 → 192.168.1.0)
  if (ip.includes('.')) {
    const parts = ip.split('.');
    parts[3] = '0';
    return parts.join('.');
  }

  // IPv6: Just store first 64 bits (simplified approach)
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + '::';
  }

  return ip;
}

/**
 * Get base URL from environment variable or default
 * @returns Base URL for the application
 */
export function getBaseURL(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
