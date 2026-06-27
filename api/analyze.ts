import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppState, RIASECType } from '../src/types';
import { ohbyCards } from '../src/data/ohbyCards';
import { valueCards } from '../src/data/valueCards';
import { RIASEC_LABELS } from '../src/types';

const RIASEC_TYPES: RIASECType[] = ['R', 'I', 'A', 'S', 'E', 'C'];

function buildPrompt(state: AppState): string {
  const interestedCards = ohbyCards.filter(c => state.cardSortResults[c.id] === 'interested');
  const riasecCounts: Record<RIASECType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  interestedCards.forEach(c => { riasecCounts[c.type]++; });

  const top3Cards = valueCards.filter(c => state.phase2Selected.includes(c.id));
  const top1Card  = valueCards.find(c => c.id === state.phase3Selected);

  const riasecSection = RIASEC_TYPES
    .filter(t => riasecCounts[t] > 0)
    .map(t => `  ${RIASEC_LABELS[t]}（${t}型）: ${riasecCounts[t]}枚`)
    .join('\n');

  const checkedTypes = state.riasecChecked.map(t => `${t}型（${RIASEC_LABELS[t]}）`).join('、');

  const valueSection = top3Cards.map((card, i) => {
    const ep = state.valueEpisodes[card.id];
    const rank = card.id === state.phase3Selected ? 'TOP1' : `第${i + 1}位`;
    return [
      `  [${rank}] ${card.keyword}（${card.categoryName}）`,
      ep?.episode ? `    経験: ${ep.episode}` : '',
      ep?.feeling ? `    感じたこと: ${ep.feeling}` : '',
    ].filter(Boolean).join('\n');
  }).join('\n');

  const matrixSection = top3Cards.flatMap(vCard =>
    state.riasecChecked.slice(0, 3).map(t => {
      const text = state.matrixData[`${vCard.id}-${t}`];
      return text ? `  「${vCard.keyword}」×${t}型: ${text}` : '';
    })
  ).filter(Boolean).join('\n');

  return `あなたはキャリアコンサルタントの専門家です。以下のワークショップ結果をもとに、このユーザーのキャリアの方向性について客観的・建設的な分析を日本語で提供してください。

【職業興味のタイプ（RIASEC）集計】
${riasecSection || '（データなし）'}
選択されたタイプ: ${checkedTypes || '（未選択）'}

【価値観TOP3（Schwartzモデル）】
${valueSection || '（データなし）'}

【価値観×職業興味の統合マトリクス記入内容】
${matrixSection || '（データなし）'}

【Step3: 一致していたこと】
${state.step3Alignment1 || '（未記入）'}

【Step3: ズレていたこと】
${state.step3Alignment2 || '（未記入）'}

【Step3: 交差点の言語化】
${state.step3Summary || '（未記入）'}

【ユーザーが描いたキャリアの方向性】
${state.careerDirection || '（未記入）'}

【今日の一文まとめ】
${state.finalSummary || '（未記入）'}

以下の構成で400〜600字程度の分析を提供してください。
1. **強みと一致点**: 職業興味と価値観が重なる核心的な強み
2. **注目すべきパターン**: データから読み取れる特徴や傾向
3. **キャリアの方向性へのコメント**: ユーザーが描いた方向性への客観的な評価
4. **次のステップへの提言**: 具体的で実践的なアドバイス

温かみがあり、ユーザーの自己理解を深める内容にしてください。`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  const state = req.body as AppState;
  if (!state) {
    return res.status(400).json({ error: 'Missing state data' });
  }

  try {
    const prompt = buildPrompt(state);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
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
