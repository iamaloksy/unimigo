'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, AlertCircle, TrendingUp, Activity, Shield } from 'lucide-react';
import StatCard from '@/components/StatCard';
import ClientTime from '@/components/ClientTime';
import api from '@/lib/api';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

export default function UniversityAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    flaggedPosts: 0,
    activeUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [universityId, setUniversityId] = useState<string>('');

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    console.log('Admin data from localStorage:', adminData);
    if (adminData) {
      const admin = JSON.parse(adminData);
      console.log('Parsed admin:', admin);
      console.log('University ID:', admin.universityId);
      if (admin.universityId) {
        setUniversityId(admin.universityId);
        fetchData(admin.universityId);
        const interval = setInterval(() => fetchData(admin.universityId), 30000);
        return () => clearInterval(interval);
      } else {
        console.error('No universityId found in admin data!');
      }
    } else {
      console.error('No admin data in localStorage!');
    }
  }, []);

  const fetchData = async (univId: string) => {
    try {
      console.log('Fetching data for university:', univId);
      const [statsRes, usersRes] = await Promise.all([
        api.get(`/admin/university/${univId}/stats`),
        api.get(`/admin/university/${univId}/users`)
      ]);
      console.log('Stats response:', statsRes.data);
      console.log('Users response:', usersRes.data);
      setStats(statsRes.data);
      setRecentUsers(usersRes.data.slice(0, 5));
    } catch (error: any) {
      console.error('Failed to fetch data:', error.response?.data || error.message);
      console.error('Full error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header with Gradient - Full Theme */}
      <div className="bg-gradient-to-r from-[#00B4D8] via-[#0090BB] to-[#FF7A00] rounded-3xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Welcome Back! 👋</h1>
            <p className="text-white/90 text-sm md:text-lg font-medium">Manage your university's students and content</p>
          </div>
          <div className="text-right bg-white/20 backdrop-blur-lg rounded-2xl p-4 w-full md:w-auto border border-white/30 hover:bg-white/30 transition-all">
            <p className="text-xs md:text-sm text-white/90 font-semibold">Last updated</p>
            <p className="text-lg md:text-xl font-bold mt-1"><ClientTime /></p>
            <button
              onClick={() => universityId && fetchData(universityId)}
              className="mt-3 text-xs md:text-sm text-white hover:text-white/80 font-semibold flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/40 transition-all w-full md:w-auto justify-center md:justify-end"
            >
              <Activity size={14} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalUsers}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={TrendingUp}
          trend={stats.totalUsers > 0 ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% verified` : undefined}
          color="green-500"
        />
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={FileText}
          color="blue-500"
        />
        <StatCard
          title="Flagged Posts"
          value={stats.flaggedPosts}
          icon={AlertCircle}
          color="red-500"
        />
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">Recent Students</h3>
            <button 
              onClick={() => router.push('/university-admin/users')}
              className="text-[#00B4D8] hover:text-[#0090BB] font-medium text-sm w-full md:w-auto"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition gap-3">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#00B4D8]/10 rounded-full flex items-center justify-center flex-shrink-0 text-sm md:text-lg font-bold text-[#00B4D8]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{user.name}</p>
                      <p className="text-xs md:text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {user.verifiedBadge && (
                      <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm font-medium justify-end md:justify-start">
                        <Shield size={14} />
                        <span className="hidden sm:inline">Verified</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Trust: {user.trustScore}/100</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No students yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-[#00B4D8] to-[#FF7A00] rounded-2xl shadow-lg p-4 md:p-6 text-white">
          <h3 className="text-lg md:text-xl font-bold mb-4">Quick Actions</h3>
          <div className="space-y-2 md:space-y-3">
            <button 
              onClick={() => router.push('/university-admin/users')}
              className="w-full text-left px-3 md:px-4 py-3 md:py-4 bg-white/20 backdrop-blur rounded-xl font-medium hover:bg-white/30 transition flex items-center gap-3 text-sm md:text-base"
            >
              <Users size={18} className="flex-shrink-0" />
              <span className="truncate">Manage Students</span>
            </button>
            <button 
              onClick={() => router.push('/university-admin/posts')}
              className="w-full text-left px-3 md:px-4 py-3 md:py-4 bg-white/20 backdrop-blur rounded-xl font-medium hover:bg-white/30 transition flex items-center gap-3 text-sm md:text-base"
            >
              <FileText size={18} className="flex-shrink-0" />
              <span className="truncate">Review Posts</span>
            </button>
            <button 
              className="w-full text-left px-3 md:px-4 py-3 md:py-4 bg-white/20 backdrop-blur rounded-xl font-medium hover:bg-white/30 transition flex items-center gap-3 text-sm md:text-base"
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="truncate">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
