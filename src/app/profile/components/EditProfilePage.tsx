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
    <div
      className="min-h-screen sm:min-h-[500px] bg-gray-50 sm:bg-white flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-white shadow-sm sm:shadow-none rounded-t-2xl">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
          )}
          <h1 className="text-xl sm:text-[20px] font-extrabold text-gray-900">Edit Profile</h1>
        </div>

        <button className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm sm:text-[13px] font-bold px-5 sm:px-6 py-2.5 sm:py-2 rounded-xl transition-colors shadow-sm min-w-[110px] text-center">
          Save Changes
        </button>
      </div>

      {/* Main content – scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white sm:bg-gray-50 border border-gray-200 sm:border-dashed sm:border-blue-300 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:gap-10 lg:gap-12">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center sm:items-start mb-8 sm:mb-0 sm:w-1/2 lg:w-2/5 shrink-0">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 self-start sm:self-auto">
                  Profile Picture
                </p>

                <div className="relative mb-5">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-orange-500 flex items-center justify-center text-white text-4xl sm:text-[36px] font-extrabold shadow-lg">
                    SG
                  </div>
                  <button className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-9 h-9 sm:w-10 sm:h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white shadow-md transition-colors">
                    <Camera size={16} />
                  </button>
                </div>

                <button className="w-full max-w-xs flex items-center justify-center gap-2 border border-gray-300 rounded-xl py-3 px-4 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors bg-white">
                  <Upload size={15} />
                  Upload New Photo
                </button>

                <p className="text-center text-[11px] text-gray-400 mt-2.5">
                  JPG, PNG or GIF • Max 15MB
                </p>
              </div>

              {/* Basic Information */}
              <div className="flex-1">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Basic Information
                </p>

                <div className="flex flex-col gap-5 sm:gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 sm:py-2.5 text-[14px] sm:text-[13px] text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">
                      Username
                    </label>
                    <div className="relative">
                      <AtSign
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 sm:py-2.5 text-[14px] sm:text-[13px] text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition"
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 sm:py-2.5 text-[14px] sm:text-[13px] text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Extra bottom spacing on mobile */}
          <div className="h-12 sm:hidden" />
        </div>
      </div>
    </div>
  );
}