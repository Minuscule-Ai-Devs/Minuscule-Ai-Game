import { Cat, Grid3X3, Map, X } from 'lucide-react';
import type { GameTab } from '../types/game.ts';

interface HowToPlayModalProps {
  open: boolean;
  dontShowAgain: boolean;
  onToggleDontShowAgain: (value: boolean) => void;
  onSelectMode: (tab: GameTab) => void;
  onClose: () => void;
}

const MODE_GUIDES: Array<{
  id: GameTab;
  title: string;
  kicker: string;
  summary: string;
  points: string[];
  cta: string;
  icon: typeof Grid3X3;
}> = [
  {
    id: 'hunt',
    title: 'Tiny Hunt',
    kicker: '3×3 Micro-Grid · Daily & Endless',
    summary:
      'Spot the single smallest picture among nine tiles, inspect it through the loupe, and describe it from memory.',
    points: [
      'Wrong taps in the 3×3 grid reduce your round multiplier.',
      'Zooming in (1.75× or 2.6×) helps you see, but costs round points.',
      'Your prompt paints a CopyCat image and scores 0–100% similarity.',
    ],
    cta: 'Play Tiny Hunt',
    icon: Grid3X3,
  },
  {
    id: 'daily-scene',
    title: 'Daily Scene',
    kicker: 'Pixel Diorama · Speed Timer',
    summary:
      'Scan a detailed pixel-art world to tap all 7 camouflaged miniature objects as quickly as possible.',
    points: [
      'The timer starts on your first canvas tap.',
      'Faster clears earn up to +500 bonus points; misclicks cost 15 pts.',
      'Use Sonar Ping or Chrono Freeze items, and unlock 4 themed packs.',
    ],
    cta: 'Play Daily Scene',
    icon: Map,
  },
  {
    id: 'copycat',
    title: 'CopyCat',
    kicker: '2-Attempt Duel · 120 Chars',
    summary:
      'Skip the pixel hunt and go head-to-head describing a clear target image in 120 characters or less.',
    points: [
      'Attempt 1 renders Your CopyCat side-by-side with a similarity %.',
      'Read the AI judge’s hint to spot missing colors, lighting, or props.',
      'Refine your prompt on Attempt 2 to push your match toward 100%.',
    ],
    cta: 'Play CopyCat',
    icon: Cat,
  },
];

export function HowToPlayModal({
  open,
  dontShowAgain,
  onToggleDontShowAgain,
  onSelectMode,
  onClose,
}: HowToPlayModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
    >
      <div
        className="w-full max-w-4xl rounded-3xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
              Quick Guide · 3 Game Modes
            </p>
            <h2 id="how-to-play-title" className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              How to Play Minuscule
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Every mode earns XP and Coins (◈) to unlock pixel-art packs, studio styles, and field items.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close How to Play"
            className="rounded-lg p-2 cursor-pointer transition-opacity hover:opacity-75"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {MODE_GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <div
                key={guide.id}
                className="flex flex-col justify-between rounded-2xl border p-5"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-xl"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold leading-tight">{guide.title}</h3>
                      <p className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {guide.kicker}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {guide.summary}
                  </p>

                  <ul className="mt-3 space-y-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {guide.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span aria-hidden="true" style={{ color: 'var(--accent-primary)' }}>
                          ·
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectMode(guide.id);
                    onClose();
                  }}
                  className="mt-5 w-full rounded-xl border py-2.5 text-xs font-bold cursor-pointer transition-colors"
                  style={{
                    borderColor: 'var(--border-hairline)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {guide.cta} →
                </button>
              </div>
            );
          })}
        </div>

        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-4"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <label className="inline-flex items-center gap-3 text-xs font-medium cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={dontShowAgain}
              onClick={() => onToggleDontShowAgain(!dontShowAgain)}
              className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer"
              style={{
                backgroundColor: dontShowAgain ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              }}
            >
              <span
                className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
                style={{
                  transform: dontShowAgain ? 'translateX(18px)' : 'translateX(3px)',
                }}
              />
            </button>
            <span style={{ color: 'var(--text-muted)' }}>Don’t show again on startup</span>
          </label>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-xs font-bold cursor-pointer transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-primary-fg)',
            }}
          >
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
}
