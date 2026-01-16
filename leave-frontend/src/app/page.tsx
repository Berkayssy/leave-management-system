// app/page.tsx - Home Sayfası
'use client';

import { Calendar, ArrowRight, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Eğer authentication varsa sign in sayfasına yönlendir
    // Yoksa doğrudan dashboard'a
    router.push('/auth/login'); // veya '/dashboard'
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                LeaveFlow
              </span>
            </div>
            <button
              onClick={handleSignIn}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-sm hover:shadow"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Modern Leave
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Management
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Streamline your team's time-off requests with a clean, efficient system 
            built for modern workplaces.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Requests</h3>
            <p className="text-gray-600">Submit and approve leave requests in seconds with our intuitive interface.</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-50 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
            <p className="text-gray-600">Get instant notifications when your leave requests are reviewed.</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">Track team availability and leave patterns with comprehensive reports.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to streamline your leave management?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of teams who trust our platform for their time-off management.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                LeaveFlow
              </span>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 LeaveFlow System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}