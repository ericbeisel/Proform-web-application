"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Zap,
  Target,
  Award,
  TrendingUp as TrendingUpIcon,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import {
  acceptAdminPlayerCard,
  getAdminPlayerCardById,
  PlayerCardDetail,
  rejectAdminPlayerCard,
} from "@/api/player-card/route";

type ToastType = "success" | "error";

type MetricsState = {
  currentWeight: string;
  height: string;
  smm: string;
  bodyFat: string;
  bodyCampScore: string;
};

type DiffState = {
  weight_diff: string;
  height_diff: string;
  smm_diff: string;
  bf_diff: string;
  body_camp_diff: string;
};

interface AccountabilityTool {
  id: string;
  title: string;
  preview: string | null;
  isExpanded: boolean;
  uploadedUrl?: string | null;
}

function initialMetrics(cardData?: PlayerCardDetail | null): MetricsState {
  return {
    currentWeight: (cardData?.currentWeight ?? "0").toString(),
    height: (cardData?.height ?? "0").toString(),
    smm: (cardData?.smm ?? "0").toString(),
    bodyFat: (cardData?.bodyFat ?? "0").toString(),
    bodyCampScore: (cardData?.bodyCampScore ?? "0").toString(),
  };
}

function initialDiffs(cardData?: any | null): DiffState {
  return {
    weight_diff: (cardData?.currentWeightDiff ?? cardData?.weight_diff ?? cardData?.current_weight_diff ?? "0")?.toString() || "0",
    height_diff: (cardData?.heightDiff ?? cardData?.height_diff ?? "0")?.toString() || "0",
    smm_diff: (cardData?.smmDiff ?? cardData?.smm_diff ?? "0")?.toString() || "0",
    bf_diff: (cardData?.bodyFatDiff ?? cardData?.bf_diff ?? "0")?.toString() || "0",
    body_camp_diff: (cardData?.bodyCampScoreDiff ?? cardData?.body_camp_diff ?? "0")?.toString() || "0",
  };
}

function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace("https://paxlete.com//", "https://paxlete.com/").replace(/([^:]\/)\/+/g, "$1");
}

/** * Renders a small colored badge showing the diff value.
 * @param reverseColor - If true, positive values are Red and negative are Green (Weight/Fat)
 */
function DiffBadge({ value, unit, reverseColor = false }: { value: string; unit: string; reverseColor?: boolean }) {
  const cleanVal = value.toString().replace(/[^\d.-]/g, "");
  const num = parseFloat(cleanVal);
  
  if (isNaN(num)) return null;

  // Neutral style for 0 change
  if (num === 0) {
    return (
      <span className="ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide shadow-sm border bg-gray-50 text-gray-500 border-gray-200">
        0 {unit && <span className="opacity-70 ml-0.5">{unit}</span>}
      </span>
    );
  }

  const isPositive = num > 0;
  const displayVal = isPositive ? `+${num}` : `${num}`;

  // Logic: 
  // If reverseColor is true: Positive is Red, Negative is Green.
  // If reverseColor is false: Positive is Green, Negative is Red (Standard for SMM/Score).
  const isRed = reverseColor ? isPositive : !isPositive;

  return (
    <span
      className={`ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide shadow-sm border ${
        isRed
          ? "bg-red-50 text-red-500 border-red-200"
          : "bg-emerald-50 text-emerald-600 border-emerald-200"
      }`}
    >
      {displayVal}
      {unit && <span className="opacity-70 ml-0.5">{unit}</span>}
    </span>
  );
}

// function DiffBadge({ value, unit }: { value: string; unit: string }) {
//   const cleanVal = value.toString().replace(/[^\d.-]/g, "");
//   const num = parseFloat(cleanVal);
//   if (isNaN(num)) return null;
//   if (num === 0) {
//     return (
//       <span className="ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide shadow-sm border bg-gray-50 text-gray-500 border-gray-200">
//         0{unit && <span className="opacity-70 ml-0.5">{unit}</span>}
//       </span>
//     );
//   }
//   const isPositive = num > 0;
//   const displayVal = isPositive ? `+${num}` : `${num}`;
//   return (
//     <span className={`ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide shadow-sm border ${isPositive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-500 border-red-200"}`}>
//       {displayVal}{unit && <span className="opacity-70 ml-0.5">{unit}</span>}
//     </span>
//   );
// }

