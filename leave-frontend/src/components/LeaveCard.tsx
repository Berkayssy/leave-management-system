// app/dashboard/leaves/new/page.tsx - Yeni İzin Talep Sayfası
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Calendar, ArrowLeft } from 'lucide-react';

export default function NewLeavePage() {
  const [formData, setFormData] = useState({
    type: 'annual',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.start_date || !formData.end_date) {
      setError('Please select start and end dates');
      setLoading(false);
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        leave: {
          leave_type: formData.type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
        },
      };

      const response = await api.post('/leaves', requestData);
      if (response.ok) {
        router.push('/dashboard/leaves');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create leave request');
      }
    } catch (error) {
      console.error('Failed to create leave:', error);
      setError('An error occurred while creating your leave request');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave', icon: '🏖️' },
    { value: 'sick', label: 'Sick Leave', icon: '🤒' },
    { value: 'personal', label: 'Personal Leave', icon: '👨‍👩‍👧' },
    { value: 'maternity', label: 'Maternity Leave', icon: '🤰' },
    { value: 'paternity', label: 'Paternity Leave', icon: '👨‍🍼' },
    { value: 'unpaid', label: 'Unpaid Leave', icon: '💰' },
    { value: 'emergency', label: 'Emergency Leave', icon: '🚨' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                LeaveFlow
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Leave Request</h1>
          <p className="text-gray-600">Submit a new leave request for approval</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-2">
              Leave Type
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              disabled={loading}
            >
              {leaveTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 mb-2">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 mb-2">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Days Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Selected Duration</p>
                <p className="text-xs text-blue-600 mt-1">
                  {formData.start_date && formData.end_date 
                    ? `${formData.start_date} to ${formData.end_date}`
                    : 'Select dates to see duration'
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{calculateDays()}</p>
                <p className="text-xs text-blue-600">days</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-900 mb-2">
              Reason
            </label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={5}
              placeholder="Provide a brief description of your leave request..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none placeholder:text-gray-400"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Please provide enough details for your manager to review your request.
            </p>
          </div>

          {/* Leave Balance Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Your Leave Balance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Available</div>
                <div className="text-lg font-medium text-gray-900">11 days</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Used</div>
                <div className="text-lg font-medium text-gray-900">7 days</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Pending</div>
                <div className="text-lg font-medium text-gray-900">2 days</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}