// app/layout.tsx - GÜNCELLENMİŞ VERSİYON
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/ui/Toast';
import PageTransition from '@/components/layout/PageTransition';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Leave Management System',
  description: 'Ruby on Rails API + Next.js Frontend',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
            <PageTransition>
              {children}
            </PageTransition>
        </ToastProvider>
      </body>
    </html>
  );
}