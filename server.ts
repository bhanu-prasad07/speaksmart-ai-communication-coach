import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. Text to Speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', stylePrompt } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required for speech synthesis' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in server environment.' });
    }

    // gemini-3.8-flash-lite-tts is the recommended TTS model
    const cleanText = text.replace(/\[Pause[^\]]*\]/gi, '...').replace(/\[[^\]]*\]/g, '').trim();
    const style = stylePrompt || 'Clear, confident, articulate, and natural human communication mentor';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText.slice(0, 1500),
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Options: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio stream returned from Gemini TTS' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      voiceName,
    });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    return res.status(500).json({
      error: error.message || 'Failed to synthesize speech',
    });
  }
});

// 2. Speech Coach & Analytics endpoint
app.post('/api/speech-coach', async (req, res) => {
  try {
    const { transcript, durationSeconds = 30, wpm = 140, fillerWordsCount = 0, topic = 'General Speech' } = req.body;
    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Speech transcript is required' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const prompt = `You are Luminescent Cadence, an elite world-class executive communication and vocal presence coach.
Analyze the following speech transcript and telemetry data:
- Speech Topic / Scenario: "${topic}"
- Duration: ${durationSeconds} seconds
- Cadence / Speaking Pace: ${wpm} words per minute (Ideal conversational cadence is 130 - 160 WPM)
- Detected Filler count: ${fillerWordsCount}
- Spoken Transcript:
"""${transcript}"""

Provide a detailed diagnostic evaluation in JSON format matching this schema:
{
  "overallScore": number (0-100),
  "cadenceScore": number (0-100),
  "clarityScore": number (0-100),
  "persuasionScore": number (0-100),
  "vocalPresenceScore": number (0-100),
  "summary": "Warm, constructive executive summary of the performance",
  "pacingVerdict": "Optimal (130-160 WPM)" | "Too Slow" | "Slightly Fast" | "Rushed",
  "pacingFeedback": "Specific advice on cadence and pauses",
  "strengths": ["string", "string"],
  "growthAreas": ["warm amber coachable opportunity 1", "warm amber coachable opportunity 2"],
  "fillerWordsAnalysis": [
    {"word": "um", "count": 2, "impact": "minor", "replacementTip": "Use a deliberate silent breath pause instead of vocal filler"}
  ],
  "deliveryCues": [
    {"cueType": "pause", "advice": "Insert a 1.5s pregnant pause right before the primary statistic to build anticipation"},
    {"cueType": "cadence", "advice": "Decelerate during key takeaways to establish authority"}
  ],
  "rewrittenPunchline": "Punchier executive version of the core sentence"
}

Respond ONLY with valid JSON. Do not wrap in markdown quotes if possible, or use standard markdown json.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textOutput = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(textOutput);
    } catch {
      // Clean fallback if wrapped
      const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/speech-coach:', error);
    return res.status(500).json({ error: error.message || 'Speech coaching analysis failed' });
  }
});

// 3. Generate Insert Page / Speech Script endpoint
app.post('/api/generate-insert-page', async (req, res) => {
  try {
    const { topic, audience = 'Executive Board', tone = 'Inspiring Keynote', targetDurationMinutes = 2, keyPoints = '' } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required to generate an insert page' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const prompt = `You are a master speechwriter for TED keynote speakers and Fortune 500 CEOs.
Generate a high-impact, ready-to-deliver speech "Insert Page" script for a teleprompter.

Requirements:
- Topic: "${topic}"
- Target Audience: "${audience}"
- Tone: "${tone}"
- Target Duration: ~${targetDurationMinutes} minutes (approx. ${targetDurationMinutes * 140} words total)
- Key Points to Include: "${keyPoints || 'Focus on clarity, strong narrative arc, and inspiring conclusion'}"

Return JSON matching this exact structure:
{
  "title": "Compelling Title",
  "category": "Keynote | Pitch | Briefing | Storytelling | Toast",
  "estimatedDurationMinutes": ${targetDurationMinutes},
  "targetWpm": 145,
  "openingHook": "The powerful opening line",
  "scriptWithCues": "Full speech script with teleprompter cadence tags like [Pause 2s], [Emphasis], [Breathe], [Warm eye contact] embedded naturally throughout the paragraphs.",
  "cleanScript": "The complete speech text without brackets or tags, ready for clean Text-to-Speech audio reading.",
  "closingCallToAction": "Memorable final sentence",
  "coachingChecklist": [
    "Tip 1 for vocal pacing",
    "Tip 2 for emotional resonance",
    "Tip 3 for body posture and breath"
  ]
}

Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textOutput = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(textOutput);
    } catch {
      const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/generate-insert-page:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate insert page' });
  }
});

