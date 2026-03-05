// app/teams/page.tsx    or   wherever you placed this component

'use client';

import React from 'react';
import { Plus, Search, Crown, Zap, Key, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeamsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-8 lg:px-12">
      <div className="mx-auto max-w-full space-y-10">
        {/* Header */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Get Started with Teams
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Join your teammates or create a team to track progress together
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Team Card */}
          <div
            onClick={() => router.push('/team/createTeam')}
            className="group relative flex h-[320px] cursor-pointer flex-col justify-center rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-purple-300 hover:shadow-xl active:scale-[0.98]"
          >
            <div className="mb-6 flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-[#6202AC] transition-colors group-hover:bg-purple-200">
                <Plus size={32} strokeWidth={2.5} />
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2.5">
                  <h3 className="text-2xl font-bold text-gray-900">Create a Team</h3>
                  <span className="rounded-full bg-[#6202AC] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Recommended
                  </span>
                </div>
                <p className="text-base leading-relaxed text-gray-600">
                  Start your own team and invite up to 15 friends, colleagues, or family members to join you.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold text-[#6202AC]">
                <Crown size={14} />
                Team Leader
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold text-[#6202AC]">
                <Zap size={14} />
                Quick Setup
              </div>
            </div>

            {/* Optional subtle overlay on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50/0 to-purple-100/0 opacity-0 transition-opacity group-hover:opacity-40" />
          </div>

          {/* Join Team Card */}
          <div
            onClick={() => router.push('/team/joiningCode')}
            className="group relative flex h-[320px] cursor-pointer flex-col justify-center rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-cyan-300 hover:shadow-xl active:scale-[0.98]"
          >
            <div className="mb-6 flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 transition-colors group-hover:bg-cyan-200">
                <Search size={32} strokeWidth={2.5} />
              </div>

              <div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">Join a Team</h3>
                <p className="text-base leading-relaxed text-gray-600">
                  Enter a joining code from your coach or team leader to become part of an existing team.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold text-cyan-700">
                <Key size={14} />
                Have a Code?
              </div>
            </div>

            {/* Optional subtle overlay on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-50/0 to-cyan-100/0 opacity-0 transition-opacity group-hover:opacity-40" />
          </div>
        </div>

        {/* Why join teams info box */}
        <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-7">
          <div className="flex gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[#6202AC]">
              <Info size={20} />
            </div>

            <div>
              <h4 className="mb-2 text-lg font-bold text-gray-900">
                Why join or create a team?
              </h4>
              <p className="text-gray-700">
                Teams let you share stats, compete in challenges, track group progress, and stay
                motivated together. Perfect for gyms, sports teams, CrossFit boxes, running crews,
                or just workout buddies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}