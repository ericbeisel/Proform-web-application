"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Utensils, Bell } from "lucide-react";

export default function MicrosPage() {
  const router = useRouter();
  const [notified, setNotified] = useState(false);

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
          <h1 className="text-lg font-extrabold text-gray-900">Nutrition & Macros</h1>
        </div>

        {/* Coming Soon */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 pb-20">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
            <Utensils size={32} className="text-amber-500" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-gray-900">Nutrition & Macros</p>
            <p className="text-sm text-gray-400 mt-2">
              Monitor your daily nutritional intake and macro balance.
            </p>
          </div>

          <span className="bg-purple-50 text-purple-700 text-xs font-bold px-4 py-1.5 rounded-full">
            COMING SOON
          </span>

          <button
            onClick={() => setNotified(true)}
            disabled={notified}
            className="flex items-center gap-2 border border-gray-200 text-gray-900 font-semibold text-sm px-5 py-3 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <Bell size={16} className="text-purple-600" />
            {notified ? "We'll notify you!" : "Notify me when this feature is ready"}
          </button>
        </div>

      </div>
    </div>
  );
}
