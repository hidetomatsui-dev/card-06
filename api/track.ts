import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.GAS_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(200).json({ ok: true }); // サイレントに無視
  }

  const { event, sessionId } = req.body as { event?: string; sessionId?: string };
  if (!event || !sessionId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, sessionId }),
    });
  } catch {
    // スプレッドシートへの記録失敗はユーザー体験に影響させない
  }

  return res.status(200).json({ ok: true });
}
