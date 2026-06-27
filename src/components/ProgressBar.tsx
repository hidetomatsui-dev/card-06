import { motion } from 'framer-motion';

const STEPS = [
  { label: 'Intro', short: '導入' },
  { label: 'Step 1', short: '職業興味の可視化' },
  { label: 'Step 2', short: 'キャリアの価値観の可視化' },
  { label: 'Step 3', short: '統合と納得' },
  { label: 'Step 4', short: '行動へ' },
];

interface Props {
  currentStep: number;
  onStepClick: (step: number) => void;
  className?: string;
}

export default function ProgressBar({ currentStep, onStepClick, className = '' }: Props) {
  const progress = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <h1 className="text-sm font-bold text-indigo-700 tracking-tight hidden sm:block">
            職業興味×価値観ワークショップ
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400 hidden sm:block">
              {currentStep === 0 ? '開始前' : `Step ${currentStep} / 4`}
            </p>
            <button
              onClick={() => window.location.reload()}
              title="画面を再読込"
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              再読込
            </button>
          </div>
        </div>

        {/* Step indicators */}
        <div className="relative h-10">
          {/* Background line */}
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200" />

          {/* Progress fill — width matches center of current dot */}
          <motion.div
            className="absolute top-3 left-0 h-0.5 bg-indigo-500"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />

          {/* Dots — absolutely positioned at exact percentages */}
          {STEPS.map((step, i) => {
            const leftPct = (i / (STEPS.length - 1)) * 100;
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            const isClickable = i <= currentStep + 1;

            return (
              <button
                key={i}
                onClick={() => isClickable && onStepClick(i)}
                disabled={!isClickable}
                style={{ left: `${leftPct}%`, transform: 'translateX(-50%)' }}
                className={`absolute top-0 flex flex-col items-center gap-1 transition-all ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                {/* Circle */}
                <motion.div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : isCompleted
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                  animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {isCompleted ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{i === 0 ? '▶' : i}</span>
                  )}
                </motion.div>

                {/* Label */}
                <span
                  className={`text-xs font-semibold hidden sm:block whitespace-nowrap transition-colors ${
                    isCurrent ? 'text-indigo-700' : isCompleted ? 'text-indigo-500' : 'text-gray-400'
                  }`}
                >
                  {step.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
