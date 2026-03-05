'use client';

import React from 'react';
import { X, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-20 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Title with Icon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Users size={20} className="text-gray-700" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Teams</h1>
            </div>

            {/* Right - Close Button */}
            <button
              onClick={() => {
                // Navigate back or to dashboard
                router.back();
              }}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full mx-auto py-8">
        {children}
      </div>
    </div>
  );
}