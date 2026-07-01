"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Upload,
  ChevronDown,
  Check,
  Loader2,
  ImageIcon,
  Dumbbell,
  Flame,
  Droplets,
  Heart,
  User,
  Utensils,
} from "lucide-react";
import { getCardioMenu, type CardioMenuItem } from "@/api/cardio/route";
import { getAllRecoveryZones, type RecoveryZone } from "@/api/recovery/route";
import { getHydrationZones, type HydrationZone } from "@/api/hydration/route";

const ACTIVITY_TYPES = [
  { label: "Cardio",              value: "Cardio",            Icon: Flame,    color: "text-orange-500",  bg: "bg-orange-50"  },
  { label: "Recovery",            value: "Recovery",          Icon: Heart,    color: "text-purple-500",  bg: "bg-purple-50"  },
  { label: "Player Card",         value: "Player Card",       Icon: User,     color: "text-blue-500",    bg: "bg-blue-50"    },
  { label: "Macro",               value: "Macro",             Icon: Utensils, color: "text-green-500",   bg: "bg-green-50"   },
  { label: "Hydration",           value: "Hydrate",           Icon: Droplets, color: "text-cyan-500",    bg: "bg-cyan-50"    },
  { label: "Individual Exercise", value: "IndividualExercise",Icon: Dumbbell, color: "text-indigo-500",  bg: "bg-indigo-50"  },
];

type SecondaryOption = { id: string; name: string };

interface Props {
  onClose: () => void;
}

