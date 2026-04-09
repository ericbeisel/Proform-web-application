"use client";

import { useState } from "react";
import { ArrowLeft, X, CheckCircle, Circle, Plus, Calendar, Droplet, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HydrationCompletion() {
  const router = useRouter();
  
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [saveAsNew, setSaveAsNew] = useState(false);

  const completionOptions = [
    {
      id: "choice1",
      title: "Choice 1",
      description: "Get credit towards your scheduled 8 AM hydration session",
      time: "8:00 AM",
      amount: "16 oz"
    },
    {
      id: "choice2",
      title: "Choice 2",
      description: "Get credit towards your scheduled 12 PM hydration session",
      time: "12:00 PM",
      amount: "24 oz"
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#f0f4f8]">
      
      {/* HEADER */}
      <div className="w-full bg-purple-600 px-6 sm:px-8 py-4 sm:py-5">
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
              <div className="text-white/80 text-xs sm:text-sm mt-0.5">Choose how you want to save your completed session</div>
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

      {/* BODY */}
      <div className="w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        
        {/* Subtitle */}
        <div className="mb-6 text-center">
          <p className="text-gray-600 text-sm sm:text-base">
            Get credit towards one of your scheduled hydration sessions:
          </p>
        </div>

        {/* Options Cards */}
        <div className="space-y-4 mb-8">
          {completionOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => {
                setSelectedOption(option.id);
                setSaveAsNew(false);
              }}
              className={`bg-white rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ${
                selectedOption === option.id && !saveAsNew
                  ? "border-2 border-purple-500 shadow-lg"
                  : "border border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {selectedOption === option.id && !saveAsNew ? (
                    <CheckCircle size={22} className="text-purple-600" />
                  ) : (
                    <Circle size={22} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-gray-800 text-base sm:text-lg">
                    {option.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {option.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{option.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplet size={14} className="text-blue-400" />
                      <span className="text-xs text-gray-500">{option.amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* OR Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative bg-[#f0f4f8] px-4">
            <span className="text-gray-400 text-sm font-medium">or</span>
          </div>
        </div>

        {/* Save as New Option */}
        <div
          onClick={() => {
            setSaveAsNew(true);
            setSelectedOption("");
          }}
          className={`bg-white rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ${
            saveAsNew
              ? "border-2 border-purple-500 shadow-lg"
              : "border border-gray-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {saveAsNew ? (
                <CheckCircle size={22} className="text-purple-600" />
              ) : (
                <Circle size={22} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-gray-800 text-base sm:text-lg">
                Save as a new hydration session
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                This will not affect your Hydration Completion this week
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Plus size={14} className="text-green-500" />
                <span className="text-xs text-gray-500">New independent session</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
<div className="mt-8">
  <button
    onClick={() => {
      if (saveAsNew) {
        console.log("Saved as a new hydration session!");
        // Store flag in localStorage
        localStorage.setItem('showItineraryMessage', 'true');
        router.push('/hydration/hydrationDashboard');
      } else if (selectedOption) {
        const selected = completionOptions.find(opt => opt.id === selectedOption);
        console.log(`Credit applied to ${selected?.title}!`);
        router.push('/hydration/hydrationDashboard');
      } else {
        alert("Please select an option to continue");
        return;
      }
    }}
    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all hover:-translate-y-0.5"
  >
    Save as New One
  </button>
</div>  

        {/* Info Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Select one option to continue
          </p>
        </div>
      </div>
    </div>
  );
}