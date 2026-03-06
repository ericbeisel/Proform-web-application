// app/dashboard/page.tsx
"use client"

import { useState } from 'react'

import DashboardHeader from './components/DashboardHeader'
import Banner from './components/Banner'
import ItineraryCard from './components/ItineraryCard'
import ForYouCard from './components/ForYouCard'
import AccountabilityTools from './components/AccountabilityTools'
import StandardsCard from './components/StandardsCard'
import LiveSessionsCard from './components/LiveSessionsCard'
import DailyTodoCard from './components/DailyTodoCard'
import ChallengesCard from './components/ChallengesCard'
import WeeklyTargets from './components/WeeklyTargets'
import QuickActions from './components/QuickActions'

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('Home')

  return (
    <div className="min-h-screen bg-[#f0eff4] text-[#1a1825] antialiased">
      <DashboardHeader activeNav={activeNav} setActiveNav={setActiveNav} />

      <main className="p-7 px-8 flex flex-col gap-6">
        <Banner />

        <div className="grid grid-cols-[280px_1fr_280px] gap-5">
          <ItineraryCard />

          <div className="space-y-5">
            <ForYouCard />
            <AccountabilityTools />
            <StandardsCard />
          </div>

          <div className="space-y-5">
            <LiveSessionsCard />
            <DailyTodoCard />
            <ChallengesCard />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <WeeklyTargets />
          <QuickActions />
        </div>
      </main>
    </div>
  )
}