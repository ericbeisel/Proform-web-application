"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Flame, Sparkles, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

const MOCK_FOODS: FoodItem[] = [
  { id: "1", name: "Grilled Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100g" },
  { id: "2", name: "Brown Rice (Cooked)", calories: 112, protein: 2.6, carbs: 23, fat: 0.9, serving: "100g" },
  { id: "3", name: "Whole Egg (Boiled)", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, serving: "1 large" },
  { id: "4", name: "Avocado", calories: 160, protein: 2, carbs: 8.5, fat: 15, serving: "100g" },
  { id: "5", name: "Whey Protein Shake", calories: 120, protein: 24, carbs: 3, fat: 1.5, serving: "1 scoop" },
  { id: "6", name: "Sweet Potato (Baked)", calories: 90, protein: 2, carbs: 21, fat: 0.2, serving: "100g" },
];

export default function MacrosSearchPage() {
  const router = useRouter();
  const [macroImage, setMacroImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loggedItems, setLoggedItems] = useState<FoodItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("MacroDetails");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.uploadImage) {
            setMacroImage(parsed.uploadImage);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogFood = (item: FoodItem) => {
    setLoggedItems((prev) => [...prev, item]);
    showToast(`Logged ${item.name}!`);
  };

  const handleRemoveLog = (index: number) => {
    const removed = loggedItems[index];
    setLoggedItems((prev) => prev.filter((_, idx) => idx !== index));
    showToast(`Removed ${removed.name}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const totalCalories = loggedItems.reduce((acc, item) => acc + item.calories, 0);
  const totalProtein = loggedItems.reduce((acc, item) => acc + item.protein, 0);
  const totalCarbs = loggedItems.reduce((acc, item) => acc + item.carbs, 0);
  const totalFat = loggedItems.reduce((acc, item) => acc + item.fat, 0);

  const filteredFoods = MOCK_FOODS.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-8 md:px-10 md:py-12 font-sans relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles size={16} className="text-yellow-400" />
          {toastMessage}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-all border border-gray-100"
            >
              <ArrowLeft size={20} className="text-gray-700" strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Search Macros</h1>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Log food & calculate calories
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Search & Food List */}
          <div className="lg:col-span-7 space-y-6">
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search food database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-3.5 text-sm shadow-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* Food items */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4">Matches</h2>
              <div className="space-y-4">
                {filteredFoods.map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{food.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Serving: {food.serving} &bull; P: {food.protein}g &bull; C: {food.carbs}g &bull; F: {food.fat}g
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-600 bg-gray-200/60 px-2.5 py-1 rounded-lg">
                        {food.calories} kcal
                      </span>
                      <button
                        onClick={() => handleLogFood(food)}
                        className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Preview & Logging Summary */}
          <div className="lg:col-span-5 space-y-6">
            {/* Image Preview Box */}
            {macroImage && (
              <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Meal Highlight Photo</p>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                  <img src={macroImage} alt="Meal Highlight" className="h-full w-auto object-contain" />
                  <button
                    onClick={() => {
                      sessionStorage.removeItem("MacroDetails");
                      setMacroImage(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Nutrition Breakdown */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={20} className="text-orange-400" />
                <h2 className="text-base font-bold">Nutrition Summary</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-2xl p-3.5">
                  <p className="text-[10px] uppercase font-bold text-white/60">Calories</p>
                  <p className="text-2xl font-black mt-1">{totalCalories} <span className="text-xs font-normal">kcal</span></p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3.5">
                  <p className="text-[10px] uppercase font-bold text-white/60">Protein</p>
                  <p className="text-2xl font-black mt-1">{totalProtein}g</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3.5">
                  <p className="text-[10px] uppercase font-bold text-white/60">Carbs</p>
                  <p className="text-2xl font-black mt-1">{totalCarbs}g</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3.5">
                  <p className="text-[10px] uppercase font-bold text-white/60">Fat</p>
                  <p className="text-2xl font-black mt-1">{totalFat}g</p>
                </div>
              </div>

              {/* Logged foods list */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">Logged Items</h3>
                {loggedItems.length === 0 ? (
                  <p className="text-xs text-white/40 italic">No food items logged for this highlight yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {loggedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 text-xs">
                        <span>{item.name} ({item.serving})</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{item.calories} kcal</span>
                          <button
                            onClick={() => handleRemoveLog(idx)}
                            className="p-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
