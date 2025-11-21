'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Building2, FileText, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import StatCard from '@/components/StatCard';
import api from '@/lib/api';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUniversities: 0,
    totalPosts: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform insights and performance metrics • Auto-refresh every 30s</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={stats.trends ? `+${stats.trends.usersThisWeek} this week` : undefined}
          color="primary"
        />
        <StatCard
          title="Universities"
          value={stats.totalUniversities}
          icon={Building2}
          trend={stats.trends ? `+${stats.trends.universitiesThisMonth} this month` : undefined}
          color="accent"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={Activity}
          trend={stats.totalUsers > 0 ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% verified` : undefined}
          color="green-500"
        />
        <StatCard
          title="Total Posts"
          value={stats.totalPosts.toLocaleString()}
          icon={FileText}
          trend={stats.trends ? `+${stats.trends.postsToday} today` : undefined}
          color="blue-500"
        />
      </div>


    </div>
  );
}
