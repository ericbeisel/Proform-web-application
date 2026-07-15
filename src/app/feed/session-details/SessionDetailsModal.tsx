"use client";

import { X } from "lucide-react";
import SessionDetailsContent, { SessionDetailsContentProps } from "./SessionDetailsContent";

interface SessionDetailsModalProps extends SessionDetailsContentProps {
  onClose: () => void;
}

export default function SessionDetailsModal({ onClose, ...contentProps }: SessionDetailsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start sm:items-center justify-center p-4 py-10">
        <div
          className="relative w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 sm:-top-2 sm:-right-2 z-20 w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <X size={14} className="text-gray-700" />
          </button>

          <SessionDetailsContent {...contentProps} compact />
        </div>
      </div>
    </div>
  );
}
