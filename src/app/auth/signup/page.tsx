'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';           // ← add this import

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);   // ← new state

  // Prefill email when arriving from an invite/sign link (e.g. ?email=...&name=...)
  useEffect(() => {
    const invitedEmail = searchParams.get('email');
    if (invitedEmail) {
      setFormData((prev) => ({ ...prev, email: invitedEmail }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {                    // ← new function
    setShowPassword(prev => !prev);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Trim and store
    sessionStorage.setItem('signup_email', formData.email.trim());
    sessionStorage.setItem('signup_password', formData.password.trim());

    router.replace('/auth/profile');
  };

  return (
    <>
      <div className="flex justify-end mb-4 px-2">
        <span className="text-sm font-semibold text-gray-600">1 of 2</span>
      </div>

      <div className="flex justify-center mb-16 px-2">
        <div className="w-full max-w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-cyan-400 h-full transition-all duration-300 rounded-full"
            style={{ width: '50%' }}
          />
        </div>
      </div>

      <div className="w-full max-w-[520px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-3">Create Account!</h1>
          <p className="text-gray-500 text-base">Start your fitness journey today</p>
        </div>

        {error && (
          <div className="mx-4 mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 px-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
              Email*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="abcd1234@email.com"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          {/* Password field with eye toggle */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
              Password*
            </label>
            <div className="relative">                                 {/* ← wrapper */}
              <input
                type={showPassword ? 'text' : 'password'}               // ← toggle type
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-900 placeholder:text-gray-400 pr-12"  // ← added pr-12
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-[#6202AC] focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <input
              type="checkbox"
              id="terms"
              className="mt-0.5 w-4 h-4 text-[#6202AC] border-gray-300 rounded focus:ring-[#6202AC]"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-[#8B5CF6] hover:text-[#6202AC]">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#8B5CF6] hover:text-[#6202AC]">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#6202AC] hover:bg-[#4e0288] text-white font-semibold text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg mt-8"
          >
            Continue
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-8">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#2247ee] hover:text-[#0625d4] font-semibold">
            Log In
          </Link>
        </p>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
