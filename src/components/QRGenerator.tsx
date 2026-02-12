'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { GenerateQRResponse } from '@/types/database';

export default function QRGenerator() {
  const [targetUrl, setTargetUrl] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateQRResponse | null>(null);
  const [showFgPicker, setShowFgPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl, fgColor, bgColor }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result.qr_code_data_url;
    link.download = `qr-${result.short_code}.png`;
    link.click();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
        <div className="p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* URL Input */}
            <div>
              <label
                htmlFor="url"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Target URL
              </label>
              <input
                id="url"
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Foreground Color */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Foreground Color
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFgPicker(!showFgPicker)}
                    className="h-10 w-10 rounded-md border-2 border-gray-300"
                    style={{ backgroundColor: fgColor }}
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
                {showFgPicker && (
                  <div className="mt-2">
                    <HexColorPicker color={fgColor} onChange={setFgColor} />
                  </div>
                )}
              </div>

              {/* Background Color */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBgPicker(!showBgPicker)}
                    className="h-10 w-10 rounded-md border-2 border-gray-300"
                    style={{ backgroundColor: bgColor }}
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
                {showBgPicker && (
                  <div className="mt-2">
                    <HexColorPicker color={bgColor} onChange={setBgColor} />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="mt-8 space-y-4 border-t border-gray-200 pt-8 dark:border-gray-700">
              <div className="text-center">
                <img
                  src={result.qr_code_data_url}
                  alt="Generated QR Code"
                  className="mx-auto h-64 w-64 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="space-y-3">
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-700">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Short URL
                  </label>
                  <p className="break-all text-sm font-mono text-gray-900 dark:text-white">
                    {result.short_url}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 rounded-md bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    Download QR Code
                  </button>
                  <a
                    href={result.analytics_url}
                    className="flex-1 rounded-md bg-gray-600 px-6 py-3 text-center font-semibold text-white hover:bg-gray-700"
                  >
                    View Analytics
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
