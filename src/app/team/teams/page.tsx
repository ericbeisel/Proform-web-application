"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Crown,
  Users,
  MoreVertical,
  Loader2,
  ArrowRight,
  Search,
  Zap,
  Key,
  Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getTeamsList, Team } from '@/api/create-team/route';

interface TeamsPageProps {
  searchQuery?: string;
}

export default function TeamsPage({ searchQuery = "" }: TeamsPageProps) {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await getTeamsList();
        setTeams(response.data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    return teams.filter(team =>
      team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teams, searchQuery]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#7c3aed]" size={40} />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="min-h-[80vh] bg-gray-50 px-4 py-10 md:px-8 lg:px-12 animate-in fade-in duration-700">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="text-center md:text-left">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">
              Get Started with Teams
            </h2>
            <p className="text-[10px] md:text-sm text-gray-500 mt-1">
              Join your teammates or create a team to track progress together
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div
              onClick={() => router.push('/team/createTeam')}
              className="group relative flex min-h-[250px] cursor-pointer flex-col justify-center rounded-[2rem] border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-purple-300 hover:shadow-xl active:scale-[0.98]"
            >
              <div className="mb-4 flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-[#6202AC] transition-colors group-hover:bg-purple-200">
                  <Plus size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2.5">
                    <h3 className="text-sm md:text-base font-bold text-gray-900">Create a Team</h3>
                    <span className="rounded-full bg-[#6202AC] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed">
                    Start your own team and invite friends, colleagues, or family members to join you.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <div className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-[10px] font-bold text-[#6202AC]">
                  <Crown size={12} /> Team Leader
                </div>
              </div>
            </div>

            <div
              onClick={() => router.push('/team/joiningCode')}
              className="group relative flex min-h-[250px] cursor-pointer flex-col justify-center rounded-[2rem] border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl active:scale-[0.98]"
            >
              <div className="mb-4 flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 transition-colors group-hover:bg-cyan-200">
                  <Search size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2">Join a Team</h3>
                  <p className="text-[10px] md:text-sm text-gray-500 leading-relaxed">
                    Enter a joining code from your coach or team leader to become part of an existing team.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-[10px] font-bold text-cyan-700 w-fit">
                <Key size={12} /> Have a Code?
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 sm:px-0 font-sans">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="group flex flex-col rounded-[2rem] border border-gray-100 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-xl hover:border-purple-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-white shadow-md transition-transform group-hover:scale-110 ${getAvatarBg(team.id)}`}>
                  <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight">
                      {team.name ?? "N/A"}
                    </h3>
                    {team.individual === "0" && <Crown size={14} className="text-amber-400" />}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-[#7c3aed]">
                      {team.individual === "1" ? "Player" : "Coach"}
                    </span>
                  </div>
                </div>
              </div>
              {team.number && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff5c00] text-[10px] font-bold text-white ring-4 ring-orange-50">
                  {team.number}
                </div>
              )}
            </div>

            {/* FIXED GAP: Changed mt-8 to mt-5 */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50/80 px-4 py-2.5 text-[10px] md:text-xs text-gray-500 font-bold">
                <Users size={14} className="text-gray-400" />
                <span>{(team as any).member_count ?? "0"} members</span>
              </div>
            </div>

            {/* FIXED GAP: Changed mt-8 to mt-5 */}
            <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4">
              <button
                onClick={() => router.push(`/team-dashboard`)}
                className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-[#7c3aed] hover:gap-3 transition-all uppercase tracking-tight"
              >
                View Dashboard <ArrowRight size={14} />
              </button>
              <button className="h-8 w-8 flex items-center justify-center rounded-full text-gray-300 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 mt-6">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs px-4">
            No teams match "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}

function getAvatarBg(id: string) {
  const themes = ['bg-[#7c3aed]', 'bg-[#0ea5e9]', 'bg-[#f97316]', 'bg-[#10b981]', 'bg-[#ec4899]'];
  const cleanId = parseInt(id) || 0;
  return themes[cleanId % themes.length];
}