export interface InsertPage {
  id: string;
  title: string;
  category: 'Keynote' | 'Pitch' | 'Executive' | 'Story' | 'Media' | 'Custom';
  targetAudience: string;
  estimatedWpm: number;
  durationMinutes: number;
  wordCount: number;
  openingHook: string;
  scriptWithCues: string;
  cleanScript: string;
  closingCallToAction: string;
  coachingTips: string[];
  createdAt: string;
  isCustom?: boolean;
}

export interface SpeechAnalysisReport {
  id: string;
  sessionTitle: string;
  timestamp: string;
  durationSeconds: number;
  wordCount: number;
  wpm: number;
  overallScore: number;
  cadenceScore: number;
  clarityScore: number;
  persuasionScore: number;
  vocalPresenceScore: number;
  summary: string;
  pacingVerdict: string;
  pacingFeedback: string;
  strengths: string[];
  growthAreas: string[];
  fillerWordsAnalysis: Array<{
    word: string;
    count: number;
    impact: string;
    replacementTip: string;
  }>;
  deliveryCues: Array<{
    cueType: string;
    advice: string;
  }>;
  rewrittenPunchline?: string;
  recordedAudioUrl?: string;
  transcript: string;
}

export interface VoicePersona {
  id: string;
  name: string;
  title: string;
  roleDescription: string;
  geminiVoice: 'Kore' | 'Fenrir' | 'Zephyr' | 'Puck' | 'Charon';
  accent: string;
  toneStyle: string;
  avatarUrl: string;
  initialGreeting: string;
}

export interface SparringMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  coachingTip?: string;
  sentiment?: string;
  audioUrl?: string;
}

export type ActiveTab = 'prompter' | 'inserts' | 'tts' | 'conversation' | 'analytics' | 'history';
