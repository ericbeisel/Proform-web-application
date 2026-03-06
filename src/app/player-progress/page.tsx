'use client';

import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPlayerCardDetails } from '@/api/player-card/route';

interface ProgressItem {
  id: number;
  date: string;
  weight: string;
  smm: string;
  fat: string;
  score: number;
  status?: 'Complete' | 'Pending';
}

export default function PlayerProgress() {
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalScans: 0,
    weightChange: '0 lbs',
    currentScore: 0,
    improvement: 0,
    playerName: 'Shweta Gharge',
  });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        
        // Call your API endpoint
        const data = await getPlayerCardDetails();
        console.log('API Response:', data);
        
        // Transform API data to match your component's format
        // Adjust this mapping based on your actual API response structure
        const formattedData = data.map((item: any, index: number) => ({
          id: item.id || index + 1,
          date: item.date || 'N/A',
          weight: item.currentWeight ? `${item.currentWeight} lbs` : '0 lbs',
          smm: item.smm ? `${item.smm} lbs` : '0 lbs',
          fat: item.bodyFat ? `${item.bodyFat}%` : '0%',
          score: item.bodyCampScore || 0,
          status: item.status || 'Complete',
        }));

        setProgressData(formattedData);

        // Calculate stats from data
        if (formattedData.length > 0) {
          // Sort by date (assuming newest first)
          const sorted = [...formattedData].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          const latestScan = sorted[0];
          const oldestScan = sorted[sorted.length - 1];
          
          // Parse weight values (remove 'lbs' and convert to number)
          const latestWeight = parseFloat(latestScan.weight) || 0;
          const oldestWeight = parseFloat(oldestScan.weight) || 0;
          const weightDiff = (latestWeight - oldestWeight).toFixed(1);
          
          // Calculate score improvement
          const latestScore = latestScan.score || 0;
          const oldestScore = oldestScan.score || 0;
          const scoreDiff = latestScore - oldestScore;

          setStats({
            totalScans: formattedData.length,
            weightChange: `${weightDiff.startsWith('-') ? '' : '+'}${weightDiff} lbs`,
            currentScore: latestScore,
            improvement: scoreDiff,
            playerName: data[0]?.name || 'Shweta Gharge',
          });
        }

      } catch (err: any) {
        console.error('Error fetching progress:', err);
        setError(err.message || 'Failed to load progress data');
        
        // Fallback to dummy data if API fails
        setProgressData([
          {
            id: 4,
            date: '2/3/2026',
            weight: '67 lbs',
            smm: '52.4 lbs',
            fat: '18.2%',
            score: 85,
            status: 'Complete',
          },
          {
            id: 3,
            date: '1/15/2026',
            weight: '68.5 lbs',
            smm: '51.8 lbs',
            fat: '19.1%',
            score: 82,
            status: 'Complete',
          },
          {
            id: 2,
            date: '12/28/2025',
            weight: '69.2 lbs',
            smm: '51.2 lbs',
            fat: '20%',
            score: 79,
            status: 'Complete',
          },
        ]);
        
        setStats({
          totalScans: 3,
          weightChange: '-2.2 lbs',
          currentScore: 85,
          improvement: 6,
          playerName: 'Shweta Gharge',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#eef1f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading progress data...</p>
        </div>
      </main>
    );
  }

  // Show error state (optional - you can keep showing fallback data instead)
  if (error && progressData.length === 0) {
    return (
      <main className="min-h-screen bg-[#eef1f5] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef1f5] px-5 py-6 md:p-8">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Player Progress</h1>
            <p className="text-gray-500 text-xs md:text-sm">
              Track {stats.playerName}’s fitness journey
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <p className="text-gray-500 text-xs md:text-sm">Total Scans</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-1">{stats.totalScans}</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <p className="text-gray-500 text-xs md:text-sm">Weight Change</p>
          <p className={`text-2xl md:text-3xl font-bold mt-1 ${
            stats.weightChange.startsWith('-') ? 'text-green-500' : 
            stats.weightChange === '0 lbs' ? 'text-gray-500' : 'text-orange-500'
          }`}>
            {stats.weightChange}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <p className="text-gray-500 text-xs md:text-sm">Current Score</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-1">{stats.currentScore}</p>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm">
          <p className="text-gray-500 text-xs md:text-sm">Improvement</p>
          <p className={`text-2xl md:text-3xl font-bold mt-1 ${
            stats.improvement > 0 ? 'text-green-500' : 
            stats.improvement < 0 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {stats.improvement > 0 ? '+' : ''}{stats.improvement}
          </p>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="bg-white rounded-2xl shadow p-5 md:p-6">
        <h2 className="text-lg font-bold mb-4">Progress Timeline</h2>

        <div className="space-y-3">
          {progressData.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl p-4 flex items-center justify-between hover:shadow transition"
            >
              {/* LEFT SECTION */}
              <div className="flex items-center gap-4 flex-1">
                {/* ID Circle */}
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  #{item.id}
                </div>

                {/* Image Placeholder */}
                <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0" />

                {/* Content */}
                <div className="flex-1">
                  {/* Date and Status Row */}
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-sm md:text-base">{item.date}</p>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${
                      item.status === 'Complete' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.status || 'Complete'}
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-6 text-xs md:text-sm">
                    <div>
                      <span className="text-gray-500 block mb-0.5">Weight</span>
                      <div className="text-purple-600 font-semibold">{item.weight}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">SMM</span>
                      <div className="text-blue-600 font-semibold">{item.smm}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Body Fat</span>
                      <div className="text-orange-500 font-semibold">{item.fat}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Score</span>
                      <div className="text-purple-600 font-semibold">{item.score}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT ARROW */}
              <div className="text-purple-500 text-lg pl-4 flex-shrink-0">›</div>
            </div>
          ))}

          {/* PENDING CARD - only show if there's a pending scan in data */}
          {progressData.some(item => item.status === 'Pending') && (
            <div className="border rounded-xl p-4 flex items-center gap-4 opacity-65">
              <div className="w-10 h-10 rounded-full bg-purple-300 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                #1
              </div>

              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-lg flex-shrink-0">
                📅
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold text-sm">12/10/2025</p>
                  <span className="text-xs bg-gray-200 px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                <p className="text-xs text-gray-500">Scan not completed yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TIP */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 text-sm rounded-xl p-3.5 text-center">
        Keep uploading scans to see your progress!
      </div>
    </main>
  );
}