import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function AnalyticsPage({
  params,
}: {
  params: { qrId: string };
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            QR Code Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View detailed scan statistics for your QR code
          </p>
        </div>

        <AnalyticsDashboard qrId={params.qrId} />

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Generate Another QR Code
          </a>
        </div>
      </div>
    </main>
  );
}
