'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login:', formData);
  };

  return (
    <>
      {/* Step Counter */}
      <div className="flex justify-end mb-4 px-2">
        <span className="text-sm font-semibold text-gray-600">1 of 2</span>
      </div>

      {/* Progress Bar - Centered with equal spacing */}
      <div className="flex justify-center mb-16 px-2">
        <div className="w-full max-w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-cyan-400 h-full transition-all duration-300 rounded-full" 
            style={{ width: '50%' }} // 1 of 2 steps
          />
        </div>
      </div>

      {/* Welcome Text */}
      <div className="w-full max-w-[520px] mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-black mb-3">
          Welcome Back!
        </h1>
        <p className="text-gray-500 text-base">
          Log in to continue your journey
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5 px-4">
        {/* Email Field */}
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

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
            Password*
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6202AC] focus:border-transparent text-gray-900 placeholder:text-gray-400"
            required
          />
        </div>

        {/* Terms and Conditions */}
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

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-[#6202AC] hover:bg-[#4e0288] text-white font-semibold text-lg py-4 px-6 rounded-full transition-all duration-200 shadow-md hover:shadow-lg mt-8"
        >
          Log In
        </button>
      </form>

      {/* Sign Up Link */}
      <p className="text-center text-gray-600 text-sm mt-8">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-[#2233ee] hover:text-[#0015fb] font-semibold">
          Sign Up
        </Link>
      </p>
      </div>
    </>
  );
}