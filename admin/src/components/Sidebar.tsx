'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Users, Building2, FileText, Settings, LogOut, AlertCircle, Shield, Zap } from 'lucide-react';

interface SidebarProps {
  role: 'super-admin' | 'university-admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const admin = useAuthStore((state) => state.admin);

  const superAdminLinks = [
    { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/super-admin/universities', label: 'Universities', icon: Building2 },
    { href: '/super-admin/users', label: 'All Users', icon: Users },
    { href: '/super-admin/analytics', label: 'Analytics', icon: FileText },
    { href: '/super-admin/settings', label: 'Settings', icon: Settings },
  ];

  const universityAdminLinks = [
    { href: '/university-admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/university-admin/users', label: 'Users', icon: Users },
    { href: '/university-admin/posts', label: 'Posts', icon: FileText },
    { href: '/university-admin/reports', label: 'Reports', icon: AlertCircle },
    { href: '/university-admin/settings', label: 'Settings', icon: Settings },
  ];

  const links = role === 'super-admin' ? superAdminLinks : universityAdminLinks;

  return (
    <div className="w-64 bg-gradient-to-b from-white to-gray-50 h-screen border-r border-gray-200 flex flex-col shadow-lg overflow-y-auto">
      {/* Logo Header - Gradient Theme */}
      <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-[#00B4D8] via-[#0090BB] to-[#FF7A00] sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/30 rounded-xl backdrop-blur-sm hover:bg-white/40 transition-all">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">UNIMIGO</h1>
            <p className="text-xs text-white/90 font-medium">
              {role === 'super-admin' ? 'Super Admin' : 'University Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#00B4D8] to-[#FF7A00] text-white shadow-md scale-[1.02] font-semibold'
                  : 'text-gray-700 hover:bg-gray-100 hover:scale-[1.01] font-medium'
              }`}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t-2 border-gray-100 bg-gradient-to-t from-gray-50 to-transparent">
        <div className="mb-3 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00B4D8] to-[#FF7A00] rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {admin?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{admin?.name}</p>
              <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-all duration-200 font-semibold hover:scale-[1.02] active:scale-95"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
