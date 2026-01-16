'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function Spinner({ size = 'md' }: SpinnerProps) {
  const sizes: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizes[size]} animate-spin`}>
      <div className="h-full w-full border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full" />
    </div>
  );
}