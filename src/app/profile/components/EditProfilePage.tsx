"use client";

import { useState } from "react";
import { ChevronLeft, Upload, Camera, MapPin, AtSign } from "lucide-react";

export default function EditProfilePage({ onClose }: { onClose?: () => void }) {
  const [form, setForm] = useState({
    fullName: "Shweta Gharge",
    username: "shweta18",
    location: "San Francisco, CA",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[400px] bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-blue-200 bg-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <h1 className="text-[20px] font-extrabold text-gray-900">Edit Profile</h1>
        </div>
        <button className="bg-purple-700 hover:bg-purple-800 text-white text-[13px] font-bold px-5 py-2 rounded-xl transition-colors mr-9">
          Save Changes
        </button>
      </div>

      {/* ── Content ── */}
      <div className="p-6">
        <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 bg-gray-50">
          <div className="grid grid-cols-2 gap-8">

            {/* Left: Profile picture */}
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Profile Picture</p>
              <div className="relative w-fit mx-auto mb-4">
                <div className="w-40 h-40 rounded-full bg-orange-500 flex items-center justify-center text-white text-[36px] font-extrabold shadow-lg">
                  SG
                </div>
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white shadow-md transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-xl py-3 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors bg-white">
                <Upload size={15} />
                Upload New Photo
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-2">JPG, PNG or GIF • Max 15MB</p>
            </div>

            {/* Right: Basic info */}
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Basic Information</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">Full Name</label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">Username</label>
                  <div className="relative">
                    <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">Location</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}