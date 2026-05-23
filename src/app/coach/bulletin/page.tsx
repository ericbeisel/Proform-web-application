"use client";

import { useState, useRef } from "react";
import { Plus, X, FileText, Eye } from "lucide-react";

export default function BulletinPage() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(false);

  const pdfRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    setOpen(false);
    setPreview(false);
    setTitle("");
    setBody("");
    setPdfFile(null);
    setImageFile(null);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-black text-[#1f1f1f]">Bulletin Board</h1>
          <p className="text-xs text-gray-500 hidden sm:block">Stay updated with the latest news and announcements.</p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white shadow-md hover:bg-[#7C3AED] transition active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-gray-400 text-sm text-center mt-20">No posts yet. Tap + to create your first bulletin.</p>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-[#1f1f1f]">Create Bulletin Post</h2>
                <p className="text-xs text-gray-500 mt-0.5">Share this post with your Team members.</p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <X size={15} />
              </button>
            </div>

            {preview ? (
              /* Preview */
              <div className="px-5 py-5 space-y-4">
                <p className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wide">Preview</p>
                <h3 className="text-xl font-black text-[#1f1f1f]">{title || "Untitled Post"}</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{body || "No content yet."}</p>

                {pdfFile && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                    <FileText size={16} className="text-[#8B5CF6]" />
                    <span className="text-xs text-gray-600 truncate">{pdfFile.name}</span>
                  </div>
                )}

                {imageFile && (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="preview"
                    className="w-full rounded-2xl object-cover max-h-60"
                  />
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setPreview(false)}
                    className="flex-1 h-11 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    Edit
                  </button>
                  <button className="flex-1 h-11 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] transition">
                    Post
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <div className="px-5 py-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Give your post a title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Team Practice Update"
                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#8B5CF6] transition"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    What would you like to share?
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your message here..."
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#8B5CF6] transition resize-none"
                  />
                </div>

                {/* PDF */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Add a file (.pdf)
                  </label>
                  <input
                    ref={pdfRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  />
                  {pdfFile ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                      <FileText size={16} className="text-[#8B5CF6] flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate flex-1">{pdfFile.name}</span>
                      <button onClick={() => setPdfFile(null)}>
                        <X size={14} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => pdfRef.current?.click()}
                      className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                </div>

                {/* Image */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Add an image
                  </label>
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                  {imageFile ? (
                    <div className="relative w-full">
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="selected"
                        className="w-full rounded-2xl object-cover max-h-40"
                      />
                      <button
                        onClick={() => setImageFile(null)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => imageRef.current?.click()}
                      className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                </div>

                {/* Preview button */}
                <div className="pt-2">
                  <button
                    onClick={() => setPreview(true)}
                    className="w-full h-11 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#7C3AED] transition"
                  >
                    <Eye size={16} />
                    Preview Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
