"use client";

import { useState } from "react";
import {
  RefreshCw,
  Calendar,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function RecoveryDashboard() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
const [goal, setGoal] = useState<number | string>(70);
const increase = () => {
  setGoal((prev) => Number(prev || 0) + 5);
};

const decrease = () => {
  setGoal((prev) => Math.max(Number(prev || 0) - 5, 0));
};

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Recovery Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Track your recovery progress and options
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-white shadow">
            <RefreshCw size={18} />
          </button>
          <button className="p-2 rounded-full bg-purple-600 text-white shadow">
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* Product Card */}
          <div className="bg-orange-400 text-white rounded-2xl p-5 flex justify-between items-center shadow">
            <div>
              <p className="text-lg font-bold">GATORADE</p>
              <p className="text-sm opacity-80">WHEY PROTEIN</p>
            </div>

            <div className="flex gap-2 items-center">
              <span className="bg-white/30 px-3 py-1 rounded-lg text-xs">
                CHOCOLATE
              </span>
              <div className="w-10 h-10 bg-white/20 rounded-lg" />
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex flex-col items-center">
              {/* Circular Progress */}
              <div className="relative w-36 h-36">
                <div className="absolute inset-0 rounded-full border-[10px] border-gray-200" />
                <div className="absolute inset-0 rounded-full border-[10px] border-purple-500 border-t-transparent rotate-[120deg]" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">0%</p>
                    <p className="text-xs text-gray-500">COMPLETED</p>
                  </div>
                </div>
              </div>

              <p className="text-purple-600 text-xl font-semibold mt-4">
                {goal}m Left
              </p>
              <p className="text-gray-500 text-sm">Total Recovery</p>

              <p className="text-xs text-green-500 text-center mt-3 max-w-xs">
                *All programs at least 30 minutes of recovery based on your
                Activity, Condition and Body Score
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="text-blue-600 text-sm mt-3"
              >
                Change Recovery Goal →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Recently Completed */}
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                Recently Completed
              </h2>
              <button className="text-blue-600 text-sm">View All →</button>
            </div>

            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <div className="text-3xl">✦</div>
              <p className="text-sm mt-2">No recent recovery sessions</p>
              <button
                onClick={() => router.push("/recovery/recovery-session")}
                className="text-blue-600 text-sm mt-1"
              >
                View All Activity →
              </button>
            </div>
          </div>

          {/* Recovery Options */}
          <div className="bg-white rounded-2xl p-5 shadow">
            <h2 className="font-semibold text-gray-800 mb-4">
              Recovery Options
            </h2>

            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-xl bg-red-100 flex items-center justify-center border border-red-300">
                  <div className="w-8 h-10 bg-red-500 rounded-sm" />
                </div>
                <p className="text-xs text-center">Red Light Therapy</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-xl bg-yellow-100 flex items-center justify-center border border-yellow-300">
                  <div className="w-10 h-6 bg-yellow-500 rounded-full" />
                </div>
                <p className="text-xs text-center">
                  HBOT (Hyperbaric Oxygen Chamber)
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center border">
                  <div className="w-8 h-6 bg-gray-400 rounded" />
                </div>
                <p className="text-xs text-center">Red Light Mask</p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button onClick={()=> router.push("/recovery/all-recovery-options")} className="text-blue-600 text-sm">
                View All Recovery Options →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 relative shadow-xl">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-black"
            >
              <X />
            </button>

            <p className="text-center text-xs text-gray-400 mb-1">
              You're adjusting:
            </p>
            <h2 className="text-center text-xl font-semibold mb-4">
              Recovery Goal
            </h2>

            <div className="bg-green-100 text-green-700 text-sm p-3 rounded-xl mb-6 text-center">
              *AI suggests at least 82 minutes of recovery each week
            </div>

            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="bg-gray-100 rounded-xl px-8 py-6 text-center">
                <p className="text-3xl font-bold text-gray-500">70</p>
                <p className="text-xs text-gray-500 mt-2">
                  Current Goal (minutes)
                </p>
              </div>

            <div className="flex items-center gap-2">
  {/* Stepper */}
  <div className="flex flex-col">
    <button
      onClick={increase}
      className="p-1 bg-gray-200 rounded-t hover:bg-gray-300"
    >
      <ChevronUp size={16} />
    </button>
    <button
      onClick={decrease}
      className="p-1 bg-gray-200 rounded-b hover:bg-gray-300"
    >
      <ChevronDown size={16} />
    </button>
  </div>

  {/* Input Box */}
  <div className="bg-gray-100 rounded-xl px-6 py-4 text-center">
    <input
      type="number"
      value={goal}
    onChange={(e) => {
  const value = e.target.value;

  // ✅ allow empty (so user can delete)
  if (value === "") {
    setGoal("");
    return;
  }

  const val = Number(value);

  // ✅ only allow valid numbers
  if (!isNaN(val) && val >= 0 && val <= 500) {
    setGoal(val);
  }
}}
      className="w-20 text-center text-3xl font-bold bg-transparent outline-none"
    />

    <p className="text-xs text-purple-600 mt-2">
      New Goal (minutes)
    </p>
  </div>
</div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gradient-to-r from-purple-700 to-purple-500 text-white py-3 rounded-xl shadow"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}