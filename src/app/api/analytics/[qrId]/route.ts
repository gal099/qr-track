import { NextRequest, NextResponse } from 'next/server';
import {
  getQRCodeById,
  getTotalScans,
  getScansByDate,
  getDeviceBreakdown,
  getBrowserBreakdown,
  getLocationBreakdown,
} from '@/lib/db';
import type { ScanAnalytics } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { qrId: string } }
) {
  try {
    const qrId = parseInt(params.qrId);

    if (isNaN(qrId)) {
      return NextResponse.json(
        { error: 'Invalid QR code ID' },
        { status: 400 }
      );
    }

    // Check if QR code exists
    const qrCode = await getQRCodeById(qrId);
    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    // Fetch all analytics data in parallel
    const [totalScans, scansByDate, deviceBreakdown, browserBreakdown, locationBreakdown] =
      await Promise.all([
        getTotalScans(qrId),
        getScansByDate(qrId),
        getDeviceBreakdown(qrId),
        getBrowserBreakdown(qrId),
        getLocationBreakdown(qrId),
      ]);

    const analytics: ScanAnalytics = {
      total_scans: totalScans,
      scans_by_date: scansByDate,
      device_breakdown: deviceBreakdown,
      browser_breakdown: browserBreakdown,
      location_breakdown: locationBreakdown,
    };

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}
