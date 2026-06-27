import type { AppState, RIASECType } from '../types';
import { RIASEC_LABELS } from '../types';
import { ohbyCards } from '../data/ohbyCards';
import { valueCards } from '../data/valueCards';

interface Props {
  state: AppState;
}

const RIASEC_TYPES: RIASECType[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export default function PrintView({ state }: Props) {
  const interestedCards = ohbyCards.filter(c => state.cardSortResults[c.id] === 'interested');

  const riasecCounts: Record<RIASECType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  interestedCards.forEach(c => { riasecCounts[c.type]++; });

  const top3Cards = valueCards.filter(c => state.phase2Selected.includes(c.id));
  const top1Card  = valueCards.find(c => c.id === state.phase3Selected);

  const riasecCounts2: Record<RIASECType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  ohbyCards.forEach(c => {
    if (state.cardSortResults[c.id] === 'interested') riasecCounts2[c.type]++;
  });
  const matrixTypes = [...state.riasecChecked]
    .sort((a, b) => riasecCounts2[b] - riasecCounts2[a])
    .slice(0, 3) as RIASECType[];

  return (
    <div className="hidden print-only text-gray-900 text-sm leading-relaxed">

      {/* ── Step 1 ── */}
      <section className="print-section">
        <h2 className="text-base font-bold border-b-2 border-gray-800 pb-1 mb-3">
          【Step 1】 職業興味の可視化（What）
        </h2>

        <div className="mb-4">
          <p className="font-semibold mb-1">■ 「興味がある」カード（{interestedCards.length}枚）</p>
          {interestedCards.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 pl-2">
              {interestedCards.map(c => (
                <p key={c.id} className="text-xs">
                  [{c.type}型] {c.title}
                </p>
              ))}
            </div>
          ) : (
            <p className="pl-2 text-gray-400">（未実施）</p>
          )}
        </div>

        <div className="mb-4">
          <p className="font-semibold mb-1">■ 職業興味のタイプ集計</p>
          <div className="pl-2 grid grid-cols-3 gap-x-6 gap-y-0.5">
            {RIASEC_TYPES.map(t => (
              <p key={t} className="text-xs">
                {state.riasecChecked.includes(t) ? '✓' : '○'} {RIASEC_LABELS[t]}：{riasecCounts[t]}枚
              </p>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <p className="font-semibold mb-1">■ 内省①「興味があるカードに共通していたパターン」</p>
          <p className="pl-2 border border-gray-300 rounded p-2 min-h-[3rem] text-xs whitespace-pre-wrap">
            {state.step1Reflection1 || '（未記入）'}
          </p>
        </div>

        <div>
          <p className="font-semibold mb-1">■ 内省②「そのタイプに惹かれる背景・理由」</p>
          <p className="pl-2 border border-gray-300 rounded p-2 min-h-[3rem] text-xs whitespace-pre-wrap">
            {state.step1Reflection2 || '（未記入）'}
          </p>
        </div>
      </section>

      {/* ── Step 2 ── */}
      <section className="print-section">
        <h2 className="text-base font-bold border-b-2 border-gray-800 pb-1 mb-3">
          【Step 2】 キャリアの価値観の可視化（Why）
        </h2>

        <div className="mb-4">
          <p className="font-semibold mb-2">■ 価値観 TOP3</p>
          {top3Cards.length > 0 ? (
            <div className="pl-2 space-y-3">
              {top3Cards.map((card, i) => {
                const ep = state.valueEpisodes[card.id];
                return (
                  <div key={card.id} className="border border-gray-200 rounded p-2">
                    <p className="font-bold text-xs mb-1">
                      {card.id === state.phase3Selected ? '★ TOP1' : `第${i + 1}位`}　「{card.keyword}」（{card.categoryName}）
                    </p>
                    <p className="text-xs text-gray-600">
                      エピソード：{ep?.episode || '（未記入）'}
                    </p>
                    <p className="text-xs text-gray-600">
                      感じたこと：{ep?.feeling || '（未記入）'}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="pl-2 text-gray-400">（未実施）</p>
          )}
        </div>

        <div>
          <p className="font-semibold mb-1">■ 「興味がない」の裏返し内省</p>
          <p className="pl-2 border border-gray-300 rounded p-2 min-h-[3rem] text-xs whitespace-pre-wrap">
            {state.step2Reflection || '（未記入）'}
          </p>
        </div>
      </section>

      {/* ── Step 3 ── */}
      <section className="print-section">
        <h2 className="text-base font-bold border-b-2 border-gray-800 pb-1 mb-3">
          【Step 3】 職業興味×価値観（Alignment）
        </h2>

        {top3Cards.length > 0 && matrixTypes.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold mb-2">■ マイ・統合マトリクス</p>
            <table className="w-full border-collapse print-matrix text-xs">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-1.5 bg-gray-50 text-left">価値観 ＼ タイプ</th>
                  {matrixTypes.map(t => (
                    <th key={t} className="border border-gray-300 p-1.5 bg-gray-50">{t}型</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {top3Cards.map(vCard => (
                  <tr key={vCard.id}>
                    <td className="border border-gray-300 p-1.5 font-bold bg-gray-50">
                      {vCard.keyword}
                      {vCard.id === state.phase3Selected && <span className="ml-1 text-[10px]">★TOP1</span>}
                    </td>
                    {matrixTypes.map(t => (
                      <td key={t} className="border border-gray-300 p-1.5 align-top">
                        {state.matrixData[`${vCard.id}-${t}`] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mb-3">
          <p className="font-semibold mb-1">■ 一致していたこと</p>
          <p className="pl-2 border border-gray-300 rounded p-2 min-h-[3rem] text-xs whitespace-pre-wrap">
            {state.step3Alignment1 || '（未記入）'}
          </p>
        </div>

        <div className="mb-3">
          <p className="font-semibold mb-1">■ ズレていたこと</p>
          <p className="pl-2 border border-gray-300 rounded p-2 min-h-[3rem] text-xs whitespace-pre-wrap">
            {state.step3Alignment2 || '（未記入）'}
          </p>
        </div>

        <div>
          <p className="font-semibold mb-1">■ 交差点を一言で</p>
          <p className="pl-2 border border-gray-300 rounded p-2 min-h-[2rem] text-xs whitespace-pre-wrap">
            {state.step3Summary || '（未記入）'}
          </p>
        </div>
      </section>

      {/* ── Step 4 ── */}
      <section className="print-section">
        <h2 className="text-base font-bold border-b-2 border-gray-800 pb-1 mb-3">
          【Step 4】 行動への橋渡し（Action）
        </h2>

        <div className="mb-3">
          <p className="font-semibold mb-1">■ キャリアの方向性</p>
          <p className="pl-2 border border-gray-300 rounded p-2 min-h-[3rem] text-xs whitespace-pre-wrap">
            {state.careerDirection || '（未記入）'}
          </p>
        </div>

        <div className="mb-3">
          <p className="font-semibold mb-2">■ 24時間以内のスモールステップ</p>
          <div className="pl-2 space-y-1.5">
            {state.actions.map((a, i) => (
              <p key={i} className="text-xs border border-gray-300 rounded p-1.5">
                Action {i + 1}：{a || '（未記入）'}
              </p>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold mb-1">■ 今日の一文まとめ</p>
          <p className="pl-2 border border-gray-300 rounded p-2 min-h-[3rem] text-xs whitespace-pre-wrap">
            {state.finalSummary || '（未記入）'}
          </p>
        </div>
      </section>

      {/* ── AI分析 ── */}
      {state.aiAnalysis && (
        <section className="print-section">
          <h2 className="text-base font-bold border-b-2 border-gray-800 pb-1 mb-3">
            【AI キャリア分析】
          </h2>
          <p className="text-xs border border-gray-300 rounded p-3 whitespace-pre-wrap leading-relaxed">
            {state.aiAnalysis}
          </p>
        </section>
      )}

    </div>
  );
}
