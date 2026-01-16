// components/ui/Button.tsx - DÜZELTİLMİŞ VERSİYON
'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({ 
  loading, 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 border border-gray-300",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
  };

  return (
    <button 
      {...props}
      disabled={loading || props.disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:scale-100
        ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Loading...
        </div>
      ) : children}
    </button>
  );
}