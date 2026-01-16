'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import {
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';

import ViewDetailsModal from '@/components/modals/ViewDetails';
import EditLeaveModal from '@/components/modals/Edit';
import DeleteConfirmModal from '@/components/modals/Delete';

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

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [deletingLeave, setDeletingLeave] = useState<{
    id: number; leaveType?: string; dates?: string;
  } | null>(null);
  const [viewingLeaveDetails, setViewingLeaveDetails] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Farklı endpoint'ler dene
      const endpoints = [
        '/leaves',
        '/api/v1/leaves',
        '/user/leaves',
        '/my-leaves'
      ];
      
      let leavesData: Leave[] = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          if (response.ok) {
            const data = await response.json();
            leavesData = Array.isArray(data) ? data : 
                        data.leaves ? data.leaves :
                        data.data ? data.data : [];
            break;
          }
        } catch (e) {
          console.log('Failed to fetch from', endpoint, ':', e);
          continue;
        }
      }
      
      setLeaves(leavesData);
      
    } catch (error: any) {
      console.error('Failed to fetch leaves:', error);
      setError(error.message || 'Failed to load leave requests');
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

  const filteredLeaves = leaves.filter(leave => {
    // Status filter
    if (statusFilter !== 'all' && leave.status !== statusFilter) {
      return false;
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      const type = leave.leave_type || leave.type || '';
      if (type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        leave.reason.toLowerCase().includes(searchLower) ||
        (leave.leave_type || leave.type || '').toLowerCase().includes(searchLower) ||
        leave.status.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: leaves.length
    };
    
    leaves.forEach(leave => {
      if (leave.status === 'pending') counts.pending++;
      if (leave.status === 'approved') counts.approved++;
      if (leave.status === 'rejected') counts.rejected++;
    });
    
    return counts;
  };

  const handleDelete = async (leaveId: number) => {
    const leaveToDelete = leaves.find(leave => leave.id === leaveId);
    setDeletingLeave({ 
      id: leaveId, 
      leaveType: leaveToDelete?.leave_type || leaveToDelete?.type, 
      dates: leaveToDelete ? `${formatDate(leaveToDelete?.start_date || '')} - ${formatDate(leaveToDelete?.end_date)}` : undefined 
    });
  };

  const handleConfirmDelete = async (leaveId: number) => {
    try {
      const response = await api.delete(`/leaves/${leaveId}`);
      if (response.ok) {
        setLeaves(prev => prev.filter(leave => leave.id !== leaveId));
        setDeletingLeave(null);
        return;
      } else {
        throw new Error('Failed to delete leave');
      }
    } catch (error) {
      console.warn('Primary delete endpoint failed, trying alternatives...');
      alert('Failed to delete leave request');
    }
  };
  
  const handleEdit = (leaveId: number) => {
    // Modal
    setEditingLeave(leaves.find(leave => leave.id === leaveId) || null);
  };

  const handleViewDetails = (leaveId: number) => {
    setViewingLeaveDetails(leaveId);

  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading leave requests...</p>
        <p className="text-sm text-gray-400 mt-1">Fetching your leave data</p>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
          <p className="text-gray-600">Manage and track all your leave applications</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchLeaves}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={() => router.push('/dashboard/leaves/new')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            New Request
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Requests</div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{statusCounts.total}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-yellow-600">{statusCounts.pending}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-green-600">{statusCounts.approved}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Rejected</div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-red-600">{statusCounts.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leaves by reason or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="all">All Types</option>
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
              <option value="maternity">Maternity</option>
              <option value="paternity">Paternity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaves List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-gray-900">All Leave Requests</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredLeaves.length} of {leaves.length} requests
            </p>
          </div>
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        
        {filteredLeaves.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium mb-2">
              {leaves.length === 0 
                ? 'No leave requests found'
                : 'No leave requests match your filters'
              }
            </p>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {leaves.length === 0
                ? 'Start by creating your first leave request'
                : 'Try changing your search or filter criteria'
              }
            </p>
            {leaves.length === 0 && (
              <Button
                onClick={() => router.push('/dashboard/leaves/new')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create First Leave
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLeaves.map((leave) => {
              const days = calculateDays(leave.start_date, leave.end_date);
              const startDate = formatDate(leave.start_date);
              const endDate = formatDate(leave.end_date);
              const submittedDate = leave.created_at ? formatDate(leave.created_at) : 'N/A';
              
              return (
                <div key={leave.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          leave.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : leave.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {leave.leave_type || leave.type || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {days} days
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <div className="text-xs text-gray-500">Dates</div>
                          <div className="text-sm font-medium text-gray-900">
                            {startDate} - {endDate}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Submitted</div>
                          <div className="text-sm text-gray-900">{submittedDate}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Duration</div>
                          <div className="text-sm text-gray-900">{days} days</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Reason:</span> {leave.reason}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleViewDetails(leave.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      
                      {leave.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleEdit(leave.id)}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(leave.id)}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
       <div>
          {viewingLeaveDetails !== null && (
            <ViewDetailsModal
              leaveId={viewingLeaveDetails}
              isOpen={viewingLeaveDetails !== null}
              onClose={() => setViewingLeaveDetails(null)}
            />
          )}
        </div>
        <div>
          {editingLeave !== null && (
            <EditLeaveModal
              leave={editingLeave}
              isOpen={editingLeave !== null}
              onClose={() => setEditingLeave(null)}
              onSuccess={() => {
                setEditingLeave(null);
                fetchLeaves();
              }}
            />
          )}
        </div>
        <div>
          {deletingLeave !== null && (
            <DeleteConfirmModal
              leaveId={deletingLeave.id}
              leaveType={deletingLeave?.leaveType}
              dates={deletingLeave.dates}
              isOpen={true}
              onClose={() => setDeletingLeave(null)}
              onConfirm={async () => {
                try {
                  await handleConfirmDelete(deletingLeave.id);
                  setDeletingLeave(null);
                } catch (error) {
                  alert('Failed to delete leave request');
                  setDeletingLeave(null);
                }
              }}
            />
          )}
        </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Leave Summary</p>
            <p className="text-xs text-gray-500 mt-1">
              {statusCounts.pending} pending • {statusCounts.approved} approved • {statusCounts.rejected} rejected
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Approval Rate</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {statusCounts.total > 0 
                ? `${Math.round((statusCounts.approved / statusCounts.total) * 100)}%`
                : '0%'
              }
            </p>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                style={{ 
                  width: `${statusCounts.total > 0 
                    ? Math.round((statusCounts.approved / statusCounts.total) * 100) 
                    : 0}%` 
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Avg. Duration</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {leaves.length > 0 
                ? (leaves.reduce((acc, leave) => 
                    acc + calculateDays(leave.start_date, leave.end_date), 0) / leaves.length
                  ).toFixed(1)
                : '0'
              } days
            </p>
            <p className="text-xs text-gray-500">Average per request</p>
          </div>
        </div>
      </div>
    </div>
  );
}