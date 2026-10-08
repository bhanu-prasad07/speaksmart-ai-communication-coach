import React, { useEffect, useState } from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  barCount?: number;
  height?: number;
  analyserNode?: AnalyserNode | null;
  accentColor?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  barCount = 36,
  height = 42,
  analyserNode = null,
  accentColor = '#4F46E5',
}) => {
  const [frequencyData, setFrequencyData] = useState<number[]>(
    new Array(barCount).fill(0.15)
  );

  useEffect(() => {
    let animationFrameId: number;

    if (isActive) {
      if (analyserNode) {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const renderRealAudio = () => {
          analyserNode.getByteFrequencyData(dataArray);
          // Sample across frequencies for barCount
          const step = Math.floor(bufferLength / barCount);
          const sampled = [];
          for (let i = 0; i < barCount; i++) {
            const val = dataArray[i * step] || 0;
            const normalized = Math.max(0.12, Math.min(1, val / 220));
            sampled.push(normalized);
          }
          setFrequencyData(sampled);
          animationFrameId = requestAnimationFrame(renderRealAudio);
        };
        renderRealAudio();
      } else {
        // Organic dynamic cadence animation
        let tick = 0;
        const renderSimulatedAudio = () => {
          tick += 0.15;
          const bars = [];
          for (let i = 0; i < barCount; i++) {
            const wave1 = Math.sin(tick + i * 0.4);
            const wave2 = Math.cos(tick * 0.7 + i * 0.2);
            const height = Math.abs((wave1 + wave2) / 2);
            bars.push(Math.max(0.15, Math.min(0.95, height)));
          }
          setFrequencyData(bars);
          animationFrameId = requestAnimationFrame(renderSimulatedAudio);
        };
        renderSimulatedAudio();
      }
    } else {
      // Idle gentle subtle pattern
      setFrequencyData(
        new Array(barCount).fill(0).map((_, i) => 0.15 + 0.08 * Math.sin(i * 0.5))
      );
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive, analyserNode, barCount]);

  return (
    <div
      className="flex items-center justify-center gap-[2px] px-2 py-1 select-none overflow-hidden"
      style={{ height }}
    >
      {frequencyData.map((val, index) => {
        const barHeight = Math.max(4, Math.round(val * height));
        return (
          <div
            key={index}
            className="w-[3px] rounded-full transition-all duration-75"
            style={{
              height: `${barHeight}px`,
              backgroundColor: isActive ? accentColor : '#CBD5E1',
              opacity: isActive ? (0.6 + val * 0.4) : 0.5,
              transform: isActive ? `scaleY(${1 + val * 0.2})` : 'scaleY(1)',
            }}
          />
        );
      })}
    </div>
  );
};
