// app/dashboard/admin/page.tsx - GÜNCELLENMİŞ STİL
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import {
  Shield,
  Users,
  RefreshCw,
  Download,
  Calendar,
  TrendingUp,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { showToast } from '@/lib/toast';

import ViewDetailsModal from '@/components/modals/ViewDetails';
import ApproveModal from '@/components/modals/Approve';
import RejectModal from '@/components/modals/Reject';

interface Leave {
  id: number;
  start_date: string;
  end_date: string;
  leave_type?: string;
  type?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
  manager_notes?: string;
  created_at?: string;
}

interface DashboardStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  users?: number;
  departments?: number;
  onLeaveToday?: number;
}

const monthlyTrends = [
  { month: 'Aug', leaves: 45, pending: 12, approved: 30 },
  { month: 'Sep', leaves: 52, pending: 15, approved: 35 },
  { month: 'Oct', leaves: 38, pending: 8, approved: 28 },
  { month: 'Nov', leaves: 42, pending: 10, approved: 30 },
  { month: 'Dec', leaves: 65, pending: 18, approved: 45 },
  { month: 'Jan', leaves: 48, pending: 12, approved: 34 },
];

const departmentStats = [
  { name: 'Engineering', total: 45, onLeave: 5, pending: 3, color: '#3b82f6' },
  { name: 'Marketing', total: 28, onLeave: 2, pending: 1, color: '#8b5cf6' },
  { name: 'Sales', total: 32, onLeave: 4, pending: 2, color: '#10b981' },
  { name: 'HR', total: 12, onLeave: 1, pending: 0, color: '#f59e0b' },
  { name: 'Finance', total: 18, onLeave: 2, pending: 1, color: '#ef4444' },
];

const leaveTypeDistribution = [
  { type: 'Annual', count: 145, color: '#3b82f6' },
  { type: 'Sick', count: 67, color: '#ef4444' },
  { type: 'Personal', count: 43, color: '#8b5cf6' },
  { type: 'Maternity', count: 18, color: '#10b981' },
  { type: 'Paternity', count: 12, color: '#f59e0b' },
];

const statusDistribution = [
  { status: 'Approved', count: 180, color: '#10b981' },
  { status: 'Pending', count: 25, color: '#f59e0b' },
  { status: 'Rejected', count: 40, color: '#ef4444' },
];

export default function AdminPanel() {
  const [stats, setStats] = useState<DashboardStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    users: 0,
    departments: 0,
    onLeaveToday: 0
  });
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
  const [viewingLeaveDetails, setViewingLeaveDetails] = useState<number | null>(null);
  const [approvingLeave, setApprovingLeave] = useState<{
    isOpen: boolean;
    leaveId: number;
    leaveType: string;
    dates: string;
    userName: string;
  }| null>(null);
  const [rejectingLeave, setRejectingLeave] = useState<{
    isOpen: boolean;
    leaveId: number;
    leaveType: string;
    dates: string;
    userName: string;
  }| null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Admin dashboard stats
      const endpoints = [
        '/admin/dashboard',
        '/api/v1/admin/dashboard',
        '/dashboard/stats'
      ];
      
      let dashboardData = null;
      
      for (const endpoint of endpoints) {
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
        const rejected = leavesArray.filter((l: any) => l.status === 'rejected').length;
        
        dashboardData = {
          stats: {
            pending,
            approved,
            rejected,
            total: leavesArray.length,
            users: 135,
            departments: 8,
            onLeaveToday: 14
          }
        };
      }
      
      // Pending leaves
      let pendingData: Leave[] = [];
      const pendingEndpoints = [
        '/admin/leaves?status=pending',
        '/api/v1/admin/leaves?status=pending',
        '/leaves?status=pending'
      ];
      
      for (const endpoint of pendingEndpoints) {
        try {
          const pendingRes = await api.get(endpoint);
          if (pendingRes.ok) {
            const data = await pendingRes.json();
            pendingData = Array.isArray(data) ? data : 
                         data.leaves ? data.leaves :
                         data.data ? data.data : [];
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // All leaves
      let allData: Leave[] = [];
      const allEndpoints = [
        '/admin/leaves',
        '/api/v1/admin/leaves',
        '/leaves',
        '/api/v1/leaves'
      ];
      
      for (const endpoint of allEndpoints) {
        try {
          const allRes = await api.get(endpoint);
          if (allRes.ok) {
            const data = await allRes.json();
            allData = Array.isArray(data) ? data : 
                     data.leaves ? data.leaves :
                     data.data ? data.data : [];
            break;
          }
        } catch (e) {
          continue;
        }
      }

      setStats({
        pending: dashboardData.stats?.pending || 25,
        approved: dashboardData.stats?.approved || 180,
        rejected: dashboardData.stats?.rejected || 40,
        total: dashboardData.stats?.total || 245,
        users: dashboardData.stats?.users || 135,
        departments: dashboardData.stats?.departments || 8,
        onLeaveToday: dashboardData.stats?.onLeaveToday || 14
      });

      setPendingLeaves(pendingData);
      setAllLeaves(allData);
      
    } catch (error: unknown) {
      console.error('Failed to fetch admin data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load admin data');
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
    return diffDays + 1;
  };

  const handleApprove = async (leave: Leave) => {
    setApprovingLeave({
      isOpen: true,
      leaveId: leave.id,
      leaveType: leave.leave_type || leave.type || 'N/A',
      dates: `${formatDate(leave.start_date)} - ${formatDate(leave.end_date)}`,
      userName: leave.user?.name || 'Employee'
    });
  };

  const handleReject = async (leave: Leave) => {
    setRejectingLeave({
      isOpen: true,
      leaveId: leave.id,
      leaveType: leave.leave_type || leave.type || 'N/A',
      dates: `${formatDate(leave.start_date)} - ${formatDate(leave.end_date)}`,
      userName: leave.user?.name || 'Employee'
    });
  };

  const handleViewLeaveDetails = (leaveId: number) => {
    setViewingLeaveDetails(leaveId);
  };

  const filteredLeaves = pendingLeaves.filter(leave => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      leave.user?.name?.toLowerCase().includes(searchLower) ||
      leave.user?.email?.toLowerCase().includes(searchLower) ||
      leave.reason.toLowerCase().includes(searchLower) ||
      leave.leave_type?.toLowerCase().includes(searchLower)
    );
  });

