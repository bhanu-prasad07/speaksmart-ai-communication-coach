import React from 'react';

interface CadenceProgressBarProps {
  wpm: number;
  showLabels?: boolean;
}

export const CadenceProgressBar: React.FC<CadenceProgressBarProps> = ({
  wpm,
  showLabels = true,
}) => {
  // Optimal zone is 130 - 160 WPM
  const isOptimal = wpm >= 130 && wpm <= 160;
  const isSlow = wpm < 130 && wpm > 0;
  const isFast = wpm > 160;

  // Max scale is 220 WPM
  const maxWpm = 220;
  const fillPercentage = Math.min(Math.max((wpm / maxWpm) * 100, 0), 100);

  // Status text and colors
  let statusBadge = {
    text: 'Awaiting Speech',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  if (wpm > 0) {
    if (isOptimal) {
      statusBadge = {
        text: 'Optimal Cadence (130-160 WPM)',
        color: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
        dot: 'bg-[#10B981]',
      };
    } else if (isSlow) {
      statusBadge = {
        text: 'Deliberate / Slow Pace',
        color: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
        dot: 'bg-[#F59E0B]',
      };
    } else if (isFast) {
      statusBadge = {
        text: 'Elevated Velocity / Fast Pace',
        color: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
        dot: 'bg-[#F59E0B]',
      };
    }
  }

  return (
    <div className="w-full flex flex-col gap-1.5">
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0F172A]">Speaking Pace</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.text}
            </span>
          </div>
          <span className="font-mono font-bold text-sm text-[#0F172A]">
            {wpm} <span className="text-xs font-normal text-[#64748B]">WPM</span>
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div className="relative h-2.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
        {/* Optimal zone guide markers (130-160 WPM -> ~59% to 72% position) */}
        <div
          className="absolute top-0 bottom-0 bg-[#A7F3D0]/50 border-x border-[#10B981]/40 z-0"
          style={{
            left: `${(130 / maxWpm) * 100}%`,
            width: `${((160 - 130) / maxWpm) * 100}%`,
          }}
          title="Optimal 130–160 WPM Target Zone"
        />

        {/* Dynamic fill bar */}
        <div
          className={`h-full rounded-full transition-all duration-300 relative z-10 ${
            isOptimal
              ? 'bg-[#10B981]'
              : isSlow || isFast
              ? 'bg-[#F59E0B]'
              : 'bg-[#4F46E5]'
          }`}
          style={{ width: `${fillPercentage}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between text-[10px] text-[#64748B] font-mono px-0.5">
          <span>0 WPM</span>
          <span className="text-[#065F46] font-semibold">130 WPM (Target)</span>
          <span className="text-[#065F46] font-semibold">160 WPM</span>
          <span>220 WPM</span>
        </div>
      )}
    </div>
  );
};
