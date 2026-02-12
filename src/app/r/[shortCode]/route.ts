import { NextRequest, NextResponse } from 'next/server';
import { getQRCodeByShortCode, createScan } from '@/lib/db';
import { parseUserAgent, truncateIP } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = params;

    // Look up QR code
    const qrCode = await getQRCodeByShortCode(shortCode);

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    // Parse request metadata for analytics
    const userAgent = request.headers.get('user-agent');
    const { device_type, browser } = parseUserAgent(userAgent);

    // Get IP and geolocation from Vercel headers
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const country = request.headers.get('x-vercel-ip-country') || null;
    const city = request.headers.get('x-vercel-ip-city') || null;

    // Truncate IP for privacy (GDPR compliance)
    const truncatedIP = truncateIP(ip);

    // Track scan event asynchronously (non-blocking)
    createScan({
      qr_code_id: qrCode.id,
      user_agent: userAgent,
      ip_address: truncatedIP,
      country,
      city,
      device_type,
      browser,
    }).catch((error) => {
      // Log error but don't fail the redirect
      console.error('Failed to track scan:', error);
    });

    // Redirect to target URL (302 temporary redirect)
    return NextResponse.redirect(qrCode.target_url, 302);
  } catch (error: any) {
    console.error('Redirect error:', error);
    return NextResponse.json(
      { error: 'Redirect failed', details: error.message },
      { status: 500 }
    );
  }
}
