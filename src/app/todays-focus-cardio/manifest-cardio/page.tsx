// app/cardio/manifest-cardio/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  ArrowLeft,
  Calendar,
  Loader2,
  Eye,
  Share2,
  Trash2,
  Clock,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCardioSessions, CardioSession, deleteCardioSession } from "@/api/cardio/route";
import { useToast } from "@/components/ui/toast-provider";

export default function ManifestCardioPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<CardioSession[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [currentPage]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await getCardioSessions(currentPage, limit);
      setSessions(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching cardio sessions:", error);
      toast.error("Failed to load cardio sessions");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session? This will also delete all associated calculator records.")) {
      return;
    }
    
    setDeletingId(id);
    try {
      await deleteCardioSession(id);
      toast.success("Session deleted successfully");
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleShare = (session: CardioSession) => {
    const shareText = `${session.title} - ${session.minutes} minutes, ${session.calories_burned} calories burned on ${formatDate(session.created_at)}`;
    navigator.clipboard.writeText(shareText);
    toast.success("Copied to clipboard!");
  };

  const handleView = (id: string) => {
    router.push(`/cardio/session/${id}`);
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f8] pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Flame size={16} className="text-white" />
              </div>
              <h1 className="text-white font-bold text-lg">Cardio Manifest</h1>
            </div>
          </div>
          <button
            onClick={() => router.push("/todays-focus-cardio/cardio-entry")}
            className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/30 transition"
          >
            New Session
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-800">{total}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Activity size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No cardio sessions found</p>
              <button
                onClick={() => router.push("/todays-focus-cardio/cardio-entry")}
                className="mt-4 text-purple-600 text-sm font-medium hover:underline"
              >
                Log your first session →
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left side - Session Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between sm:justify-start gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Flame size={24} className="text-red-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">{session.title}</h3>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{session.minutes} minutes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame size={14} className="text-red-400" />
                            <span className="text-sm font-medium text-gray-800">{session.calories_burned} cal</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Calendar size={12} />
                          Started: {formatDate(session.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Action Buttons */}
                  <div className="flex gap-2 justify-end sm:justify-start">
                    <button
                      onClick={() => handleView(session.id)}
                      className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleShare(session)}
                      className="p-2.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition"
                      title="Share"
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      disabled={deletingId === session.id}
                      className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      {deletingId === session.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}