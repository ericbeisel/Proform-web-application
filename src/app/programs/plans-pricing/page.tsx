'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, Crown, Zap, Users, CreditCard, LogOut } from 'lucide-react';

export default function AccessRestrictedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      
      {/* Header - Now contains all utility navigation */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Back to site */}
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-[#6C3AE8] transition-colors group flex-1"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-wider hidden sm:inline">Back to site</span>
            <span className="text-sm font-bold uppercase tracking-wider sm:hidden">Back</span>
          </button>
          
          {/* Middle: Logo (Absolute Centered) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <button onClick={() => router.push('/')} className="hover:opacity-80 transition block">
              <img 
                src="/images/proform-logo.jpg" 
                alt="Proform Logo" 
                className="w-8 h-8 md:w-9 md:h-9 object-contain"
              />
            </button>
          </div>
          
          {/* Right: Switch Accounts */}
          <div className="flex-1 flex justify-end">
            <button 
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 text-[#6C3AE8] hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
            >
              <LogOut size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Switch Account</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-12 md:py-20">
        
        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl border border-gray-50">
            <Lock size={32} className="text-[#6C3AE8]" />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-[#6C3AE8] italic tracking-tight mb-2 uppercase">
            You're almost there!
          </h1>
          <p className="text-base md:text-lg font-bold text-gray-300 italic">
            #TrainWithThePros
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: <Zap size={18} />, label: "Full Access" },
            { icon: <Users size={18} />, label: "Community" },
            { icon: <CreditCard size={18} />, label: "Pro Plans" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-[#6C3AE8] mb-2 flex justify-center">{item.icon}</div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 text-center max-w-sm mx-auto mb-10 leading-relaxed font-medium">
          Get a pricing plan to access this page. Complete your purchase to join the marketplace and community today.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            onClick={() => router.push('/pricing')}
            className="w-full bg-[#6C3AE8] hover:bg-[#5B2AC7] text-white py-4 rounded-xl font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-purple-200 active:scale-[0.98]"
          >
            Explore Plans
          </button>

          <button 
            onClick={() => router.push('/all-options')}
            className="w-full bg-white border-2 border-gray-200 text-gray-900 hover:border-[#6C3AE8] hover:text-[#6C3AE8] py-4 rounded-xl font-black uppercase tracking-[0.15em] transition-all active:scale-[0.98]"
          >
            More Plan Options
          </button>
        </div>

        {/* Minimalist Footer Note */}
        <p className="mt-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Secure Checkout • Instant Access
        </p>
      </div>
    </div>
  );
}