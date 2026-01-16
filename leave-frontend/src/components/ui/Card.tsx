'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div className={`
      bg-white rounded-xl border border-gray-200 
      ${hover ? 'hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200' : ''}
      shadow-sm p-6
      ${className}
    `}>
      {children}
    </div>
  );
}