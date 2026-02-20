import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden md:block md:w-2/5 relative overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/proform-vid.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Right Panel - Dynamic Content (Full width on mobile) */}
      <div className="w-full md:w-3/5 bg-gray-50 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-6 pt-3 md:p-10 md:pt-3">
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}