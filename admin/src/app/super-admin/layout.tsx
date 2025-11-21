'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/Sidebar';
import { Menu, X } from 'lucide-react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const admin = useAuthStore((state) => state.admin);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const token = localStorage.getItem('adminToken');
    if (!token && !admin) {
      router.push('/');
    } else if (admin && admin.role !== 'super-admin') {
      router.push('/university-admin');
    }
  }, [admin, router]);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isHydrated || !admin) {
    return null;
  }

  if (admin.role !== 'super-admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* Mobile Sidebar Overlay */}
      {mounted && isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          mounted && isMobile
            ? `fixed left-0 top-0 h-screen z-50 transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative'
        }`}
      >
        <Sidebar role="super-admin" />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        {mounted && isMobile && (
          <div className="bg-gradient-to-r from-[#00B4D8] to-[#FF7A00] text-white p-4 flex items-center justify-between sticky top-0 z-30">
            <h1 className="text-lg font-bold">UNIMIGO Admin</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 w-full">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
