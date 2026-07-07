import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { requireEditor } from '../middleware/rbac';
import { HttpError } from '../middleware/error';
import { config } from '../config';

const router = Router();
router.use(requireAuth);

// POST /meeting-audio/transcribe { audio: dataURL, mimeType } -> { transcript }
router.post('/transcribe', requireEditor, async (req: AuthedRequest, res) => {
  const { audio } = z.object({ audio: z.string().min(1).max(30_000_000) }).parse(req.body);
  if (!config.stt.apiKey) throw new HttpError(400, 'stt_not_configured', 'Set STT_API_KEY in server .env');

  const match = audio.match(/^data:([a-z]+\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match) throw new HttpError(400, 'invalid_audio', 'expected data:audio/...;base64,...');
  const mimeType = match[1];
  const buf = Buffer.from(match[2], 'base64');

  try {
    const formData = new FormData();
    formData.append('file', new Blob([buf], { type: mimeType }), 'audio.m4a');
    formData.append('model', config.stt.model);
    const r = await fetch(config.stt.baseUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.stt.apiKey}` },
      body: formData,
    });
    if (!r.ok) {
      const errText = await r.text();
      throw new HttpError(502, 'stt_failed', errText.slice(0, 500));
    }
    const data = await r.json() as { text?: string };
    res.json({ transcript: data.text || '' });
  } catch (e: any) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(502, 'stt_error', e?.message || 'Transcription failed');
  }
});

// POST /meeting-audio/summarize { transcript } -> { summary }
router.post('/summarize', requireEditor, async (req: AuthedRequest, res) => {
  const { transcript } = z.object({ transcript: z.string().min(10).max(100_000) }).parse(req.body);
  if (!config.ai.apiKey) throw new HttpError(400, 'ai_not_configured', 'Set AI_API_KEY in server .env');

  const systemPrompt = `You are a professional meeting minutes assistant for Lions Club Ahmedabad Host. Generate a detailed, well-structured summary of the meeting transcript. Include these sections if mentioned:
- Meeting title and date (if discernible)
- Attendees (if mentioned)
- Key discussions and decisions
- Action items with assignees
- Financial matters
- Service project updates
- Next meeting / upcoming events
Use clear headings and bullet points. Keep it concise but comprehensive.`;

  const callAI = async (model: string) => {
    const r = await fetch(`${config.ai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${config.ai.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript },
        ],
        max_tokens: 3000,
      }),
    });
    if (!r.ok) {
      const errText = await r.text();
      throw new Error(`AI ${model} failed: ${r.status} ${errText.slice(0, 200)}`);
    }
    const data = await r.json() as { choices?: { message: { content: string } }[] };
    return data.choices?.[0]?.message?.content || '';
  };

  try {
    let summary = '';
    try {
      summary = await callAI(config.ai.chatModel);
    } catch (primaryErr: any) {
      console.warn('[ai] primary model failed, trying fallback:', primaryErr?.message);
      summary = await callAI(config.ai.chatModelFallback);
    }
    res.json({ summary });
  } catch (e: any) {
    throw new HttpError(502, 'ai_error', e?.message || 'Summary generation failed');
  }
});

export default router;