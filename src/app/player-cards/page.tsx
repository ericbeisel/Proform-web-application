"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  Heart,
  Camera,
  CheckCircle,
  MapPin,
  Award,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getPlayerCard, createPlayerCard } from "@/api/player-card/route"; // Import the axios-based function
import { useToast } from "@/components/ui/toast-provider";

interface PlayerCardData {
  date: string;
  name: string;
  currentWeight: string;
  bodyCampScore: number;
  height: string;
  smm: number;
  bodyFat: string;
}

export default function PlayerCardPage() {
  const router = useRouter();
  const toast = useToast();
  const [showBodyScanModal, setShowBodyScanModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const progressFileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progressFile, setProgressFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null,
  );
  const [progressFilePreview, setProgressFilePreview] = useState<string | null>(
    null,
  );
  const [playerData, setPlayerData] = useState<PlayerCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlayerCardData = useCallback(
    async (showSuccessToast: boolean) => {
      try {
        setLoading(true);
        console.log("1️⃣ Fetching player card...");

        const data = await getPlayerCard();

        console.log("2️⃣ Data received:", data);
        setPlayerData(data);
        setError("");
        if (showSuccessToast) {
          toast.success("Player card data loaded successfully.");
        }
        return data;
      } catch (err: unknown) {
        console.error("❌ Error:", err);
        const message =
          err instanceof Error ? err.message : "Failed to load data";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void fetchPlayerCardData(true);
  }, [fetchPlayerCardData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleProgressFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgressFile(e.target.files?.[0] ?? null);
  };

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setSelectedFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!progressFile) {
      setProgressFilePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(progressFile);
    setProgressFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [progressFile]);

  const hasChanges = !!selectedFile || !!progressFile;

  const handleSubmitCard = async () => {
    if (!hasChanges) return;

    try {
      setLoading(true);

      const formData = new FormData();

      if (selectedFile) {
        formData.append("inBodyScans", selectedFile);
      }
      if (progressFile) {
        formData.append("progressImage", progressFile);
      }

      // DIRECT FUNCTION CALL - NOT fetch or axios to /api/player-card
      const result = await createPlayerCard(formData);

      console.log("✅ Update successful:", result);
      toast.success("Player card submitted successfully.");

      // Reset files
      setSelectedFile(null);
      setProgressFile(null);
      if (fileRef.current) fileRef.current.value = "";
      if (progressFileRef.current) progressFileRef.current.value = "";

      // Refresh data - DIRECT FUNCTION CALL AGAIN
      await fetchPlayerCardData(true);
    } catch (error: unknown) {
      console.error("❌ Update error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update card";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && !playerData) {
    return (
      <main className="min-h-screen bg-[#eef1f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading your player card...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (error && !playerData) {
    return (
      <main className="min-h-screen bg-[#eef1f5] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const data = playerData || {
    date: "N/A",
    name: "User",
    currentWeight: "0",
    bodyCampScore: 0,
    height: "0",
    smm: 0,
    bodyFat: "0",
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-6 md:px-8 md:py-8 lg:px-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50"
          >
            <ArrowLeft
              size={20}
              className="text-gray-600 group-hover:text-gray-900"
            />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#333333] text-white shadow-lg shadow-black/10">
              <Award size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
                Player Card
              </h1>
              <p className="text-sm font-medium text-gray-400">
                Track your fitness progress
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push("/player-progress")}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#7c3aed] bg-white px-6 py-2.5 text-base font-bold text-[#7c3aed] transition-all hover:bg-[#7c3aed]/5"
        >
          <Activity size={20} />
          View Player Progress
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: BODY IMAGE */}
          <div className="lg:col-span-4 bg-white rounded-[32px] p-6 shadow-xl shadow-gray-200/50 flex flex-col h-[750px] border border-gray-100">
            <div className="flex-1 relative rounded-[24px] overflow-hidden bg-[#16181b] border border-gray-800">
              {/* Grid background pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(#4b5563 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <img
                  src="/images/svg.png"
                  alt="Human Asset"
                  className="h-full object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                />
              </div>
            </div>
            <button
              onClick={() => setShowProgressModal(true)}
              className="mt-6 text-center text-[#7c3aed] text-base font-bold hover:underline underline-offset-4"
            >
              Uplaod Progress Photo
            </button>
          </div>

          {/* RIGHT COLUMN: CARDS */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* PROFILE INFO CARD */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-[32px] font-bold text-[#1a1a1a] leading-tight mb-2">
                    {data.name}
                  </h2>
                  <p className="text-lg text-gray-400 font-medium">
                    Scan Date: {data.date}
                  </p>
                </div>
                <div className="bg-[#00d1e0] text-white px-6 py-1.5 rounded-full text-sm font-black tracking-widest">
                  ACTIVE
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setShowBodyScanModal(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#6d28d9] py-4 text-xl font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-[#5b21b6]"
                >
                  <Upload size={24} />
                  Upload Body Scan
                </button>
                <button className="flex items-center justify-center gap-2 text-[#00a3b8] font-bold text-base hover:text-[#008ba0]">
                  <MapPin size={18} />
                  Find a Body Scan Location
                </button>
              </div>
            </div>

            {/* METRIC GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BASIC METRICS */}
              <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-[#1a1a1a]">
                    Basic Metrics
                  </h3>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                    <Activity size={20} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
                    <span className="text-base font-bold text-gray-400">
                      Current Wt (lbs):
                    </span>
                    <span className="text-[32px] font-black text-[#5b21b6]">
                      {data.currentWeight}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-gray-400">
                      Height (inches):
                    </span>
                    <span className="text-[32px] font-black text-[#5b21b6]">
                      {data.height}
                    </span>
                  </div>
                </div>
              </div>

              {/* BODY COMPOSITION */}
              <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-[#1a1a1a]">
                    Body Composition
                  </h3>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-500">
                    <Activity size={20} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
                    <span className="text-base font-bold text-gray-400">
                      SMM (lbs):
                    </span>
                    <span className="text-[32px] font-black text-gray-300">
                      {data.smm}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-gray-400">
                      Body Fat (%):
                    </span>
                    <span className="text-[32px] font-black text-gray-300">
                      {data.bodyFat}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* COMPOSITION SCORE */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">
                    Composition Score
                  </h3>
                  <p className="text-lg font-medium text-gray-400">
                    Overall fitness rating
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-purple-50 text-purple-600">
                  <Award size={32} />
                </div>
              </div>
              <div className="mt-8">
                <span className="text-[120px] font-black text-gray-200 leading-none">
                  {data.bodyCampScore}
                </span>
              </div>
            </div>

            {/* ALERT BANNER */}
            <div className="bg-[#fff1ed] rounded-2xl p-4 border-l-4 border-[#ff7043] flex items-center justify-center gap-3">
              <div className="text-[#ff7043]">
                <CheckCircle size={20} />
              </div>
              <p className="text-base font-bold text-[#ff7043]">
                Upload a body scan to submit a complete card and unlock all
                metrics!
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmitCard}
              disabled={loading || !hasChanges}
              className={`w-full py-5 rounded-[24px] text-xl font-bold shadow-lg transition-all ${
                hasChanges
                  ? "bg-[#6d28d9] text-white hover:bg-[#5b21b6] cursor-pointer"
                  : "bg-[#dadddf] text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading
                ? "Submitting..."
                : hasChanges
                  ? "Submit Card"
                  : "Submit Card (Scan Required)"}
            </button>
          </div>
        </div>
      </div>

      {/* BODY SCAN MODAL */}
      {showBodyScanModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#1a1c1e]/40 backdrop-blur-md p-4 z-50 transition-all duration-300">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-[480px] relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] border border-white/20 transform animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowBodyScanModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="text-center mb-0">
              <p className="text-gray-400 text-sm font-bold mb-0.5">
                Add a new
              </p>
              <h2 className="text-3xl font-black text-[#1a1c1e] leading-none mb-3 relative inline-block">
                Inbody Scan
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#6d28d9] rounded-full" />
              </h2>
            </div>

            <div className="flex justify-center mb-6 pt-2">
              <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#6d28d9] via-[#7c3aed] to-[#00d1e0] text-white shadow-xl shadow-purple-500/30 transform -rotate-6">
                <Heart size={32} fill="currentColor" strokeWidth={0} />
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 mb-6" />

            <div
              onClick={() => fileRef.current?.click()}
              className="group border-2 border-dashed border-gray-200 rounded-[24px] p-6 text-center cursor-pointer hover:border-[#6d28d9] hover:bg-purple-50/30 transition-all duration-300"
            >
              {selectedFilePreview ? (
                <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <img
                    src={selectedFilePreview}
                    alt="Selected body scan"
                    className="h-48 w-full object-contain"
                  />
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-100 transition-colors">
                    <Upload
                      className="text-[#6d28d9]"
                      size={24}
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="text-lg font-bold text-[#1a1c1e] mb-1">
                    Upload Image
                  </p>
                  <p className="text-gray-400 text-xs font-medium mb-0.5">
                    or drag and drop
                  </p>
                  <p className="text-gray-300 text-[10px] font-medium">
                    Max File Size 15MB
                  </p>
                </>
              )}
              {selectedFile && (
                <p className="mt-3 text-xs font-semibold text-[#6d28d9]">
                  {selectedFile.name}
                </p>
              )}
              <input
                type="file"
                ref={fileRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <button
                disabled={!selectedFile}
                onClick={() => {
                  if (!selectedFile) return;
                  setShowBodyScanModal(false);
                  toast.success("Body scan saved. Tap Submit Card to upload.");
                }}
                className={`w-full py-4 rounded-[18px] text-lg font-black shadow-lg transition-all duration-300 ${
                  selectedFile
                    ? "bg-[#6d28d9] text-white hover:bg-[#5b21b6] shadow-purple-500/25 active:scale-[0.98]"
                    : "bg-[#dadddf] text-gray-500 cursor-not-allowed"
                }`}
              >
                {selectedFile ? "Save Scan" : "Select a File First"}
              </button>

              <button
                onClick={() => setShowBodyScanModal(false)}
                className="text-[#00d1e0] text-lg font-black hover:opacity-80 transition-opacity"
              >
                Close
              </button>
            </div>

            <div className="mt-6 bg-[#f0f0ff] rounded-xl p-3 border border-purple-100/50">
              <p className="text-xs font-bold text-gray-600 flex items-center justify-center gap-2">
                <span className="text-sm">💡</span>
                <span className="text-gray-400 font-medium">Tip:</span>
                <span className="text-purple-600/80">
                  Clear photos of scan results for best accuracy
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PROGRESS PHOTO MODAL */}
      {showProgressModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#1a1c1e]/40 backdrop-blur-md p-4 z-50 transition-all duration-300">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-[480px] relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] border border-white/20 transform animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowProgressModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="text-center mb-0">
              <p className="text-gray-400 text-sm font-bold mb-0.5">
                Add a new
              </p>
              <h2 className="text-3xl font-black text-[#1a1c1e] leading-none mb-3 relative inline-block">
                Progress Photo
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#6d28d9] rounded-full" />
              </h2>
            </div>

            <div className="flex justify-center mb-6 pt-2">
              <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#6d28d9] via-[#7c3aed] to-[#00d1e0] text-white shadow-xl shadow-purple-500/30 transform -rotate-6">
                <Camera size={32} fill="currentColor" strokeWidth={0} />
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 mb-6" />

            <div
              onClick={() => progressFileRef.current?.click()}
              className="group border-2 border-dashed border-gray-200 rounded-[24px] p-6 text-center cursor-pointer hover:border-[#6d28d9] hover:bg-purple-50/30 transition-all duration-300"
            >
              {progressFilePreview ? (
                <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <img
                    src={progressFilePreview}
                    alt="Selected progress photo"
                    className="h-48 w-full object-contain"
                  />
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-100 transition-colors">
                    <Upload
                      className="text-[#6d28d9]"
                      size={24}
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="text-lg font-bold text-[#1a1c1e] mb-1">
                    Upload Image
                  </p>
                  <p className="text-gray-400 text-xs font-medium mb-0.5">
                    or drag and drop
                  </p>
                  <p className="text-gray-300 text-[10px] font-medium">
                    Max File Size 15MB
                  </p>
                </>
              )}
              {progressFile && (
                <p className="mt-3 text-xs font-semibold text-[#6d28d9]">
                  {progressFile.name}
                </p>
              )}
              <input
                type="file"
                ref={progressFileRef}
                className="hidden"
                onChange={handleProgressFileChange}
                accept="image/*"
              />
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <button
                disabled={!progressFile}
                onClick={() => {
                  if (!progressFile) return;
                  setShowProgressModal(false);
                  toast.success("Progress photo saved. Tap Submit Card to upload.");
                }}
                className={`w-full py-4 rounded-[18px] text-lg font-black shadow-lg transition-all duration-300 ${
                  progressFile
                    ? "bg-[#6d28d9] text-white hover:bg-[#5b21b6] shadow-purple-500/25 active:scale-[0.98]"
                    : "bg-[#dadddf] text-gray-500 cursor-not-allowed"
                }`}
              >
                {progressFile ? "Save Photo" : "Select a File First"}
              </button>

              <button
                onClick={() => setShowProgressModal(false)}
                className="text-[#00d1e0] text-lg font-black hover:opacity-80 transition-opacity"
              >
                Close
              </button>
            </div>

            <div className="mt-6 bg-[#e6f9fb] rounded-xl p-3 border border-cyan-100/50">
              <p className="text-xs font-bold text-gray-600 flex items-center justify-center gap-2">
                <span className="text-sm">💡</span>
                <span className="text-gray-400 font-medium">Tip:</span>
                <span className="text-cyan-600/80">
                  Clear photos of physique for best accuracy
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
