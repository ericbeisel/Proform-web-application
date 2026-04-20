// src/app/organization/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Users, Calendar, Dumbbell, Award, Star, TrendingUp, 
  Search, ChevronRight, BookOpen, User, Target, Zap, Heart,
  Eye, ShoppingBag, Clock, Filter
} from "lucide-react";

// Dummy data for different organizations
const organizationData: Record<string, any> = {
  "ERB": {
    name: "ERICBEISEL.COM",
    founder: "Eric Beisel",
    description: "Designed by pro-athlete trainer and ProformApp CEO Eric Beisel. Train with one of the best trainers of the century, with over 70,000 hours of in-person training with pro athletes, celebrities and elite business professionals.",
    totalPrograms: 24,
    combinedWorkouts: 0,
    workoutsThisYear: 0,
    totalSubscribers: 1310,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
    badge: "👑",
    contributors: [
      { name: "Paige Hathaway", role: "Fitness Model & Trainer", image: "" },
      { name: "Eric Beisel", role: "CEO & Head Trainer", image: "" },
      { name: "Clay Harbor", role: "Former NFL Player", image: "" },
      { name: "Ryan Sorensen", role: "Performance Coach", image: "" },
      { name: "shubhamstripeisgn", role: "Contributor", image: "" },
      { name: "Coach Eric", role: "Head Coach", image: "" },
    ],
    featuredPrograms: [
      { id: "1", title: "BOMB-SHELL", specialty: "SPECIALTY AT THE TOP", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", workouts: 18 },
      { id: "2", title: "POWER COUPLE", specialty: "10", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80", workouts: 10 },
      { id: "3", title: "TEAM TRANSFORMATION", specialty: "10", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", workouts: 10 },
      { id: "4", title: "VICE", specialty: "6", image: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&q=80", workouts: 6 },
    ]
  },
  "OPM": {
    name: "Optimal Performance Methods",
    founder: "Dr. Pat Ivey",
    description: "Designed by elite performance coaches and ProformApp's top trainers.",
    totalPrograms: 47,
    combinedWorkouts: 823,
    workoutsThisYear: 156,
    totalSubscribers: 8742,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    badge: "🏆",
    contributors: [
      { name: "Dr. Pat Ivey", role: "Performance Director", image: "" },
      { name: "Eric Beisel", role: "Performance Coach", image: "" },
      { name: "Kurt Schmidt", role: "Performance Director", image: "" },
    ],
    featuredPrograms: [
      { id: "5", title: "POWER PREP", specialty: "POWER", image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80", workouts: 12 },
      { id: "6", title: "INTER-EXPLOSIVE", specialty: "EXPLOSIVE", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80", workouts: 8 },
    ]
  }
};

export default function OrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const orgId = params.id as string;
  
  const org = organizationData[orgId] || organizationData["ERB"];

  const filteredPrograms = org.featuredPrograms.filter((p: any) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition-colors">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-extrabold text-gray-900">{org.name}</h1>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        <img 
          src={org.image} 
          alt={org.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl md:text-4xl">{org.badge}</span>
            <h1 className="text-white text-2xl md:text-3xl font-extrabold">{org.name}</h1>
          </div>
          <p className="text-white/80 text-sm max-w-2xl line-clamp-2">{org.description}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-2xl md:text-3xl font-extrabold text-purple-600">{org.totalPrograms}</p>
            <p className="text-xs text-gray-500">Total Programs</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-2xl md:text-3xl font-extrabold text-purple-600">{org.combinedWorkouts.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Combined Workouts</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-2xl md:text-3xl font-extrabold text-purple-600">{org.workoutsThisYear.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Workouts Created this Year</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-2xl md:text-3xl font-extrabold text-purple-600">{org.totalSubscribers.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Subscribers</p>
          </div>
        </div>

        {/* Authors and Contributors */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-purple-600" />
            <h2 className="font-bold text-gray-900">Authors and Contributors</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            See who writes and builds programs and workouts of this franchise
          </p>
          <div className="flex flex-wrap gap-3">
            {org.contributors.map((contributor: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  {contributor.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700">{contributor.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Programs */}
        <div className="mb-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Featured Programs</h2>
          <p className="text-sm text-gray-500 mb-4">Check out these popular and new programs</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {org.featuredPrograms.slice(0, 4).map((program: any) => (
              <div 
                key={program.id}
                onClick={() => router.push(`/programs/${program.id}`)}
                className="group bg-white rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={program.image} 
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-extrabold text-sm text-gray-900">{program.title}</h3>
                  {program.specialty && (
                    <p className="text-xs text-purple-600 font-semibold mt-1">{program.specialty}</p>
                  )}
                  {program.workouts && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Dumbbell size={10} />
                      <span>{program.workouts} workouts</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Programs Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-900 mb-2">All Programs</h2>
          <p className="text-sm text-gray-500 mb-4">Search All Programs in this Franchise</p>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Program List */}
          <div className="space-y-3">
            {filteredPrograms.map((program: any) => (
              <div 
                key={program.id}
                onClick={() => router.push(`/programs/${program.id}`)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Dumbbell size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{program.title}</p>
                    <p className="text-xs text-gray-500">{program.workouts} workouts</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            ))}
          </div>

          {filteredPrograms.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No programs found</p>
            </div>
          )}
        </div>

        {/* Program Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {org.featuredPrograms.slice(0, 3).map((program: any) => (
            <div key={program.id} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-extrabold text-purple-600">{program.workouts}</p>
              <p className="text-xs text-gray-500">{program.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}