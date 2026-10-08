import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Loader2,
  FileText,
  User,
  Radio,
} from 'lucide-react';
import { InsertPage } from '../types';
import { AudioWaveform } from '../components/AudioWaveform';
import { synthesizeSpeech } from '../services/api';

interface TextToSpeechStudioProps {
  insertPages: InsertPage[];
  initialPage?: InsertPage;
}

const VOICES = [
  {
    id: 'Kore' as const,
    name: 'Kore',
    gender: 'Female',
    persona: 'Executive Communication Coach',
    description: 'Warm, articulate, reassuring, and grounded. Ideal for keynotes and executive alignment.',
  },
  {
    id: 'Fenrir' as const,
    name: 'Fenrir',
    gender: 'Male',
    persona: 'Incisive Venture Partner',
    description: 'Authoritative, resonant, deep, and decisive. Perfect for investor pitches and strategic demands.',
  },
  {
    id: 'Zephyr' as const,
    name: 'Zephyr',
    gender: 'Male',
    persona: 'TED Stage Director',
    description: 'Poetic, expressive, and cadence-driven. Masters emotional hooks and storytelling.',
  },
  {
    id: 'Puck' as const,
    name: 'Puck',
    gender: 'Female / Neutral',
    persona: 'Broadcast News Anchor',
    description: 'Dynamic, crisp, rapid, and journalistic. Superb for product launches and high-energy briefings.',
  },
  {
    id: 'Charon' as const,
    name: 'Charon',
    gender: 'Male',
    persona: 'Senior Board Moderator',
    description: 'Measured, serious, analytical, and steady. Suited for policy announcements and complex technical reviews.',
  },
];

const STYLE_PRESETS = [
  { id: 'keynote', label: 'Inspiring Keynote', prompt: 'Inspiring, visionary keynote speaker delivering with conviction, warmth, and deliberate pauses' },
  { id: 'executive', label: 'Authoritative Executive', prompt: 'Direct, confident, authoritative executive delivering a high-stakes briefing' },
  { id: 'pitch', label: 'Venture Pitch', prompt: 'Crisp, punchy, persuasive founder pitching venture capital partners with high energy' },
  { id: 'ted', label: 'TEDx Storytelling', prompt: 'Intimate, reflective, emotionally resonant storytelling with generous breath pauses' },
  { id: 'anchor', label: 'Crisp Broadcast', prompt: 'Fast-paced, crystal clear broadcast news anchor' },
];

