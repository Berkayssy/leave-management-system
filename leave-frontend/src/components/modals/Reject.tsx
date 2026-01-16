'use client';

import { useState } from 'react';
import { XCircle, X, User, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';

interface RejectModalProps {
  leaveId: number;
  leaveType: string;
  dates: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function RejectModal({
  leaveId,
  leaveType,
  dates,
  userName,
  isOpen,
  onClose,
  onConfirm
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onConfirm(reason.trim());
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-2xl bg-white shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reject Leave Request</h3>
            </div>
            <button onClick={onClose} disabled={loading} className="rounded-full p-1 hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Leave Info */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">Requested by</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{leaveType}</p>
                  <p className="text-xs text-gray-500">{dates}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Leave Details</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium">#{leaveId}</span>
                </div>
              </div>
            </div>

            {/* Reason (Required) */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-medium text-gray-900">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
              </div>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                rows={3}
                className={`w-full px-3 py-2.5 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none`}
                placeholder="Provide a reason for rejecting this leave request..."
                required
                disabled={loading}
              />
              {error && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {error}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Required. This will be shared with the employee.
              </p>
            </div>

            {/* Warning Box */}
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-700">
                This action will reject the leave request. The employee will be notified with your reason.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Rejecting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" />
                    <span>Reject Request</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}