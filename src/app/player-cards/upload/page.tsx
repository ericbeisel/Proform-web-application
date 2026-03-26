// app/player-cards/upload/page.tsx
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
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getPlayerCard,
  createPlayerCard,
  getPlayerCardTypes,
  PlayerCardData,
  PlayerCardType,
} from "@/api/player-card/route";
import { dashboardApi } from "@/api/dashboard/route";
import { useToast } from "@/components/ui/toast-provider";

// Extend the PlayerCardData type to include inBodyScanUrl
interface ExtendedPlayerCardData extends PlayerCardData {
  inBodyScanUrl?: string | null;
  progressImage?: string | null;
}

// ✅ Small inline spinner shown in place of a metric value
const ValueLoader = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
);

// Accountability Tools Item Type
interface AccountabilityTool {
  id: string;
  title: string;
  file: File | null;
  preview: string | null;
  isExpanded: boolean;
  allowUpload: boolean; // New flag to control upload visibility
}

export default function PlayerCardUploadPage() {
  const router = useRouter();
  const toast = useToast();
  const [showBodyScanModal, setShowBodyScanModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null,
  );
  const [playerData, setPlayerData] = useState<ExtendedPlayerCardData | null>(
    null,
  );
  const [cardTypes, setCardTypes] = useState<PlayerCardType[]>([]);
  const [selectedCardType, setSelectedCardType] = useState<string>("");
  const [measurementUnit, setMeasurementUnit] = useState<string>("kg");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [error, setError] = useState("");

  // Accountability Tools State - Only first one allows upload
  const [accountabilityTools, setAccountabilityTools] = useState<AccountabilityTool[]>([
    { id: "progress-photo", title: "Progress Photo", file: null, preview: null, isExpanded: false, allowUpload: true },
    { id: "blood-pressure", title: "Blood Pressure Test", file: null, preview: null, isExpanded: false, allowUpload: false },
    { id: "breathing", title: "Breathing Test", file: null, preview: null, isExpanded: false, allowUpload: false },
    { id: "hydration", title: "Hydration Test (Urine Test)", file: null, preview: null, isExpanded: false, allowUpload: false },
    { id: "bloodwork", title: "Bloodwork (Hormone) Results", file: null, preview: null, isExpanded: false, allowUpload: false },
  ]);

//   const convertHeightToInches = (heightStr: string | number | null): number => {
//     if (!heightStr) return 0;
//     return Number(heightStr) * 12;
//   };

useEffect(() => {
  // Format the current date/time
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  setCurrentDateTime(`${formattedDate} ${formattedTime}`);
}, []);

  const fetchAllData = useCallback(
    async (showSuccessToast: boolean) => {
      try {
        setLoading(true);

        const [playerCardResult, dashboardResult, cardTypesResult] =
          await Promise.allSettled([
            getPlayerCard(),
            dashboardApi.getDashboardSummary(),
            getPlayerCardTypes(),
          ]);

        console.log("📊 Data fetch results:", {
          playerCardResult,
          dashboardResult,
          cardTypesResult,
        });

        if (playerCardResult.status === "fulfilled") {
              const playerDataValue = playerCardResult.value as ExtendedPlayerCardData;
        console.log("🔍 RAW Player Card Data Received:", {
          height: playerDataValue.height,
          heightType: typeof playerDataValue.height,
          rawHeight: playerDataValue.height,
          currentWeight: playerDataValue.currentWeight,
          smm: playerDataValue.smm,
          bodyFat: playerDataValue.bodyFat,
          fullData: playerDataValue
        });
          setPlayerData(playerCardResult.value as ExtendedPlayerCardData);
        } else {
          console.error(
            "Failed to fetch player card:",
            playerCardResult.reason,
          );
        }

        if (dashboardResult.status === "fulfilled") {
          const dashboardData = dashboardResult.value;
          if (dashboardData.measurementUnit) {
            setMeasurementUnit(dashboardData.measurementUnit);
          }
        } else {
          console.error("Failed to fetch dashboard:", dashboardResult.reason);
        }

        if (cardTypesResult.status === "fulfilled") {
          const typesData = cardTypesResult.value as PlayerCardType[];
          console.log("📋 Processed card types:", typesData);
          setCardTypes(typesData);
        } else {
          console.error("Failed to fetch card types:", cardTypesResult.reason);
        }

        setError("");
        if (showSuccessToast) {
          toast.success("Player card data loaded successfully.");
        }
      } catch (err: unknown) {
        console.error("❌ Error:", err);
        const message =
          err instanceof Error ? err.message : "Failed to load data";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void fetchAllData(true);
  }, [fetchAllData]);

  // Handle card type selection from dropdown
  const handleCardTypeSelect = (typeId: string) => {
    setSelectedCardType(typeId);
    const selectedType = cardTypes.find(
      (type) => type.id.toString() === typeId,
    );

    if (selectedType) {
      console.log("Selected card type:", selectedType);
      toast.success(`Selected: ${selectedType.name}`);
    }
  };

  // Handle file change for body scan
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) setMetricsLoading(true);
  };

  // Handle file change for progress photo (only first tool)
  const handleProgressPhotoChange = (file: File | null) => {
    setAccountabilityTools((prev) =>
      prev.map((tool) => {
        if (tool.id === "progress-photo") {
          const preview = file ? URL.createObjectURL(file) : null;
          return { ...tool, file, preview, isExpanded: false };
        }
        return tool;
      })
    );
  };

  // Toggle tool expansion
  const toggleToolExpansion = (toolId: string) => {
    setAccountabilityTools((prev) =>
      prev.map((tool) => ({
        ...tool,
        isExpanded: tool.id === toolId ? !tool.isExpanded : false,
      }))
    );
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

  const hasChanges = !!selectedFile;
  const hasBodyScan = !!(playerData?.inBodyScanUrl || selectedFilePreview);
  const progressPhoto = accountabilityTools.find(t => t.id === "progress-photo")?.file;

  const handleSubmitCard = async () => {
    if (!selectedFile) {
      toast.error("Please select a scan file first");
      return;
    }

    if (!selectedCardType) {
      toast.error("Please select a scan type");
      return;
    }

    try {
      setSubmitting(true);
      setMetricsLoading(true);

      const formData = new FormData();
      formData.append("inBodyScans", selectedFile);
      formData.append("type", selectedCardType);

      // Add progress photo if exists
      if (progressPhoto) {
        formData.append("progressImage", progressPhoto);
      }

      console.log("📤 Submitting player card payload:");
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const result = await createPlayerCard(formData);
      console.log("✅ Update successful:", result);
      toast.success("Player card submitted successfully.");

      setSelectedFile(null);
      setSelectedCardType("");
      // Reset progress photo
      handleProgressPhotoChange(null);
      if (fileRef.current) fileRef.current.value = "";

      await fetchAllData(true);
      
      // Redirect to progress list after successful submission
      router.push("/player-progress");
    } catch (error: unknown) {
      console.error("❌ Update error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update card";
      toast.error(message);
    } finally {
      setSubmitting(false);
      setMetricsLoading(false);
    }
  };

  if (loading && !playerData) {
    return (
      <main className="min-h-screen bg-[#eef1f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading your player card...</p>
        </div>
      </main>
    );
  }

  if (error && !playerData) {
    return (
      <main className="min-h-screen bg-[#eef1f5] flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-2xl shadow">
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-5 py-1.5 rounded-xl text-sm hover:bg-purple-700"
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
    currentWeight: 0,
    bodyCampScore: 0,
    height: 0,
    smm: 0,
    bodyFat: 0,
    inBodyScanUrl: null,
  };

  console.log("🎨 Rendering with data:", {
  height: data.height,
  heightType: typeof data.height,
  rawHeight: data.height,
  currentWeight: data.currentWeight,
  Date: data.date,
});

  const frontendCompositionScore =
    data.smm && data.currentWeight && data.bodyFat
      ? (
          Number(data.smm) -
          (Number(data.currentWeight) * Number(data.bodyFat)) / 100
        ).toFixed(1)
      : null;

//   const displayScore = frontendCompositionScore ?? data.bodyCampScore ?? "—";
const displayScore = data.bodyCampScore ?? "—";
//   const heightInInches = convertHeightToInches(data.height);
  const weightUnit = measurementUnit;

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-3 py-4 md:px-5 md:py-5 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="group flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50"
          >
            <ArrowLeft
              size={16}
              className="text-gray-600 group-hover:text-gray-900"
            />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#333333] text-white shadow-lg shadow-black/10">
              <Award size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight">
                Player Card
              </h1>
              <p className="text-xs font-medium text-gray-400">
                Track your fitness progress
              </p>
            </div>
          </div>
        </div>
      <button
  onClick={() => router.push("/player-progress")}
  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#7c3aed] bg-white px-4 py-1.5 text-sm font-bold text-[#7c3aed] transition-all hover:bg-[#7c3aed]/5"
>
  <Activity size={16} />
  View Player Progress
</button>
      </div>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN - ACCOUNTABILITY TOOLS */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Accountability Tools</h2>
              <p className="text-xs text-gray-400 mt-1">
                Track your health metrics and progress
              </p>
            </div>

            <div className="space-y-3">
              {accountabilityTools.map((tool) => (
                <div
                  key={tool.id}
                  className="border border-gray-100 rounded-xl overflow-hidden"
                >
                  {/* Tool Header */}
                  <button
                    onClick={() => toggleToolExpansion(tool.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {tool.title}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${
                        tool.isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Expanded Content */}
                  {tool.isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      {tool.allowUpload ? (
                        // Only Progress Photo shows upload option
                        <div
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleProgressPhotoChange(file);
                            };
                            input.click();
                          }}
                          className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-purple-300 transition-all"
                        >
                          {tool.preview ? (
                            <div className="space-y-2">
                              <img
                                src={tool.preview}
                                alt={tool.title}
                                className="h-24 w-full object-contain rounded-lg"
                              />
                              <p className="text-xs text-purple-600 truncate">
                                {tool.file?.name}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProgressPhotoChange(null);
                                }}
                                className="text-xs text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-center mb-2">
                                <img
                                  src="/images/svg.png"
                                  alt="Upload"
                                  className="h-12 w-auto object-contain opacity-50"
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                Click to upload photo
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        // Other tools show informational message
                        <div className="text-center py-6">
                          <div className="flex justify-center mb-2">
                            <img
                              src="/images/svg.png"
                              alt="Info"
                              className="h-12 w-auto object-contain opacity-30"
                            />
                          </div>
                        
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN - REST OF THE PAGE */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* PROFILE INFO CARD */}
            <div className="bg-white rounded-2xl p-5 shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1a1a1a] leading-tight mb-1">
                    {data.name}
                  </h2>
               <p className="text-sm text-gray-400 font-medium">
  Scan Date: {currentDateTime || "Today"}
</p>
                </div>
                <div className="bg-[#00d1e0] text-white px-3 py-0.5 rounded-full text-xs font-black tracking-widest">
                  ACTIVE
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowBodyScanModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6d28d9] py-3 text-base font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-[#5b21b6]"
                >
                  <Upload size={18} />
                  {hasBodyScan ? "Update Body Scan" : "Upload Body Scan"}
                </button>
                <button className="flex items-center justify-center gap-1 text-[#00a3b8] text-xs font-bold hover:text-[#008ba0]">
                  <MapPin size={14} />
                  Find a Body Scan Location
                </button>
              </div>
            </div>

            {/* METRIC GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BASIC METRICS */}
              <div className="bg-white rounded-2xl p-5 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#1a1a1a]">
                    Basic Metrics
                  </h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Activity size={16} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-400">
                      Current Wt ({weightUnit}):
                    </span>
                    {metricsLoading ? (
                      <ValueLoader />
                    ) : (
                      <span className="text-xl font-black text-[#5b21b6]">
                        {data.currentWeight}
                      </span>
                    )}
                  </div>
                <div className="flex items-center justify-between">
  <span className="text-xs font-bold text-gray-400">
    Height:
  </span>
  {metricsLoading ? (
    <ValueLoader />
  ) : (
    <span className="text-xl font-black text-[#5b21b6]">
      {data.height} {/* Display raw height value */}
    </span>
  )}
</div>
                </div>
              </div>

              {/* BODY COMPOSITION */}
              <div className="bg-white rounded-2xl p-5 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#1a1a1a]">
                    Body Composition
                  </h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-500">
                    <Activity size={16} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-400">
                      SMM ({weightUnit}):
                    </span>
                    {metricsLoading ? (
                      <ValueLoader />
                    ) : (
                      <span className="text-xl font-black text-gray-300">
                        {data.smm}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">
                      Body Fat (%):
                    </span>
                    {metricsLoading ? (
                      <ValueLoader />
                    ) : (
                      <span className="text-xl font-black text-[#5b21b6]">
                        {data.bodyFat}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* COMPOSITION SCORE */}
            <div className="bg-white rounded-2xl p-5 shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-1">
                    Composition Score
                  </h3>
                  <p className="text-xs font-medium text-gray-400">
                    Overall fitness rating
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Award size={20} />
                </div>
              </div>
              <div className="mt-3">
                {metricsLoading ? (
                  <ValueLoader />
                ) : (
                  <span className="text-5xl font-black text-gray-200 leading-none">
                    {displayScore}
                  </span>
                )}
              </div>
            </div>

            {/* ALERT BANNER */}
            {!hasBodyScan && (
              <div className="bg-[#fff1ed] rounded-xl p-3 border-l-4 border-[#ff7043] flex items-center justify-center gap-2">
                <div className="text-[#ff7043]">
                  <CheckCircle size={16} />
                </div>
                <p className="text-xs font-bold text-[#ff7043]">
                  Upload a body scan to submit a complete card
                </p>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmitCard}
              disabled={submitting || (!hasChanges && !hasBodyScan)}
              className={`w-full py-3 rounded-xl text-base font-bold shadow-lg transition-all ${
                submitting
                  ? "bg-gray-400 text-white cursor-wait"
                  : hasChanges
                    ? "bg-[#6d28d9] text-white hover:bg-[#5b21b6] cursor-pointer"
                    : hasBodyScan
                      ? "bg-gray-400 text-white cursor-not-allowed opacity-50"
                      : "bg-[#dadddf] text-gray-500 cursor-not-allowed"
              }`}
            >
              {submitting
                ? "Submitting..."
                : hasChanges
                  ? "Submit Card"
                  : hasBodyScan
                    ? "No Changes to Submit"
                    : "Submit Card (Scan Required)"}
            </button>
          </div>
        </div>
      </div>

      {/* BODY SCAN MODAL */}
      {showBodyScanModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#1a1c1e]/40 backdrop-blur-md p-4 z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl p-5 w-full max-w-[400px] relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] border border-white/20 transform animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => {
                setShowBodyScanModal(false);
                setSelectedCardType("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>

            <div className="text-center mb-0">
              <p className="text-gray-400 text-xs font-bold mb-0.5">
                Add a new
              </p>
              <h2 className="text-2xl font-black text-[#1a1c1e] leading-none mb-2 relative inline-block">
                Inbody Scan
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#6d28d9] rounded-full" />
              </h2>
            </div>

            <div className="flex justify-center mb-4 pt-1">
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#6d28d9] via-[#7c3aed] to-[#00d1e0] text-white shadow-xl shadow-purple-500/30 transform -rotate-6">
                <Heart size={24} fill="currentColor" strokeWidth={0} />
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 mb-4" />

            {cardTypes.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Select Scan Type
                </label>
                <div className="relative">
                  <select
                    value={selectedCardType}
                    onChange={(e) => handleCardTypeSelect(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6d28d9] appearance-none cursor-pointer text-sm"
                  >
                    <option value="">Select a scan type</option>
                    {cardTypes.map((type) => (
                      <option key={type.id} value={type.id.toString()}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            <div
              onClick={() => fileRef.current?.click()}
              className="group border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#6d28d9] hover:bg-purple-50/30 transition-all duration-300"
            >
              {selectedFilePreview ? (
                <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img
                    src={selectedFilePreview}
                    alt="Selected body scan"
                    className="h-32 w-full object-contain"
                  />
                </div>
              ) : playerData?.inBodyScanUrl ? (
                <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img
                    src={playerData.inBodyScanUrl}
                    alt="Current body scan"
                    className="h-32 w-full object-contain"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current scan</p>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-100 transition-colors">
                    <Upload
                      className="text-[#6d28d9]"
                      size={18}
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="text-base font-bold text-[#1a1c1e] mb-1">
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
                <p className="mt-2 text-xs font-semibold text-[#6d28d9] truncate">
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

            <div className="flex flex-col gap-3 mt-4">
              <button
                disabled={!selectedFile || !selectedCardType}
                onClick={() => {
                  if (!selectedFile || !selectedCardType) {
                    toast.error("Please select both a scan file and type");
                    return;
                  }
                  setShowBodyScanModal(false);
                  toast.success("Body scan saved. Tap Submit Card to upload.");
                }}
                className={`w-full py-3 rounded-xl text-base font-bold shadow-lg transition-all duration-300 ${
                  selectedFile && selectedCardType
                    ? "bg-[#6d28d9] text-white hover:bg-[#5b21b6] shadow-purple-500/25 active:scale-[0.98]"
                    : "bg-[#dadddf] text-gray-500 cursor-not-allowed"
                }`}
              >
                {selectedFile && selectedCardType ? "Save Scan" : "Select a File First"}
              </button>
              <button
                onClick={() => {
                  setShowBodyScanModal(false);
                  setSelectedCardType("");
                }}
                className="text-[#00d1e0] text-sm font-bold hover:opacity-80 transition-opacity"
              >
                Close
              </button>
            </div>

            <div className="mt-4 bg-[#f0f0ff] rounded-lg p-2 border border-purple-100/50">
              <p className="text-xs font-bold text-gray-600 flex items-center justify-center gap-1">
                <span className="text-xs">💡</span>
                <span className="text-gray-400 font-medium">Tip:</span>
                <span className="text-purple-600/80 text-[10px]">
                  Clear photos of scan results for best accuracy
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}