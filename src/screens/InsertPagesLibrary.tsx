import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Play,
  Volume2,
  MessageSquare,
  Sparkles,
  Search,
  Clock,
  Users,
  CheckCircle2,
  Trash2,
  Copy,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { InsertPage } from '../types';

interface InsertPagesLibraryProps {
  insertPages: InsertPage[];
  onSelectPage: (page: InsertPage, navigateToPrompter?: boolean) => void;
  onOpenInsertModal: () => void;
  onListenTTS: (page: InsertPage) => void;
  onStartVoiceSparring: (page: InsertPage) => void;
  onDeleteCustomPage: (id: string) => void;
}

export const InsertPagesLibrary: React.FC<InsertPagesLibraryProps> = ({
  insertPages,
  onSelectPage,
  onOpenInsertModal,
  onListenTTS,
  onStartVoiceSparring,
  onDeleteCustomPage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPage, setPreviewPage] = useState<InsertPage | null>(null);

  const categories = ['All', 'Keynote', 'Pitch', 'Executive', 'Story', 'Custom'];

  const filteredPages = insertPages.filter((page) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      page.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Custom' && page.isCustom);

    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.cleanScript.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-white via-[#FAF8FF] to-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              Curated Speech Scripts & Insert Pages
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] font-display">
            Insert Pages Library
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-xl">
            Pre-engineered keynote hooks, executive briefings, investor crucible scripts, and custom Gemini-generated insert pages ready for instant teleprompter delivery.
          </p>
        </div>

        <button
          onClick={onOpenInsertModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] shadow-md shadow-[#4F46E5]/25 transition-all hover:-translate-y-0.5 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#E0E7FF]" />
          <Plus className="w-4 h-4" />
          <span>Insert New Page</span>
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search scripts or audience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
          />
        </div>
      </div>

      {/* Grid of Insert Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map((page) => (
          <div
            key={page.id}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#4F46E5]/30 transition-all flex flex-col justify-between overflow-hidden group"
          >
            {/* Card Header & Content */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    page.category === 'Keynote'
                      ? 'bg-purple-100 text-purple-700'
                      : page.category === 'Pitch'
                      ? 'bg-blue-100 text-blue-700'
                      : page.category === 'Executive'
                      ? 'bg-indigo-100 text-indigo-700'
                      : page.category === 'Story'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {page.category}
                </span>

                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{page.durationMinutes}m</span>
                  <span>•</span>
                  <span>{page.wordCount}w</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0F172A] font-display group-hover:text-[#4F46E5] transition-colors line-clamp-1">
                  {page.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{page.targetAudience}</span>
                </div>
              </div>

              {/* Opening hook quote preview */}
              <div className="p-3 rounded-xl bg-[#FAF8FF] border border-[#E2E8F0] text-xs text-slate-700 italic leading-relaxed line-clamp-3">
                "{page.openingHook}"
              </div>

              {/* Teleprompter Cues badge preview */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Target Cadence:
                </span>
                <span className="text-[11px] font-mono font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  {page.estimatedWpm} WPM
                </span>
                {page.isCustom && (
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Custom Generated
                  </span>
                )}
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="px-5 py-3.5 bg-[#FAF8FF] border-t border-[#E2E8F0] flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewPage(page)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read Full</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onListenTTS(page)}
                  className="p-1.5 rounded-full text-slate-500 hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
                  title="Synthesize Speech with Gemini TTS"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onStartVoiceSparring(page)}
                  className="p-1.5 rounded-full text-slate-500 hover:text-[#8455EF] hover:bg-[#FAF5FF] transition-colors"
                  title="Practice in Voice Sparring Studio"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelectPage(page, true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-colors shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Prompter</span>
                </button>

                {page.isCustom && (
                  <button
                    onClick={() => onDeleteCustomPage(page.id)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                    title="Delete Custom Page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No insert pages found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for something else or generate a new speech script with Gemini.
          </p>
          <button
            onClick={onOpenInsertModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#4F46E5]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Insert Page</span>
          </button>
        </div>
      )}

      {/* Script Detail Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#FAF8FF]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full">
                  {previewPage.category}
                </span>
                <h2 className="text-xl font-bold text-[#0F172A] font-display mt-1">
                  {previewPage.title}
                </h2>
                <span className="text-xs text-[#64748B]">
                  Audience: {previewPage.targetAudience} • {previewPage.durationMinutes} min
                </span>
              </div>
              <button
                onClick={() => setPreviewPage(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  Teleprompter Script with Cadence Cues
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-sans text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {previewPage.scriptWithCues}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  Mentor Speaking Checklist
                </h4>
                <div className="space-y-1.5">
                  {previewPage.coachingTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-[#FAF8FF] flex items-center justify-end gap-2">
              <button
                onClick={() => onListenTTS(previewPage)}
                className="px-4 py-2 rounded-full text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF]"
              >
                Hear TTS Voice
              </button>
              <button
                onClick={() => {
                  onSelectPage(previewPage, true);
                  setPreviewPage(null);
                }}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA]"
              >
                Load in Teleprompter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
