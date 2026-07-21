"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f8f9] flex items-center justify-center px-6">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition"
      >
        <ArrowLeft size={18} className="text-gray-700" />
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl" />
          <div className="relative w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={36} strokeWidth={3} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-500 text-[14px] leading-relaxed">
          Your subscription is now active. You have full access to all
          features — start training today.
        </p>
      </div>
    </div>
  );
}
