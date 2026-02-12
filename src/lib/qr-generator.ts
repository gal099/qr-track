import QRCode from 'qrcode';

/**
 * Generate QR code as Data URL (base64-encoded PNG)
 * @param text - Text to encode in QR code (typically a URL)
 * @param fgColor - Foreground color (hex format)
 * @param bgColor - Background color (hex format)
 * @returns Data URL string (data:image/png;base64,...)
 */
export async function generateQRCodeDataURL(
  text: string,
  fgColor: string = '#000000',
  bgColor: string = '#FFFFFF'
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      color: {
        dark: fgColor,
        light: bgColor,
      },
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'M',
    });

    return dataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}
