// app/(dashboard)/page.tsx - GÜNCELLENMİŞ VERSİYON
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  PlusCircle, 
  RefreshCw, 
  Inbox,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  Download,
  Eye,
  ChevronRight
} from 'lucide-react';
import Button from '@/components/ui/Button';
import ViewDetailsModal from '@/components/modals/ViewDetails';

// TypeScript interface'leri
interface Leave {
  id: number;
  start_date: string;
  end_date: string;
  leave_type?: string;
  type?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  user?: {
    name: string;
    email: string;
    department?: string;
  };
}

interface DashboardStats {
  pending: number;
  approved: number;
  total: number;
  teamMembers?: number;
  onLeaveToday?: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    pending: 0,
    approved: 0,
    total: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState<Leave[]>([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState<Leave[]>([]);
  const [viewingLeaveDetails, setViewingLeaveDetails] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Dashboard stats için farklı endpoint'ler dene
      const statsEndpoints = [
        '/dashboard/stats',
        '/api/v1/dashboard',
        '/user/dashboard'
      ];
      
      let dashboardData = null;
      
      for (const endpoint of statsEndpoints) {
        try {
          const dashboardRes = await api.get(endpoint);
          if (dashboardRes.ok) {
            dashboardData = await dashboardRes.json();
            console.log('Dashboard data from', endpoint, ':', dashboardData);
            break;
          }
        } catch (e) {
          console.log('Failed to fetch from', endpoint, ':', e);
          continue;
        }
      }
      
      if (!dashboardData) {
        // Fallback: Manuel olarak hesapla
        console.log('No dashboard endpoint found, calculating manually...');
        
        const leavesRes = await api.get('/leaves');
        const leavesData = await leavesRes.json();
        
        const leavesArray = Array.isArray(leavesData) ? leavesData : 
                           leavesData.leaves ? leavesData.leaves :
                           leavesData.data ? leavesData.data : [];
        
        const pending = leavesArray.filter((l: any) => l.status === 'pending').length;
        const approved = leavesArray.filter((l: any) => l.status === 'approved').length;
        
        dashboardData = {
          stats: {
            pending,
            approved,
            total: leavesArray.length,
            teamMembers: 15,
            onLeaveToday: 2
          }
        };
      }
      
      // Recent leaves - son 10 gün içindeki izinler
      let allData: Leave[] = [];
      const leavesEndpoints = [
        '/leaves',
        '/api/v1/leaves',
        '/user/leaves'
      ];
      
      for (const endpoint of leavesEndpoints) {
        try {
          const leavesRes = await api.get(endpoint);
          if (leavesRes.ok) {
            const data = await leavesRes.json();
            const rawData = Array.isArray(data) ? data : 
                           data.leaves ? data.leaves :
                           data.data ? data.data : [];
            
            allData = rawData;
            
            // Son 5 izin talebini al
            const recent = rawData
              .sort((a: any, b: any) => 
                new Date(b.created_at || b.start_date).getTime() - 
                new Date(a.created_at || a.start_date).getTime()
              )
              .slice(0, 5);
            
            // Yaklaşan izinleri al (bugünden sonra başlayacak ve approved olan)
            const today = new Date();
            const upcoming = rawData
              .filter((leave: any) => 
                leave.status === 'approved' && 
                new Date(leave.start_date) > today
              )
              .sort((a: any, b: any) => 
                new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
              )
              .slice(0, 3);
            
            setRecentLeaves(recent);
            setUpcomingLeaves(upcoming);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      setStats({
        pending: dashboardData.stats?.pending || 0,
        approved: dashboardData.stats?.approved || 0,
        total: dashboardData.stats?.total || 0,
        teamMembers: dashboardData.stats?.teamMembers || 15,
        onLeaveToday: dashboardData.stats?.onLeaveToday || 0
      });
      
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Both dates inclusive
  };

  const exportUserLeaves = () => {
  try {
    if (recentLeaves.length === 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { 
            message: 'No leave data to export!', 
            type: 'error' 
          }
        }));
      }
      return;
    }
    
    // CSV başlıkları
    const headers = [
      'ID',
      'Type',
      'Start Date',
      'End Date',
      'Duration (Days)',
      'Status',
      'Reason',
      'Submitted Date'
    ];
    
    // CSV satırları
    const csvRows = recentLeaves.map(leave => [
      leave.id,
      leave.leave_type || leave.type || 'N/A',
      leave.start_date,
      leave.end_date,
      calculateDays(leave.start_date, leave.end_date),
      leave.status,
      `"${leave.reason.replace(/"/g, '""')}"`,
      leave.created_at ? formatDate(leave.created_at) : 'N/A'
    ]);
    
    // CSV içeriğini oluştur
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    // Blob oluştur ve indir
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    a.href = url;
    a.download = `my-leave-history-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Toast göster
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: 'Leave history exported successfully!', 
          type: 'success' 
        }
      }));
    }
    
  } catch (error) {
    console.error('Export failed:', error);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: 'Failed to export leave history!', 
          type: 'error' 
        }
      }));
    }
  }
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
        <p className="text-sm text-gray-400 mt-1">Fetching your leave data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
          <div className="flex-1">
            <div className="text-red-700 font-semibold">Error Loading Data</div>
            <p className="text-red-600 mt-1">{error}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={fetchDashboardData}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2.5 rounded-lg flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard/leaves/new')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2.5 rounded-lg flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Create Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's your leave summary</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchDashboardData}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Pending Requests</div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.pending > 0 ? 'Needs attention' : 'All clear'}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Approved Leaves</div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-green-600">{stats.approved}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.total > 0 
              ? `${Math.round((stats.approved / stats.total) * 100)}% approval rate`
              : 'No requests'
            }
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Requests</div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">All time requests</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Team Members</div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{stats.teamMembers}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.onLeaveToday || 0} on leave today
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leaves */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-900">Recent Leave Requests</h2>
            <div className="text-sm text-gray-500">
              {recentLeaves.length} request{recentLeaves.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {recentLeaves.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium mb-2">No leave requests yet</p>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start by creating your first leave request to track your time off
              </p>
              <Button
                onClick={() => router.push('/dashboard/leaves/new')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create First Leave
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentLeaves.map((leave) => {
                const days = calculateDays(leave.start_date, leave.end_date);
                const startDate = formatDate(leave.start_date);
                const endDate = formatDate(leave.end_date);
                const submittedDate = leave.created_at ? formatDate(leave.created_at) : 'N/A';
                
                return (
                  <div key={leave.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            leave.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : leave.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {leave.leave_type || leave.type || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {startDate} - {endDate}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Reason:</span> {leave.reason}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Submitted on {submittedDate} • {days} days
                          </div>
                          <button
                            onClick={() => setViewingLeaveDetails(leave.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            View Details
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {stats.total > 5 && (
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push('/dashboard/leaves')}
                    className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1"
                  >
                    View all {stats.total} leaves
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Leaves */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Upcoming Leaves</h2>
            <p className="text-sm text-gray-500 mt-1">Your approved upcoming leaves</p>
          </div>
          
          {upcomingLeaves.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500">No upcoming leaves</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {upcomingLeaves.map((leave) => {
                const days = calculateDays(leave.start_date, leave.end_date);
                const startDate = formatDate(leave.start_date);
                const endDate = formatDate(leave.end_date);
                const startDateObj = new Date(leave.start_date);
                const today = new Date();
                const daysUntil = Math.ceil((startDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={leave.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {startDate} - {endDate}
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Approved
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Type:</span> {leave.leave_type || leave.type || 'N/A'}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {days} days • {daysUntil > 0 ? `In ${daysUntil} days` : 'Starts today'}
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/leaves/${leave.id}`)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/dashboard/leaves/new')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                New Leave Request
              </button>
              <button
                onClick={() => router.push('/dashboard/leaves')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                View All Leaves
              </button>
              <button
                onClick={exportUserLeaves}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export History
              </button>
            </div>
          </div>
        </div>
      </div>
        {viewingLeaveDetails !== null && (
          <ViewDetailsModal
            leaveId={viewingLeaveDetails}
            isOpen={true}
            onClose={() => setViewingLeaveDetails(null)}
          />
        )}

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Leave Summary</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pending} pending • {stats.approved} approved • {stats.total} total
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Approval Rate</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {stats.total > 0 
                ? `${Math.round((stats.approved / stats.total) * 100)}%`
                : '0%'
              }
            </p>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                style={{ width: `${stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Upcoming Leaves</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{upcomingLeaves.length}</p>
            <p className="text-xs text-gray-500">Next 30 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}