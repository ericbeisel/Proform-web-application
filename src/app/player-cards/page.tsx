'use client';
import { useState, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  X,
  Heart,
  Camera,
  User,
  CheckCircle,
  MapPin,
  Search,
  Weight,
  Ruler,
  Dumbbell,
  Percent,
  Award,
  Activity,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PlayerCardPage() {
  const router = useRouter();
  const [showBodyScanModal, setShowBodyScanModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const progressFileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progressFile, setProgressFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleProgressFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgressFile(e.target.files?.[0] ?? null);
  };

  return (
    <main className="min-h-screen bg-[#eef1f5] px-6 py-6 md:p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-full bg-white shadow-sm hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
              <User size={18} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Player Card</h1>
              <p className="text-gray-500 text-xs md:text-sm">
                Track your fitness progress
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/player-progress')}
          className="flex items-center gap-1.5 border border-purple-600 text-purple-600 px-4 py-1.5 md:px-5 md:py-2 rounded-xl font-semibold text-sm md:text-base hover:bg-purple-50 transition"
        >
          <Activity size={16} />
          View Progress
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BODY IMAGE / PROGRESS PHOTO CARD */}
        <div className="bg-white rounded-2xl p-5 shadow flex flex-col items-center lg:col-span-1">
          <div className="w-full aspect-[4/5] max-h-[420px] bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center relative overflow-hidden">
            <span className="text-cyan-400 text-base md:text-lg font-medium z-10">
              Body Scan Preview
            </span>
            {/* Optional subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <button
            onClick={() => setShowProgressModal(true)}
            className="mt-4 flex items-center gap-1.5 text-purple-600 hover:text-purple-800 text-sm underline font-medium transition"
          >
            <Camera size={14} />
            Upload Progress Photo
          </button>
        </div>

        {/* RIGHT SIDE - INFO + METRICS */}
        <div className="lg:col-span-2 space-y-5">
          {/* USER INFO */}
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Shweta Gharge</h2>
                  <p className="text-gray-500 text-xs md:text-sm flex items-center gap-1">
                    Scan Date: 2/3/2026
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 bg-cyan-100 text-cyan-800 text-xs px-3 py-1 rounded-full font-medium">
                <CheckCircle size={14} />
                ACTIVE
              </span>
            </div>

            <button
              onClick={() => setShowBodyScanModal(true)}
              className="w-full bg-gradient-to-r from-purple-700 to-purple-500 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm hover:brightness-105 transition text-sm md:text-base"
            >
              <Upload size={16} />
              Upload Body Scan
            </button>

            <p className="text-blue-600 hover:text-blue-800 text-xs md:text-sm mt-3 text-center flex items-center justify-center gap-1.5 cursor-pointer">
              <MapPin size={14} />
              <Search size={14} />
              Find a Body Scan Location
            </p>
          </div>

          {/* METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Basic Metrics */}
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-semibold mb-3 text-sm md:text-base flex items-center gap-2">
                <Weight size={16} className="text-purple-600" />
                Basic Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600 text-sm flex items-center gap-1.5">
                    <Weight size={14} />
                    Current Wt (lbs)
                  </span>
                  <span className="text-purple-700 font-bold text-lg md:text-xl">67.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm flex items-center gap-1.5">
                    <Ruler size={14} />
                    Height (inches)
                  </span>
                  <span className="text-purple-700 font-bold text-lg md:text-xl">64.00</span>
                </div>
              </div>
            </div>

            {/* Body Composition */}
            <div className="bg-white rounded-2xl p-5 shadow">
              <h3 className="font-semibold mb-3 text-sm md:text-base flex items-center gap-2">
                <Dumbbell size={16} className="text-blue-600" />
                Body Composition
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600 text-sm flex items-center gap-1.5">
                    <Dumbbell size={14} />
                    SMM (lbs)
                  </span>
                  <span className="text-gray-500 font-bold text-lg md:text-xl">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm flex items-center gap-1.5">
                    <Percent size={14} />
                    Body Fat (%)
                  </span>
                  <span className="text-gray-500 font-bold text-lg md:text-xl">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* COMPOSITION SCORE */}
          <div className="bg-white rounded-2xl p-5 shadow text-center">
            <h3 className="font-semibold mb-2 text-sm md:text-base flex items-center justify-center gap-2">
              <Award size={18} className="text-amber-600" />
              Composition Score
            </h3>
            <p className="text-gray-400 text-xs md:text-sm mb-3">
              Overall fitness rating
            </p>
            <div className="text-5xl md:text-6xl font-bold text-gray-300">
              0
            </div>
          </div>
        </div>
      </div>

      {/* BODY SCAN MODAL */}
      {showBodyScanModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[480px] relative shadow-2xl">
            <button
              onClick={() => setShowBodyScanModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-5">
              <p className="text-gray-400 text-sm">Add a new</p>
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Activity size={24} className="text-purple-600" />
                InBody Scan
              </h2>
            </div>
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow">
                <Heart size={22} />
              </div>
            </div>
            <hr className="my-5 border-gray-200" />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition"
            >
              <Upload className="mx-auto text-purple-600 mb-2" size={28} />
              <p className="font-semibold text-gray-800">Upload Scan Image</p>
              <p className="text-gray-400 text-sm mt-1">or drag and drop</p>
              <input
                type="file"
                ref={fileRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <button
              disabled={!selectedFile}
              className={`w-full mt-5 py-2.5 rounded-xl font-semibold text-sm md:text-base transition ${
                selectedFile
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Upload Scan
            </button>
          </div>
        </div>
      )}

      {/* PROGRESS PHOTO MODAL */}
      {showProgressModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[480px] relative shadow-2xl">
            <button
              onClick={() => setShowProgressModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-5">
              <p className="text-gray-400 text-sm">Add a new</p>
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Camera size={24} className="text-purple-600" />
                Progress Photo
              </h2>
            </div>
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow">
                <Camera size={22} />
              </div>
            </div>
            <hr className="my-5 border-gray-200" />
            <div
              onClick={() => progressFileRef.current?.click()}
              className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition"
            >
              <Camera className="mx-auto text-purple-600 mb-2" size={28} />
              <p className="font-semibold text-gray-800">Upload Progress Photo</p>
              <input
                type="file"
                ref={progressFileRef}
                className="hidden"
                onChange={handleProgressFileChange}
                accept="image/*"
              />
            </div>
            <button
              disabled={!progressFile}
              className={`w-full mt-5 py-2.5 rounded-xl font-semibold text-sm md:text-base transition ${
                progressFile
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Upload Photo
            </button>
          </div>
        </div>
      )}
    </main>
  );
}