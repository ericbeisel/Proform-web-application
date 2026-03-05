"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
export default function JoiningCodePage() {
  const [code, setCode] = useState("");
  const router = useRouter();
    
  const handleSubmit = () => {
    router.push("/team-dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 mt-4">
      <div className="w-full max-w-xl flex flex-col items-center">

        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00B8DB] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-violet-200 mb-7">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="7.5" cy="15.5" r="4.5" stroke="white" strokeWidth="2" />
            <path
              d="M10.5 12.5L16 7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M15 8l2-2 1.5 1.5-2 2"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.5 10.5l1-1 1.5 1.5-1 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
          Joining Code
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-8 max-w-md">
          Please submit the code that your coach shared to you to join the team
        </p>

        {/* Form */}
        <div className="w-full mb-4">
          <label
            htmlFor="joiningCode"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Team Joining Code
          </label>
          <input
            id="joiningCode"
            type="text"
            placeholder="ENTER JOINING CODE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3.5 text-sm text-gray-700 border border-gray-200 rounded-lg outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 placeholder:text-gray-400 placeholder:uppercase placeholder:tracking-wide"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-[#6202AC] hover:bg-violet-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
        >
          Submit
        </button>

      </div>
    </div>
  );
}