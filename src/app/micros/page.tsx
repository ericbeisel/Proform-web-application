"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Utensils } from "lucide-react";

export default function MicrosPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-gray-100 w-full flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="bg-white w-full flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
          >
            <ArrowLeft size={17} />
          </button>
          <h1 className="text-lg font-extrabold text-gray-900">Micros</h1>
        </div>

        {/* Coming Soon */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 pb-20">
          <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center">
            <Utensils size={36} className="text-green-500" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-gray-900">Coming Soon</p>
            <p className="text-sm text-gray-400 mt-2">Micronutrient tracking is on its way.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
