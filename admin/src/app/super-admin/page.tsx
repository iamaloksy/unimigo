'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  FileText,
  TrendingUp,
  Activity,
  RefreshCw
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import ClientTime from '@/components/ClientTime';
import api from '@/lib/api';
import { Stats, University } from '@/types';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalUniversities: 0,
  });
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, uniRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/universities'),
      ]);
      setStats(statsRes.data || {});
      setUniversities(Array.isArray(uniRes.data) ? uniRes.data.slice(0, 6) : []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-8 px-4 sm:px-6 lg:px-10 pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#00B4D8] to-[#FF7A00] p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-40 h-40 bg-white/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-white/10 rounded-2xl p-3">
              <img src="/unimigo_logo.png" alt="unimigo" className="w-11 h-11 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back, Admin</h1>
              <p className="text-white/90 mt-1 text-sm md:text-base max-w-xl">
                Overview of platform activity and quick actions to manage universities and users.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <div className="bg-white/10 rounded-2xl px-4 py-3 text-white shadow border border-white/20 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-white/90">Last updated</p>
                <p className="text-lg md:text-xl font-bold mt-1"><ClientTime /></p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchData}
                  aria-label="Refresh dashboard"
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition"
                >
                  <RefreshCw size={16} />
                  <span className="text-sm font-medium">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Universities" value={stats.totalUniversities} icon={Building2} color="primary" />
        <StatCard title="Total Students" value={Number(stats.totalUsers || 0).toLocaleString()} icon={Users} color="accent" />
        <StatCard title="Active Users" value={Number(stats.activeUsers || 0).toLocaleString()} icon={TrendingUp} color="green-500" />
        <StatCard title="Total Posts" value={Number(stats.totalPosts || 0).toLocaleString()} icon={FileText} color="blue-500" />
      </section>

      {/* Main grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Universities (wide) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800">Recent Universities</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/super-admin/universities')}
                className="text-primary hover:underline text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {universities.length > 0 ? (
              universities.map((uni) => (
                <article
                  key={uni._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Building2 className="text-primary" size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{uni.name || 'Unnamed University'}</h4>
                      <p className="text-sm text-gray-500 truncate">@{uni.domain || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        uni.subscriptionStatus === 'active'
                          ? 'bg-green-100 text-green-700'
                          : uni.subscriptionStatus === 'trial'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {uni.subscriptionStatus || 'N/A'}
                    </span>

                    <button
                      onClick={() => router.push(`/super-admin/universities/${uni._id}`)}
                      className="text-sm text-primary hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="py-10 text-center text-gray-500">
                <p>No universities found</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions panel */}
        <aside className="bg-gradient-to-br from-[#00B4D8] to-[#FF7A00] p-6 rounded-3xl text-white shadow-lg">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <p className="text-sm text-white/90 mb-4">Common admin tasks for fast access</p>

          <div className="grid gap-3">
            <button
              onClick={() => router.push('/super-admin/universities')}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl text-sm font-medium transition"
            >
              <Building2 size={18} />
              Add New University
            </button>

            <button
              onClick={() => router.push('/super-admin/users')}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl text-sm font-medium transition"
            >
              <Users size={18} />
              Manage Users
            </button>

            <button
              onClick={() => router.push('/super-admin/analytics')}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl text-sm font-medium transition"
            >
              <Activity size={18} />
              View Analytics
            </button>
          </div>

          <div className="mt-6 text-xs text-white/80">
            <p>Last refreshed: <span className="font-semibold">{refreshing ? 'Refreshing...' : 'Realtime'}</span></p>
          </div>
        </aside>
      </section>
    </main>
  );
}
