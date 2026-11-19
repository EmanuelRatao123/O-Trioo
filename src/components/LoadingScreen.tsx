import React from 'react';

interface LoadingScreenProps {
  progress: number;
  statusText: string;
  hardwareSummary?: string;
  errorMsg?: string | null;
  onRetry?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  statusText,
  hardwareSummary,
  errorMsg,
  onRetry,
}) => {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div
      data-testid="loading-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-6 text-white"
    >
      <div className="w-full max-w-md flex flex-col items-center text-center gap-5">
        {/* Brazilian School Crest Emblem */}
        <svg viewBox="0 0 64 64" className="w-20 h-20" aria-hidden="true">
          <path
            d="M10 10 H54 V34 C54 48 32 58 32 58 C32 58 10 48 10 34 Z"
            fill="#1D4ED8"
            stroke="#FACC15"
            strokeWidth="4"
          />
          <path d="M18 20 H46 V33 C46 42 32 49 32 49 C32 49 18 42 18 33 Z" fill="#16A34A" />
          <polygon points="32,22 43,32 32,42 21,32" fill="#FACC15" />
          <circle cx="32" cy="32" r="4.5" fill="#1E3A8A" />
        </svg>

        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            RT: O TRIO
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-bold tracking-widest text-amber-300 uppercase">
            Edição Ultra Remaster · Mundo Animal &amp; Mundo Humano
          </p>
        </div>

        {errorMsg ? (
          <div className="w-full p-4 rounded-xl bg-rose-950/90 border border-rose-500/70 text-sm text-rose-100 flex flex-col gap-3">
            <p className="font-semibold">{errorMsg}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Tentar Novamente
              </button>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-700 overflow-hidden">
              <div
                className="h-full bg-amber-400 origin-left transition-transform duration-150"
                style={{ transform: `scaleX(${clamped / 100})` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-200 font-medium truncate">{statusText}</span>
              <span className="font-mono-num font-bold text-amber-300 ml-2 shrink-0">{clamped}%</span>
            </div>
          </div>
        )}

        {hardwareSummary && (
          <div className="text-[11px] text-slate-400 font-medium">
            Perfil detectado: {hardwareSummary}
          </div>
        )}
      </div>
    </div>
  );
};
