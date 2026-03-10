'use client';

import React, { useState, useEffect } from 'react';
import { Upload, BarChart3, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SplitLayout from '@/components/account-setup/SplitLayout';
import { useToast } from '@/components/ui/toast-provider';

export default function ProgressMetricsPage() {
  const router = useRouter();
  const toast = useToast();

  const [progressPhoto, setProgressPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // 1. Restore preview from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('accountSetup');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      if (data.progressPhotoPreview?.startsWith('data:image')) {
        setPhotoPreview(data.progressPhotoPreview);
      }
    } catch {
      // silent fail – bad JSON or missing key
    }
  }, []);

  // 2. Save base64 preview to sessionStorage whenever it changes
  useEffect(() => {
    if (!photoPreview) {
      // Optional: clean up when removed
      const existing = JSON.parse(sessionStorage.getItem('accountSetup') || '{}');
      delete existing.progressPhotoPreview;
      sessionStorage.setItem('accountSetup', JSON.stringify(existing));
      return;
    }

    const existing = JSON.parse(sessionStorage.getItem('accountSetup') || '{}');
    sessionStorage.setItem('accountSetup', JSON.stringify({
      ...existing,
      progressPhotoPreview: photoPreview, // base64 string
      // You could also store: fileName, fileType, uploadTimestamp if useful later
    }));
  }, [photoPreview]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/heic'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG or HEIC file');
      return;
    }

    setProgressPhoto(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      toast.success('Progress photo selected');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setProgressPhoto(null);
    setPhotoPreview(null);
    toast.info('Photo removed');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Optional: you could do extra validation or logging here
    router.push('/account-setup/yourSchedule');
  };

  return (
    <>
      <SplitLayout
        leftContent={{
          title: 'Progress Metrics',
          description: 'Document your starting point to track visible change over time.',
        }}
        showProgress
        progressData={{ currentStep: 5, totalSteps: 9, nextStep: 'Your Schedule' }}
      />

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2 sm:mb-3">Add a progress photo</h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Upload a photo to visually track your transformation alongside your metrics.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 mb-3">
            <Camera size={15} className="text-[#6202AC]" />
            Progress Photo (optional)
          </label>

          <div className="border-2 border-dashed border-gray-200 rounded-2xl bg-[#FAFAFA] overflow-hidden">
            <input
              type="file"
              id="progress-photo"
              accept="image/jpeg,image/png,image/heic"
              onChange={handlePhotoChange}
              className="hidden"
            />

            {photoPreview ? (
              <div className="flex flex-col items-center gap-4 p-6 sm:p-8">
                <img
                  src={photoPreview}
                  alt="Progress preview"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-2xl shadow-md"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <label
                htmlFor="progress-photo"
                className="flex flex-col items-center justify-center gap-3 py-14 sm:py-20 cursor-pointer px-4"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <Upload size={26} className="text-[#6202AC]" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Upload a photo</p>
                  <p className="text-xs sm:text-sm text-gray-400">JPG, PNG or HEIC (max 10MB)</p>
                </div>
              </label>
            )}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-purple-900">
            <span className="font-semibold inline-flex items-center gap-1.5">
              <BarChart3 size={14} />
              Progress Tracking:
            </span>{' '}
            Regular photos and metrics help you see real changes that the scale might not show.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-[#6202AC] hover:bg-[#4e0288] text-white font-semibold text-base sm:text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Continue
        </button>

        <button
          type="button"
          onClick={() => router.push('/account-setup/yourSchedule')}
          className="w-full text-[#6202AC] font-semibold text-sm sm:text-base py-2 hover:text-[#4e0288] transition-colors"
        >
          Skip For Now
        </button>
      </form>
    </>
  );
}