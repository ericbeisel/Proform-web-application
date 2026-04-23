"use client";

import { useState } from "react";
import { ArrowLeft, X, Circle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HydrationCompletion() {
  const router = useRouter();
  
  const [selectedOption, setSelectedOption] = useState<string>("choice1");

  const handleSaveRecovery = () => {
    if (selectedOption === "new") {
       localStorage.setItem('showItineraryMessage', 'true');
       router.push('/hydration/hydrationDashboard');
    } else if (selectedOption) {
       router.push('/hydration/hydrationDashboard');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f0f4f8] flex flex-col">
      
      {/* HEADER - Kept as requested */}
      <div className="w-full bg-purple-600 px-6 sm:px-8 py-4 sm:py-5 flex-shrink-0">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 border-none rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all"
            >
              <ArrowLeft size={18} color="white" />
            </button>
            <div>
              <div className="text-white font-extrabold text-lg sm:text-xl leading-tight">Hydration Completion</div>
              <div className="text-white/80 text-xs sm:text-sm mt-0.5">Save your completed session</div>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 border-none rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all"
          >
            <X size={18} color="white" />
          </button>
        </div>
      </div>

      {/* BODY - Matched to Screenshot */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-sm p-8 sm:p-12 flex flex-col items-center">
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 text-center mb-4">
            Hydration Completion
          </h2>
          
          <p className="text-gray-500 text-center text-sm sm:text-base leading-relaxed mb-10 max-w-md">
            Choose how you want to save your completed Recovery Session on your itinerary page
          </p>

          {/* TOP CHOICE BOX */}
          <div className="w-full bg-[#f8fafc] rounded-3xl p-6 sm:p-8 border border-gray-50 flex flex-col items-center mb-8">
            <p className="text-gray-500 text-xs sm:text-sm text-center mb-6">
              Get credit towards one of your scheduled hydration sessions<br/>(Choose One):
            </p>

            <div className="w-full max-w-xs space-y-4 mb-8">
              {/* Choice 1 */}
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setSelectedOption("choice1")}
              >
                {selectedOption === "choice1" ? (
                  <CheckCircle2 className="text-[#00b4d8] fill-[#00b4d8] bg-white rounded-full" size={24} />
                ) : (
                  <Circle className="text-gray-300" size={24} />
                )}
                <span className={`font-bold text-sm sm:text-base ${selectedOption === "choice1" ? "text-gray-800" : "text-gray-500"}`}>
                  Choice 1
                </span>
              </div>

              {/* Choice 2 */}
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setSelectedOption("choice2")}
              >
                {selectedOption === "choice2" ? (
                  <CheckCircle2 className="text-[#00b4d8] fill-[#00b4d8] bg-white rounded-full" size={24} />
                ) : (
                  <Circle className="text-gray-300" size={24} />
                )}
                <span className={`font-bold text-sm sm:text-base ${selectedOption === "choice2" ? "text-gray-800" : "text-gray-500"}`}>
                  Choice 2
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveRecovery}
              disabled={selectedOption === "new"}
              className={`w-full max-w-sm py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
                selectedOption === "new" ? "bg-gray-300 cursor-not-allowed" : "bg-[#4a5568] hover:bg-[#3d4654] active:scale-[0.98]"
              }`}
            >
              Save Recovery
            </button>
          </div>

          {/* OR DIVIDER */}
          <div className="w-full flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-gray-100"></div>
            <span className="font-black text-gray-800 text-sm italic uppercase tracking-widest">or</span>
            <div className="h-[1px] flex-1 bg-gray-100"></div>
          </div>

          {/* BOTTOM CHOICE */}
          <div className="w-full flex flex-col items-center">
            <p className="text-gray-500 text-xs sm:text-sm text-center mb-6 max-w-xs">
              Save as a new hydration session, which will not affect your Hydration Completion this week:
            </p>

            <button
              onClick={() => {
                setSelectedOption("new");
                localStorage.setItem('showItineraryMessage', 'true');
                router.push('/hydration/hydrationDashboard');
              }}
              className="w-full max-w-xs bg-gradient-to-r from-[#6e22e5] to-[#9d50ff] text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-purple-200 transition-all active:scale-[0.98]"
            >
              Create a New One
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}