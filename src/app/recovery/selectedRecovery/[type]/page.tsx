"use client";

import { X, Upload } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

/* DATA */
const recoveryData: any = {
  "hottub": {
    title: "Hottub",
    time: "10-15m",
    color: "bg-cyan-600",
    description:
      "Hottubs can help loosen up tight muscles and increase blood flow within the body",
  },
  "infrared-sauna": {
    title: "Infrared Sauna",
    time: "10-20m",
    color: "bg-orange-500",
    description: "Helps detoxify the body and relax muscles",
  },
  "compression": {
    title: "Compression",
    time: "15-10m",
    color: "bg-purple-500",
    description: "Improves circulation and reduces soreness",
  },
};

export default function RecoveryDetailPage() {
  const router = useRouter();
  const params = useParams();

  const type = params.type as string;
  const data = recoveryData[type] || recoveryData["hottub"];

  const [time, setTime] = useState<string>("10");

  const handleChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setTime(value);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4">

      {/* CLOSE */}
      <button
        onClick={() => router.back()}
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
      >
        <X size={18} />
      </button>

      <div className="w-full max-w-2xl text-center space-y-5">

        {/* TITLE */}
        <div>
          <p className="text-sm text-gray-500">Submit Recovery:</p>
          <h1 className="text-2xl font-bold text-gray-800">{data.title}</h1>
        </div>

        {/* UPLOAD */}
        <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl flex items-center justify-center gap-2">
          <Upload size={18} />
          Upload Photo
        </button>

        {/* ICON */}
        <div className="flex justify-center">
          <div className={`w-20 h-20 ${data.color} rounded-2xl shadow-md`} />
        </div>

        {/* DESCRIPTION */}
        <div>
          <div className="h-px bg-gray-200 my-4" />
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {data.description}
          </p>
        </div>

        {/* SUGGESTED */}
        <div>
          <p className="text-xs text-gray-400">Suggested:</p>
          <p className="text-3xl font-bold">{data.time}</p>
        </div>

        {/* TIME CONTROLS */}
        <div className="flex flex-row items-center justify-between gap-6">

          <div className="flex flex-col items-center">
            <input
              type="text"
              value={time}
              onChange={(e) => handleChange(e.target.value)}
              className="text-6xl font-bold text-gray-500 text-center w-32 bg-transparent outline-none border-b-2 border-gray-300 focus:border-purple-600"
            />
            <p className="text-xs text-gray-400 mt-2">Time Spent (m)</p>
          </div>

          {/* INSTRUCTIONS */}
          <div className="bg-gray-100 rounded-2xl p-5 text-left flex-1">
            <p className="font-semibold text-sm mb-2">Instructions</p>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>• Set temperature appropriately</li>
              <li>• Stay relaxed and consistent</li>
              <li>• Focus on breathing</li>
            </ul>
          </div>
        </div>

        {/* SUBMIT */}
    <button
  onClick={() => {
    // validation (optional but recommended)
    if (!time || Number(time) <= 0) {
      alert("Please enter valid time");
      return;
    }

    // redirect to completion page
    router.push(
      `/recovery/completion?type=${data.title}&time=${time}`
    );
  }}
  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl font-semibold"
>
  Submit
</button>
      </div>
    </div>
  );
}