function toastStyles(type: ToastType): string {
  return type === "success" ? "border-[#b7e9d7] bg-[#e8f8f2] text-[#0f7f5c]" : "border-[#f1c8c1] bg-[#fff2f0] text-[#c0392b]";
}

function statusStyles(status: string): string {
  const normalized = (status || "").toLowerCase();
  if (normalized === "complete" || normalized === "approved" || normalized === "accepted") return "bg-[#00daba] text-white";
  if (normalized === "reject" || normalized === "rejected") return "bg-[#ef4444] text-white";
  return "bg-[#9ca3af] text-white";
}

export default function AdminPlayerCardDetail() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  const parsedId = useMemo(() => {
    const value = Array.isArray(id) ? id[0] : id;
    const asNumber = Number.parseInt(value || "", 10);
    return Number.isNaN(asNumber) ? null : asNumber;
  }, [id]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cardData, setCardData] = useState<PlayerCardDetail | null>(null);
  const [metrics, setMetrics] = useState<MetricsState>(initialMetrics());
  const [diffs, setDiffs] = useState<DiffState>(initialDiffs());
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const nameFromUrl = searchParams.get("name");
  

  const [accountabilityTools, setAccountabilityTools] = useState<AccountabilityTool[]>([
    { id: "progress-photo", title: "Progress Photo", preview: null, isExpanded: false, uploadedUrl: null },
    { id: "blood-pressure", title: "Blood Pressure Test", preview: null, isExpanded: false, uploadedUrl: null },
    { id: "breathing", title: "Breathing Test", preview: null, isExpanded: false, uploadedUrl: null },
    { id: "hydration", title: "Hydration Test (Urine Test)", preview: null, isExpanded: false, uploadedUrl: null },
    { id: "bloodwork", title: "Bloodwork (Hormone) Results", preview: null, isExpanded: false, uploadedUrl: null },
  ]);

  
  const toggleToolExpansion = (toolId: string) => {
    setAccountabilityTools((prev) =>
      prev.map((tool) => ({
        ...tool,
        isExpanded: tool.id === toolId ? !tool.isExpanded : false,
      }))
    );
  };

useEffect(() => {
  if (parsedId === null) {
    setLoading(false);
    setToast({ type: "error", message: "Invalid player card id." });
    return;
  }

  const fetchCard = async () => {
    try {
      setLoading(true);
      const data = await getAdminPlayerCardById(parsedId);
      setCardData(data);
      setMetrics(initialMetrics(data));
      setDiffs(initialDiffs(data));
      console.log("Fetched Card Data:", data);
      
      // Map all images to accountability tools
      setAccountabilityTools((prev) =>
        prev.map((tool) => {
          let imageUrl = null;
          
          // Map based on tool ID and the actual field names from API
          switch (tool.id) {
            case "progress-photo":
              imageUrl = data.progressImage || data.progress_image;
              break;
            case "blood-pressure":
              // Check both possible field names
              imageUrl = data.bpPhoto || data.bp_test_image || data.bpImage;
              break;
            case "breathing":
              imageUrl = data.breathingPhoto || data.breathing_test_image || data.breathingImage;
              break;
            case "hydration":
              imageUrl = data.hydrationPhoto || data.hydration_test_image || data.hydrationImage;
              break;
            case "bloodwork":
              imageUrl = data.bloodworkPhoto || data.bloodwork_test_image || data.bloodworkImage;
              break;
            default:
              imageUrl = null;
          }
          
          if (imageUrl) {
            const cleaned = cleanImageUrl(imageUrl);
            return { ...tool, uploadedUrl: cleaned, preview: cleaned };
          }
          return tool;
        })
      );
    } catch (error: unknown) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load player card details.",
      });
    } finally {
      setLoading(false);
    }
  };

  void fetchCard();
}, [parsedId]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const safe = value.replace(/[^\d.]/g, "");
    setMetrics((prev) => ({ ...prev, [name]: safe }));
  };

  const handleAccept = async () => {
  if (parsedId === null) return;
  
  // Convert strings to numbers
  const currentWeightNum = parseFloat(metrics.currentWeight);
  const heightNum = parseFloat(metrics.height);
  const smmNum = parseFloat(metrics.smm);
  const bodyFatNum = parseFloat(metrics.bodyFat);
  const bodyCampScoreNum = parseFloat(metrics.bodyCampScore);

  // Validate
  if (isNaN(currentWeightNum) || isNaN(heightNum) || isNaN(smmNum) || isNaN(bodyFatNum) || isNaN(bodyCampScoreNum)) {
    setToast({ type: "error", message: "All fields must contain valid numbers." });
    return;
  }

  try {
    setSubmitting(true);
    await acceptAdminPlayerCard({
      id: parsedId,
      currentWeight: currentWeightNum,
      height: heightNum,
      smm: smmNum,
      bodyFat: bodyFatNum,
      bodyCampScore: bodyCampScoreNum,
    });
    setToast({ type: "success", message: "Card approved successfully." });
    router.push("/admin-player-card-status");
  } catch (error: unknown) {
    setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to approve card." });
  } finally {
    setSubmitting(false);
  }
};

  const handleReject = async () => {
    if (parsedId === null) return;
    if (!rejectComment.trim()) {
      setToast({ type: "error", message: "Rejection comment is required." });
      return;
    }
    try {
      setSubmitting(true);
      await rejectAdminPlayerCard({ id: parsedId, reject_comment: rejectComment.trim() });
      setShowRejectModal(false);
      setRejectComment("");
      setToast({ type: "success", message: "Card rejected successfully." });
      router.push("/admin-player-cards");
    } catch (error: unknown) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to reject card." });
    } finally {
      setSubmitting(false);
    }
  };

  const scanDate = cardData?.date ? cardData.date.split(" ")[0] : "N/A";
