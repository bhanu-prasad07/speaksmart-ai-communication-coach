import React, { useState } from 'react';
import { X, Sparkles, FileText, Check, Loader2 } from 'lucide-react';
import { InsertPage } from '../types';
import { generateInsertPage } from '../services/api';

interface InsertPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePage: (page: InsertPage, autoLoadPrompter?: boolean) => void;
}

export const InsertPageModal: React.FC<InsertPageModalProps> = ({
  isOpen,
  onClose,
  onSavePage,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Generator Form States
  const [aiTopic, setAiTopic] = useState('');
  const [aiAudience, setAiAudience] = useState('Executive Leadership & Board');
  const [aiTone, setAiTone] = useState('Inspiring Keynote');
  const [aiDuration, setAiDuration] = useState(2);
  const [aiKeyPoints, setAiKeyPoints] = useState('');

  // Manual Form States
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState<InsertPage['category']>('Executive');
  const [manualAudience, setManualAudience] = useState('');
  const [manualScript, setManualScript] = useState('');

  if (!isOpen) return null;

  const handleGenerateAI = async (autoLoad = false) => {
    if (!aiTopic.trim()) {
      setErrorMessage('Please provide a topic for your speech insert.');
      return;
    }
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const generated = await generateInsertPage({
        topic: aiTopic,
        audience: aiAudience,
        tone: aiTone,
        targetDurationMinutes: aiDuration,
        keyPoints: aiKeyPoints,
      });

      const fullPage: InsertPage = {
        id: `page-${Date.now()}`,
        title: generated.title || aiTopic,
        category: (generated.category as any) || 'Custom',
        targetAudience: generated.targetAudience || aiAudience,
        estimatedWpm: generated.estimatedWpm || 140,
        durationMinutes: generated.durationMinutes || aiDuration,
        wordCount: generated.wordCount || 250,
        openingHook: generated.openingHook || 'Opening delivery',
        scriptWithCues: generated.scriptWithCues || '',
        cleanScript: generated.cleanScript || '',
        closingCallToAction: generated.closingCallToAction || '',
        coachingTips: generated.coachingTips || [
          'Maintain relaxed breathing throughout delivery.',
          'Pause deliberately at marked intervals.',
        ],
        createdAt: new Date().toISOString().split('T')[0],
        isCustom: true,
      };

      onSavePage(fullPage, autoLoad);
      onClose();
    } catch (err: any) {
      console.error('Failed to generate insert page:', err);
      setErrorMessage(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveManual = (autoLoad = false) => {
    if (!manualTitle.trim() || !manualScript.trim()) {
      setErrorMessage('Please provide both a title and speech script.');
      return;
    }

    const words = manualScript.trim().split(/\s+/).length;
    const durationMins = Number((words / 140).toFixed(1));

    const clean = manualScript.replace(/\[Pause[^\]]*\]/gi, '').replace(/\[[^\]]*\]/g, '').trim();

    const newPage: InsertPage = {
      id: `manual-${Date.now()}`,
      title: manualTitle.trim(),
      category: manualCategory,
      targetAudience: manualAudience || 'General Audience',
      estimatedWpm: 140,
      durationMinutes: Math.max(0.5, durationMins),
      wordCount: words,
      openingHook: clean.slice(0, 100) + '...',
      scriptWithCues: manualScript,
      cleanScript: clean,
      closingCallToAction: 'Deliver with poise and presence.',
      coachingTips: [
        'Notice your natural cadence and pace.',
        'Use purposeful pauses to emphasize important points.',
      ],
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true,
    };

    onSavePage(newPage, autoLoad);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#FAF8FF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3525CD] to-[#8455EF] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] font-display">
                Insert New Speech Page
              </h2>
              <p className="text-xs text-[#64748B]">
                Create a customized teleprompter script powered by Gemini AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex px-6 pt-4 border-b border-slate-100 gap-4">
          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Gemini Speechwriter
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Custom Script Input
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'ai' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Speech Topic or Occasion *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unveiling our new sustainability platform, All-hands realignment, Wedding toast"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 text-sm outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={aiAudience}
                    onChange={(e) => setAiAudience(e.target.value)}
                    placeholder="e.g. Venture Investors, Employees, TED audience"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-[#4F46E5] text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Tone & Style
                  </label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-[#4F46E5] text-xs outline-none bg-white"
                  >
                    <option value="Inspiring Keynote">Inspiring Keynote (Visionary & Resonant)</option>
                    <option value="Direct Executive">Direct Executive (Authoritative & Concise)</option>
                    <option value="90-Second Pitch">90-Second Pitch (Fast & Compelling)</option>
                    <option value="TEDx Storytelling">TEDx Storytelling (Vulnerable & Poetic)</option>
                    <option value="Warm Celebration">Warm Celebration (Supportive & Joyful)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Target Duration
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 5].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setAiDuration(mins)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          aiDuration === mins
                            ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Word Budget
                  </label>
                  <div className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-mono">
                    ~{aiDuration * 140} words @ 140 WPM optimal pace
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Key Points / Data to Include (Optional)
                </label>
                <textarea
                  rows={3}
                  value={aiKeyPoints}
                  onChange={(e) => setAiKeyPoints(e.target.value)}
                  placeholder="e.g. Emphasize 45% efficiency jump, announce our new carbon initiative, thank the engineering team"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-[#4F46E5] text-xs outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Speech Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Keynote: Scaling Beyond Borders"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#4F46E5] text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Category
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-[#4F46E5] text-xs outline-none bg-white"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Keynote">Keynote</option>
                    <option value="Pitch">Pitch</option>
                    <option value="Story">Story</option>
                    <option value="Media">Media</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Audience
                  </label>
                  <input
                    type="text"
                    value={manualAudience}
                    onChange={(e) => setManualAudience(e.target.value)}
                    placeholder="e.g. Shareholders, Conference Attendees"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-[#4F46E5] text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Teleprompter Script *
                  <span className="text-[11px] font-normal text-slate-500 ml-2">
                    (Use tags like [Pause 2s], [Emphasis], [Breathe] to guide delivery)
                  </span>
                </label>
                <textarea
                  rows={7}
                  value={manualScript}
                  onChange={(e) => setManualScript(e.target.value)}
                  placeholder="[Warm smile - Pause 1.5s]&#10;Good morning everyone. Today we are gathered to..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#4F46E5] text-xs outline-none font-sans"
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-[#FAF8FF]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {activeTab === 'ai' ? (
              <>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleGenerateAI(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] transition-all disabled:opacity-50"
                >
                  Save to Library
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleGenerateAI(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] shadow-md shadow-[#4F46E5]/25 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Generate & Practice</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSaveManual(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] transition-all"
                >
                  Save to Library
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveManual(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#4F46E5] to-[#6366F1] shadow-md transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Insert & Open Prompter</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
