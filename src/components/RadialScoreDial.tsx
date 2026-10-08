import React from 'react';

interface RadialScoreDialProps {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
  sublabel?: string;
  strokeWidth?: number;
}

export const RadialScoreDial: React.FC<RadialScoreDialProps> = ({
  score,
  maxScore = 100,
  size = 140,
  label = 'Delivery Score',
  sublabel = 'Executive Cadence',
  strokeWidth = 8,
}) => {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine dynamic gradient / color based on score
  const isMastery = score >= 85;
  const isGood = score >= 70 && score < 85;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90 origin-center"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="masteryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth - 2}
          />

          {/* Dynamic indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={isMastery ? 'url(#masteryGradient)' : isGood ? 'url(#scoreGradient)' : 'url(#amberGradient)'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-extrabold text-[#0F172A] tracking-tight leading-none text-3xl font-display">
            {score}
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-[#64748B] uppercase mt-0.5">
            / {maxScore}
          </span>
        </div>
      </div>

      {label && (
        <span className="mt-2 text-sm font-semibold text-[#0F172A]">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-xs text-[#64748B]">
          {sublabel}
        </span>
      )}
    </div>
  );
};
