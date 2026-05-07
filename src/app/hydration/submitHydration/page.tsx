"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Droplet,
  GlassWater,
  Plus,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Clock,
  Check,
  Upload,
  Minus,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getHydrationZones, addHydrationRecord, getTodayHydration, HydrationZone, HydrateRecord, ProteinRecord } from "@/api/hydration/route";

// Custom SVG Bottle component to represent 16oz and 24oz
const WaterBottle = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 21h6a2 2 0 0 0 2-2V9.17a2 2 0 0 0-.59-1.42L14.5 5.83A2 2 0 0 1 14 4.41V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1.41c0 .54-.21 1.05-.59 1.42L7.59 7.75A2 2 0 0 0 7 9.17V19a2 2 0 0 0 2 2Z" />
    <path d="M7 13h10" />
    <path d="M9 2v2" />
    <path d="M15 2v2" />
  </svg>
);

const tags = [
  "25g Protein", "5g Creatine", "5g Glutamine", "100mg Electrolytes", "10g BCAA's", "Pre-Workout",
];

export default function HydrationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hydrationZones, setHydrationZones] = useState<HydrationZone[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState<HydrationZone | null>(null);
  const [customOz, setCustomOz] = useState<number>(32);
  const [isCustom, setIsCustom] = useState(false);
  const [selectedTags, setSelectedTags] = useState<{ name: string; value: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload image to server (you'll need to implement your actual upload endpoint)
  const uploadImageToServer = async (base64Image: string): Promise<string> => {
    // If you have an upload API endpoint:
    // const formData = new FormData();
    // formData.append('image', base64Image);
    // const response = await fetch('/api/upload', { method: 'POST', body: formData });
    // const data = await response.json();
    // return data.url;
    
    // For now, return the base64 string directly
    return base64Image;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const base64 = await fileToBase64(file);
      setUploadedImage(base64);
    } catch (error) {
      console.error("Error converting image:", error);
      alert("Failed to process image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Fetch hydration zones and today's total
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [zones, todayRecords] = await Promise.all([
          getHydrationZones(),
          getTodayHydration().catch(() => [])
        ]);
        
        setHydrationZones(zones);
        
        // Calculate today's total
        const total = todayRecords.reduce((sum, record) => sum + (record.oz_number || 0), 0);
        setTodayTotal(total);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleZoneClick = (zone: HydrationZone) => {
    if (zone.title === "Custom") {
      setIsCustom(true);
      setCustomOz(32);
    } else {
      setIsCustom(false);
      setSelectedZone(zone);
    }
    setSelectedTags([]);
    setSubmitting(false);
    setUploadedImage(null);
    setShowModal(true);
  };

  const handleTagClick = (tag: string) => {
    const exists = selectedTags.find((t) => t.name === tag);
    if (exists) {
      setSelectedTags(selectedTags.filter((t) => t.name !== tag));
    } else {
      setSelectedTags([...selectedTags, { name: tag, value: "0" }]);
    }
  };

  const handleTagValueChange = (tag: string, newValue: string) => {
    setSelectedTags((prev) =>
      prev.map((t) => (t.name === tag ? { ...t, value: newValue } : t))
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      let zoneId: string;
      let ozNumber: number;
      let zoneTitle: string;
      
      if (isCustom) {
        const customZone = hydrationZones.find(z => z.title === "Custom");
        if (!customZone) throw new Error("Custom zone not found");
        zoneId = customZone.id;
        ozNumber = customOz;
        zoneTitle = "Custom Hydration";
      } else if (selectedZone) {
        zoneId = selectedZone.id;
        ozNumber = selectedZone.oz_number;
        zoneTitle = selectedZone.title;
      } else {
        throw new Error("No zone selected");
      }
      
      // Upload image if exists
      let imageUrl = null;
      if (uploadedImage) {
        imageUrl = await uploadImageToServer(uploadedImage);
      }
      
      // Convert selected tags to the format API expects
      const proteinRecordsArray = selectedTags.map(tag => tag.name);
      const proteinRecordsString = JSON.stringify(proteinRecordsArray);
      
      await addHydrationRecord({
        title: `${zoneTitle} - ${new Date().toLocaleTimeString()}`,
        oz_number: ozNumber,
        hydrate_zone_id: zoneId,
        protein_records: proteinRecordsString,
        calories: 0,
        upload_image: imageUrl,
      });
      
      // Refresh today's total
      const updatedTodayRecords = await getTodayHydration().catch(() => []);
      const total = updatedTodayRecords.reduce((sum, record) => sum + (record.oz_number || 0), 0);
      setTodayTotal(total);
      
      // Redirect after success
      setTimeout(() => {
        setShowModal(false);
        setSelectedTags([]);
        setCustomOz(32);
        setUploadedImage(null);
        setSubmitting(false);
        router.push('/hydration/hydrationCompletion');
      }, 800);
      
    } catch (err: any) {
      console.error("Error adding hydration:", err);
      alert(err.message || "Failed to add hydration");
      setSubmitting(false);
    }
  };

  const getHydrationOptions = () => {
    return hydrationZones.filter(z => z.title !== "Custom").map(zone => ({
      label: zone.title,
      oz: zone.oz_number,
      picture: zone.picture,
    }));
  };

  const renderIcon = (oz: number, picture?: string) => {
    if (picture) {
      return (
        <img
          src={picture}
          alt={`${oz} oz`}
          className="w-10 h-10 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      );
    }
    
    const colorClass = "text-[#00aeef]";
    if (oz === 8) return <GlassWater size={24} className={colorClass} strokeWidth={2} />;
    if (oz === 16) return <WaterBottle size={24} className={colorClass} />;
    if (oz === 24) return <WaterBottle size={28} className={colorClass} />;
    return <Droplet size={24} className={colorClass} />;
  };

  const renderModalIcon = () => {
    const colorClass = "text-[#00aeef]";
    const oz = isCustom ? customOz : (selectedZone?.oz_number || 0);
    
    if (isCustom) {
      const customZone = hydrationZones.find(z => z.title === "Custom");
      if (customZone?.picture) {
        return (
          <img
            src={customZone.picture}
            alt="Custom"
            className="w-20 h-20 object-contain"
          />
        );
      }
    }
    
    if (selectedZone?.picture && !isCustom) {
      return (
        <img
          src={selectedZone.picture}
          alt={selectedZone.title}
          className="w-20 h-20 object-contain"
        />
      );
    }
    
    if (oz === 8) return <GlassWater size={54} className={colorClass} strokeWidth={2} />;
    if (oz === 16) return <WaterBottle size={54} className={colorClass} />;
    if (oz === 24) return <WaterBottle size={68} className={colorClass} />;
    return <Droplet size={54} className={colorClass} />;
  };

  const bgColors = ["#e8f0fe", "#e0f9f0", "#f3e8ff"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f0f4f8]">
      {/* HEADER */}
      <div className="w-full bg-purple-600 px-6 py-5">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all">
              <ArrowLeft size={18} color="white" />
            </button>
            <div>
              <div className="text-white font-extrabold text-xl leading-tight">Stay Hydrated</div>
              <div className="text-white/80 text-sm mt-0.5">Track daily intake</div>
            </div>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 flex items-center gap-2 backdrop-blur-sm border border-white/30">
            <Calendar size={16} color="white" />
            <div className="text-right">
              <div className="text-white/80 text-[10px] font-semibold uppercase">TODAY</div>
              <div className="text-white text-lg font-extrabold leading-tight">{todayTotal} oz</div>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="w-full py-6">
        <div className="w-full bg-white px-6 py-6 shadow-sm mb-5">
          <div className="flex items-center gap-2 mb-5">
            <Droplet size={18} color="#2bb5c8" />
            <h2 className="text-lg font-extrabold text-[#1a1a2e]">Quick Add</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {getHydrationOptions().map((option, index) => (
              <div 
                key={option.label} 
                onClick={() => {
                  const zone = hydrationZones.find(z => z.title === option.label);
                  if (zone) handleZoneClick(zone);
                }} 
                className="border-2 border-[#f0f0f5] rounded-xl p-5 flex flex-col items-center cursor-pointer transition-all bg-white hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: bgColors[index % bgColors.length] }}>
                  {renderIcon(option.oz, option.picture)}
                </div>
                <div className="text-lg font-extrabold text-[#1a1a2e] mb-0.5">{option.label}</div>
                <div className="text-xs text-gray-400 font-medium">{option.oz} oz</div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => {
              const customZone = hydrationZones.find(z => z.title === "Custom");
              if (customZone) handleZoneClick(customZone);
            }} 
            className="w-full mt-4 bg-[#f4f4f8] rounded-xl py-3.5 text-base font-semibold text-gray-500 hover:bg-[#eceef5]"
          >
            Select a custom amount
          </button>
        </div>

        {/* BOTTOM NAVIGATION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6">
          <button 
            onClick={() => router.push('/hydration/hydrationDashboard')}
            className="bg-gradient-to-r from-[#7c3aed] to-[#9333ea] rounded-2xl p-6 flex items-center gap-4 transition-all hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} color="white" />
            </div>
            <div>
              <div className="text-white font-extrabold">Hydration Dashboard</div>
              <div className="text-white/70 text-sm">View progress & stats</div>
            </div>
          </button>

          <button 
            onClick={() => router.push('/hydration/hydrationDashboard')}
            className="bg-gradient-to-r from-[#3b82f6] to-[#6366f1] rounded-2xl p-6 flex items-center gap-4 transition-all hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock size={20} color="white" />
            </div>
            <div>
              <div className="text-white font-extrabold">Hydration History</div>
              <div className="text-white/70 text-sm">Track past performance</div>
            </div>
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fadeIn"
             onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="w-full max-w-md bg-white rounded-3xl relative shadow-2xl animate-slideUp overflow-hidden flex flex-col max-h-[95vh]">
            
            <button onClick={() => setShowModal(false)} className="absolute right-5 top-5 p-1.5 hover:bg-gray-100 rounded-full transition-all z-20">
              <X size={20} className="text-gray-500" />
            </button>

            <div className="flex-1 overflow-y-auto px-6 pt-10 pb-4">
              <div className="text-center mb-6">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Add Hydration:</p>
                <h2 className="text-3xl font-black text-gray-900">{isCustom ? `${customOz} oz` : selectedZone?.title || ""}</h2>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              {/* Upload Photo Button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full bg-[#0e99b6] hover:bg-[#0c88a3] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-6 transition disabled:opacity-50"
              >
                {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {uploadingImage ? "Processing..." : "Upload Photo"}
              </button>

              {/* Image Preview */}
              {uploadedImage && (
                <div className="mb-6">
                  <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-purple-300">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* CENTER DISPLAY AREA */}
              <div className={`flex flex-col items-center mb-8 transition-all ${isCustom ? 'bg-[#ebf8ff] rounded-3xl p-8' : 'p-4'}`}>
                <div className="py-4 animate-fadeIn">{renderModalIcon()}</div>
                {isCustom && (
                  <div className="flex items-center justify-between w-full max-w-[220px] mt-4">
                    <button onClick={() => setCustomOz(Math.max(0, customOz - 1))} className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 text-2xl font-bold active:scale-90">−</button>
                    <div className="text-center">
                      <span className="text-6xl font-black text-gray-800 tracking-tighter leading-none">{customOz}</span>
                      <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">oz</p>
                    </div>
                    <button onClick={() => setCustomOz(customOz + 1)} className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 text-2xl font-bold active:scale-90">+</button>
                  </div>
                )}
              </div>

              {/* NUTRIENTS SECTION */}
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-gray-900 text-sm">Add Nutrients</h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 px-1">
                {tags.map((tag, i) => {
                  const isSelected = selectedTags.find((t) => t.name === tag);
                  return (
                    <button key={i} onClick={() => handleTagClick(tag)}
                      className={`py-2 px-4 rounded-full text-[10px] font-bold transition-all border ${isSelected ? "bg-[#7c3aed] text-white border-transparent" : "bg-white text-gray-500 border-gray-200"}`}>
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* SELECTED NUTRIENTS INPUTS */}
              {selectedTags.length > 0 && (
                <div className="bg-[#f8fafd] rounded-2xl p-4 space-y-3">
                  {selectedTags.map((tag, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{tag.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">g</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleTagValueChange(tag.name, String(Math.max(0, parseInt(tag.value) - 1)))} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="font-black text-gray-800 w-6 text-center">{tag.value}</span>
                        <button onClick={() => handleTagValueChange(tag.name, String(parseInt(tag.value) + 1))} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="p-6 pt-2 text-center bg-white border-t border-gray-50">
              <p className="text-gray-400 text-[10px] font-medium mb-4">Tap to submit this hydration for today:</p>
              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                className={`w-full py-3.5 rounded-xl font-black text-lg text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                  submitting ? "bg-green-500" : "bg-[#5d00b4] hover:bg-[#4a0091]"
                }`}
              >
                {submitting ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}