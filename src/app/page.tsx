import QRGenerator from '@/components/QRGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            QR Track
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Generate custom QR codes with built-in analytics
          </p>
        </div>

        <QRGenerator />

        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Built with Next.js and deployed on Vercel
          </p>
        </footer>
      </div>
    </main>
  );
}
