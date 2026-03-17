'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { checkUsername, signup } from '@/api/auth/signup/route';
import { checkAccountStatus } from '@/api/auth/account-status/route';

export default function ProfileSetupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ fullName: '', username: '' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  // const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const usernameTimeout = useRef<NodeJS.Timeout | null>(null);

  const [usernameStatus, setUsernameStatus] = useState<
  'idle' | 'checking' | 'available' | 'taken' | 'error'
>('idle');
const [usernameMessage, setUsernameMessage] = useState<string>('');

// ────────────────────────────────────────────────
// 2. Better username checker
// ────────────────────────────────────────────────
const handleUsernameCheck = async (username: string) => {
  const trimmed = username.trim();

  // No minimum length check anymore
  if (!trimmed) {
    setUsernameStatus('idle');
    setUsernameMessage('');
    return;
  }

  setUsernameStatus('checking');
  setUsernameMessage('Checking availability...');

  try {
    const data = await checkUsername(trimmed);

    // Flexible detection of "available" (adjust based on your actual API response shape)
    const isAvailable =
      data.available === true ||
      data.isAvailable === true ||
      data.exists === false ||
      data.status === 'available' ||
      data.available === 'true' ||
      !data.taken ||
      data.message?.toLowerCase().includes('available');

    if (isAvailable) {
      setUsernameStatus('available');
      setUsernameMessage(`@${trimmed} is available`);
    } else {
      setUsernameStatus('taken');
      setUsernameMessage('The username has already been taken.');
    }
  } catch (err: any) {
    console.error('Username check failed:', err);

    setUsernameStatus('error');
    setUsernameMessage(
      err.message?.toLowerCase().includes('taken') ||
      err.message?.toLowerCase().includes('already')
        ? 'The username has already been taken.'
        : 'Could not check username right now. Please try again.'
    );
  }
};

  // const handleUsernameCheck = async (username: string) => {
  //   if (!username.trim()) { setUsernameStatus('idle'); return; }
  //   setUsernameStatus('checking');
  //   try {
  //     const data = await checkUsername(username.trim());
  //     const isAvailable =
  //       data.available === true ||
  //       data.isAvailable === true ||
  //       !data.exists ||
  //       data.status === 'available';
  //     setUsernameStatus(isAvailable ? 'available' : 'taken');
  //   } catch (err: any) {
  //     console.error('Username check failed:', err);
  //     setUsernameStatus('idle');
  //   }
  // };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (name === 'username') {
      if (usernameTimeout.current) clearTimeout(usernameTimeout.current);
      if (value.trim().length > 0) {
        usernameTimeout.current = setTimeout(() => handleUsernameCheck(value.trim()), 500);
      } else {
        setUsernameStatus('idle');
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (usernameStatus !== 'available' || !formData.fullName.trim()) return;

  const email = sessionStorage.getItem('signup_email')?.trim();
  const password = sessionStorage.getItem('signup_password');

  if (!email || !password) {
    setError('Session expired. Please start signup again.');
    router.replace('/auth/signup');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // 1. Signup — token is saved inside signup()
    await signup({
      name: formData.fullName.trim(),
      email,
      password,
      username: formData.username.trim(),
      image: avatarFile ?? undefined,
    });

    sessionStorage.removeItem('signup_email');
    sessionStorage.removeItem('signup_password');

    // 2. Check accountsetup status → redirect accordingly
    const redirectTo = await checkAccountStatus();
    router.replace(redirectTo);

  } catch (err: any) {
    console.error('Signup error:', err);
    
    // Check for email already exists error
    const errorMessage = err.message || '';
    if (
      errorMessage.toLowerCase().includes('email already exists') ||
      errorMessage.toLowerCase().includes('email already taken') ||
      errorMessage.toLowerCase().includes('email has already been taken') ||
      errorMessage.toLowerCase().includes('email already registered')
    ) {
      // Show the error message
      setError('This email is already registered. Redirecting to login...');
      
      // Clear session storage
      sessionStorage.removeItem('signup_email');
      sessionStorage.removeItem('signup_password');
      
      // Wait 3 seconds then redirect to login
      setTimeout(() => {
        router.replace('/auth/login?error=email_exists');
      }, 3000);
    } else {
      setError(errorMessage || 'Unable to create account. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  const isSubmitDisabled = usernameStatus !== 'available' || !formData.fullName.trim() || loading;

  useEffect(() => {
    return () => { if (usernameTimeout.current) clearTimeout(usernameTimeout.current); };
  }, []);

  return (
    <>
      {/* Step Counter */}
      <div className="flex justify-end mb-4 px-2">
        <span className="text-sm font-semibold text-gray-600">2 of 2</span>
      </div>

      {/* Progress Bar */}
      <div className="flex justify-center mb-16 px-2">
        <div className="w-full max-w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-cyan-400 h-full transition-all duration-300 rounded-full" style={{ width: '100%' }} />
        </div>
      </div>

      <div className="w-full max-w-[520px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-3">Set up Profile!</h1>
          <p className="text-gray-500 text-base">Create your unique fitness identity</p>
        </div>

        {/* Avatar Upload */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                </svg>
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-500 transition-colors shadow-lg">
              <Camera size={20} color="white" />
            </label>
            <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-black mb-2">Full Name</label>
            <input
              type="text" id="fullName" name="fullName" value={formData.fullName}
              onChange={handleChange} placeholder="Enter your Name" disabled={loading} required
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
            />
          </div>

          {/* Username */}
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
      disabled={loading}
      required
      autoComplete="off"
      className={`w-full px-5 py-4 bg-white border rounded-xl focus:outline-none text-gray-900 placeholder:text-gray-400 disabled:opacity-50 transition-colors
        ${usernameStatus === 'taken' ? 'border-red-500 focus:ring-red-400' : ''}
        ${usernameStatus === 'available' ? 'border-green-500 focus:ring-green-400' : ''}
        ${usernameStatus === 'error' ? 'border-red-500 focus:ring-red-400' : ''}
        ${usernameStatus === 'idle' || usernameStatus === 'checking'
          ? 'border-gray-200 focus:ring-cyan-400'
          : ''}
        ${usernameStatus === 'taken' || usernameStatus === 'error' ? 'pr-5' : 'pr-14'}`} // ← reduced padding when no icon
      />
    
    {/* Only show icon for checking and success — no icon when taken/error */}
    {usernameStatus === 'checking' && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )}

    {usernameStatus === 'available' && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
        <Check size={18} color="white" />
      </div>
    )}

    {/* Removed: taken & error icons — no X mark inside input */}
  </div>

  {/* Feedback message below */}
  {usernameMessage && (
    <p
      className={`text-sm mt-2 flex items-center gap-1.5
        ${usernameStatus === 'available' ? 'text-green-600' : ''}
        ${usernameStatus === 'taken' ? 'text-red-600 font-medium' : ''}
        ${usernameStatus === 'error' ? 'text-amber-700' : ''}
        ${usernameStatus === 'checking' ? 'text-gray-500' : ''}
      `}
    >
      {usernameStatus === 'checking' && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {usernameStatus === 'available' && <Check size={14} />}
      {usernameStatus === 'taken' && <span className="text-red-600">!</span>} {/* small ! instead of big X */}
      {usernameStatus === 'error' && <span className="text-amber-700">!</span>}
      {usernameMessage}
    </p>
  )}
</div>
          {/* Submit */}
          <button
            type="submit" disabled={isSubmitDisabled}
            className={`w-full font-semibold text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md mt-4 flex items-center justify-center gap-2
              ${!isSubmitDisabled ? 'bg-[#6202AC] hover:bg-[#4e0288] text-white hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Account...
              </>
            ) : 'Continue'}
          </button>
        </form>
      </div>
    </>
  );
}
