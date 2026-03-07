// app/dashboard/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { dashboardApi, DashboardSummary } from '@/api/dashboard/route'

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
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

// app/dashboard/page.tsx - Update the fetch function

useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('📡 Fetching dashboard data...')
      
      const data = await dashboardApi.getDashboardSummary()
      
      // 🔍 DEBUG: Log the entire data object
      console.log('✅ Dashboard data received:', data)
      
      // Log each section to verify
      console.log('👤 User:', data.userName, data.userEmail)
      console.log('⚖️ Weight:', data.currentWeight, data.measurementUnit)
      console.log('🎯 Weekly Targets:', data.weeklyTargets)
      console.log('💪 Strength Metrics:', data.strengthMetrics)
      console.log('🏋️ Training Goals:', data.trainingGoals)
      console.log('📊 Daily Steps:', data.dailySteps)
      console.log('🔥 Calories Goal:', data.caloriesGoal)
      
      setDashboardData(data)
      setError(null)
    } catch (err: any) {
      console.error('❌ Dashboard error:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  fetchDashboardData()
}, [])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0eff4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f0eff4] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0eff4] text-[#1a1825] antialiased">
      <DashboardHeader 
        activeNav={activeNav} 
        setActiveNav={setActiveNav} 
        userName={dashboardData?.userName}
      />

      <main className="p-7 px-8 flex flex-col gap-6">
        <Banner />

        <div className="grid grid-cols-[280px_1fr_280px] gap-5">
          <ItineraryCard />

          <div className="space-y-5">
            <ForYouCard 
              currentWeight={dashboardData?.currentWeight}
              goalWeight={dashboardData?.goalWeight}
              measurementUnit={dashboardData?.measurementUnit}
              trainingGoals={dashboardData?.trainingGoals}
            />
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
          <WeeklyTargets targets={dashboardData?.weeklyTargets} />
          <QuickActions />
        </div>
      </main>
    </div>
  )
}