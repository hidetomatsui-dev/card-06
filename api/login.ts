import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, password } = req.body as { id?: string; password?: string };
  const correctId  = process.env.APP_ID;
  const correctPw  = process.env.APP_PASSWORD;

  if (!correctId || !correctPw) {
    return res.status(503).json({ error: 'Auth not configured' });
  }

  if (id === correctId && password === correctPw) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'IDまたはパスワードが正しくありません' });
}
