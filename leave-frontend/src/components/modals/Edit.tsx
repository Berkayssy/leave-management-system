'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { X, Calendar, AlertCircle, Check } from 'lucide-react';

interface Leave {
  id: number;
  start_date: string;
  end_date: string;
  leave_type?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface EditLeaveModalProps {
  leave: Leave | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave', icon: '🏖️' },
  { value: 'sick', label: 'Sick Leave', icon: '🤒' },
  { value: 'personal', label: 'Personal Leave', icon: '👨‍👩‍👧' },
  { value: 'unpaid', label: 'Unpaid Leave', icon: '💰' },
  { value: 'emergency', label: 'Emergency Leave', icon: '🚨' },
];

export default function EditLeaveModal({ leave, isOpen, onClose, onSuccess }: EditLeaveModalProps) {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    leave_type: 'annual',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Leave data gelince formu doldur
  useEffect(() => {
    if (leave) {
      setFormData({
        start_date: leave.start_date,
        end_date: leave.end_date,
        leave_type: leave.leave_type || 'annual',
        reason: leave.reason,
      });
      setError('');
    }
  }, [leave]);

  if (!isOpen || !leave) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.start_date || !formData.end_date) {
      setError('Please select start and end dates');
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('End date must be after start date');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.patch(`/leaves/${leave.id}`, {
        leave: formData
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update leave request');
      }
    } catch (error: any) {
      console.error('Failed to update leave:', error);
      setError('An error occurred while updating your leave request');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Edit Leave Request</h3>
              <p className="text-sm text-gray-500">Update your leave details</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Leave Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Leave Type
              </label>
              <select
                value={formData.leave_type}
                onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {LEAVE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Days Info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-800">Duration</p>
                  <p className="text-xs text-blue-600">
                    {formData.start_date && formData.end_date 
                      ? `${formatDate(formData.start_date)} - ${formatDate(formData.end_date)}`
                      : 'Select dates'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">{calculateDays()}</p>
                  <p className="text-xs text-blue-600">days</p>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Reason
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Provide a reason for your leave..."
                required
                disabled={loading}
              />
            </div>

            {/* Original Info */}
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Original Request</p>
              <p className="text-sm text-gray-700">
                Status: <span className="font-medium capitalize">{leave.status}</span>
              </p>
              <p className="text-sm text-gray-700">
                ID: <span className="font-medium">#{leave.id}</span>
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
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Update Request</span>
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