import React from 'react';
import {
  History,
  Calendar,
  Clock,
  Award,
  Play,
  Volume2,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { SpeechAnalysisReport } from '../types';

interface RecordingsHistoryProps {
  historyReports: SpeechAnalysisReport[];
  onSelectReport: (report: SpeechAnalysisReport) => void;
  onClearHistory: () => void;
  onNewSession: () => void;
}

export const RecordingsHistory: React.FC<RecordingsHistoryProps> = ({
  historyReports,
  onSelectReport,
  onClearHistory,
  onNewSession,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              Vocal Telemetry Archive
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] font-display">
            Practice Sessions & History
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-xl">
            Review past teleprompter deliveries, monitor cadence trajectory, and listen back to audio recordings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {historyReports.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              Clear History
            </button>
          )}
          <button
            onClick={onNewSession}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-all shadow-sm"
          >
            <span>Start Practice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* History Cards List */}
      {historyReports.length > 0 ? (
        <div className="space-y-3">
          {historyReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-display font-extrabold text-white shrink-0 ${
                    report.overallScore >= 90
                      ? 'bg-gradient-to-tr from-[#10B981] to-[#059669]'
                      : report.overallScore >= 80
                      ? 'bg-gradient-to-tr from-[#4F46E5] to-[#8455EF]'
                      : 'bg-gradient-to-tr from-[#F59E0B] to-[#D97706]'
                  }`}
                >
                  <span className="text-lg leading-none">{report.overallScore}</span>
                  <span className="text-[9px] font-sans font-medium opacity-80">SCORE</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0F172A] font-display">
                    {report.sessionTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {report.durationSeconds}s
                    </span>
                    <span>•</span>
                    <span className="font-mono font-semibold text-[#10B981]">
                      {report.wpm} WPM
                    </span>
                    <span>•</span>
                    <span>{report.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-1 italic">
                    "{report.summary}"
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {report.recordedAudioUrl && (
                  <audio
                    controls
                    src={report.recordedAudioUrl}
                    className="h-8 max-w-[180px]"
                  />
                )}

                <button
                  onClick={() => onSelectReport(report)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] transition-colors"
                >
                  View Full Audit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
          <History className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No session recordings yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Deliver a speech in the Teleprompter Studio to automatically track cadence, filler words, and vocal performance.
          </p>
          <button
            onClick={onNewSession}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-colors"
          >
            <span>Begin Practice Session</span>
          </button>
        </div>
      )}
    </div>
  );
};
