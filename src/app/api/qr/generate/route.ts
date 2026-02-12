import { NextRequest, NextResponse } from 'next/server';
import { generateQRSchema } from '@/types/api';
import { createQRCode } from '@/lib/db';
import { generateQRCodeDataURL } from '@/lib/qr-generator';
import { generateShortCode, getBaseURL } from '@/lib/utils';
import type { GenerateQRResponse } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = generateQRSchema.parse(body);

    // Generate unique short code
    let shortCode = generateShortCode(10);
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    // Retry if short code already exists (unlikely with nanoid)
    while (attempts < MAX_ATTEMPTS) {
      try {
        // Create QR code record in database
        const qrCode = await createQRCode(
          shortCode,
          validatedData.targetUrl,
          validatedData.fgColor,
          validatedData.bgColor
        );

        // Generate QR code image
        const baseURL = getBaseURL();
        const shortUrl = `${baseURL}/r/${shortCode}`;
        const qrCodeDataUrl = await generateQRCodeDataURL(
          shortUrl,
          validatedData.fgColor,
          validatedData.bgColor
        );

        // Return success response
        const response: GenerateQRResponse = {
          id: qrCode.id,
          short_code: shortCode,
          short_url: shortUrl,
          qr_code_data_url: qrCodeDataUrl,
          analytics_url: `${baseURL}/analytics/${qrCode.id}`,
        };

        return NextResponse.json(response, { status: 201 });
      } catch (error: any) {
        // Check if error is due to duplicate short_code
        if (error.message?.includes('duplicate key') || error.code === '23505') {
          shortCode = generateShortCode(10);
          attempts++;
          continue;
        }
        throw error;
      }
    }

    throw new Error('Failed to generate unique short code');
  } catch (error: any) {
    console.error('QR generation error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate QR code', details: error.message },
      { status: 500 }
    );
  }
}
