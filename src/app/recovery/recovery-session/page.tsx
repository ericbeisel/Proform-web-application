"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getRecoveryRecords, RecoveryRecord } from "@/api/recovery/route";

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
};

export default function RecoverySessions() {
  const router = useRouter();
  const [records, setRecords] = useState<RecoveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch recovery records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await getRecoveryRecords(currentPage, 20);
        // The response has an 'items' array
        setRecords(response.items || []);
        setTotalPages(response.totalPages || 1);
        setTotalRecords(response.total || 0);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching recovery records:", err);
        setError(err.message || "Failed to load recovery sessions");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6 max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-200 transition-all duration-200"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Recovery Sessions
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl mt-1">
            Your past recovery sessions and activities
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-10 py-3 rounded-full text-sm font-semibold shadow-xl">
          {totalRecords} Total Sessions
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Session List */}
      <div className="space-y-5 max-w-5xl mx-auto">
        {records.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <p className="text-gray-500">No recovery sessions yet</p>
            <button
              onClick={() => router.push("/recovery/all-recovery-options")}
              className="mt-4 text-purple-600 font-semibold hover:underline"
            >
              Start your first recovery session →
            </button>
          </div>
        ) : (
          records.map((record) => {
            const formattedDate = formatDate(record.date || record.created_date);
            const recoveryName = record.recovery_title || record.title;
            const recoveryImage = record.recovery_zone?.image || record.images;
            
            return (
              <div
                key={record.id}
                className="group relative bg-white rounded-2xl p-5 flex items-center justify-between 
                  shadow-[0_20px_35px_-8px_rgba(0,0,0,0.2),0_5px_12px_-4px_rgba(0,0,0,0.1)]
                  hover:shadow-[0_25px_40px_-12px_rgba(0,0,0,0.25)]
                  hover:-translate-y-1.5 
                  transition-all duration-300 cursor-pointer"
                onClick={() =>
                  router.push(
                    `/recovery/${record.id}?title=${encodeURIComponent(recoveryName)}&time=${record.time_spent}&date=${encodeURIComponent(record.date || record.created_date)}&image=${encodeURIComponent(recoveryImage || "")}`,
                  )
                }
              >
                {/* Left - Text Content */}
                <div className="flex items-center gap-5 relative z-10">
                  {/* Image from recovery_zone or images */}
                  {recoveryImage && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                      <img
                        src={recoveryImage}
                        alt={recoveryName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Text */}
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      {formattedDate}
                    </p>
                    <p className="font-bold text-gray-800 text-xl mt-1">
                      {recoveryName}
                    </p>
                    <p className="text-sm text-purple-600 font-bold mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                      {record.time_spent} minutes
                    </p>
                  </div>
                </div>

                {/* Bookmark */}
                <button 
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 relative z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle bookmark/favorite
                  }}
                >
                  <Bookmark size={18} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg transition ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg transition ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}