import React from 'react';
import {
  Award,
  Sparkles,
  TrendingUp,
  Clock,
  Mic,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  RefreshCw,
  Share2,
  Download,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { SpeechAnalysisReport } from '../types';
import { RadialScoreDial } from '../components/RadialScoreDial';
import { CadenceProgressBar } from '../components/CadenceProgressBar';

interface AnalyticsDashboardProps {
  report: SpeechAnalysisReport | null;
  onPracticeAgain: () => void;
  onOpenInsertPages: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  report,
  onPracticeAgain,
  onOpenInsertPages,
}) => {
  // Fallback demo report if user lands here before practicing
  const activeReport: SpeechAnalysisReport = report || {
    id: 'demo-report',
    sessionTitle: 'Keynote: The Dawn of Ambient Intelligence',
    timestamp: 'Today, 10:42 AM',
    durationSeconds: 150,
    wordCount: 355,
    wpm: 142,
    overallScore: 92,
    cadenceScore: 94,
    clarityScore: 91,
    persuasionScore: 89,
    vocalPresenceScore: 95,
    summary:
      'Superb executive cadence and authoritative pause architecture. Your delivery projected grounded calm without sacrificing forward momentum.',
    pacingVerdict: 'Optimal (130-160 WPM)',
    pacingFeedback:
      'Your average pace of 142 WPM sits directly in the sweet spot for keynote retention. Strategic deceleration before climax statements lent great weight to the thesis.',
    strengths: [
      'Masterful 2-second pregnant pause right before the core rhetorical question',
      'Consistent pitch modulation avoiding vocal fry at sentence endings',
      'Crisp consonant articulation on technical terminology',
    ],
    growthAreas: [
      'Slight rush during the transitional paragraph between slides 3 and 4',
      'Use chest voice resonance rather than throat tension when projecting',
    ],
    fillerWordsAnalysis: [
      {
        word: 'um',
        count: 2,
        impact: 'minimal',
        replacementTip: 'Take a silent diaphragmatic breath instead of verbalizing the gap.',
      },
      {
        word: 'actually',
        count: 1,
        impact: 'negligible',
        replacementTip: 'State claims directly; omit qualifying filler adjectives.',
      },
    ],
    deliveryCues: [
      {
        cueType: 'pause',
        advice: 'Extend the opening silence by 0.5s to let the auditorium settle completely.',
      },
      {
        cueType: 'cadence',
        advice: 'Decelerate by 10 WPM on "The question is what you will imagine next".',
      },
    ],
    rewrittenPunchline:
      'The question is no longer what the machine computes; it is what you will dare to imagine next.',
    transcript:
      'We did not build computers to replace human thought. We built them to free human imagination. For three decades, humanity has been trapped in a reactive dialogue with glass screens...',
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
              Diagnostic Speech Audit
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] font-display">
            Vocal Presence & Cadence Report
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Session: <strong className="text-[#0F172A]">{activeReport.sessionTitle}</strong> • {activeReport.timestamp} • {Math.round(activeReport.durationSeconds / 60)} min ({activeReport.durationSeconds}s)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPracticeAgain}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Practice Another Run</span>
          </button>
        </div>
      </div>

      {/* Main Scoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Overall Radial Score Dial & Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col items-center justify-between text-center">
          <div className="w-full">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-4">
              Executive Delivery Score
            </span>

            {/* Radial Score Dial as specified in style guide */}
            <div className="my-2 flex justify-center">
              <RadialScoreDial
                score={activeReport.overallScore}
                maxScore={100}
                size={170}
                strokeWidth={10}
                label="Mastery Tier"
                sublabel="Top 8% Executive Presence"
              />
            </div>
          </div>

          <div className="w-full mt-6 pt-5 border-t border-slate-100 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#8455EF]" />
              <span className="text-xs font-bold text-[#0F172A]">
                Mentor Executive Summary
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "{activeReport.summary}"
            </p>
          </div>
        </div>

        {/* Right Cards: Cadence, Pacing, and Secondary Dimensions (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Cadence & Pacing Bar Gauge */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] font-display">
                  Cadence & Velocity Analysis
                </h3>
                <span className="text-xs text-[#64748B]">
                  Target conversational rhythm is 130–160 Words Per Minute
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#10B981] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
                {activeReport.wpm} WPM ({activeReport.pacingVerdict})
              </span>
            </div>

            <CadenceProgressBar wpm={activeReport.wpm} />

            <div className="p-3 bg-[#FAF8FF] rounded-xl border border-[#E2E8F0] text-xs text-slate-700 leading-relaxed mt-2">
              💡 {activeReport.pacingFeedback}
            </div>
          </div>

          {/* 4 Multi-Dimensional Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-2xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Cadence & Rhythm
              </span>
              <span className="text-2xl font-extrabold text-[#4F46E5] font-display mt-1 block">
                {activeReport.cadenceScore}%
              </span>
              <span className="text-[10px] text-[#10B981] font-semibold">Fluent flow</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-2xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Vocal Presence
              </span>
              <span className="text-2xl font-extrabold text-[#8455EF] font-display mt-1 block">
                {activeReport.vocalPresenceScore}%
              </span>
              <span className="text-[10px] text-[#10B981] font-semibold">Commanding</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-2xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Clarity & Enunciation
              </span>
              <span className="text-2xl font-extrabold text-[#0284C7] font-display mt-1 block">
                {activeReport.clarityScore}%
              </span>
              <span className="text-[10px] text-[#10B981] font-semibold">Crisp diction</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-2xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Persuasion Index
              </span>
              <span className="text-2xl font-extrabold text-[#0D9488] font-display mt-1 block">
                {activeReport.persuasionScore}%
              </span>
              <span className="text-[10px] text-[#10B981] font-semibold">High impact</span>
            </div>
          </div>

          {/* Audio Replay (if recorded during session) */}
          {activeReport.recordedAudioUrl && (
            <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0F172A] block">
                    Your Recorded Voice Audio
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    Listen back to evaluate pauses and vocal color
                  </span>
                </div>
              </div>
              <audio controls src={activeReport.recordedAudioUrl} className="h-9" />
            </div>
          )}
        </div>
      </div>

      {/* Two Column Diagnostic Details: Strengths & Opportunities vs Filler & Delivery Cues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Strengths & Opportunities */}
        <div className="space-y-4">
          {/* Mastery Strengths */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-[#065F46] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Mastery Highlights
            </h4>
            <div className="space-y-2">
              {activeReport.strengths.map((str, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]/50 text-xs text-[#065F46] leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Opportunities (Strictly warm amber as mandated by the style guide) */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-[#92400E] uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
              Coachable Opportunities (Warm Amber Focus)
            </h4>
            <div className="space-y-2">
              {activeReport.growthAreas.map((area, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 shrink-0" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Filler Words & Delivery Cues */}
        <div className="space-y-4">
          {/* Filler Word Diagnostics */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Filler Word Frequency & Substitutions
              </h4>
              <span className="text-xs font-mono font-bold text-slate-600">
                {activeReport.fillerWordsAnalysis.reduce((acc, curr) => acc + curr.count, 0)} total
              </span>
            </div>

            <div className="space-y-2">
              {activeReport.fillerWordsAnalysis.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FAF8FF] border border-[#E2E8F0] flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F172A] font-mono uppercase bg-slate-200 px-2 py-0.5 rounded">
                        "{item.word}"
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        used {item.count} times
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4F46E5] font-medium mt-1">
                      💡 {item.replacementTip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gemini Punchline Rewrite */}
          {activeReport.rewrittenPunchline && (
            <div className="bg-gradient-to-br from-[#FAF8FF] to-white rounded-2xl p-5 border border-[#8455EF]/30 shadow-sm space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8455EF] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#8455EF]" />
                Gemini Climax Punchline Rewrite
              </div>
              <p className="text-xs text-[#0F172A] font-semibold italic bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                "{activeReport.rewrittenPunchline}"
              </p>
              <span className="text-[11px] text-[#64748B] block">
                Deliver this final statement with a descending final cadence for maximum executive gravitas.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