export default function UploadHighlightModal({ onClose }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);
  const [caption, setCaption] = useState("");
  const [activityType, setActivityType] = useState("");
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [secondaryOptions, setSecondaryOptions] = useState<SecondaryOption[]>([]);
  const [selectedSecondary, setSelectedSecondary] = useState("");
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);
  const [loadingSecondary, setLoadingSecondary] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activityType) { setSecondaryOptions([]); setSelectedSecondary(""); return; }
    if (!["Cardio", "Recovery", "Hydrate"].includes(activityType)) {
      setSecondaryOptions([]); setSelectedSecondary(""); return;
    }

    setLoadingSecondary(true);
    setSelectedSecondary("");

    const load = async () => {
      try {
        if (activityType === "Cardio") {
          const items: CardioMenuItem[] = await getCardioMenu();
          const withoutOther = items.filter(i => i.name?.toLowerCase() !== "other");
          const other = items.find(i => i.name?.toLowerCase() === "other");
          const sorted = [...withoutOther].sort((a, b) => a.name.localeCompare(b.name));
          if (other) sorted.push(other);
          setSecondaryOptions(sorted.map(i => ({ id: i.id, name: i.name })));
        } else if (activityType === "Recovery") {
          const zones: RecoveryZone[] = await getAllRecoveryZones();
          setSecondaryOptions(zones.map(z => ({ id: z.id, name: z.form || z.title })));
        } else if (activityType === "Hydrate") {
          const zones: HydrationZone[] = await getHydrationZones();
          const sorted = [...zones].sort((a, b) => (a.order || 0) - (b.order || 0));
          setSecondaryOptions(sorted.map(z => ({ id: z.id, name: `${z.title || "Water"} (${z.oz_number || 8} oz)` })));
        }
      } catch {
        setSecondaryOptions([]);
      } finally {
        setLoadingSecondary(false);
      }
    };
    load();
  }, [activityType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    setPreviewIsVideo(isVideo);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setActivityType("");
    setSelectedSecondary("");
    setSecondaryOptions([]);
    setPreviewUrl(null);
    setPreviewIsVideo(false);
    setCaption("");
    setError("");
    setComingSoon(false);
    sessionStorage.removeItem("uploadHighlightImage");
  };

  const navigate = (path: string) => {
    if (previewUrl) sessionStorage.setItem("uploadHighlightImage", previewUrl);
    else sessionStorage.removeItem("uploadHighlightImage");
    if (caption.trim()) sessionStorage.setItem("uploadHighlightCaption", caption.trim());
    else sessionStorage.removeItem("uploadHighlightCaption");
    onClose();
    router.push(path);
  };

  const handleNext = () => {
    setError("");
    if (!activityType) { setError("Please select an activity type."); return; }
    if (["Cardio", "Recovery", "Hydrate"].includes(activityType) && !selectedSecondary) {
      setError("Please choose a specific category."); return;
    }

    switch (activityType) {
      case "IndividualExercise":
        navigate("/find-exercises"); break;
      case "Cardio":
        navigate("/todays-focus-cardio/cardio-entry"); break;
      case "Recovery": {
        const zone = secondaryOptions.find(s => s.id === selectedSecondary);
        const slug = (zone?.name ?? "recovery").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        navigate(`/recovery/selectedRecovery/${slug}?id=${selectedSecondary}`);
        break;
      }
      case "Hydrate":
        navigate("/hydration/hydrationDashboard"); break;
      case "Player Card":
      case "Macro":
        setComingSoon(true); break;
      default: break;
    }
  };

  const selectedActivity = ACTIVITY_TYPES.find(a => a.value === activityType);
  const selectedSecondaryObj = secondaryOptions.find(s => s.id === selectedSecondary);
  const needsSecondary = ["Cardio", "Recovery", "Hydrate"].includes(activityType);
  const secondaryLabel =
    activityType === "Cardio"    ? "Cardio Exercise Method" :
    activityType === "Recovery"  ? "Specific Recovery Zone" :
    activityType === "Hydrate"   ? "Hydration Target Goal"  : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[18px] font-extrabold text-gray-900">Upload Activities</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Log a highlight to your feed</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh] px-5 py-4 space-y-5">
          {/* STEP 1 */}
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
              Step 1: Choose Media
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {previewUrl ? (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-gray-200 bg-black">
                {previewIsVideo ? (
                  <video src={previewUrl} muted playsInline className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => { setPreviewUrl(null); setPreviewIsVideo(false); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X size={12} />
                </button>
                {previewIsVideo && (
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">VIDEO</span>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-36 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 flex flex-col items-center justify-center gap-2 transition-colors group"
              >
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload size={18} className="text-purple-600" />
                </div>
                <p className="text-[13px] font-bold text-gray-700">Upload Photo or Video</p>
                <p className="text-[11px] text-gray-400">Image or video (max 30 seconds)</p>
              </button>
            )}
          </div>

          {/* STEP 2 */}
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
              Step 2: Log Details
            </p>

            {/* Activity Type Picker */}
            <div className="mb-3">
              <p className="text-[12px] font-bold text-gray-600 mb-1.5">Activity Type</p>
              <button
                onClick={() => setShowActivityPicker(v => !v)}
                className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] bg-white hover:border-purple-300 transition-colors"
              >
                {selectedActivity ? (
                  <span className={`flex items-center gap-2 font-semibold ${selectedActivity.color}`}>
                    <selectedActivity.Icon size={14} />
                    {selectedActivity.label}
                  </span>
                ) : (
                  <span className="text-gray-400">Select activity to log</span>
                )}
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showActivityPicker && (
                <div className="mt-1 border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white z-10">
                  {ACTIVITY_TYPES.map(item => (
                    <button
                      key={item.value}
                      onClick={() => { setActivityType(item.value); setShowActivityPicker(false); setComingSoon(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${activityType === item.value ? "bg-purple-50" : ""}`}
                    >
                      <span className={`flex items-center gap-2.5 text-[13px] font-semibold ${activityType === item.value ? item.color : "text-gray-700"}`}>
                        <span className={`w-6 h-6 rounded-lg ${item.bg} flex items-center justify-center`}>
                          <item.Icon size={12} className={item.color} />
                        </span>
                        {item.label}
                      </span>
                      {activityType === item.value && <Check size={15} className="text-purple-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Secondary Picker */}
            {needsSecondary && (
              <div className="mb-3">
                <p className="text-[12px] font-bold text-gray-600 mb-1.5">{secondaryLabel}</p>
                <button
                  onClick={() => { if (!loadingSecondary && secondaryOptions.length > 0) setShowSecondaryPicker(v => !v); }}
                  disabled={loadingSecondary || secondaryOptions.length === 0}
                  className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] bg-white hover:border-purple-300 transition-colors disabled:opacity-60"
                >
                  {loadingSecondary ? (
                    <span className="flex items-center gap-2 text-gray-400">
                      <Loader2 size={13} className="animate-spin" /> Loading categories...
                    </span>
                  ) : (
                    <span className={selectedSecondary ? "text-gray-800 font-semibold" : "text-gray-400"}>
                      {selectedSecondaryObj ? selectedSecondaryObj.name : "Choose category"}
                    </span>
                  )}
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {showSecondaryPicker && (
                  <div className="mt-1 border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white max-h-48 overflow-y-auto">
                    {secondaryOptions.map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setSelectedSecondary(item.id); setShowSecondaryPicker(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${selectedSecondary === item.id ? "bg-purple-50" : ""}`}
                      >
                        <span className={`text-[12px] font-medium ${selectedSecondary === item.id ? "text-purple-700 font-semibold" : "text-gray-700"}`}>
                          {item.name}
                        </span>
                        {selectedSecondary === item.id && <Check size={14} className="text-purple-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Coming Soon notice */}
            {comingSoon && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-[12px] text-amber-700 font-semibold text-center">
                This feature is coming soon!
              </div>
            )}

            {error && (
              <p className="text-[12px] text-red-500 mt-1">{error}</p>
            )}
          </div>

          {/* Caption */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                Step 3: Add Caption
              </p>
              <span className={`text-[10px] font-semibold ${caption.length > 90 ? "text-red-400" : "text-gray-400"}`}>
                {caption.length}/100
              </span>
            </div>
            <textarea
              value={caption}
              onChange={e => { if (e.target.value.length <= 100) setCaption(e.target.value); }}
              placeholder="Write a short caption… (optional)"
              rows={3}
              className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[13px] text-gray-800 outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition placeholder:text-gray-400"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 text-[13px] font-bold hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleNext}
            disabled={!activityType}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[13px] font-bold hover:shadow-lg disabled:opacity-50 transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
