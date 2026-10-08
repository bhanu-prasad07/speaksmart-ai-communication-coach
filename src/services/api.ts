import { SpeechAnalysisReport, InsertPage } from '../types';

export interface TTSRequest {
  text: string;
  voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  stylePrompt?: string;
}

export interface TTSResponse {
  audioBase64: string;
  mimeType: string;
  voiceName: string;
}

export interface SparringRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  userMessage: string;
  personaId: string;
  synthesizeVoice?: boolean;
  currentScriptContext?: string;
}

export interface SparringResponse {
  reply: string;
  coachingTip: string;
  sentiment: string;
  audioBase64?: string | null;
  mimeType?: string | null;
  voiceName?: string;
}

export interface GeneratePageRequest {
  topic: string;
  audience: string;
  tone: string;
  targetDurationMinutes: number;
  keyPoints?: string;
}

export async function checkServerHealth(): Promise<{ status: string; hasKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', hasKey: false };
  }
}

export async function synthesizeSpeech(params: TTSRequest): Promise<TTSResponse> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `TTS synthesis failed: ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeSpeech(params: {
  transcript: string;
  durationSeconds: number;
  wpm: number;
  fillerWordsCount: number;
  topic?: string;
}): Promise<Partial<SpeechAnalysisReport>> {
  const response = await fetch('/api/speech-coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Speech coach analysis failed: ${response.statusText}`);
  }

  return response.json();
}

export async function generateInsertPage(params: GeneratePageRequest): Promise<Partial<InsertPage>> {
  const response = await fetch('/api/generate-insert-page', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Insert page generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: `custom-${Date.now()}`,
    title: data.title || params.topic,
    category: (data.category as any) || 'Custom',
    targetAudience: params.audience,
    estimatedWpm: data.targetWpm || 145,
    durationMinutes: params.targetDurationMinutes,
    wordCount: data.cleanScript ? data.cleanScript.split(/\s+/).length : 200,
    openingHook: data.openingHook || 'Opening delivery',
    scriptWithCues: data.scriptWithCues || data.cleanScript || '',
    cleanScript: data.cleanScript || data.scriptWithCues || '',
    closingCallToAction: data.closingCallToAction || '',
    coachingTips: data.coachingChecklist || [],
    createdAt: new Date().toISOString().split('T')[0],
    isCustom: true,
  };
}

export async function sendVoiceSparringMessage(params: SparringRequest): Promise<SparringResponse> {
  const response = await fetch('/api/voice-sparring', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Voice sparring failed: ${response.statusText}`);
  }

  return response.json();
}
