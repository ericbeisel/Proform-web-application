'use client';

import React, { useState } from 'react';
import { Camera, X, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    username: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check username availability when typing
    if (name === 'username') {
      if (value.length > 0) {
        setUsernameStatus('checking');
        // Simulate API call
        setTimeout(() => {
          // For demo: "johndoe" is taken, others are available
          if (value.toLowerCase() === 'johndoe') {
            setUsernameStatus('taken');
          } else {
            setUsernameStatus('available');
          }
        }, 500);
      } else {
        setUsernameStatus('idle');
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (usernameStatus === 'available') {
      console.log('Profile setup:', formData);
      // Navigate to new member checklist
      router.push('/account-setup/newMember');
    }
  };

  return (
    <>
      {/* Step Counter */}
      <div className="flex justify-end mb-4 px-2">
        <span className="text-sm font-semibold text-gray-600">2 of 2</span>
      </div>

      {/* Progress Bar - Centered with equal spacing */}
      <div className="flex justify-center mb-16 px-2">
        <div className="w-full max-w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-cyan-400 h-full transition-all duration-300 rounded-full" 
            style={{ width: '100%' }} // 1 of 9 steps
          />
        </div>
      </div>
           <div className="w-full max-w-[520px] mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-black mb-3">
          Set up Profile!
        </h1>
        <p className="text-gray-500 text-base">
          Create your unique fitness identity
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            )}
          </div>
          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-500 transition-colors shadow-lg"
          >
            <Camera size={20} color="white" />
          </label>
          <input 
            type="file" 
            id="avatar-upload" 
            accept="image/*" 
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-black mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your Name"
            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            required
          />
        </div>

        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-black mb-2">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your Username"
              className={`w-full px-5 py-4 bg-white border rounded-xl focus:outline-none text-gray-900 placeholder:text-gray-400 pr-12
                ${usernameStatus === 'taken' ? 'border-red-500 focus:ring-2 focus:ring-red-500' : ''}
                ${usernameStatus === 'available' ? 'border-green-400 focus:ring-2 focus:ring-green-400' : ''}
                ${usernameStatus === 'idle' || usernameStatus === 'checking' ? 'border-gray-200 focus:ring-2 focus:ring-cyan-400' : ''}
              `}
              required
            />
            {usernameStatus === 'taken' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <X size={18} color="white" />
              </div>
            )}
            {usernameStatus === 'available' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <Check size={18} color="white" />
              </div>
            )}
          </div>
          
          {/* Username Status Message */}
          {usernameStatus === 'taken' && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <X size={14} /> @{formData.username} is already taken
            </p>
          )}
          {usernameStatus === 'available' && (
            <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
              <Check size={14} /> {formData.username} Available
            </p>
          )}
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          disabled={usernameStatus !== 'available' || !formData.fullName}
          className={`w-full font-semibold text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md mt-4
            ${usernameStatus === 'available' && formData.fullName
              ? 'bg-[#6202AC] hover:bg-[#4e0288] text-white hover:shadow-lg' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continue
        </button>
      </form>
      </div>
    </>
  );
}