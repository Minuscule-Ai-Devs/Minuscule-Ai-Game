import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Cat, RefreshCw, Sparkles } from 'lucide-react';
import type { CopyJudgment, PlayerProgression, SharePayload } from '../types/game.ts';
import { SPECIMENS } from '../data/specimens.ts';
import { CopyCatSvgRenderer } from './CopyCatRenderer.tsx';
import { sound } from '../lib/sound.ts';

interface CopyCatDuelProps {
  progression: PlayerProgression;
  onReward: (xp: number, coins: number, patch?: Partial<PlayerProgression['stats']>) => void;
  onShare: (payload: SharePayload) => void;
  onRecordRun: (mode: 'copycat', score: number, detail: string) => void;
}

const MAX_PROMPT_CHARS = 120;

export function CopyCatDuel({
  progression,
  onReward,
  onShare,
  onRecordRun,
}: CopyCatDuelProps) {
  const [specIdx, setSpecIdx] = useState(0);
  const [attempt, setAttempt] = useState<1 | 2>(1);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attempt1, setAttempt1] = useState<CopyJudgment | null>(null);
  const [attempt2, setAttempt2] = useState<CopyJudgment | null>(null);
  const [previewAttempt, setPreviewAttempt] = useState<1 | 2>(1);

  const spec = SPECIMENS[specIdx % SPECIMENS.length];

  function nextTarget() {
    sound.tap();
    setSpecIdx((i) => (i + 1) % SPECIMENS.length);
    setAttempt(1);
    setPreviewAttempt(1);
    setPrompt('');
    setAttempt1(null);
    setAttempt2(null);
    setErrorMsg('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/judge-copycat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specimenId: spec.id,
          guess: prompt.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not evaluate prompt.');

      const judgment: CopyJudgment = data;
      if (attempt === 1) {
        setAttempt1(judgment);
        setPreviewAttempt(1);
        setAttempt(2);
        sound.copyMatch(judgment.score);
      } else {
        setAttempt2(judgment);
        setPreviewAttempt(2);
        const best = Math.max(attempt1?.score ?? 0, judgment.score);
        onReward(35 + Math.round(best * 0.5), 18 + Math.round(best * 0.25), {
          bestCopyScore: Math.max(progression.stats.bestCopyScore, best),
        });
        onRecordRun('copycat', best, `${spec.title} · CopyCat Duel`);
        if (best >= 80) {
          sound.victory();
          confetti({
            particleCount: 80,
            spread: 72,
            origin: { y: 0.6 },
            colors: ['#3b5bff', '#ff4d6d', '#10b981'],
            disableForReducedMotion: true,
          });
        } else {
          sound.copyMatch(judgment.score);
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Try submitting your prompt again.');
    } finally {
      setBusy(false);
    }
  }

  const displayedJudgment = previewAttempt === 2 && attempt2 ? attempt2 : attempt1;
  const bestScore = Math.max(attempt1?.score ?? 0, attempt2?.score ?? 0);

  const sharePayload: SharePayload = {
    title: `CopyCat Duel · ${spec.title}`,
    modeLabel: 'CopyCat 2-Attempt Challenge',
    headlineStat: `${bestScore}%`,
    subStat: `Prompt match on ${spec.title}`,
    emojiGrid: `Attempt 1: ${attempt1?.score ?? 0}% · Attempt 2: ${attempt2?.score ?? 0}%`,
    summaryText: `MINUSCULE COPYCAT · ${spec.title}\nAttempt 1: ${attempt1?.score ?? 0}% → Attempt 2: ${
      attempt2?.score ?? 0
    }%\nBest Match: ${bestScore}%`,
    accentHex: '#3b5bff',
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-20 pt-8">
      {/* Streamlined Centered Challenge Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
            <Cat className="h-4 w-4" />
            <span>CopyCat Daily Prompt Duel</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Describe it. Match it. Beat 90%.
          </h1>
        </div>

        <button
          type="button"
          onClick={nextTarget}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold cursor-pointer shadow-xs"
          style={{
            borderColor: 'var(--border-hairline)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>New Picture</span>
        </button>
      </div>

      {/* Prominent Match Score Banner (when scored) */}
      {displayedJudgment && (
        <div
          className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-4 shadow-sm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-extrabold tabular-nums"
              style={{
                backgroundColor: displayedJudgment.score >= 75 ? '#10b981' : 'var(--accent-primary)',
                color: '#ffffff',
              }}
            >
              {displayedJudgment.score}%
            </div>
            <div>
              <p className="font-semibold text-base leading-snug">{displayedJudgment.verdict}</p>
              <p className="mt-0.5 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                Subject {displayedJudgment.subjectScore}% · Palette {displayedJudgment.paletteScore}% · Layout{' '}
                {displayedJudgment.compositionScore}%
              </p>
            </div>
          </div>

          {attempt1 && attempt2 && (
            <div
              className="flex items-center gap-1 rounded-lg p-1"
              style={{ backgroundColor: 'var(--bg-canvas)' }}
            >
              <button
                type="button"
                onClick={() => setPreviewAttempt(1)}
                className="rounded-md px-3 py-1 text-xs font-semibold cursor-pointer"
                style={{
                  backgroundColor: previewAttempt === 1 ? 'var(--bg-surface)' : 'transparent',
                  color: previewAttempt === 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                Try 1 ({attempt1.score}%)
              </button>
              <button
                type="button"
                onClick={() => setPreviewAttempt(2)}
                className="rounded-md px-3 py-1 text-xs font-semibold cursor-pointer"
                style={{
                  backgroundColor: previewAttempt === 2 ? 'var(--bg-surface)' : 'transparent',
                  color: previewAttempt === 2 ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}
              >
                Try 2 ({attempt2.score}%)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Comparison Frames (Signature Dual-Canvas Layout) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <figure
          className="rounded-3xl border p-3.5 shadow-sm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          <div className="mb-2.5 flex items-center justify-between px-1 font-mono text-xs uppercase tracking-wider">
            <span style={{ color: 'var(--text-muted)' }}>Challenge Image</span>
            <span style={{ color: 'var(--accent-primary)' }}>{spec.category}</span>
          </div>
          <div
            className="aspect-square overflow-hidden rounded-2xl border"
            style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-canvas)' }}
          >
            <img
              src={spec.imageUrl}
              alt="Challenge target image"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </figure>

        <figure
          className="rounded-3xl border p-3.5 shadow-sm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          <div className="mb-2.5 flex items-center justify-between px-1 font-mono text-xs uppercase tracking-wider">
            <span style={{ color: 'var(--text-muted)' }}>Your CopyCat</span>
            <span style={{ color: 'var(--accent-pop)' }}>
              {displayedJudgment ? `${displayedJudgment.score}% match` : `Attempt ${attempt}/2`}
            </span>
          </div>
          <div
            className="aspect-square overflow-hidden rounded-2xl border flex items-center justify-center"
            style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-canvas)' }}
          >
            {busy ? (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <Sparkles className="h-7 w-7 animate-spin" style={{ color: 'var(--accent-primary)' }} />
                <p className="text-sm font-semibold">Painting your CopyCat...</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Comparing colors, composition & details
                </p>
              </div>
            ) : displayedJudgment ? (
              <CopyCatSvgRenderer
                blueprint={displayedJudgment.blueprint}
                label="Your CopyCat generated image"
              />
            ) : (
              <div className="p-8 text-center">
                <Cat className="mx-auto h-10 w-10 opacity-35" />
                <p className="mt-3 text-sm font-semibold">Waiting for your prompt</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Describe the subject, colors, and mood in {MAX_PROMPT_CHARS} characters or less.
                </p>
              </div>
            )}
          </div>
        </figure>
      </div>

      {/* Prompt Input Bar Directly Below Frames */}
      <div
        className="mt-6 rounded-2xl border p-4 shadow-sm"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        {attempt1 && !attempt2 && (
          <p className="mb-3 text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
            Tip for Attempt 2: {attempt1.missingHint}
          </p>
        )}

        {!attempt2 ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={MAX_PROMPT_CHARS}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={busy}
                  placeholder="Describe the challenge image concisely..."
                  className="w-full rounded-xl border px-4 py-3.5 pr-20 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                />
                <span
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs tabular-nums"
                  style={{
                    color: prompt.length >= MAX_PROMPT_CHARS - 10 ? 'var(--accent-pop)' : 'var(--text-muted)',
                  }}
                >
                  {prompt.length}/{MAX_PROMPT_CHARS}
                </span>
              </div>

              <button
                type="submit"
                disabled={!prompt.trim() || busy}
                className="rounded-xl px-6 py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary-fg)',
                }}
              >
                {busy
                  ? 'Scoring...'
                  : attempt === 1
                    ? 'Generate Copy (1/2)'
                    : 'Refine Copy (2/2)'}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs font-medium" style={{ color: 'var(--accent-pop)' }}>
                {errorMsg}
              </p>
            )}
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Secret Original Prompt
              </p>
              <p className="mt-1 text-sm font-medium">{spec.secretPrompt}</p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onShare(sharePayload)}
                className="rounded-xl px-5 py-2.5 text-xs font-bold cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary-fg)',
                }}
              >
                Share {bestScore}% Match
              </button>
              <button
                type="button"
                onClick={nextTarget}
                className="rounded-xl border px-4 py-2.5 text-xs font-semibold cursor-pointer"
                style={{
                  borderColor: 'var(--border-hairline)',
                  backgroundColor: 'var(--bg-canvas)',
                }}
              >
                Next Picture →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
