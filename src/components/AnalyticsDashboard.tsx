'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ScanAnalytics } from '@/types/database';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsDashboard({ qrId }: { qrId: string }) {
  const [analytics, setAnalytics] = useState<ScanAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics/${qrId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch analytics');
        }

        setAnalytics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [qrId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
        <p className="text-red-800 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Total Scans Card */}
      <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Total Scans
        </h2>
        <p className="text-5xl font-bold text-blue-600">
          {analytics.total_scans.toLocaleString()}
        </p>
      </div>

      {/* Scans Over Time */}
      {analytics.scans_by_date.length > 0 && (
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            Scans Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.scans_by_date}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Scans"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Device & Browser Breakdown */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Device Breakdown */}
        {analytics.device_breakdown.length > 0 && (
          <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Device Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.device_breakdown}
                  dataKey="count"
                  nameKey="device_type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {analytics.device_breakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Browser Breakdown */}
        {analytics.browser_breakdown.length > 0 && (
          <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Browser Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.browser_breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="browser" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Scans" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Location Breakdown */}
      {analytics.location_breakdown.length > 0 && (
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            Geographic Distribution
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    City
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Scans
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {analytics.location_breakdown.map((location, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {location.country}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {location.city}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                      {location.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {analytics.total_scans === 0 && (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-700">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            No scans yet. Share your QR code to start tracking!
          </p>
        </div>
      )}
    </div>
  );
}