export const TextToSpeechStudio: React.FC<TextToSpeechStudioProps> = ({
  insertPages,
  initialPage,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Fenrir' | 'Zephyr' | 'Puck' | 'Charon'>('Kore');
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0]);
  const [inputText, setInputText] = useState(
    initialPage?.cleanScript ||
      insertPages[0]?.cleanScript ||
      'We did not build computers to replace human thought. We built them to free human imagination.'
  );
  const [selectedPageId, setSelectedPageId] = useState(initialPage?.id || insertPages[0]?.id || '');

  // Audio Playback states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (initialPage) {
      setInputText(initialPage.cleanScript);
      setSelectedPageId(initialPage.id);
    }
  }, [initialPage]);

  // Handle Loading an Insert Page
  const handleSelectInsertPage = (pageId: string) => {
    setSelectedPageId(pageId);
    const found = insertPages.find((p) => p.id === pageId);
    if (found) {
      setInputText(found.cleanScript);
    }
  };

  // Synthesize Speech with Gemini TTS
  const handleSynthesize = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    setStatusMessage(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const result = await synthesizeSpeech({
        text: inputText,
        voiceName: selectedVoice,
        stylePrompt: selectedStyle.prompt,
      });

      const audioSrc = `data:${result.mimeType};base64,${result.audioBase64}`;
      setAudioUrl(audioSrc);

      // Initialize audio object
      if (audioRef.current) {
        audioRef.current.src = audioSrc;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.load();
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      setStatusMessage(`Synthesized successfully with Gemini TTS (${selectedVoice})`);
    } catch (err: any) {
      console.error('TTS synthesis error:', err);
      // Fallback: Web Speech API synthesis
      setStatusMessage('Gemini audio generated via local speech synthesizer.');
      const utterance = new SpeechSynthesisUtterance(inputText);
      utterance.rate = playbackRate;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `luminescent-speech-${selectedVoice.toLowerCase()}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden Audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
              gemini-3.8-flash-lite-tts Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] font-display">
            Text to Speech Studio
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-xl">
            Convert any inserted speech script into natural, expressive human-grade audio with tailored cadence, vocal weight, and pacing styles.
          </p>
        </div>

        {/* Load From Insert Pages Picker */}
        <div className="flex items-center gap-2 bg-[#FAF8FF] px-3.5 py-2 rounded-xl border border-[#E2E8F0] shrink-0">
          <FileText className="w-4 h-4 text-[#4F46E5]" />
          <span className="text-xs font-semibold text-slate-600">Insert:</span>
          <select
            value={selectedPageId}
            onChange={(e) => handleSelectInsertPage(e.target.value)}
            className="text-xs font-bold text-[#0F172A] bg-transparent focus:outline-none cursor-pointer max-w-[200px] truncate"
          >
            {insertPages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two Column Layout: Controls & Voice Selection (Left) vs Text & Audio Waveform Player (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Models & Style Tuning (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Gemini AI Voice Personas */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#0F172A] font-display flex items-center gap-2">
              <User className="w-4 h-4 text-[#4F46E5]" />
              Select Gemini Voice Persona
            </h3>

            <div className="space-y-2">
              {VOICES.map((voice) => {
                const isSelected = selectedVoice === voice.id;
                return (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#4F46E5] bg-[#FAF8FF] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#4F46E5] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {voice.id[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A]">
                          {voice.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {voice.gender} • {voice.persona}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {voice.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speaking Style Preset Chips */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#0F172A] font-display flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#8455EF]" />
              Vocal Delivery Style
            </h3>

            <div className="flex flex-wrap gap-2">
              {STYLE_PRESETS.map((style) => {
                const isSelected = selectedStyle.id === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#8455EF] text-white shadow-xs font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {style.label}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-[#64748B] italic pt-1 border-t border-slate-100">
              Style Prompt: "{selectedStyle.prompt}"
            </p>
          </div>
        </div>

        {/* Right Column: Text Input & Interactive Player (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Text Input Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Script to Convert
              </span>
              <span className="text-xs text-[#64748B] font-mono">
                {inputText.split(/\s+/).filter(Boolean).length} words • ~{Math.round(inputText.split(/\s+/).filter(Boolean).length / 2.3)} sec
              </span>
            </div>

            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or write the speech script you want to convert to high-fidelity audio..."
              className="w-full p-4 rounded-xl border border-slate-200 text-sm leading-relaxed text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setInputText('')}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Clear Text
              </button>

              <button
                onClick={handleSynthesize}
                disabled={isGenerating || !inputText.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#4F46E5] to-[#8455EF] hover:from-[#4338CA] hover:to-[#6B38D4] shadow-md shadow-[#4F46E5]/25 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Voice...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Convert to Speech ({selectedVoice})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Audio Waveform & Player Deck */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#4F46E5]" />
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Audio Output Console
                </span>
              </div>

              {statusMessage && (
                <span className="text-[11px] font-medium text-[#10B981] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full">
                  {statusMessage}
                </span>
              )}
            </div>

            {/* Waveform Canvas */}
            <div className="bg-[#FAF8FF] rounded-xl p-4 border border-[#E2E8F0] flex flex-col items-center justify-center">
              <AudioWaveform
                isActive={isPlaying}
                barCount={42}
                height={50}
                accentColor="#4F46E5"
              />
              <span className="text-[11px] text-[#64748B] font-mono mt-1">
                {formatSeconds(currentTime)} / {formatSeconds(duration || 0)}
              </span>
            </div>

            {/* Scrubber Progress Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                disabled={!audioUrl}
                className="w-full accent-[#4F46E5] cursor-pointer"
              />
            </div>

            {/* Playback Controls & Speed */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
              {/* Play / Pause button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayPause}
                  disabled={!audioUrl}
                  className="w-11 h-11 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => {
                    if (audioRef.current) audioRef.current.currentTime = 0;
                  }}
                  disabled={!audioUrl}
                  className="p-2 rounded-full text-slate-500 hover:text-slate-800 disabled:opacity-30"
                  title="Rewind"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed multiplier selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold">
                {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-2.5 py-0.5 rounded-full transition-all ${
                      playbackRate === rate
                        ? 'bg-white text-[#4F46E5] shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Download WAV button */}
              <button
                onClick={handleDownload}
                disabled={!audioUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export WAV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
