import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Crosshair, Eye, Sparkles, ZoomIn } from 'lucide-react';
import type {
  CopyJudgment,
  DailyConfig,
  ItemId,
  LeaderboardEntry,
  PlayerProgression,
  RoundResult,
  SharePayload,
} from '../types/game.ts';
import { SPECIMEN_BY_ID, SPECIMENS } from '../data/specimens.ts';
import { CopyComparison } from './CopyCatRenderer.tsx';
import { sound } from '../lib/sound.ts';

interface TinyHuntGameProps {
  dailyConfig: DailyConfig;
  todayRuns: LeaderboardEntry[];
  progression: PlayerProgression;
  onReward: (xp: number, coins: number, patch?: Partial<PlayerProgression['stats']>, markDailyComplete?: string) => void;
  onUseItem: (itemId: ItemId) => boolean;
  onShare: (payload: SharePayload) => void;
  onRecordRun: (mode: 'hunt', score: number, detail: string) => void;
}

const DISTRACTOR_OFFSETS = [20, 12, 24, 16, 22, 10, 18, 14, 26];
const ZOOM_SCALES = [1, 1.75, 2.6];
const ZOOM_MULTIPLIERS = [1, 0.6, 0.3];
const MISS_MULTIPLIERS = [1, 0.75, 0.5, 0.35];

function computeRoundPoints(similarityScore: number, zoom: number, misses: number, freeZoomUsed: boolean): number {
  const zMult = freeZoomUsed ? 1 : (ZOOM_MULTIPLIERS[zoom] ?? 1);
  const mMult = MISS_MULTIPLIERS[Math.min(misses, MISS_MULTIPLIERS.length - 1)];
  return Math.max(0, Math.round(similarityScore * zMult * mMult));
}

function buildEndlessRound(roundNum: number) {
  const pool = [...SPECIMENS].sort(() => Math.random() - 0.5);
  const targetKey = Math.floor(Math.random() * 9);
  const tinySize = Math.max(10, 15 - (roundNum % 4));
  return {
    targetKey,
    tinySize,
    specimenIds: pool.map((s) => s.id),
  };
}