// 4. Voice Conversation / AI Sparring endpoint
app.post('/api/voice-sparring', async (req, res) => {
  try {
    const {
      messages = [],
      userMessage = '',
      personaId = 'elena',
      synthesizeVoice = true,
      currentScriptContext = '',
    } = req.body;

    const ai = getAIClient();
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const personaDescriptions: Record<string, { role: string; voiceName: string; style: string }> = {
      elena: {
        role: 'Elena, an encouraging yet exacting Executive Speaking Mentor. You praise articulate phrasing, challenge vague statements, and provide swift vocal tips.',
        voiceName: 'Kore',
        style: 'Warm, articulate, encouraging executive mentor',
      },
      marcus: {
        role: 'Marcus, an incisive Venture Capitalist partner. You test business assumptions, ask sharp follow-up questions, and evaluate clarity under pressure.',
        voiceName: 'Fenrir',
        style: 'Deep, crisp, authoritative venture partner',
      },
      sophia: {
        role: 'Sophia, a world-class TED Stage Director. You focus on storytelling hooks, emotional vulnerability, metaphor, and rhythmic delivery pauses.',
        voiceName: 'Zephyr',
        style: 'Inspiring, poetic, vibrant stage director',
      },
      charles: {
        role: 'Charles, a broadcast journalist and debate moderator. You test precision, counter-arguments, and composure.',
        voiceName: 'Puck',
        style: 'Energetic, direct, inquisitive journalist',
      },
    };

    const persona = personaDescriptions[personaId] || personaDescriptions.elena;

    const systemPrompt = `You are ${persona.role}.
The user is practicing their vocal delivery and conversational presence.
${currentScriptContext ? `Context or Speech Topic being worked on: "${currentScriptContext}"` : ''}

In your reply:
1. Provide a direct, natural conversational response (keep it punchy, conversational, 2 to 4 sentences).
2. End with an engaging follow-up prompt or question to keep the conversation flowing.
3. Also provide a separate short coaching tip (1 sentence) critiquing the user's latest delivery, pacing, or phrasing.

Respond in JSON format:
{
  "reply": "Your spoken conversational reply to the user (no markdown, pure spoken text)",
  "coachingTip": "Brief supportive tip on their pacing, confidence, or word choice",
  "sentiment": "encouraging | inquisitive | challenging | pleased"
}`;

    const formattedContents: any[] = [];
    formattedContents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    formattedContents.push({ role: 'model', parts: [{ text: JSON.stringify({ reply: "Understood. I am ready to spar with you. Let's begin!", coachingTip: "Take a deep breath and start whenever you are ready.", sentiment: "encouraging" }) }] });

    for (const msg of messages) {
      formattedContents.push({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    if (userMessage) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });
    }

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = geminiResponse.text || '{}';
    let conversationResult: any;
    try {
      conversationResult = JSON.parse(rawText);
    } catch {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      conversationResult = JSON.parse(cleanJson);
    }

    let audioBase64: string | null = null;
    if (synthesizeVoice && conversationResult.reply) {
      try {
        const ttsResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: conversationResult.reply.slice(0, 1000),
                  speechMetadata: {
                    style: persona.style,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: persona.voiceName },
              },
            },
          },
        });

        audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      } catch (ttsErr) {
        console.warn('TTS generation warning inside voice-sparring:', ttsErr);
      }
    }

    return res.json({
      reply: conversationResult.reply || "Let's continue refining your thoughts. What is the core conviction behind your idea?",
      coachingTip: conversationResult.coachingTip || "Notice your breathing rhythm between sentences.",
      sentiment: conversationResult.sentiment || "encouraging",
      audioBase64,
      mimeType: audioBase64 ? 'audio/wav' : null,
      voiceName: persona.voiceName,
    });
  } catch (error: any) {
    console.error('Error in /api/voice-sparring:', error);
    return res.status(500).json({ error: error.message || 'Voice sparring conversation failed' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Luminescent Cadence server running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
