'use client';

import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PlayerProgress() {
  const router = useRouter();

  const progressData = [
    {
      id: 4,
      date: '2/3/2026',
      weight: '67 lbs',
      smm: '52.4 lbs',
      fat: '18.2%',
      score: 85,
    },
    {
      id: 3,
      date: '1/15/2026',
      weight: '68.5 lbs',
      smm: '51.8 lbs',
      fat: '19.1%',
      score: 82,
    },
    {
      id: 2,
      date: '12/28/2025',
      weight: '69.2 lbs',
      smm: '51.2 lbs',
      fat: '20%',
      score: 79,
    },
  ];

  return (
    <main className="min-h-screen bg-[#eef1f5] px-5 py-6 md:p-8">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Player Progress</h1>
            <p className="text-gray-500 text-xs md:text-sm">
              Track Shweta Gharge’s fitness journey
            </p>
          </div>
        </div>
      </div>

      {/* STATS - more compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <p className="text-gray-500 text-xs md:text-sm">Total Scans</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-1">3</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <p className="text-gray-500 text-xs md:text-sm">Weight Change</p>
          <p className="text-2xl md:text-3xl font-bold text-green-500 mt-1">-2.2 lbs</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <p className="text-gray-500 text-xs md:text-sm">Current Score</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-1">85</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <p className="text-gray-500 text-xs md:text-sm">Improvement</p>
          <p className="text-2xl md:text-3xl font-bold text-green-500 mt-1">+6</p>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="bg-white rounded-2xl shadow p-5 md:p-6">
        <h2 className="text-lg font-bold mb-4">Progress Timeline</h2>

        <div className="space-y-3">
          {progressData.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl p-4 flex items-center justify-between hover:shadow transition"
            >
              {/* LEFT */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                  #{item.id}
                </div>

                <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0" />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm md:text-base">{item.date}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                      Complete
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-1.5 text-xs md:text-sm">
                    <div>
                      <span className="text-gray-500">Wt</span>
                      <div className="text-purple-600 font-semibold">{item.weight}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">SMM</span>
                      <div className="text-blue-600 font-semibold">{item.smm}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Fat</span>
                      <div className="text-orange-500 font-semibold">{item.fat}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Score</span>
                      <div className="text-purple-600 font-semibold">{item.score}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-purple-500 text-lg pl-2">›</div>
            </div>
          ))}

          {/* PENDING */}
          <div className="border rounded-xl p-4 flex items-center gap-3 opacity-65">
            <div className="w-10 h-10 rounded-full bg-purple-300 text-white flex items-center justify-center font-bold text-sm">
              #1
            </div>

            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-lg">
              📅
            </div>

            <div className="flex-1">
              <p className="font-semibold text-sm">12/10/2025</p>
              <p className="text-xs text-gray-500">Scan not completed yet</p>
            </div>

            <span className="text-xs bg-gray-200 px-2.5 py-0.5 rounded-full">
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* TIP */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 text-sm rounded-xl p-3.5 text-center">
        📈 Keep uploading scans to see your progress!
      </div>
    </main>
  );
}