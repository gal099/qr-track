import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QR Track - QR Code Generator with Analytics',
  description:
    'Generate custom QR codes with color customization and track scans with detailed analytics.',
  keywords: ['QR code', 'generator', 'analytics', 'tracking', 'short URL'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
