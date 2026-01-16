// PageTransition.tsx'i Tailwind ile yap:
'use client';

import { ReactNode } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      {children}
    </div>
  );
}