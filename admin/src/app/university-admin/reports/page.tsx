'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users, FileText, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface Report {
  _id: string;
  reportedBy: {
    _id: string;
    email: string;
    name: string;
  };
  reportedUser?: {
    _id: string;
    email: string;
    name: string;
  };
  reportedPost?: {
    _id: string;
    title: string;
  };
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedBy?: {
    name: string;
  };
}

interface ReportStats {
  total: number;
  pending: number;
  resolved: number;
  dismissed: number;
  recent: number;
  today: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    pending: 0,
    resolved: 0,
    dismissed: 0,
    recent: 0,
    today: 0
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [universityId, setUniversityId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      const admin = JSON.parse(adminData);
      if (admin.universityId) {
        setUniversityId(admin.universityId);
        fetchReportsAndStats(admin.universityId);
        // Real-time updates every 30 seconds
        const interval = setInterval(() => fetchReportsAndStats(admin.universityId), 30000);
        return () => clearInterval(interval);
      }
    }
  }, []);

  const fetchReportsAndStats = async (univId: string) => {
    try {
      setLoading(true);
      const [reportsResponse, statsResponse] = await Promise.all([
        api.get(`/admin/university/${univId}/reports?status=${filter}`),
        api.get(`/admin/university/${univId}/report-stats`)
      ]);

      setReports(reportsResponse.data.reports || []);
      setStats(statsResponse.data);
    } catch (error: any) {
      console.error('Failed to fetch reports and stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filter changes
  useEffect(() => {
    if (universityId) {
      fetchReportsAndStats(universityId);
    }
  }, [filter]);

  const handleResolve = async (reportId: string) => {
    try {
      setUpdating(reportId);
      await api.put(`/admin/reports/${reportId}/status`, { status: 'resolved' });
      // Update local state immediately
      setReports(reports.map(r => r._id === reportId ? { ...r, status: 'resolved' as const } : r));
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        resolved: prev.resolved + 1
      }));
    } catch (error: any) {
      console.error('Failed to resolve report:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleDismiss = async (reportId: string) => {
    try {
      setUpdating(reportId);
      await api.put(`/admin/reports/${reportId}/status`, { status: 'dismissed' });
      // Update local state immediately
      setReports(reports.map(r => r._id === reportId ? { ...r, status: 'dismissed' as const } : r));
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        dismissed: prev.dismissed + 1
      }));
    } catch (error: any) {
      console.error('Failed to dismiss report:', error);
    } finally {
      setUpdating(null);
    }
  };

  const manualRefresh = () => {
    if (universityId) {
      fetchReportsAndStats(universityId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
        <p className="text-gray-600 mt-2">Review and manage reported content and users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.resolved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'resolved'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resolved
          </button>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle size={48} className="mx-auto mb-3 opacity-30" />
              <p>No reports found</p>
            </div>
          ) : (
            reports.map((report: Report) => (
              <div
                key={report._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'pending'
                          ? 'bg-orange-100 text-orange-700'
                          : report.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {report.status}
                      </span>
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        {report.reason}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">
                      {report.reportedPost ? `Post: ${report.reportedPost.title}` : report.reportedUser ? `User: ${report.reportedUser.name} (${report.reportedUser.email})` : 'Unknown'}
                    </p>
                    <p className="text-gray-600 mb-2">{report.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Reported by: {report.reportedBy.name} ({report.reportedBy.email})</span>
                      <span>•</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleResolve(report._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleDismiss(report._id)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
