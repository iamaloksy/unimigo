'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { University } from '@/types';

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    adminEmail: '',
    adminPassword: '',
    logoUrl: '',
    subscriptionExpiryDate: '',
  });
  const [createdAdmin, setCreatedAdmin] = useState<{ 
    email: string; 
    password: string;
    portalUrl?: string;
    setupInstructions?: string;
  } | null>(null);

  useEffect(() => {
    fetchUniversities();
    const interval = setInterval(fetchUniversities, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUniversities = async () => {
    try {
      const { data } = await api.get('/admin/universities');
      setUniversities(data);
    } catch (error) {
      console.error('Failed to fetch universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && editId) {
        await api.put(`/admin/universities/${editId}`, formData);
        setShowModal(false);
        setEditMode(false);
        setEditId(null);
      } else {
        const { data } = await api.post('/admin/universities', formData);
        setCreatedAdmin({
          email: data.admin.email,
          password: data.admin.password,
          portalUrl: data.portalUrl,
        });
      }
      setFormData({ name: '', domain: '', adminEmail: '', adminPassword: '', logoUrl: '' });
      fetchUniversities();
    } catch (error) {
      console.error('Failed to save university:', error);
    }
  };

  const handleEdit = (uni: University) => {
    setEditMode(true);
    setEditId(uni._id);
    setFormData({
      name: uni.name,
      domain: uni.domain,
      adminEmail: uni.adminEmail,
      adminPassword: '',
      logoUrl: uni.logoUrl || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this university?')) return;
    try {
      await api.delete(`/admin/universities/${id}`);
      fetchUniversities();
    } catch (error) {
      console.error('Failed to delete university:', error);
    }
  };

  const filteredUniversities = universities.filter((uni) =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Universities</h1>
          <p className="text-gray-600 mt-2">Manage all onboarded universities • Auto-refresh every 30s</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
        >
          <Plus size={20} />
          Add University
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search universities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Domain</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Admin Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUniversities.map((uni) => (
                  <tr key={uni._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-800">{uni.name || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-600">{uni.domain || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-600">{uni.adminEmail || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        uni.subscriptionStatus === 'active'
                          ? 'bg-green-100 text-green-700'
                          : uni.subscriptionStatus === 'trial'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {uni.subscriptionStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(uni)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            const newStatus = uni.subscriptionStatus === 'active' ? 'inactive' : 'active';
                            try {
                              await api.patch(`/admin/universities/${uni._id}/subscription`, {
                                subscriptionStatus: newStatus
                              });
                              fetchUniversities();
                            } catch (error) {
                              console.error('Failed to update status:', error);
                            }
                          }}
                          className={`p-2 rounded-lg transition ${
                            uni.subscriptionStatus === 'active'
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={uni.subscriptionStatus === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {uni.subscriptionStatus === 'active' ? '⏸' : '▶'}
                        </button>
                        <button
                          onClick={() => handleDelete(uni._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editMode ? 'Edit University' : 'Add New University'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">University Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="lpu.in"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                <input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  placeholder="Leave empty for default: admin123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL (optional)</label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Expiry Date (optional)</label>
                <input
                  type="date"
                  value={formData.subscriptionExpiryDate}
                  onChange={(e) => setFormData({ ...formData, subscriptionExpiryDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              {createdAdmin ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-green-800 font-bold mb-3 text-lg">✅ University Created Successfully!</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Admin Email</p>
                      <p className="text-sm font-semibold text-gray-900">{createdAdmin.email}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Admin Password</p>
                      <p className="text-sm font-semibold text-gray-900">{createdAdmin.password}</p>
                    </div>
                    {createdAdmin.portalUrl && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-600 mb-2">University Portal</p>
                        <a 
                          href={createdAdmin.portalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-blue-900 hover:text-blue-700 underline break-all"
                        >
                          {createdAdmin.portalUrl}
                        </a>
                        <p className="text-xs text-blue-600 mt-2">👆 Click to open portal</p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setCreatedAdmin(null);
                    }}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditMode(false);
                      setEditId(null);
                      setFormData({ name: '', domain: '', adminEmail: '', adminPassword: '', logoUrl: '' });
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
                  >
                    {editMode ? 'Update' : 'Add University'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