export function TinyHuntGame({
  dailyConfig,
  todayRuns,
  progression,
  onReward,
  onUseItem,
  onShare,
  onRecordRun,
}: TinyHuntGameProps) {
  const [playMode, setPlayMode] = useState<'daily' | 'endless'>('daily');
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<'hunt' | 'guess' | 'scoring' | 'reveal' | 'done'>('hunt');
  const [wrongPicks, setWrongPicks] = useState<number[]>([]);
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);
  const [zoom, setZoom] = useState(0);
  const [freeZoomActive, setFreeZoomActive] = useState(false);
  const [pingedKey, setPingedKey] = useState<number | null>(null);
  const [guess, setGuess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [results, setResults] = useState<RoundResult[]>([]);
  const [currentJudgment, setCurrentJudgment] = useState<CopyJudgment | null>(null);
  const [endlessRounds, setEndlessRounds] = useState(() => [buildEndlessRound(0)]);

  const storageKey = `minuscule:hunt:${dailyConfig.date}:${progression.playerId}`;

  // Load saved daily progress if in daily mode
  useEffect(() => {
    if (playMode !== 'daily') return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.results)) {
          setResults(parsed.results);
          setRoundIndex(parsed.roundIndex ?? 0);
          setPhase(parsed.phase ?? 'hunt');
          setWrongPicks(parsed.wrongPicks ?? []);
          setCurrentJudgment(parsed.currentJudgment ?? null);
          return;
        }
      }
    } catch {
      // ignore invalid saved state
    }
    setRoundIndex(0);
    setPhase('hunt');
    setWrongPicks([]);
    setZoom(0);
    setFreeZoomActive(false);
    setPingedKey(null);
    setGuess('');
    setResults([]);
    setCurrentJudgment(null);
  }, [playMode, storageKey]);

  useEffect(() => {
    if (playMode !== 'daily') return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          roundIndex,
          phase,
          wrongPicks,
          results,
          currentJudgment,
        })
      );
    } catch {
      // ignore quota errors
    }
  }, [playMode, storageKey, roundIndex, phase, wrongPicks, results, currentJudgment]);

  const activeRound =
    playMode === 'daily'
      ? dailyConfig.rounds[roundIndex]
      : endlessRounds[roundIndex] ?? buildEndlessRound(roundIndex);

  const targetSpecimenId = activeRound?.specimenIds[activeRound.targetKey] ?? SPECIMENS[0].id;
  const targetSpecimen = SPECIMEN_BY_ID[targetSpecimenId] ?? SPECIMENS[0];
  const totalRounds = playMode === 'daily' ? dailyConfig.rounds.length : roundIndex + 1;
  const totalScore = results.reduce((acc, r) => acc + r.points, 0);

  function handleSwitchMode(nextMode: 'daily' | 'endless') {
    if (nextMode === playMode) return;
    sound.tap();
    setPlayMode(nextMode);
    if (nextMode === 'endless') {
      setEndlessRounds([buildEndlessRound(0)]);
      setRoundIndex(0);
      setPhase('hunt');
      setWrongPicks([]);
      setZoom(0);
      setFreeZoomActive(false);
      setPingedKey(null);
      setGuess('');
      setErrorMsg('');
      setResults([]);
      setCurrentJudgment(null);
    }
  }

  function handleTilePick(idx: number) {
    if (phase !== 'hunt' || !activeRound) return;
    if (idx === activeRound.targetKey) {
      sound.found();
      setPingedKey(null);
      setPhase('guess');
    } else {
      sound.wrong();
      setShakeIdx(idx);
      setTimeout(() => setShakeIdx(null), 220);
      setWrongPicks((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
    }
  }

  function handleUseSonar() {
    if (phase !== 'hunt' || pingedKey !== null) return;
    if (onUseItem('radar_ping')) {
      sound.sonar();
      setPingedKey(activeRound.targetKey);
    }
  }

  function handleUseFreeZoom() {
    if (phase !== 'guess' || freeZoomActive) return;
    if (onUseItem('free_zoom')) {
      sound.zoom();
      setFreeZoomActive(true);
      setZoom(2);
    }
  }

  async function handleSubmitGuess(e: React.FormEvent) {
    e.preventDefault();
    if (!guess.trim() || phase !== 'guess') return;
    setErrorMsg('');
    setPhase('scoring');

    try {
      const res = await fetch('/api/judge-copycat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specimenId: targetSpecimen.id,
          guess: guess.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not evaluate description.');
      }
      const judgment: CopyJudgment = data;
      const pts = computeRoundPoints(judgment.score, zoom, wrongPicks.length, freeZoomActive);
      const roundRes: RoundResult = {
        roundIndex,
        specimenId: targetSpecimen.id,
        guess: guess.trim(),
        zoom,
        score: judgment.score,
        points: pts,
        misses: wrongPicks.length,
        judgment,
      };

      setCurrentJudgment(judgment);
      setResults((prev) => [...prev, roundRes]);
      setPhase('reveal');

      // Award instant round XP & coins
      const roundXp = 25 + Math.round(pts * 0.6);
      const roundCoins = 12 + Math.round(pts * 0.25);
      onReward(roundXp, roundCoins, {
        bestCopyScore: Math.max(progression.stats.bestCopyScore, judgment.score),
      });

      if (pts >= 75) {
        sound.victory();
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#c3f24d', '#f96294', '#f8f6f0'],
          disableForReducedMotion: true,
        });
      } else {
        sound.found();
      }
    } catch (err) {
      setPhase('guess');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Try submitting again.');
    }
  }

  function handleNextRound() {
    sound.tap();
    if (playMode === 'daily' && roundIndex >= dailyConfig.rounds.length - 1) {
      setPhase('done');
      const finalTotal = results.reduce((acc, r) => acc + r.points, 0);
      onReward(
        80,
        40,
        {
          huntsCompleted: progression.stats.huntsCompleted + 1,
          bestHuntScore: Math.max(progression.stats.bestHuntScore, finalTotal),
        },
        dailyConfig.date
      );
      onRecordRun('hunt', finalTotal, `${results.length} rounds · daily`);
      return;
    }

    const nextIdx = roundIndex + 1;
    if (playMode === 'endless') {
      setEndlessRounds((prev) => [...prev, buildEndlessRound(nextIdx)]);
    }
    setRoundIndex(nextIdx);
    setWrongPicks([]);
    setZoom(0);
    setFreeZoomActive(false);
    setPingedKey(null);
    setGuess('');
    setErrorMsg('');
    setCurrentJudgment(null);
    setPhase('hunt');
  }

  function buildSharePayload(): SharePayload {
    const emojis = results
      .map((r) => (r.points >= 75 ? '🟢' : r.points >= 40 ? '🟡' : '⚪'))
      .join(' ');
    const maxPts = results.length * 100;
    return {
      title: `Minuscule · ${playMode === 'daily' ? dailyConfig.date : 'Endless Run'}`,
      modeLabel: playMode === 'daily' ? `Daily Tiny Hunt · ${dailyConfig.date}` : 'Endless Tiny Hunt',
      headlineStat: `${totalScore}/${maxPts}`,
      subStat: `Avg CopyCat Match: ${Math.round(
        results.reduce((a, b) => a + b.score, 0) / Math.max(1, results.length)
      )}%`,
      emojiGrid: emojis,
      summaryText: `MINUSCULE · ${playMode === 'daily' ? dailyConfig.date : 'Endless'}\n${emojis}\nScore: ${totalScore}/${maxPts}`,
      accentHex: '#3b5bff',
    };
  }

  const specimenDisplayPx =
    phase === 'reveal' || phase === 'done'
      ? 360
      : Math.round((activeRound?.tinySize ?? 13) * (ZOOM_SCALES[zoom] ?? 1));

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8">
      {/* Mode & Round Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-wider">
          <span style={{ color: 'var(--accent-primary)' }}>
            {playMode === 'daily'
              ? `Daily Run · Round ${Math.min(roundIndex + 1, dailyConfig.rounds.length)}/${dailyConfig.rounds.length}`
              : `Endless Round ${roundIndex + 1}`}
          </span>
          <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
            ·
          </span>
          <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Score {totalScore}
          </span>
        </div>

        <div
          className="flex items-center gap-1 rounded-lg p-1"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <button
            type="button"
            onClick={() => handleSwitchMode('daily')}
            className="rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
            style={{
              backgroundColor: playMode === 'daily' ? 'var(--bg-elevated)' : 'transparent',
              color: playMode === 'daily' ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            Daily 5-Round
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('endless')}
            className="rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
            style={{
              backgroundColor: playMode === 'endless' ? 'var(--bg-elevated)' : 'transparent',
              color: playMode === 'endless' ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            Endless Practice
          </button>
        </div>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
        {/* Left Visual Stage */}
        <div>
          {phase === 'hunt' ? (
            <div
              className="rounded-3xl border p-3.5 shadow-xl"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              <div className="grid grid-cols-3 gap-3">
                {activeRound.specimenIds.map((specId, idx) => {
                  const spec = SPECIMEN_BY_ID[specId] ?? SPECIMENS[0];
                  const isWrong = wrongPicks.includes(idx);
                  const isPinged = pingedKey === idx;
                  const sizePx =
                    idx === activeRound.targetKey
                      ? activeRound.tinySize
                      : activeRound.tinySize + DISTRACTOR_OFFSETS[idx % DISTRACTOR_OFFSETS.length];

                  return (
                    <button
                      key={`${specId}-${idx}`}
                      type="button"
                      onClick={() => handleTilePick(idx)}
                      disabled={isWrong}
                      aria-label={`Specimen tile ${idx + 1}`}
                      className={`relative grid aspect-square place-items-center rounded-2xl border transition-colors cursor-pointer ${
                        shakeIdx === idx ? 'animate-shake' : ''
                      }`}
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        borderColor: isPinged
                          ? 'var(--accent-primary)'
                          : isWrong
                            ? 'var(--accent-pop)'
                            : 'var(--border-hairline)',
                        opacity: isWrong ? 0.42 : 1,
                      }}
                    >
                      <span
                        className="overflow-hidden rounded-sm block"
                        style={{ width: sizePx, height: sizePx }}
                      >
                        <img
                          src={spec.imageUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      </span>

                      {isWrong && (
                        <span
                          className="absolute bottom-1.5 font-mono text-[10px] uppercase tracking-wider tabular-nums"
                          style={{ color: 'var(--accent-pop)' }}
                        >
                          too big · {sizePx}px
                        </span>
                      )}

                      {isPinged && !isWrong && (
                        <span
                          className="absolute top-1.5 right-2 font-mono text-[10px] uppercase tracking-wider"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          Sonar
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : phase === 'reveal' && currentJudgment ? (
            <CopyComparison
              originalUrl={targetSpecimen.imageUrl}
              originalTitle={targetSpecimen.title}
              blueprint={currentJudgment.blueprint}
              score={currentJudgment.score}
            />
          ) : (
            <figure
              className="rounded-3xl border p-4 shadow-xl"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              <div className="mb-3 flex items-center justify-between px-1 font-mono text-xs uppercase tracking-wider">
                <span style={{ color: 'var(--text-muted)' }}>
                  Specimen {String(roundIndex + 1).padStart(2, '0')}
                </span>
                <span className="tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                  {specimenDisplayPx} px
                </span>
              </div>

              <div
                className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl"
                style={{ backgroundColor: 'var(--bg-canvas)' }}
              >
                <div
                  className="overflow-hidden rounded-lg border transition-[width,height] duration-300"
                  style={{
                    width: specimenDisplayPx,
                    height: specimenDisplayPx,
                    borderColor: 'var(--border-hairline)',
                  }}
                >
                  <img
                    src={targetSpecimen.imageUrl}
                    alt={phase === 'done' ? targetSpecimen.title : 'Tiny specimen to describe'}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <figcaption className="mt-3 flex items-center justify-between px-1 text-xs">
                <span className="font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {phase === 'done'
                    ? 'Run Complete'
                    : freeZoomActive
                      ? 'Precision Loupe Active (0% cost)'
                      : `Zoom ${ZOOM_SCALES[zoom]}×`}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {phase === 'done' ? targetSpecimen.title : 'Describe what you see'}
                </span>
              </figcaption>
            </figure>
          )}
        </div>

        {/* Right Controls & Briefing */}
        <div>
          {phase === 'hunt' && (
            <div>
              <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-balance sm:text-5xl">
                Find the{' '}
                <span style={{ color: 'var(--accent-primary)' }}>smallest picture.</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Nine illustrations sit in the grid and one is genuinely smaller ({activeRound.tinySize}px) than
                the rest. Spot it first, then recreate what you see in a CopyCat prompt duel.
              </p>

              <div
                className="mt-6 rounded-2xl border p-4"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span style={{ color: 'var(--text-muted)' }}>
                    Wrong taps: {wrongPicks.length} (Multiplier{' '}
                    {Math.round(
                      (MISS_MULTIPLIERS[Math.min(wrongPicks.length, MISS_MULTIPLIERS.length - 1)] ?? 0.35) * 100
                    )}
                    %)
                  </span>
                  <span style={{ color: 'var(--accent-primary)' }}>Base 100 pts</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleUseSonar}
                    disabled={progression.inventory.radar_ping <= 0 || pingedKey !== null}
                    className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-40"
                    style={{
                      borderColor: 'var(--border-hairline)',
                      backgroundColor: 'var(--bg-canvas)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Crosshair className="h-3.5 w-3.5" style={{ color: 'var(--accent-primary)' }} />
                    <span>
                      Use Sonar Ping ({progression.inventory.radar_ping})
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {(phase === 'guess' || phase === 'scoring') && (
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl">
                Describe the <span style={{ color: 'var(--accent-primary)' }}>tiny specimen.</span>
              </h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Write a crisp visual prompt (subject, colors, setting). The AI paints your CopyCat illustration
                and grades how closely it matches the hidden original.
              </p>

              {/* Zoom Loupe Controls */}
              <div
                className="mt-5 rounded-2xl border p-4"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    <p className="font-semibold">Specimen Loupe</p>
                    <p className="font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {freeZoomActive
                        ? 'Precision Loupe active: 0% point penalty'
                        : zoom === 0
                          ? '1× Native · 100% points'
                          : zoom === 1
                            ? '1.75× Zoom · -40% points'
                            : '2.6× Zoom · -70% points'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.zoom();
                        setZoom((z) => Math.min(2, z + 1));
                      }}
                      disabled={zoom >= 2 || phase === 'scoring'}
                      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer disabled:opacity-40"
                      style={{
                        borderColor: 'var(--border-hairline)',
                        backgroundColor: 'var(--bg-canvas)',
                      }}
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                      <span>Zoom In</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleUseFreeZoom}
                      disabled={freeZoomActive || progression.inventory.free_zoom <= 0 || phase === 'scoring'}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer disabled:opacity-40"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Free 2.6× ({progression.inventory.free_zoom})</span>
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitGuess} className="mt-5 space-y-3">
                <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider">
                  <label style={{ color: 'var(--text-muted)' }}>
                    Your CopyCat Prompt
                  </label>
                  <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {guess.length}/120
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={120}
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  disabled={phase === 'scoring'}
                  placeholder="e.g., Bright yellow rubber duck floating in turquoise swimming pool water..."
                  className="w-full rounded-2xl border p-4 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)',
                  }}
                />
                {errorMsg && (
                  <p className="text-xs font-medium" style={{ color: 'var(--accent-pop)' }}>
                    {errorMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!guess.trim() || phase === 'scoring'}
                  className="w-full rounded-xl py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-primary-fg)',
                  }}
                >
                  {phase === 'scoring' ? 'Painting CopyCat & Judging Match...' : 'Generate Copy & Score'}
                </button>
              </form>
            </div>
          )}

          {phase === 'reveal' && currentJudgment && (
            <div className="space-y-5">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Round {roundIndex + 1} Verdict
                </p>
                <div className="mt-1 flex items-baseline gap-3">
                  <span
                    className="font-display text-6xl font-extrabold tabular-nums"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {results[results.length - 1]?.points ?? 0}
                  </span>
                  <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                    pts earned ({currentJudgment.score}% visual match)
                  </span>
                </div>
                <p className="mt-3 text-base font-medium leading-relaxed">{currentJudgment.verdict}</p>
              </div>

              <div
                className="rounded-2xl border p-4 space-y-3"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                {[
                  { label: 'Subject', val: currentJudgment.subjectScore },
                  { label: 'Palette', val: currentJudgment.paletteScore },
                  { label: 'Composition', val: currentJudgment.compositionScore },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center gap-3 text-xs">
                    <span className="w-24 font-mono" style={{ color: 'var(--text-muted)' }}>
                      {metric.label}
                    </span>
                    <div
                      className="h-2 flex-1 overflow-hidden rounded-full"
                      style={{ backgroundColor: 'var(--bg-canvas)' }}
                    >
                      <div
                        className="h-full transition-[width] duration-500"
                        style={{
                          width: `${metric.val}%`,
                          backgroundColor: 'var(--accent-primary)',
                        }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono tabular-nums">{metric.val}%</span>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl border p-4 text-xs leading-relaxed"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <p className="font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Secret Prompt Revealed
                </p>
                <p className="mt-1.5 text-sm">{currentJudgment.answer}</p>
              </div>

              <button
                type="button"
                onClick={handleNextRound}
                className="w-full rounded-xl py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5 cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary-fg)',
                }}
              >
                {playMode === 'daily' && roundIndex >= dailyConfig.rounds.length - 1
                  ? 'Finish Daily Run'
                  : 'Next Specimen →'}
              </button>
            </div>
          )}

          {phase === 'done' && (
            <div className="space-y-5">
              <div
                className="rounded-2xl border p-6"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Daily Run Complete
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className="font-display text-6xl font-extrabold tabular-nums"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {totalScore}
                  </span>
                  <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                    / {totalRounds * 100}
                  </span>
                </div>

                <div className="mt-5 space-y-2.5">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <span className="w-6 font-mono" style={{ color: 'var(--text-muted)' }}>
                        0{i + 1}
                      </span>
                      <div
                        className="h-2 flex-1 overflow-hidden rounded-full"
                        style={{ backgroundColor: 'var(--bg-canvas)' }}
                      >
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.min(100, r.points)}%`,
                            backgroundColor: 'var(--accent-primary)',
                          }}
                        />
                      </div>
                      <span className="w-14 text-right font-mono tabular-nums">{r.points} pts</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onShare(buildSharePayload())}
                    className="flex-1 rounded-xl py-3 text-sm font-bold cursor-pointer transition-transform hover:-translate-y-0.5"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--accent-primary-fg)',
                    }}
                  >
                    Share Result
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('endless')}
                    className="rounded-xl border px-4 py-3 text-sm font-semibold cursor-pointer"
                    style={{
                      borderColor: 'var(--border-hairline)',
                      backgroundColor: 'var(--bg-canvas)',
                    }}
                  >
                    Play Endless
                  </button>
                </div>
              </div>

              {todayRuns.length > 0 && (
                <div
                  className="rounded-2xl border p-5"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                  }}
                >
                  <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Today’s Leaders
                  </p>
                  <ol className="mt-3 space-y-2 text-sm">
                    {todayRuns.slice(0, 5).map((entry, idx) => (
                      <li key={entry.id} className="flex items-center justify-between">
                        <span>
                          <span className="font-mono text-xs mr-2" style={{ color: 'var(--text-muted)' }}>
                            {idx + 1}.
                          </span>
                          {entry.playerName}
                        </span>
                        <span className="font-mono text-xs tabular-nums" style={{ color: 'var(--accent-primary)' }}>
                          {entry.score}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subtle endless streak note */}
      {playMode === 'endless' && results.length > 0 && phase !== 'done' && (
        <div
          className="mt-10 flex items-center justify-between border-t pt-4 text-xs"
          style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-muted)' }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--accent-primary)' }} />
            Endless Practice earns XP & Coins every round
          </span>
          <button
            type="button"
            onClick={() => onShare(buildSharePayload())}
            className="font-semibold hover:underline cursor-pointer"
            style={{ color: 'var(--accent-primary)' }}
          >
            Share Endless Score
          </button>
        </div>
      )}
    </main>
  );
}
