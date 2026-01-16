'use client';

import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  leaveId: number | null;
  leaveType?: string;
  dates?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => void;
}

export default function DeleteConfirmModal({
  leaveId,
  leaveType,
  dates,
  isOpen,
  onClose,
  onConfirm
}: DeleteConfirmModalProps) {
  if (!isOpen || !leaveId) return null;

  const handleConfirm = () => {
    onConfirm(leaveId);
    onClose();
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
        <div className="relative w-full max-w-sm transform rounded-2xl bg-white shadow-2xl transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
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
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-700 font-medium mb-2">
                Are you sure you want to delete this leave request?
              </p>
              
              {leaveType && dates && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-gray-900">{leaveType}</p>
                  <p className="text-sm text-gray-600">{dates}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: #{leaveId}</p>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                This action cannot be undone. The leave request will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}