import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  RefreshCw,
  User,
  Bot,
  MessageSquare,
  Play,
  Pause,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { VoicePersona, SparringMessage, InsertPage } from '../types';
import { VOICE_PERSONAS } from '../data/personas';
import { AudioWaveform } from '../components/AudioWaveform';
import { sendVoiceSparringMessage } from '../services/api';

interface VoiceConversationStudioProps {
  currentInsertPage?: InsertPage;
}

export const VoiceConversationStudio: React.FC<VoiceConversationStudioProps> = ({
  currentInsertPage,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(VOICE_PERSONAS[0]);
  const [messages, setMessages] = useState<SparringMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: VOICE_PERSONAS[0].initialGreeting,
      timestamp: 'Just now',
      coachingTip: 'Take a calm breath and establish your vocal posture before speaking.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [liveSpeechBuffer, setLiveSpeechBuffer] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Handle switching persona
  const handleSelectPersona = (persona: VoicePersona) => {
    setSelectedPersona(persona);
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsAiSpeaking(false);
    }
    setMessages([
      {
        id: `init-${persona.id}`,
        role: 'assistant',
        content: persona.initialGreeting,
        timestamp: 'Just now',
        coachingTip: `Speaking with ${persona.name} (${persona.title}). Keep responses articulate.`,
      },
    ]);
  };

  // Web Speech Recognition for mic input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setLiveSpeechBuffer(text);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
        // Automatically send if spoken text was registered
        setLiveSpeechBuffer((current) => {
          if (current.trim().length > 0) {
            handleSendMessage(current.trim());
          }
          return '';
        });
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [selectedPersona, messages]);

  const toggleMicListening = () => {
    if (!recognitionRef.current) {
      // Browser doesn't support Web Speech
      alert('Microphone speech recognition is not supported in this browser. You can type below.');
      return;
    }

    if (isListeningMic) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    } else {
      setLiveSpeechBuffer('');
      try {
        recognitionRef.current.start();
        setIsListeningMic(true);
      } catch (e) {
        console.warn('Recognition start exception:', e);
      }
    }
  };

  // Play assistant voice
  const playAssistantAudio = (audioBase64: string, mimeType = 'audio/wav') => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
    currentAudioRef.current = audio;
    setIsAiSpeaking(true);
    audio.play().catch(() => {});
    audio.onended = () => setIsAiSpeaking(false);
    audio.onerror = () => setIsAiSpeaking(false);
  };

  // Send message to Gemini Voice Sparring
  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || inputText).trim();
    if (!msg || isProcessing) return;

    setInputText('');
    setLiveSpeechBuffer('');

    const userMsg: SparringMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsProcessing(true);

    try {
      const response = await sendVoiceSparringMessage({
        messages: newHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        userMessage: msg,
        personaId: selectedPersona.id,
        synthesizeVoice: true,
        currentScriptContext: currentInsertPage?.title,
      });

      const assistantMsg: SparringMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        coachingTip: response.coachingTip,
        sentiment: response.sentiment,
        audioUrl: response.audioBase64 ? `data:audio/wav;base64,${response.audioBase64}` : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically play audio response out loud!
      if (response.audioBase64) {
        playAssistantAudio(response.audioBase64, response.mimeType || 'audio/wav');
      } else {
        // Fallback local synthesis
        const utterance = new SpeechSynthesisUtterance(response.reply);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      console.error('Voice sparring error:', err);
      // Fallback response
      const fallbackMsg: SparringMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content:
          "That's a compelling premise. Notice how your cadence settled into a confident rhythm as you developed the core idea. How do you plan to handle skeptical pushback?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        coachingTip:
          'Keep your sentence conclusions dropping rather than rising in pitch.',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestartDialogue = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsAiSpeaking(false);
    }
    setMessages([
      {
        id: `init-${selectedPersona.id}-${Date.now()}`,
        role: 'assistant',
        content: selectedPersona.initialGreeting,
        timestamp: 'Just now',
        coachingTip: 'Take a calm breath and start fresh.',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#8455EF]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#8455EF]">
              Real-Time Conversational Sparring
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] font-display">
            Voice Conversation Studio
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-xl">
            Simulate high-stakes pitches, TED storytelling sessions, and executive Q&A drills. Talk with Gemini speech mentors who reply instantly with real human-grade voice.
          </p>
        </div>

        {/* Current Active Script Pill */}
        {currentInsertPage && (
          <div className="bg-[#FAF8FF] px-4 py-2 rounded-xl border border-[#E2E8F0] shrink-0 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Practicing Against Insert:
            </span>
            <span className="font-bold text-[#0F172A] truncate max-w-[220px] block">
              {currentInsertPage.title}
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Persona Selector (Left) vs Interactive Voice Room (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mentors (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
            <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block mb-3">
              Select Speaking Sparring Partner
            </span>

            <div className="space-y-2.5">
              {VOICE_PERSONAS.map((persona) => {
                const isSelected = selectedPersona.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#4F46E5] bg-[#FAF8FF] shadow-xs ring-1 ring-[#4F46E5]/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <img
                      src={persona.avatarUrl}
                      alt={persona.name}
                      className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A]">
                          {persona.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#4F46E5] bg-[#EEF2FF] px-1.5 py-0.2 rounded font-semibold">
                          {persona.geminiVoice}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#8455EF] block">
                        {persona.title}
                      </span>
                      <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                        {persona.roleDescription}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Voice Mode Tips */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm text-xs text-slate-600 space-y-2">
            <span className="font-bold text-[#0F172A] uppercase text-[10px] tracking-wider block">
              Coaching Best Practices
            </span>
            <p className="leading-relaxed">
              • Tap the <strong>Microphone</strong> to speak freely. When you stop, Gemini automatically replies with voice.
            </p>
            <p className="leading-relaxed">
              • Pay attention to the <strong>Mentor Feedback Chips</strong> beneath each message.
            </p>
          </div>
        </div>

        {/* Right Column: Dialogue Room (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[600px] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {/* Room Header with Active Voice Persona & Waveform */}
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] bg-[#FAF8FF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedPersona.avatarUrl}
                alt={selectedPersona.name}
                className="w-9 h-9 rounded-full object-cover border border-[#4F46E5]/30"
              />
              <div>
                <span className="text-xs font-bold text-[#0F172A] block">
                  {selectedPersona.name}
                </span>
                <span className="text-[10px] text-[#64748B]">
                  {selectedPersona.title} • Gemini Voice: {selectedPersona.geminiVoice}
                </span>
              </div>
            </div>

            {/* Live Audio Activity Waveform */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-[#E2E8F0]">
                <AudioWaveform
                  isActive={isAiSpeaking || isListeningMic}
                  barCount={20}
                  height={24}
                  accentColor={isAiSpeaking ? '#8455EF' : '#E11D48'}
                />
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  {isAiSpeaking ? 'AI Speaking' : isListeningMic ? 'Listening...' : 'Idle'}
                </span>
              </div>

              <button
                onClick={handleRestartDialogue}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                title="Restart Dialogue"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Chat History */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    {isAssistant && (
                      <img
                        src={selectedPersona.avatarUrl}
                        alt="Mentor"
                        className="w-7 h-7 rounded-full object-cover mt-1 shrink-0"
                      />
                    )}

                    <div>
                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isAssistant
                            ? 'bg-[#FAF8FF] text-[#0F172A] border border-[#E2E8F0] shadow-xs rounded-tl-sm'
                            : 'bg-[#4F46E5] text-white rounded-tr-sm shadow-xs'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Coaching Feedback Chip */}
                      {msg.coachingTip && (
                        <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] text-[11px] font-medium max-w-fit shadow-2xs">
                          <Sparkles className="w-3 h-3 text-[#F59E0B] shrink-0" />
                          <span>Mentor Tip: {msg.coachingTip}</span>
                        </div>
                      )}

                      {/* Audio replay button */}
                      {isAssistant && msg.audioUrl && (
                        <button
                          onClick={() => {
                            const audio = new Audio(msg.audioUrl);
                            audio.play();
                          }}
                          className="mt-1 text-[10px] font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Replay Audio</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Live speech transcription bubble while user is speaking */}
            {isListeningMic && liveSpeechBuffer && (
              <div className="flex flex-col items-end">
                <div className="bg-[#4F46E5]/10 text-[#4F46E5] p-3 rounded-2xl rounded-tr-sm text-xs italic border border-[#4F46E5]/20 animate-pulse">
                  🎙️ "{liveSpeechBuffer}..."
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8455EF]" />
                <span>{selectedPersona.name} is evaluating your delivery and synthesizing reply...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Bottom Chat & Voice Input Controls */}
          <div className="p-3 border-t border-[#E2E8F0] bg-white space-y-2">
            <div className="flex items-center gap-2">
              {/* Mic Toggle Button */}
              <button
                onClick={toggleMicListening}
                className={`p-3 rounded-full transition-all shrink-0 ${
                  isListeningMic
                    ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30 ring-4 ring-rose-100'
                    : 'bg-[#FAF8FF] text-[#4F46E5] border border-[#E2E8F0] hover:bg-[#EEF2FF]'
                }`}
                title={isListeningMic ? 'Stop Listening' : 'Speak via Microphone'}
              >
                {isListeningMic ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                placeholder={
                  isListeningMic
                    ? 'Listening to your voice... Speak now'
                    : 'Type a message or response to practice...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={isProcessing || !inputText.trim()}
                className="p-3 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white disabled:opacity-40 transition-colors shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#64748B] px-2">
              <span>{isListeningMic ? '🎙️ Mic active' : '💡 Tip: Click mic to speak naturally'}</span>
              <span>Gemini Flash 3.8 + Flash Lite TTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
