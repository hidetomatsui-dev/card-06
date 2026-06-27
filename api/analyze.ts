import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  const { worksheetText } = req.body as { worksheetText?: string };
  if (!worksheetText) {
    return res.status(400).json({ error: 'Missing worksheetText' });
  }

  const prompt = `あなたはキャリアコンサルタントの専門家です。以下はキャリアワークショップの参加者が記入したワークシートです。この内容をもとに、キャリアの方向性について客観的・建設的な分析を日本語で提供してください。

${worksheetText}

以下の構成で400〜600字程度の分析を提供してください。
1. **強みと一致点**: 職業興味と価値観が重なる核心的な強み
2. **注目すべきパターン**: データから読み取れる特徴や傾向
3. **キャリアの方向性へのコメント**: ユーザーが描いた方向性への客観的な評価
4. **次のステップへの提言**: 具体的で実践的なアドバイス

温かみがあり、ユーザーの自己理解を深める内容にしてください。`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API error:', response.status, errBody);
      return res.status(500).json({ error: `Gemini API error: ${response.status}`, detail: errBody });
    }

    const data = await response.json() as {
      candidates: { content: { parts: { text: string }[] } }[];
    };
    const text = data.candidates[0]?.content?.parts[0]?.text ?? '';

    return res.status(200).json({ result: text });
  } catch (err) {
    console.error('AI analyze error:', err);
    return res.status(500).json({ error: 'Analysis failed', detail: String(err) });
  }
}
