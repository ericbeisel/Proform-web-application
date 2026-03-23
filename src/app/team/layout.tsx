'use client';

import React, { useState } from 'react';
import { 
  Search, ChevronDown, Filter, Plus, Key, Menu, 
  X, Users, Calendar, Zap, CreditCard, Settings, Tv, 
  ChevronRight, LogOut 
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // --- States for Filtering ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recently_viewed');
  const [orgFilter, setOrgFilter] = useState('all');
  const [showPlayersOnly, setShowPlayersOnly] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isTeamsPage = pathname === '/team/teams';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Sticky Header --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          
          {/* Row 1: Title + Action Buttons + Hamburger */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">My Teams</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Manage all your teams in one place</p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push('/team/joiningCode')} 
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
              >
                <Key size={16} /> <span>Join</span>
              </button>
              <button 
                onClick={() => router.push('/team/createTeam')} 
                className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-purple-700 transition-all"
              >
                <Plus size={16} /> <span>Create</span>
              </button>
              
              {/* Hamburger Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 ml-1 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors border border-transparent hover:border-gray-200"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Row 2: Filters (Only visible on the main teams list) */}
          {isTeamsPage && (
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-50 pt-5">
              
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search teams..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm font-medium focus:border-purple-500 focus:outline-none transition-all" 
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-[10px] sm:text-xs font-black uppercase tracking-tight text-gray-700 outline-none hover:bg-gray-50 cursor-pointer"
                >
                  <option value="recently_viewed">Recently Viewed</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="date_created">Date Created</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              {/* Organisation Dropdown */}
              <div className="relative">
                <select 
                  value={orgFilter} 
                  onChange={(e) => setOrgFilter(e.target.value)} 
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-[10px] sm:text-xs font-black uppercase tracking-tight text-gray-700 outline-none hover:bg-gray-50 cursor-pointer"
                >
                  <option value="all">Filter by Organisation</option>
                
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              {/* Checkbox Toggle - Pinned Right */}
              <label className="flex items-center gap-2 cursor-pointer group ml-auto">
                <input 
                  type="checkbox" 
                  checked={showPlayersOnly} 
                  onChange={(e) => setShowPlayersOnly(e.target.checked)} 
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 accent-purple-600 cursor-pointer" 
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-purple-600 transition-colors whitespace-nowrap">
                  Show Player Generated Teams Only
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {React.isValidElement(children) && isTeamsPage
          ? React.cloneElement(children as React.ReactElement<any>, { 
              searchQuery, 
              sortBy, 
              orgFilter, 
              showPlayersOnly 
            })
          : children}
      </div>

      {/* --- Menu Modal (Based on reference image) --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-200">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">My Teams: Menu</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-lg">💰</span>
                    <span className="text-sm font-black text-purple-700 tracking-tighter">: 25 Pts</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Main Menu</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MenuItem icon={<Users size={18} />} label="Teams" />
                <MenuItem icon={<Calendar size={18} />} label="Queue List" />
                <MenuItem icon={<Zap size={18} />} label="Challenges" />
                <MenuItem icon={<Plus size={18} />} label="Create Team" />
                <MenuItem icon={<Settings size={18} />} label="My Preferences" />
                <MenuItem icon={<CreditCard size={18} />} label="Payments" />
              </div>

              {/* Special Connect TV Button */}
              <button className="w-full mt-4 flex items-center justify-between p-5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-2xl text-white transition-all shadow-lg shadow-purple-100 group">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><Tv size={20} /></div>
                  <span className="font-bold text-lg">Connect TV</span>
                </div>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Modal Footer Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button className="flex-1 py-3.5 bg-cyan-400 hover:bg-cyan-500 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-md active:scale-95">
                  Coach Login
                </button>
                <button className="flex-1 py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-md active:scale-95">
                  Creator
                </button>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 py-3.5 border border-gray-100 hover:bg-gray-50 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual menu cards
function MenuItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-200 hover:shadow-lg transition-all group text-left">
      <div className="flex items-center gap-3">
        <div className="bg-gray-50 p-2.5 rounded-xl text-gray-400 group-hover:text-purple-600 group-hover:bg-purple-50 transition-colors">
          {icon}
        </div>
        <span className="font-bold text-gray-700 group-hover:text-gray-900">{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-200 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
    </button>
  );
}