const playerName = nameFromUrl || cardData?.name || `User #${cardData?.user_id || ""}`;  const statusText = cardData?.status || "Pending";

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-6 md:p-10 font-sans">
      {toast && (
        <div className="fixed right-4 top-4 z-50 w-full max-w-sm">
          <div className={`rounded-lg border px-4 py-3 text-sm font-semibold shadow ${toastStyles(toast.type)}`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-all border border-gray-100">
            <ArrowLeft size={20} className="text-gray-700" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#333] text-white flex items-center justify-center shadow-lg border-2 border-white">
              <Award size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1c1e] tracking-tight">{playerName}</h1>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{cardData?.date || 'N/A'}</p>
            </div>
          </div>
        </div>

        <button onClick={() => router.push("/admin-player-progress")} className="flex items-center gap-2 bg-[#f8f9fc] border-2 border-[#6d28d9] text-[#6d28d9] px-6 py-2.5 rounded-2xl text-xs font-bold hover:bg-purple-50 transition-all shadow-sm uppercase tracking-wider">
          <BarChart3 size={16} />
          View Player Progress
        </button>
      </div>

      {loading ? (
        <div className="max-w-[1400px] mx-auto rounded-2xl bg-white p-8 text-center text-sm font-semibold text-gray-500">Loading player card...</div>
      ) : (
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - ACCOUNTABILITY TOOLS */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">Accountability Tools</h2>
                <p className="text-xs text-gray-400 mt-1">Review player health metrics and progress</p>
              </div>

              <div className="space-y-3">
                {accountabilityTools.map((tool) => (
                  <div key={tool.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                    <button onClick={() => toggleToolExpansion(tool.id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-bold text-gray-900">{tool.title}</span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${tool.isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {tool.isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                        <div className="text-center">
                          {(tool.preview || tool.uploadedUrl) ? (
                            <div className="space-y-3">
                              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                <img src={tool.preview || tool.uploadedUrl || ""} alt={tool.title} className="h-48 w-full object-contain" />
                              </div>
                              <button onClick={() => window.open(tool.uploadedUrl!, '_blank')} className="text-xs text-[#6d28d9] font-bold uppercase tracking-wider hover:underline">
                                View Full Size
                              </button>
                            </div>
                          ) : (
                            <div className="py-4">
                              <div className="flex justify-center mb-2 opacity-20">
                                <ImageIcon size={32} />
                              </div>
                              <p className="text-xs text-gray-400 font-medium tracking-wide">No {tool.title.toLowerCase()} uploaded</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN - BODY SCAN */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#1a1c1e]">Body Scan Photo</h3>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Scan Date: {scanDate}</p>
                </div>
                <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${statusStyles(statusText)}`}>
                  {statusText.toUpperCase()}
                </span>
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                <img src={cardData?.inBodyScans || "/images/svg.png"} alt="Scan Thumbnail" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-[#1a1c1e] uppercase tracking-wider">Composition Score</h3>
                  <p className="text-gray-400 text-[10px] font-medium">Overall fitness rating</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#6d28d9]">
                  <Target size={20} />
                </div>
              </div>
              <div className="mt-3 flex items-end">
                <input type="text" name="bodyCampScore" value={metrics.bodyCampScore} onChange={handleChange} className="text-[80px] font-bold text-[#6d28d9] leading-none tracking-tighter w-40 bg-transparent border-none outline-none focus:ring-0 p-0" placeholder="00" />
                <div className="pb-4"><DiffBadge value={diffs.body_camp_diff} unit="" /></div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - METRICS & ACTIONS */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-[#1a1c1e] uppercase tracking-wider">Basic Metrics</h3>
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#6d28d9]"><TrendingUpIcon size={20} /></div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Current Wt (lbs):</p>
                  <div className="flex items-center">
                    <input type="text" name="currentWeight" value={metrics.currentWeight} onChange={handleChange} className="text-2xl font-bold text-[#6d28d9] text-right w-20 bg-transparent border-b border-transparent focus:border-purple-200 outline-none" />
                    <DiffBadge value={diffs.weight_diff} unit=" lbs" reverseColor={true} />
                  </div>
                </div>
                <div className="h-px bg-gray-50 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <div className="flex items-center justify-between group">
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Height (Inches):</p>
                  <div className="flex items-center">
                    <input type="text" name="height" value={metrics.height} onChange={handleChange} className="text-2xl font-bold text-[#6d28d9] text-right w-20 bg-transparent border-b border-transparent focus:border-purple-200 outline-none" />
                    <DiffBadge value={diffs.height_diff} unit=" in" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-[#1a1c1e] uppercase tracking-wider">Body Composition</h3>
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#6d28d9]"><Zap size={20} /></div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">SMM (lbs):</p>
                  <div className="flex items-center">
                    <input type="text" name="smm" value={metrics.smm} onChange={handleChange} className="text-2xl font-bold text-[#6d28d9] text-right w-16 bg-transparent border-b border-transparent focus:border-purple-200 outline-none" />
                    <DiffBadge value={diffs.smm_diff} unit=" lbs" />
                  </div>
                </div>
                <div className="h-px bg-gray-50 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <div className="flex items-center justify-between group">
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Body Fat (%):</p>
                  <div className="flex items-center">
                    <input type="text" name="bodyFat" value={metrics.bodyFat} onChange={handleChange} className="text-2xl font-bold text-[#6d28d9] text-right w-16 bg-transparent border-b border-transparent focus:border-purple-200 outline-none" />
                    <DiffBadge value={diffs.bf_diff} unit="%" reverseColor={true} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button onClick={() => void handleAccept()} disabled={submitting} className="w-full bg-[#6202AC] hover:bg-[#500ba6] text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-sm disabled:opacity-70">
                {submitting ? "Submitting..." : "Submit Card"}
              </button>
              <button onClick={() => setShowRejectModal(true)} disabled={submitting} className="w-full bg-white border-2 border-[#6d28d9] text-[#6d28d9] hover:bg-purple-50 font-bold py-4 rounded-2xl active:scale-[0.98] transition-all uppercase tracking-widest text-sm disabled:opacity-70">
                Reject Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
            <h3 className="text-xl font-bold text-[#1a1c1e]">Reject Card</h3>
            <p className="mt-2 text-sm text-gray-500">Provide feedback for the player regarding this submission.</p>
            <textarea value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} className="mt-6 h-32 w-full resize-none rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800 outline-none focus:border-[#6202AC] transition-all" placeholder="E.g., Progress photo is blurry..." />
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => { setShowRejectModal(false); setRejectComment(""); }} className="rounded-full px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
              <button type="button" onClick={() => void handleReject()} disabled={submitting} className="rounded-full bg-[#6202AC] px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20">Reject</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}