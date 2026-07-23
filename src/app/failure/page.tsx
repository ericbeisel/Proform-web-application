"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, AlertTriangle } from "lucide-react";

export default function PaymentFailurePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.back(), 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf5f6] flex items-center justify-center px-6">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-red-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-red-200/40 blur-3xl" />

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition"
      >
        <ArrowLeft size={18} className="text-gray-700" />
      </button>

      {/* Logo */}
      <img
        src="/images/proform-logo.jpg"
        alt="Proform"
        className="absolute top-6 left-1/2 -translate-x-1/2 h-8 w-auto rounded-md"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-red-400/30 blur-xl" />
          <div className="relative w-20 h-20 rounded-full bg-red-500 flex items-center justify-center">
            <X size={36} strokeWidth={3} className="text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
            <AlertTriangle size={12} className="text-white" fill="currentColor" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-500 text-[14px] leading-relaxed">
          Your card was declined. Please check your card details or try a
          different payment method.
        </p>
      </div>
    </div>
  );
}
