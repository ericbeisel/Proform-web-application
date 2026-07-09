"use client";

import { useEffect, useState } from "react";
import { X, UserPlus, Camera } from "lucide-react";

export interface CreatePlayerFormValues {
  name: string;
  email: string;
  image: File | null;
}

interface CreatePlayerModalProps {
  teamName: string;
  onClose: () => void;
  // Pure form — the caller owns the API call (invite/create are the same backend call,
  // branched by response status) and rethrows on failure so the modal can surface it.
  onSave: (values: CreatePlayerFormValues) => Promise<void>;
}

export function CreatePlayerModal({ teamName, onClose, onSave }: CreatePlayerModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!image) { setImagePreview(null); return; }
    const objectUrl = URL.createObjectURL(image);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  function resetForm() {
    setName("");
    setEmail("");
    setImage(null);
    setError(null);
  }

  async function handleSave(closeAfter: boolean) {
    if (!name.trim() || !email.trim()) {
      setError("Please enter both a name and an email.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), email: email.trim(), image });
      resetForm();
      if (closeAfter) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite player.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 flex flex-col gap-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f5f0ff] flex items-center justify-center text-[#8B5CF6] shrink-0">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#222] leading-tight">Create Player</h2>
              <p className="text-xs text-gray-400">Add a new player to {teamName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Photo upload */}
        <div className="flex justify-center">
          <label className="relative cursor-pointer group">
            <div className="w-20 h-20 rounded-full bg-[#f5f5f7] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-[#8B5CF6] transition">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <UserPlus size={22} className="text-gray-300" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white shadow-md group-hover:bg-[#7C3AED] transition">
              <Camera size={13} />
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#222]">Full Name</label>
          <input
            type="text"
            placeholder="First and last name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl bg-[#f5f5f7] px-4 text-sm outline-none border border-transparent focus:border-[#8B5CF6] transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#222]">Email</label>
          <input
            type="email"
            placeholder="player@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl bg-[#f5f5f7] px-4 text-sm outline-none border border-transparent focus:border-[#8B5CF6] transition"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 text-center leading-snug">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2.5 mt-1">
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="h-12 rounded-2xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] transition shadow-[0_6px_16px_rgba(139,92,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="h-12 rounded-2xl border border-[#8B5CF6] text-[#8B5CF6] text-sm font-semibold hover:bg-[#f5f0ff] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save & Add Another"}
          </button>
        </div>
      </div>
    </div>
  );
}