const exportAdminReport = () => {
  try {
    // 1. Dashboard stats'ı ekle
    const summaryData = [
      ['ADMIN LEAVE MANAGEMENT REPORT'],
      [`Generated: ${new Date().toLocaleString()}`],
      [''],
      ['DASHBOARD SUMMARY'],
      ['Total Employees:', stats.users],
      ['On Leave Today:', stats.onLeaveToday],
      ['Pending Requests:', stats.pending],
      ['Approved Requests:', stats.approved],
      ['Rejected Requests:', stats.rejected],
      ['Total Requests:', stats.total],
      [''],
      ['DEPARTMENT STATISTICS'],
      ['Department', 'Total Staff', 'On Leave', 'Pending']
    ];
    
    // Department stats ekle
    const departmentRows = departmentStats.map(dept => [
      dept.name,
      dept.total,
      dept.onLeave,
      dept.pending
    ]);
    
    // 2. Leave verilerini ekle
    const leaveHeaders = [
      'ID',
      'Employee Name',
      'Department',
      'Leave Type',
      'Start Date',
      'End Date',
      'Duration (Days)',
      'Reason',
      'Status',
      'Manager Notes',
      'Submitted Date'
    ];

    const leaveRows = allLeaves.map(leave => [
      leave.id,
      leave.user?.name || 'Unknown',
      leave.user?.department || 'N/A',
      leave.leave_type || leave.type || 'N/A',
      leave.start_date,
      leave.end_date,
      calculateDays(leave.start_date, leave.end_date),
      `"${leave.reason.replace(/"/g, '""')}"`,
      leave.status,
      `"${(leave.manager_notes || '').replace(/"/g, '""')}"`,
      leave.created_at ? formatDate(leave.created_at) : 'N/A'
    ]);

    // Tüm verileri birleştir
    const allRows = [
      ...summaryData,
      ...departmentRows,
      [''],
      ['LEAVE REQUEST DETAILS'],
      leaveHeaders,
      ...leaveRows
    ];

    const csvContent = allRows.map(row => 
      Array.isArray(row) ? row.join(',') : row
    ).join('\n');

    // Blob oluştur ve indir
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    a.href = url;
    a.download = `admin-leave-full-report-${dateStr}-${timeStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('Full admin report exported successfully');
    showToast.success('Report exported successfully.');
    
  } catch (error) {
    console.error('Export failed:', error);
    showToast.error('Failed to export report.');
  }
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading admin panel...</p>
        <p className="text-sm text-gray-400 mt-1">Fetching system-wide data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">System-wide analytics and management</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchAdminData}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={exportAdminReport}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Employees</div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{stats.users}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">On Leave Today</div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-blue-600">{stats.onLeaveToday}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.users ? `${Math.round((stats.onLeaveToday! / stats.users) * 100)}% of employees` : ''}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Pending Requests</div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-gray-500 mt-1">
            Needs attention
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Avg. Leave/Employee</div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-green-600">
            {stats.users ? (stats.approved / stats.users).toFixed(1) : '0'}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-semibold text-gray-900">Monthly Leave Trends</h2>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                Total
              </span>
              <span className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                Pending
              </span>
              <span className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                Approved
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leaves" name="Total Leaves" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Type Distribution Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Leave Type Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {leaveTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {leaveTypeDistribution.map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.type}</span>
                <span className="text-sm font-medium ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Performance */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Department Performance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total Staff" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="onLeave" name="On Leave" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Status Distribution</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {statusDistribution.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.status}</span>
                </div>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-900">Pending Leave Requests</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <button
              onClick={() => router.push('/dashboard/leaves')}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {filteredLeaves.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-gray-700 font-medium mb-2">No pending leave requests!</p>
            <p className="text-gray-500 max-w-sm mx-auto">
              All leave requests have been processed.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLeaves.slice(0, 5).map((leave) => {
              const days = calculateDays(leave.start_date, leave.end_date);
              const startDate = formatDate(leave.start_date);
              const endDate = formatDate(leave.end_date);
              const submittedDate = leave.created_at ? formatDate(leave.created_at) : 'N/A';
              
              return (
                <div key={leave.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {leave.user?.name || 'Unknown Employee'}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {leave.user?.department || 'No Department'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-2">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-1 text-gray-900">
                            {leave.leave_type || leave.type || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="ml-1 text-gray-900">{days} days</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-500">Dates:</span>
                          <span className="ml-1 text-gray-900">
                            {startDate} - {endDate}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {leave.reason}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        Submitted on {submittedDate}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleApprove(leave)}
                        disabled={processing === leave.id}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === leave.id ? (
                          <div>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                            Processing...
                          </div>
                        ) : (
                          <div>
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(leave)}
                        disabled={processing === leave.id}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleViewLeaveDetails(leave.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

        {viewingLeaveDetails !== null && (
          <ViewDetailsModal
            leaveId={viewingLeaveDetails}
            isOpen={true}
            onClose={() => setViewingLeaveDetails(null)}
          />
        )}
        {approvingLeave?.isOpen && (
          <ApproveModal
            {...approvingLeave}
            onClose={() => setApprovingLeave(null)}
            onConfirm={async (notes) => {
              try {
                setProcessing(approvingLeave.leaveId);
                
                const endpoints = [
                  `/manager/leaves/${approvingLeave.leaveId}/approve`,
                  `/api/v1/manager/leaves/${approvingLeave.leaveId}/approve`,
                  `/leaves/${approvingLeave.leaveId}/approve`
                ];
                
                let success = false;
                
                for (const endpoint of endpoints) {
                  try {
                    const response = await api.patch(endpoint);
                    if (response.ok) {
                      success = true;
                      break;
                    }
                  } catch (e) {
                    continue;
                  }
                }
                
                if (!success) {
                  throw new Error('No working approve endpoint found');
                }
                
                fetchAdminData();
              } catch (error) {
                console.error('Failed to approve leave:', error);
                alert('Failed to approve leave');
              } finally {
                setProcessing(null);
              }
              const response = await api.patch(`/manager/leaves/${approvingLeave.leaveId}/approve`, {
                leave: { manager_notes: notes }
              });
              if (response.ok) fetchAdminData();
            }}
          />
        )}
        {rejectingLeave?.isOpen && (
          <RejectModal
            {...rejectingLeave}
            onClose={() => setRejectingLeave(null)}
            onConfirm={async (reason) => {
              try {
                setProcessing(rejectingLeave.leaveId);
                
                const endpoints = [
                  `/manager/leaves/${rejectingLeave.leaveId}/reject`,
                  `/api/v1/manager/leaves/${rejectingLeave.leaveId}/reject`,
                  `/leaves/${rejectingLeave.leaveId}/reject`
                ];
                
                let success = false;
                
                for (const endpoint of endpoints) {
                  try {
                    const response = await api.patch(endpoint, {
                      leave: { manager_notes: reason }
                    });
                    if (response.ok) {
                      success = true;
                      break;
                    }
                  } catch (e) {
                    continue;
                  }
                }
                
                if (!success) {
                  throw new Error('No working reject endpoint found');
                }

                fetchAdminData();
              } catch (error) {
                console.error('Failed to reject leave:', error);
                throw new Error('Failed to reject leave');
              } finally {
                setProcessing(null);
              }
            }}
          />
        )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={exportAdminReport}
            className="flex flex-col items-center justify-center p-4 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-6 h-6 mb-2 text-blue-600" />
            <span className="text-sm font-medium">Export Reports</span>
          </button>
          <button
            onClick={() => showToast.success('Leave Policies is coming soon!')}
            className="flex flex-col items-center justify-center p-4 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <Shield className="w-6 h-6 mb-2 text-purple-600" />
            <span className="text-sm font-medium">Leave Policies</span>
          </button>
          <button 
            onClick={() => showToast.success('Manage Users is coming soon!')}
            className="flex flex-col items-center justify-center p-4 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <Users className="w-6 h-6 mb-2 text-green-600" />
            <span className="text-sm font-medium">Manage Users</span>
          </button>
          <button
            onClick={() => showToast.success('System Settings is coming soon!')}
            className="flex flex-col items-center justify-center p-4 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <Settings className="w-6 h-6 mb-2 text-amber-600" />
            <span className="text-sm font-medium">System Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}