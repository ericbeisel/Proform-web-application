"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const options = [
  { id: 1, name: "Compression", time: "15-30m", icon: "🦵" },
  { id: 2, name: "Contrast", time: "5-15m", icon: "🛁" },
  { id: 3, name: "Cryotherapy", time: "3-5m", icon: "❄️" },
  { id: 4, name: "Infrared Sauna", time: "20-30m", icon: "🌡️" },
  { id: 5, name: "Massage Gun", time: "5-8m", icon: "🔫" },
  { id: 6, name: "Dry-needling", time: "5-30m", icon: "💉" },
  { id: 7, name: "E-Stim", time: "10-30m", icon: "⚡" },
  { id: 8, name: "Foam Rolling", time: "5-15m", icon: "🧘" },
  { id: 9, name: "Laser Therapy", time: "5-15m", icon: "💡" },
  { id: 10, name: "Napping", time: "15-30m", icon: "😴" },
  { id: 11, name: "HBOT", time: "60-90m", icon: "🫁" },
  { id: 12, name: "Hot tub", time: "10-15m", icon: "♨️" },
  { id: 13, name: "Ice Bath", time: "5-15m", icon: "🧊" },
  { id: 14, name: "Massage", time: "30m-60m", icon: "🐯" },
  { id: 15, name: "Red-Light Mask", time: "10-20m", icon: "😷" },
  { id: 16, name: "Red-Light Therapy", time: "5-15m", icon: "🔴" },
  { id: 17, name: "Salt Bath", time: "10-15m", icon: "🧂" },
];

export default function RecoveryOptions() {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-24">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Recovery Options
          </h1>
          <p className="text-sm text-gray-500 max-w-xl">
            Choose from our list of proven and trusted recovery methods used by
            top athletes and health professionals in the industry
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {options.map((item) => {
          const isActive = selected.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              className={`cursor-pointer rounded-2xl p-4 bg-white border transition-all
              ${
                isActive
                  ? "border-purple-500 ring-2 ring-purple-300"
                  : "border-gray-200 hover:shadow-md"
              }`}
            >
              {/* Icon box */}
              <div className="bg-gray-100 rounded-xl h-24 flex items-center justify-center mb-3">
                <span className="text-2xl">{item.icon}</span>
              </div>

              {/* Text */}
              <p className="text-sm font-medium text-gray-800 text-center">
                {item.name}
              </p>
              <p className="text-xs text-green-600 text-center mt-1">
                {item.time}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Select a recovery method to learn more and add to your schedule
        </p>

        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg shadow">
          Done
        </button>
      </div>
    </div>
  );
}