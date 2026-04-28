'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, X, User, Filter } from 'lucide-react';
import Link from 'next/link';

const clients = [
  { id: 1, name: "Alex Chen", team: "Elite Warriors FC", level: "Advanced", color: "#8B5CF6" },
  { id: 2, name: "Amanda Moore", team: "Power Lifters United", level: "Beginners", color: "#3B82F6" },
  { id: 3, name: "Chris Taylor", team: "CrossFit Champions", level: "Intermediate", color: "#8B5CF6" },
  { id: 4, name: "David Martinez", team: "Power Lifters United", level: "Intermediate", color: "#3B82F6" },
  { id: 5, name: "Emily Davis", team: "Velocity Track Team", level: "Intermediate", color: "#6366F1" },
  { id: 6, name: "Jessica Lee", team: "CrossFit Champions", level: "Beginners", color: "#8B5CF6" },
  { id: 7, name: "John Smith", team: "Elite Warriors FC", level: "Advanced", color: "#8B5CF6" },
  { id: 8, name: "Lisa White", team: "Velocity Track Team", level: "Advanced", color: "#3B82F6" },
  { id: 9, name: "Mike Williams", team: "Thunder Basketball", level: "Advanced", color: "#F97316" },
  { id: 10, name: "Rachel Brown", team: "Elite Warriors FC", level: "Advanced", color: "#8B5CF6" },
  { id: 11, name: "Sarah Johnson", team: "Elite Warriors FC", level: "Beginners", color: "#8B5CF6" },
  { id: 12, name: "Tom Anderson", team: "Thunder Basketball", level: "Beginners", color: "#F97316" },
];

export default function AdminItineraryManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All teams');

  const filteredClients = useMemo(() => {
    let result = [...clients];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.team.toLowerCase().includes(term)
      );
    }
    if (selectedTeam !== 'All teams') {
      result = result.filter(c => c.team === selectedTeam);
    }
    return result;
  }, [searchTerm, selectedTeam]);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100 sticky top-0 bg-white z-20">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 truncate mr-2">Admin Itinerary Manager</h1>
        <button className="p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0">
          <X size={18} />
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Select a Client</h2>
            <p className="text-gray-500 text-sm md:text-base mt-1">Click on a client to view and edit their itinerary</p>
          </div>
          <button className="bg-[#10B981] hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm active:scale-95 w-full sm:w-auto">
            <Plus size={18} strokeWidth={3} /> Create Group
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-50 text-base placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm font-semibold text-gray-500 px-1">
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <span>Filters:</span>
              </div>
              <select 
                className="bg-gray-50 border-none rounded-lg px-3 py-2 text-gray-600 focus:ring-2 focus:ring-blue-100 cursor-pointer text-sm"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option>All teams</option>
                <option>Elite Warriors FC</option>
                <option>Power Lifters United</option>
              </select>
              <select className="bg-gray-50 border-none rounded-lg px-3 py-2 text-gray-600 focus:ring-2 focus:ring-blue-100 cursor-pointer text-sm">
                <option>All Groups</option>
              </select>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-2 border-t md:border-none pt-3 md:pt-0">
              <span>Sort by:</span>
              <select className="bg-gray-50 border-none rounded-lg px-3 py-2 text-gray-600 focus:ring-2 focus:ring-blue-100 min-w-[100px] cursor-pointer text-sm">
                <option>Name</option>
                <option>Team</option>
              </select>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-8 font-bold uppercase tracking-widest px-1">
          Showing {filteredClients.length} of {clients.length} clients
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-12">
          {filteredClients.map((client) => (
            <Link 
              href={`/admin-itinerary/${client.id}`} 
              key={client.id} 
              className="flex flex-col items-center group cursor-pointer text-center transition-transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center mb-3 bg-[#6c3fef15]">
                <div 
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110 duration-300"
                  style={{ 
                    background: `linear-gradient(to bottom, #6c3fef 0%, #4f28c5 100%)`
                  }}
                >
                  <User size={22} className="text-white/95" strokeWidth={2.5} />
                </div>
              </div>

              <h3 className="font-bold text-sm md:text-base text-gray-900 leading-tight line-clamp-1 w-full px-1">{client.name}</h3>
              <p className="text-gray-500 text-xs mt-1 mb-3 leading-tight px-1 line-clamp-1 w-full">{client.team}</p>
              
              <div className="flex flex-col items-center w-full max-w-[75px]">
                <span 
                  className="text-[10px] font-black uppercase tracking-wider mb-1.5"
                  style={{ color: client.color }}
                >
                  {client.level}
                </span>
                <div 
                  className="h-[4px] w-full rounded-full"
                  style={{ backgroundColor: `${client.color}25` }}
                >
                    <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                            backgroundColor: client.color,
                            width: client.level === 'Advanced' ? '100%' : client.level === 'Intermediate' ? '65%' : '35%'
                        }}
                    />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}