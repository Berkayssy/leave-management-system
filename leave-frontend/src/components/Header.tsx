// components/Header.tsx - DÜZELTİLMİŞ VERSİYON
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { 
  Bell, 
  User, 
  LogOut,
  ChevronDown,
  Calendar,
  Settings,
} from 'lucide-react';

import { showToast } from '@/lib/toast';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<number>(3);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // useEffect'i ASLA try-catch içine alma!
  useEffect(() => {
    // Client-side'da çalışacak kod
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } catch (error) {
        console.error('Error loading user:', error);
        showToast.error('Failed to load user data.');
        // localStorage bozuksa temizle
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    } else {
      // Server-side'da loading state'ini kapat
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    try {
      authService.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      showToast.error('Logout failed. Please try again.');
      // Fallback: localStorage'ı temizle ve login sayfasına yönlendir
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      employee: 'from-blue-500 to-blue-600',
      manager: 'from-amber-500 to-orange-600',
      admin: 'from-purple-500 to-pink-600'
    };
    return colors[role as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  // Loading state - header'ı boş bırakma
  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm animate-pulse">
        <div className="mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </header>
    );
  }

  // User yoksa basit header göster
  if (!user) {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                LeaveFlow
              </span>
            </div>
            <button 
              onClick={() => router.push('/auth/login')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 px-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              LeaveFlow
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition group">
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                </>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center shadow-lg`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {user.role.toUpperCase()}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </div>
                </div>
              </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-5 duration-200">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-bold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <div className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} text-white`}>
                      {user.role.toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <button 
                      onClick={() => { 
                        showToast.success('My Profile is coming soon!');
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    
                    <button 
                      onClick={() => { 
                        showToast.success('Settings is coming soon!'); 
                        setShowDropdown(false); 
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}