// app/dashboard/leaves/new/page.tsx - GÜNCEL TAM ÇÖZÜM
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  FileText,
  ArrowLeft,
  PlusCircle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Button component'ini dynamic import et
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';

const Button = dynamic(() => import('@/components/ui/Button'), {
  ssr: false,
  loading: () => (
    <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed" disabled>
      Loading...
    </button>
  )
});

export default function NewLeavePage() {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    leave_type: 'annual',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [daysCount, setDaysCount] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Client-side olduğunu belirle
  useEffect(() => {
    setIsMounted(true);
    
    // Tarihleri sadece client-side'da set et
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    setFormData(prev => ({
      ...prev,
      start_date: today.toISOString().split('T')[0],
      end_date: nextWeek.toISOString().split('T')[0]
    }));
  }, []);

  // Gün sayısını hesapla (sadece client-side)
  useEffect(() => {
    if (isMounted && formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDaysCount(diffDays > 0 ? diffDays : 1);
    }
  }, [formData.start_date, formData.end_date, isMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // API çağrısı
      
      const requestData = { 
        leave: {
          start_date: formData.start_date,
          end_date: formData.end_date,
          leave_type: formData.leave_type,
          reason: formData.reason
        } 
      };
      const response = await api.post('/leaves', requestData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create leave');
      }

      // Başarılı
      setShowSuccess(true);
      setLoading(false);
      
      // Kısa gecikme ve yönlendirme
      setTimeout(() => {
        router.push('/dashboard/leaves?success=true');
      }, 1500);
      
    } catch (err: unknown) {
      setLoading(false);
      setShowSuccess(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBack = () => {
    router.back();
  };

  const getLeaveTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      annual: '🏖️',
      sick: '🤒',
      unpaid: '💰',
      emergency: '🚨'
    };
    return icons[type] || '📅';
  };

  // Server-side render için loading state
  if (!isMounted) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">Leave request submitted successfully.</p>
              <p className="text-sm text-gray-500 animate-pulse">
                Redirecting to leaves page...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          type="button"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Leave Request</h1>
          <p className="text-gray-600 text-sm mt-1">Submit a new time-off request for approval</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-700">Submission Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    min={formData.start_date}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Leave Type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Leave Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'annual', label: 'Annual', icon: '🏖️' },
                    { value: 'sick', label: 'Sick', icon: '🤒' },
                    { value: 'unpaid', label: 'Unpaid', icon: '💰' },
                    { value: 'emergency', label: 'Emergency', icon: '🚨' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({...formData, leave_type: type.value})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.leave_type === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs opacity-70">Leave</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Reason for Leave
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={5}
                  required
                  minLength={20}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Please provide a detailed reason for your leave request. This will help your manager understand your situation better..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Please be specific about your reason. Minimum 20 characters.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading || showSuccess}
                className={`
                  px-8 py-3 rounded-lg flex items-center justify-center gap-2
                  font-medium transition-all shadow-md
                  ${loading || showSuccess
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }
                  text-white disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:shadow-md
                `}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </div>
                ) : showSuccess ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Submitted!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    <span>Submit Request</span>
                  </div>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleBack}
                disabled={loading || showSuccess}
                className="px-8 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Request Summary</h3>
            
            <div className="space-y-4">
              {/* Type Summary */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl">{getLeaveTypeIcon(formData.leave_type)}</div>
                <div>
                  <p className="text-sm text-gray-500">Leave Type</p>
                  <p className="font-medium text-gray-800 capitalize">
                    {formData.leave_type === 'annual' ? 'Annual Leave' :
                     formData.leave_type === 'sick' ? 'Sick Leave' :
                     formData.leave_type === 'unpaid' ? 'Unpaid Leave' : 'Emergency Leave'}
                  </p>
                </div>
              </div>

              {/* Duration Summary */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <Clock className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-800">
                    {daysCount} day{daysCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.start_date} → {formData.end_date}
                  </p>
                </div>
              </div>

              {/* Guidelines */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Submission Guidelines</p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Submit requests at least 48 hours in advance</li>
                      <li>• Provide clear reason for emergency leaves</li>
                      <li>• Sick leaves may require doctor's note</li>
                      <li>• Unpaid leaves require manager approval</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Character Count */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Reason Length</span>
                  <span className={`text-sm font-medium ${
                    formData.reason.length >= 20 ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {formData.reason.length}/20 chars
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      formData.reason.length >= 20 ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (formData.reason.length / 20) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}