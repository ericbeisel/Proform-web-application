"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Sparkles, 
  ChevronDown, 
  Check, 
  Loader2, 
  Activity, 
  Dumbbell, 
  Heart, 
  Camera, 
  Droplets, 
  Scale, 
  Flame, 
  Clock, 
  Plus, 
  Award,
  BookOpen
} from "lucide-react";
import { getAuthUser } from "@/lib/auth/session";
import { profileApi, ProfileData } from "@/api/profile/route";
import { getCardioMenu, completeCardioSession, CardioMenuItem } from "@/api/cardio/route";
import { getAllRecoveryZones, RecoveryZone } from "@/api/recovery/route";
import { getHydrationZones, addHydrationRecord, HydrationZone } from "@/api/hydration/route";
import { getPresignedUrl, uploadFileToS3 } from "@/api/coach/route";
import { useToast } from "@/components/ui/toast-provider";

// Premium background overlay component
const BackgroundDecor = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/40 blur-[120px]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px]" />
  </div>
);

export default function UploadHighlightPage() {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile and Session Data
  const [currentUser, setCurrentUser] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileURL, setFileURL] = useState<string>(""); // S3 URL
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Dropdown States
  const [activityType, setActivityType] = useState<string>("");
  const [secondaryOptions, setSecondaryOptions] = useState<{ id: string; name: string; extra?: any }[]>([]);
  const [selectedSecondary, setSelectedSecondary] = useState<string>("");
  const [loadingSecondary, setLoadingSecondary] = useState(false);

  // Modal Overlay States
  const [activeModal, setActiveModal] = useState<"exercise" | "cardio" | "progress" | "hydrate" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal Forms States
  const [exerciseForm, setExerciseForm] = useState({ name: "", sets: "3", reps: "10", weight: "", notes: "" });
  const [cardioForm, setCardioForm] = useState({ duration: "30", distance: "", watts: "", avgHr: "", peakHr: "", calories: "250" });
  const [progressForm, setProgressForm] = useState({ tags: "Front View", notes: "" });
  const [hydrateForm, setHydrateForm] = useState({ title: "Quick Hydration", amount: "16", calories: "0" });

  // Load User Profile on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const user = getAuthUser();
        if (user && user.username) {
          const profile = await profileApi.getProfileByUsername(user.username as string);
          setCurrentUser(profile);
        } else {
          toast.error("Authentication required. Please login.");
          router.replace("/auth/login");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [router, toast]);

  // Load Secondary Dropdown Options dynamically
  useEffect(() => {
    if (!activityType) {
      setSecondaryOptions([]);
      setSelectedSecondary("");
      return;
    }

    const loadOptions = async () => {
      setLoadingSecondary(true);
      setSelectedSecondary("");
      try {
        if (activityType === "Cardio") {
          const cardioMenu = await getCardioMenu();
          // Filter out "Other", sort alphabetically, then append "Other" at end
          const menuWithoutOther = cardioMenu.filter(item => item.name.toLowerCase() !== "other");
          const sorted = [...menuWithoutOther].sort((a, b) => a.name.localeCompare(b.name));
          const otherItem = cardioMenu.find(item => item.name.toLowerCase() === "other");
          
          const options = sorted.map(item => ({ id: item.id, name: item.name, extra: item }));
          if (otherItem) {
            options.push({ id: otherItem.id, name: otherItem.name, extra: otherItem });
          }
          setSecondaryOptions(options);
        } else if (activityType === "Recovery") {
          const recoveryZones = await getAllRecoveryZones();
          const options = recoveryZones.map(zone => ({ id: zone.id, name: zone.form, extra: zone }));
          setSecondaryOptions(options);
        } else if (activityType === "Hydrate") {
          const hydrationZones = await getHydrationZones();
          const sorted = [...hydrationZones].sort((a, b) => a.order - b.order);
          const options = sorted.map(zone => ({ id: zone.id, name: `${zone.title} (${zone.oz_number} oz)`, extra: zone }));
          setSecondaryOptions(options);
        } else {
          setSecondaryOptions([]);
        }
      } catch (err) {
        console.error(`Error loading options for ${activityType}:`, err);
        toast.error(`Failed to load secondary options for ${activityType}.`);
      } finally {
        setLoadingSecondary(false);
      }
    };

    loadOptions();
  }, [activityType, toast]);

  // Handle Drag & Drop / File Upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image size must be less than 15MB");
      return;
    }

    try {
      setUploading(true);
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setShowPreview(true);

      // S3 upload using presigned url
      const { uploadUrl, fileUrl } = await getPresignedUrl({
        fileName: file.name,
        contentType: file.type,
        folder: "highlights"
      });

      await uploadFileToS3(uploadUrl, file);
      setFileURL(fileUrl);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error("File upload failed:", err);
      toast.error(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Reset page UI state
  const handleResetUI = () => {
    setActivityType("");
    setSelectedSecondary("");
    setSecondaryOptions([]);
    toast.success("Selections reset");
  };

  // Handle main action click (navigation or modal trigger)
  const handleActionClick = async () => {
    if (!fileURL) {
      toast.error("Please upload an image first");
      return;
    }
    if (!activityType) {
      toast.error("Please select an activity type");
      return;
    }

    // Secondary dropdown validation
    if (["Cardio", "Recovery", "Hydrate"].includes(activityType) && !selectedSecondary) {
      toast.error("Please select a specific category");
      return;
    }

    switch (activityType) {
      case "IndividualExercise":
        setExerciseForm({ name: "", sets: "3", reps: "10", weight: "", notes: "" });
        setActiveModal("exercise");
        break;

      case "Cardio":
        setCardioForm({ duration: "30", distance: "", watts: "", avgHr: "", peakHr: "", calories: "250" });
        setActiveModal("cardio");
        break;

      case "Recovery":
        // Browse All vs Specific Zone
        // If they select specific zone, find its details
        const selectedZoneOption = secondaryOptions.find(o => o.id === selectedSecondary);
        if (selectedZoneOption) {
          const zone = selectedZoneOption.extra as RecoveryZone;
          sessionStorage.setItem("recoveryDetails", JSON.stringify({
            recovery: zone.id,
            uploadImage: fileURL
          }));
          const dynamicLink = `/recovery/selectedRecovery/${zone.form.toLowerCase().replace(/\s+/g, "-")}?id=${zone.id}`;
          toast.success(`Redirecting to recovery: ${zone.form}`);
          router.push(dynamicLink);
        }
        break;

      case "Player Card":
        sessionStorage.setItem("CardDetails", JSON.stringify({
          uploadImage: fileURL
        }));
        toast.success("Redirecting to create player card");
        router.push("/create-player-card");
        break;

      case "Progress Photo":
        // Immediate simulated INSERT to db, then open options lightbox
        setProgressForm({ tags: "Front View", notes: "" });
        setActiveModal("progress");
        break;

      case "Hydrate":
        setHydrateForm({ title: "Quick Hydration", amount: "16", calories: "0" });
        setActiveModal("hydrate");
        break;

      case "Macro":
        sessionStorage.setItem("MacroDetails", JSON.stringify({
          uploadImage: fileURL
        }));
        toast.success("Redirecting to macros database");
        router.push("/macros-search");
        break;
      
      default:
        break;
    }
  };

  // Modals Submission handlers
  const submitExerciseLog = async () => {
    if (!exerciseForm.name) {
      toast.error("Please enter exercise name");
      return;
    }
    setSubmitting(true);
    try {
      // Mock submit exercise log
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`Logged ${exerciseForm.sets}x${exerciseForm.reps} ${exerciseForm.name}!`);
      setActiveModal(null);
    } catch (err) {
      toast.error("Failed to save exercise log");
    } finally {
      setSubmitting(false);
    }
  };

  const submitCardioSession = async () => {
    setSubmitting(true);
    try {
      const selectedOption = secondaryOptions.find(o => o.id === selectedSecondary);
      const optionName = selectedOption ? selectedOption.name : "Cardio Activity";

      await completeCardioSession({
        cardio_option: selectedSecondary,
        minutes: Number(cardioForm.duration || 0),
        calories_burned: Number(cardioForm.calories || 0),
        manifest_id: "",
        "distance mi": Number(cardioForm.distance || 0),
        mets: 0,
        "avg watts": Number(cardioForm.watts || 0),
        гра: 0,
        "peak hr": Number(cardioForm.peakHr || 0),
        avg_hr: Number(cardioForm.avgHr || 0),
        avg_mets: 0,
        image: fileURL
      });
      toast.success(`Logged ${cardioForm.duration}m of ${optionName}!`);
      setActiveModal(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to log cardio session");
    } finally {
      setSubmitting(false);
    }
  };

  const submitProgressPhoto = async () => {
    setSubmitting(true);
    try {
      // Mock PROGRESS_PHOTO database entry log
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`Transformation progress photo logged under: ${progressForm.tags}!`);
      setActiveModal(null);
    } catch (err) {
      toast.error("Failed to log progress photo");
    } finally {
      setSubmitting(false);
    }
  };

  const submitHydrationRecord = async () => {
    setSubmitting(true);
    try {
      const selectedOption = secondaryOptions.find(o => o.id === selectedSecondary);
      const zone = selectedOption ? (selectedOption.extra as HydrationZone) : null;
      
      await addHydrationRecord({
        title: hydrateForm.title,
        oz_number: Number(hydrateForm.amount || (zone ? zone.oz_number : 8)),
        hydrate_zone_id: selectedSecondary,
        protein_records: "[]",
        calories: Number(hydrateForm.calories || 0),
        upload_image: fileURL
      });

      toast.success(`Logged ${hydrateForm.amount} oz hydration record!`);
      setActiveModal(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add hydration record");
    } finally {
      setSubmitting(false);
    }
  };

  // Browse All Recovery handler
  const handleBrowseAllRecovery = () => {
    if (!fileURL) {
      toast.error("Please upload an image first");
      return;
    }
    sessionStorage.setItem("recoveryDetails", JSON.stringify({
      uploadImage: fileURL
    }));
    toast.success("Redirecting to all recovery options");
    router.push("/recovery-zone-all");
  };

  if (loadingProfile) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#6d28d9] mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-semibold">Loading profile data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1e293b] font-sans relative flex flex-col items-center justify-center p-4 overflow-x-hidden md:p-10">
      <BackgroundDecor />

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-[36px] shadow-2xl border border-white/60 p-6 md:p-10 z-10 space-y-8 relative">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all border border-gray-100 active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={18} className="text-gray-700" strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Upload Highlight <Sparkles size={20} className="text-amber-500" />
              </h1>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
                Log activities and show off achievements
              </p>
            </div>
          </div>
          
          {/* User Profile Thumbnail */}
          {currentUser && (
            <div className="flex items-center gap-2.5 bg-white shadow-sm border border-gray-100 rounded-full py-1.5 pl-2 pr-3.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center border-2 border-purple-500">
                {currentUser.image ? (
                  <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-xs text-purple-700">{currentUser.name.charAt(0)}</span>
                )}
              </div>
              <span className="text-xs font-black text-gray-800">@{currentUser.username}</span>
            </div>
          )}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Image Dropzone & Preview */}
          <div className="md:col-span-6 space-y-4">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest pl-1">Step 1: Choose Media</h2>
            
            {/* File Pick / Drop Area */}
            {!filePreview ? (
              <label className="block group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                  disabled={uploading}
                />
                <div className="border-[3px] border-dashed border-purple-200 bg-purple-50/40 rounded-3xl p-10 text-center hover:bg-purple-50/80 hover:border-purple-300 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-md flex items-center justify-center mb-4 text-[#6d28d9] group-hover:scale-105 transition-transform duration-300">
                    {uploading ? (
                      <Loader2 size={28} className="animate-spin text-purple-600" />
                    ) : (
                      <Upload size={28} />
                    )}
                  </div>
                  <p className="text-sm font-black text-gray-700">
                    {uploading ? "Uploading file..." : "Upload highlight photo"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Drag and drop or click to browse &bull; Max 15MB
                  </p>
                </div>
              </label>
            ) : (
              /* Upload Preview Container */
              showPreview && (
                <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-xl relative animate-fade-in group">
                  <div className="absolute top-2 right-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setFilePreview(null);
                        setFileURL("");
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        toast.success("Image removed");
                      }}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-2 bg-gray-800 hover:bg-gray-950 text-white rounded-full shadow-md transition cursor-pointer"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900 shadow-inner flex items-center justify-center p-2">
                    <img src={filePreview} alt="Preview" className="h-full w-auto object-contain rounded-lg" />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-2xl">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
                          <p className="text-xs text-purple-200 font-semibold">Updating storage...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Toggle Preview Button */}
            {filePreview && !showPreview && (
              <button
                onClick={() => setShowPreview(true)}
                className="w-full py-3 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-purple-300 shadow-sm transition active:scale-95"
              >
                Show Photo Preview
              </button>
            )}
          </div>

          {/* RIGHT: Selection Dropdowns & Form actions */}
          <div className="md:col-span-6 space-y-6">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest pl-1">Step 2: Log Details</h2>

            {/* Dropdown 1: Activity Type Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Activity Type</label>
              <div className="relative">
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm appearance-none outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition shadow-sm font-medium cursor-pointer"
                >
                  <option value="">Select activity to log</option>
                  <option value="IndividualExercise">Individual Exercise Log</option>
                  <option value="Cardio">Cardio Training</option>
                  <option value="Recovery">Recovery Zone</option>
                  <option value="Player Card">Player Card Scan</option>
                  <option value="Progress Photo">Progress Transform Photo</option>
                  <option value="Hydrate">Hydrate Zone Goal</option>
                  <option value="Macro">Macro Nutrition Search</option>
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Dropdown 2: Secondary selection (Cardio / Recovery / Hydrate) */}
            {["Cardio", "Recovery", "Hydrate"].includes(activityType) && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {activityType === "Cardio" && "Cardio Exercise Method"}
                  {activityType === "Recovery" && "Specific Recovery Zone"}
                  {activityType === "Hydrate" && "Hydration Target Goal"}
                </label>
                <div className="relative">
                  <select
                    value={selectedSecondary}
                    onChange={(e) => setSelectedSecondary(e.target.value)}
                    disabled={loadingSecondary}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm appearance-none outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition shadow-sm font-medium disabled:opacity-60 cursor-pointer"
                  >
                    {loadingSecondary ? (
                      <option>Loading options...</option>
                    ) : (
                      <>
                        <option value="">Choose category</option>
                        {secondaryOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </>
                    )}
                  </select>
                  {loadingSecondary ? (
                    <Loader2 size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-600 animate-spin" />
                  ) : (
                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>
            )}

            {/* Special Action Buttons for Recovery */}
            {activityType === "Recovery" && selectedSecondary && (
              <div className="pt-2">
                <button
                  onClick={handleBrowseAllRecovery}
                  className="w-full py-3 border border-purple-200 bg-purple-50 text-purple-700 text-sm font-bold rounded-2xl hover:bg-purple-100 transition shadow-sm active:scale-95 cursor-pointer"
                >
                  Browse All Recovery Options
                </button>
              </div>
            )}

            {/* Action buttons (Reset & Upload/Submit) */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-4">
              <button
                onClick={handleResetUI}
                className="flex-1 py-3.5 border border-gray-200 bg-white text-sm font-bold text-gray-600 rounded-2xl hover:bg-gray-50 transition active:scale-95 shadow-sm cursor-pointer"
              >
                Reset Selection
              </button>
              <button
                onClick={handleActionClick}
                disabled={!fileURL || !activityType || uploading}
                className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-black rounded-2xl hover:scale-[1.01] hover:shadow-lg transition duration-200 disabled:opacity-50 disabled:hover:scale-100 active:scale-95 cursor-pointer"
              >
                {activityType === "Recovery" && selectedSecondary ? "Nav to Zone Page" : "Proceed & Log"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* OVERLAY LIGHTBOX MODALS */}
      {/* =============================================================== */}

      {/* MODAL 1: Individual Exercise Log */}
      {activeModal === "exercise" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 relative animate-scale-in">
            {/* CLOSE */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Dumbbell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Add Individual Exercise Log</h3>
                <p className="text-xs text-gray-400">Save detailed weightlifting achievements</p>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bench Press, Squat"
                  value={exerciseForm.name}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Sets</label>
                  <input
                    type="number"
                    value={exerciseForm.sets}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Reps</label>
                  <input
                    type="number"
                    value={exerciseForm.reps}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Weight (lbs)</label>
                  <input
                    type="number"
                    placeholder="lbs"
                    value={exerciseForm.weight}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, weight: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Extra Notes</label>
                <textarea
                  placeholder="How did it feel? Good bar speed? Heavy?"
                  value={exerciseForm.notes}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:border-purple-500 focus:bg-white"
                />
              </div>
              {/* Photo Indicator */}
              <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-2xl p-3">
                <img src={filePreview || ""} className="w-12 h-12 object-cover rounded-lg" />
                <span className="text-xs text-purple-700 font-bold">Image will be pre-filled as exercise proof image.</span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitExerciseLog}
                disabled={submitting}
                className="flex-1 py-2.5 bg-[#6d28d9] hover:bg-[#5b1cb6] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Save Exercise Log"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Cardio Calculator */}
      {activeModal === "cardio" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 relative animate-scale-in">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Flame size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg font-black">Cardio Calculator</h3>
                <p className="text-xs text-gray-400">Calculate stats & complete cardio training</p>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Duration (mins)</label>
                  <input
                    type="number"
                    value={cardioForm.duration}
                    onChange={(e) => setCardioForm({ ...cardioForm, duration: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Calories Burned (kcal)</label>
                  <input
                    type="number"
                    value={cardioForm.calories}
                    onChange={(e) => setCardioForm({ ...cardioForm, calories: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Distance (mi)</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={cardioForm.distance}
                    onChange={(e) => setCardioForm({ ...cardioForm, distance: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Avg Watts</label>
                  <input
                    type="number"
                    placeholder="Watts"
                    value={cardioForm.watts}
                    onChange={(e) => setCardioForm({ ...cardioForm, watts: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Avg HR (bpm)</label>
                  <input
                    type="number"
                    placeholder="HR"
                    value={cardioForm.avgHr}
                    onChange={(e) => setCardioForm({ ...cardioForm, avgHr: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-3">
                <img src={filePreview || ""} className="w-12 h-12 object-cover rounded-lg" />
                <span className="text-xs text-red-700 font-bold">Image will be pre-filled as cardio verification image.</span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitCardioSession}
                disabled={submitting}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Save Cardio Log"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Upload Progress Photo Options */}
      {activeModal === "progress" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 relative animate-scale-in">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Scale size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Progress Photo Details</h3>
                <p className="text-xs text-gray-400">Add labels for before & after timelines</p>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Camera View tag</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Front View", "Side View", "Back View"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setProgressForm({ ...progressForm, tags: tag })}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        progressForm.tags === tag
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Comments & Transform Notes</label>
                <textarea
                  placeholder="e.g. Body Fat % down, feeling leaner, week 3 checkin."
                  value={progressForm.notes}
                  onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:border-purple-500 focus:bg-white"
                />
              </div>
              <div className="relative aspect-square max-w-[200px] mx-auto rounded-2xl overflow-hidden border-2 border-blue-300">
                <img src={filePreview || ""} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitProgressPhoto}
                disabled={submitting}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Save Progress Photo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Hydrate Goal */}
      {activeModal === "hydrate" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 relative animate-scale-in">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Droplets size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Log Hydration Goal</h3>
                <p className="text-xs text-gray-400">Save water logging details</p>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Log Title</label>
                <input
                  type="text"
                  placeholder="e.g. Morning Hydration, After Workout"
                  value={hydrateForm.title}
                  onChange={(e) => setHydrateForm({ ...hydrateForm, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Water Amount (oz)</label>
                  <input
                    type="number"
                    value={hydrateForm.amount}
                    onChange={(e) => setHydrateForm({ ...hydrateForm, amount: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Calories (Optional)</label>
                  <input
                    type="number"
                    value={hydrateForm.calories}
                    onChange={(e) => setHydrateForm({ ...hydrateForm, calories: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-3">
                <img src={filePreview || ""} className="w-12 h-12 object-cover rounded-lg" />
                <span className="text-xs text-blue-700 font-bold">Image will be pre-filled as hydration proof image.</span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitHydrationRecord}
                disabled={submitting}
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Save Hydrate Log"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
