"use client";

import { useRef, useState } from "react";
import {
  ChevronLeft,
  Upload,
  Camera,
  MapPin,
  AtSign,
  Loader2,
} from "lucide-react";
import { profileApi, ProfileData } from "@/api/profile/route";

interface EditProfileProps {
  profileData: ProfileData;
  onClose: () => void;
  onUpdateSuccess: (updatedData: Partial<ProfileData>) => void;
}

export default function EditProfilePage({
  profileData,
  onClose,
  onUpdateSuccess,
}: EditProfileProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: profileData.name || "",
    username: profileData.username || "",
    location: (profileData as any).location || "Global",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }

    // Basic validation
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a JPG, PNG, or GIF file.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("File size must be under 15MB.");
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const result = await profileApi.updateProfile({
        name: form.name,
        image: selectedImage,
      });
      console.log("Result:", result);
      onUpdateSuccess({ name: form.name });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // The current avatar to display (preview > existing > initials)
  const avatarSrc = previewUrl || profileData.image;

  return (
    <div
      className="min-h-screen sm:min-h-[500px] bg-gray-50 sm:bg-white flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Hidden file input */}
    <input
  ref={fileInputRef}
  type="file"
  accept="image/*" // Use wildcard for best compatibility across devices
  className="absolute inset-0 w-0 h-0 opacity-0" // Better than 'hidden' for iOS
  onChange={handleFileChange}
  aria-hidden="true"
/>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-white shadow-sm sm:shadow-none rounded-t-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-xl sm:text-[20px] font-extrabold text-gray-900">
            Edit Profile
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm sm:text-[13px] font-bold px-5 sm:px-6 py-2.5 sm:py-2 rounded-xl transition-colors shadow-sm min-w-[110px] flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Main content */}
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
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-purple-700 flex items-center justify-center text-white text-4xl sm:text-[36px] font-extrabold shadow-lg overflow-hidden">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      form.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  {/* Camera button triggers file picker */}
                <button
  type="button" // Prevents any form-submission interference
  onClick={(e) => {
    e.preventDefault(); // Stop any bubbling
    triggerFilePicker();
  }}
                    className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-9 h-9 sm:w-10 sm:h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white shadow-md transition-colors"
  >
  <Camera size={16} />
</button>
                </div>

                {/* Upload button also triggers file picker */}
                <button
                  onClick={triggerFilePicker}
                  className="w-full max-w-xs flex items-center justify-center gap-2 border border-gray-300 rounded-xl py-3 px-4 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors bg-white"
                >
                  <Upload size={15} />
                  {selectedImage ? "Change Photo" : "Upload New Photo"}
                </button>

                <p className="text-center text-[11px] text-gray-400 mt-2.5">
                  JPG, PNG or GIF • Max 15MB
                </p>

                {/* Show selected filename as confirmation */}
                {selectedImage && (
                  <p className="text-center text-[11px] text-purple-500 mt-1 font-medium truncate max-w-xs">
                    ✓ {selectedImage.name}
                  </p>
                )}
              </div>

              {/* Basic Information — unchanged */}
              <div className="flex-1">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Basic Information
                </p>
                <div className="flex flex-col gap-5 sm:gap-4">
                  <div>
                    <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 sm:py-2.5 text-[14px] sm:text-[13px] text-gray-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 bg-white transition"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {/* <div>
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
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 sm:py-2.5 text-[14px] sm:text-[13px] text-gray-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 bg-white transition"
                        placeholder="@username"
                      />
                    </div>
                  </div>
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
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 sm:py-2.5 text-[14px] sm:text-[13px] text-gray-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 bg-white transition"
                        placeholder="City, Country"
                      />
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
