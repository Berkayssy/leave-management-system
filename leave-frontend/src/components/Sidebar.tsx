// components/Sidebar.tsx - DÜZELTİLMİŞ MODERN VERSİYON
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Home,
  Calendar,
  Briefcase,
  Settings,
  ChevronRight
} from 'lucide-react';

// Kullanıcı ve navigasyon öğesi için TypeScript tiplerini tanımla
interface AppUser {
  id: number;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: AppUser['role'][];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // useEffect'i doğru şekilde kullan: setTimeout ile wrap et
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData: AppUser = JSON.parse(userStr);
          setUser(userData);

          // Temel navigasyon öğeleri
          const baseItems: NavItem[] = [
            { 
              href: '/dashboard', 
              label: 'Dashboard', 
              icon: <Home className="w-5 h-5" /> 
            },
            { 
              href: '/dashboard/leaves', 
              label: 'My Leaves', 
              icon: <Calendar className="w-5 h-5" /> 
            },
          ];

          // Role-based navigasyon öğeleri
          if (userData.role === 'manager' || userData.role === 'admin') {
            baseItems.push({ 
              href: '/dashboard/manager', 
              label: 'Manager Panel', 
              icon: <Briefcase className="w-5 h-5" /> 
            });
          }

          if (userData.role === 'admin') {
            baseItems.push({ 
              href: '/dashboard/admin', 
              label: 'Admin Panel', 
              icon: <Settings className="w-5 h-5" /> 
            });
          }

          setNavItems(baseItems);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // SSR için boş render - hydration hatasını önle
  if (!mounted) {
    return (
      <aside className="w-64 bg-white min-h-screen p-6 border-r border-gray-200 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </aside>
    );
  }

  if (!user) return null;

  return (
    <aside className="w-64 bg-white min-h-screen p-6 border-r border-gray-200 shadow-sm">
      {/* Navigation - Modern ve Tip Güvenli */}
      <nav>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
                            (item.href === '/dashboard' && pathname === '/dashboard') ||
                            (item.href === '/dashboard/leaves' && pathname?.startsWith('/dashboard/leaves'));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow'
                      : 'hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  <div className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium flex-1">{item.label}</span>
                  {isActive ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System Status */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 px-2">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <p className="text-xs text-gray-500">System Online</p>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">LeaveHub v1.0</p>
      </div>
    </aside>
  );
}