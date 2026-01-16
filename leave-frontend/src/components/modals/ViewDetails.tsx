'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { X, Calendar, User, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Leave {
  id: number;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

interface ViewDetailsModalProps {
  leaveId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewDetailsModal({ leaveId, isOpen, onClose }: ViewDetailsModalProps) {
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && leaveId) {
      fetchLeaveDetails();
    }
  }, [isOpen, leaveId]);

  const fetchLeaveDetails = async () => {
    if (!leaveId) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/leaves/${leaveId}`);
      
      if (response.ok) {
        const data = await response.json();
        setLeave(data);
      }
    } catch (error) {
      console.error('Failed to fetch leave details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-2xl bg-white shadow-2xl transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Leave Details</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : leave ? (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(leave.status)}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {leave.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    #{leave.id}
                  </span>
                </div>

                {/* Type & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Leave Type</div>
                    <div className="text-base font-medium text-gray-900 capitalize">
                      {leave.leave_type}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="text-base font-medium text-gray-900">
                      {calculateDays(leave.start_date, leave.end_date)} days
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div className="text-sm text-gray-500">Dates</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <div className="text-xs text-gray-500">Start</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(leave.start_date)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">End</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(leave.end_date)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                {leave.user && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-500">Requested By</div>
                    </div>
                    <div className="pl-6 space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {leave.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {leave.user.email}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {leave.user.role}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-3">
                  <div className="text-sm text-gray-500">Reason</div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {leave.reason}
                    </p>
                  </div>
                </div>

                {/* Dates Info */}
                <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                  <div>Created: {formatDate(leave.created_at)}</div>
                  <div>Last Updated: {formatDate(leave.updated_at)}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No leave data found
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}