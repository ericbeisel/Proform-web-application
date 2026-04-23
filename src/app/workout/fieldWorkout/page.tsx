"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const sports = [
    { name: "General Wellness", icon: "🏃" },
    { name: "Football", icon: "🏈" },
    { name: "Basketball", icon: "🏀" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🔥 HEADER (Full Width but centered text) */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Field Workouts
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Field workouts and programs designed to work WITH your strength
          training. Enroll in one of the following programs for results.
        </p>
      </div>

      {/* ⭐ RECOMMENDED */}
      <div className="px-4 md:px-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Recommended:
        </h2>
        <p className="text-gray-400 mb-6">
          Based on your current training program
        </p>

        <div
          onClick={() => router.push("/conditioning/field-day")}
          className="relative w-full h-[350px] rounded-none md:rounded-xl overflow-hidden cursor-pointer group"
        >
          <img
            src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5"
            alt="Field Day"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />

          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-6">
            <h3 className="text-3xl md:text-4xl font-bold text-white">
              FIELD DAY
            </h3>
            <p className="text-white mt-2 tracking-widest">
              8–12 WEEKS
            </p>

            <p className="text-white text-sm mt-4 max-w-xl leading-relaxed">
              Complete this 8–12 week indoor/outdoor training program with any
              active lifestyle strength training program for superior results.
              This program supplements most programs in our library and can be
              completed by all.
            </p>
          </div>
        </div>
      </div>

      {/* 🏀 BY SPORT */}
      <div className="px-4 md:px-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          By Sport:
        </h2>
        <p className="text-gray-400 mb-6">
          Choose a program by sport
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {sports.map((sport, idx) => (
            <div
              key={idx}
              onClick={() =>
                router.push(
                  `/sport/${sport.name.toLowerCase().replace(" ", "-")}`
                )
              }
              className="bg-white border h-40 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition"
            >
              <div className="text-4xl mb-2">{sport.icon}</div>
              <p className="font-semibold text-lg">{sport.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 💪 ALL CONDITIONING */}
      <div className="px-4 md:px-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          All Conditioning:
        </h2>
        <p className="text-gray-400 mb-6">
          Browse all conditioning programs
        </p>

        <div
          onClick={() => router.push("/conditioning/field-day")}
          className="relative w-full h-[300px] rounded-none md:rounded-xl overflow-hidden cursor-pointer group"
        >
          <img
            src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5"
            alt="Field Day"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />

          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-6">
            <h3 className="text-3xl font-bold text-white">
              FIELD DAY
            </h3>
            <p className="text-white mt-2 tracking-widest">
              8–12 WEEKS
            </p>
          </div>
        </div>
      </div>

      {/* 🔗 FOOTER */}
      <div className="text-center pb-10">
        <span
          onClick={() => router.push("/field-workout")}
          className="text-gray-400 text-sm cursor-pointer hover:text-purple-600"
        >
          Field Workout
        </span>
      </div>

    </div>
  );
}