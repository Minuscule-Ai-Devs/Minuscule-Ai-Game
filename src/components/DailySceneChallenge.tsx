import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Crosshair, Snowflake, ZoomIn } from 'lucide-react';
import type {
  DailyConfig,
  ItemId,
  PlayerProgression,
  ScenePackId,
  SharePayload,
} from '../types/game.ts';
import { SCENE_PACKS } from '../data/specimens.ts';
import { LOGICAL_H, LOGICAL_W, getSceneConfig, renderPixelScene } from '../lib/pixelScenes.ts';
import { sound } from '../lib/sound.ts';

interface DailySceneChallengeProps {
  dailyConfig: DailyConfig;
  progression: PlayerProgression;
  initialPackId?: ScenePackId;
  onReward: (xp: number, coins: number, patch?: Partial<PlayerProgression['stats']>) => void;
  onUseItem: (itemId: ItemId) => boolean;
  onShare: (payload: SharePayload) => void;
  onRecordRun: (mode: 'daily-scene', score: number, detail: string) => void;
  onNavigateShop: () => void;
}

export function DailySceneChallenge({
  dailyConfig,
  progression,
  initialPackId,
  onReward,
  onUseItem,
  onShare,
  onRecordRun,
  onNavigateShop,
}: DailySceneChallengeProps) {
  const [selectedPack, setSelectedPack] = useState<ScenePackId>(
    initialPackId ?? dailyConfig.dailyScenePack
  );
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [freezeRemainingMs, setFreezeRemainingMs] = useState(0);
  const [pingTargetId, setPingTargetId] = useState<string | null>(null);
  const [magnified, setMagnified] = useState(false);
  const [misclicks, setMisclicks] = useState(0);
  const [clickBurst, setClickBurst] = useState<{ x: number; y: number; ok: boolean; id: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tickRef = useRef(0);

  const isDailyPack = selectedPack === dailyConfig.dailyScenePack;
  const sceneConfig = getSceneConfig(selectedPack, isDailyPack ? dailyConfig.date : undefined);

  useEffect(() => {
    if (initialPackId) {
      resetScene(initialPackId);
    }
  }, [initialPackId]);

  function resetScene(pack: ScenePackId) {
    setSelectedPack(pack);
    setFoundIds(new Set());
    setElapsedMs(0);
    setRunning(false);
    setCompleted(false);
    setFreezeRemainingMs(0);
    setPingTargetId(null);
    setMisclicks(0);
    setClickBurst(null);
  }

  // Timer loop
  useEffect(() => {
    if (!running || completed) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      if (freezeRemainingMs > 0) {
        setFreezeRemainingMs((f) => Math.max(0, f - dt));
      } else {
        setElapsedMs((t) => t + dt);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [running, completed, freezeRemainingMs]);

  // Animation loop for pixel scene
  useEffect(() => {
    let raf = 0;
    let frame = 0;
    const draw = () => {
      frame++;
      if (frame % 3 === 0) {
        tickRef.current += 1;
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            renderPixelScene(ctx, sceneConfig, foundIds, tickRef.current, pingTargetId);
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [sceneConfig, foundIds, pingTargetId]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (completed) return;
    if (!running) setRunning(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const lx = ((e.clientX - rect.left) / rect.width) * LOGICAL_W;
    const ly = ((e.clientY - rect.top) / rect.height) * LOGICAL_H;

    let hitId: string | null = null;
    for (const t of sceneConfig.targets) {
      if (foundIds.has(t.id)) continue;
      const dist = Math.hypot(lx - t.x, ly - t.y);
      if (dist <= t.radius) {
        hitId = t.id;
        break;
      }
    }

    if (hitId) {
      sound.found();
      const nextFound = new Set(foundIds);
      nextFound.add(hitId);
      setFoundIds(nextFound);
      if (pingTargetId === hitId) setPingTargetId(null);
      setClickBurst({ x: (lx / LOGICAL_W) * 100, y: (ly / LOGICAL_H) * 100, ok: true, id: Date.now() });

      if (nextFound.size === sceneConfig.targets.length) {
        setCompleted(true);
        setRunning(false);
        const seconds = elapsedMs / 1000;
        const speedBonus = Math.max(0, Math.round(500 - seconds * 7));
        const accuracyPenalty = misclicks * 15;
        const finalScore = Math.max(200, 500 + speedBonus - accuracyPenalty);
        const earnedXp = 90 + Math.round(speedBonus * 0.35);
        const earnedCoins = 45 + Math.round(speedBonus * 0.15);

        sound.victory();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#c3f24d', '#f96294', '#38bdf8'],
          disableForReducedMotion: true,
        });

        onReward(earnedXp, earnedCoins, {
          dailyScenesCleared: progression.stats.dailyScenesCleared + 1,
          bestDailySceneScore: Math.max(progression.stats.bestDailySceneScore, finalScore),
        });
        onRecordRun(
          'daily-scene',
          finalScore,
          `${sceneConfig.title} · ${seconds.toFixed(1)}s`
        );
      }
    } else {
      sound.wrong();
      setMisclicks((m) => m + 1);
      setClickBurst({ x: (lx / LOGICAL_W) * 100, y: (ly / LOGICAL_H) * 100, ok: false, id: Date.now() });
    }
  }

  function handleSonarItem() {
    if (completed) return;
    const remaining = sceneConfig.targets.filter((t) => !foundIds.has(t.id));
    if (remaining.length === 0) return;
    if (onUseItem('radar_ping')) {
      sound.sonar();
      if (!running) setRunning(true);
      setPingTargetId(remaining[0].id);
    }
  }

  function handleFreezeItem() {
    if (completed || freezeRemainingMs > 0) return;
    if (onUseItem('time_freeze')) {
      sound.splash();
      if (!running) setRunning(true);
      setFreezeRemainingMs(12000);
    }
  }

  const seconds = elapsedMs / 1000;
  const currentSpeedBonus = Math.max(0, Math.round(500 - seconds * 7));
  const finalScore = Math.max(200, 500 + currentSpeedBonus - misclicks * 15);

  const sharePayload: SharePayload = {
    title: `Minuscule Daily Scene · ${sceneConfig.title}`,
    modeLabel: isDailyPack ? `Daily Pixel Scene · ${dailyConfig.date}` : `${sceneConfig.title} Pack`,
    headlineStat: `${finalScore} pts`,
    subStat: `Cleared 7/7 objects in ${seconds.toFixed(1)}s (+${currentSpeedBonus} speed bonus)`,
    emojiGrid: `⏱️ ${seconds.toFixed(1)}s · 🔍 ${foundIds.size}/7 · ⚡ +${currentSpeedBonus}`,
    summaryText: `MINUSCULE PIXEL SCENE · ${sceneConfig.title}\nCleared 7/7 in ${seconds.toFixed(
      1
    )}s · Score: ${finalScore} pts`,
    accentHex: '#c3f24d',
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
            {isDailyPack ? `Daily Pixel Challenge · ${dailyConfig.date}` : 'Themed Pixel Pack'}
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {sceneConfig.title}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {sceneConfig.subtitle} Faster clears earn up to +500 speed bonus points.
          </p>
        </div>

        {/* Pack Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SCENE_PACKS.map((pack) => {
            const unlocked = progression.unlockedPacks.includes(pack.id);
            const active = selectedPack === pack.id;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => {
                  if (unlocked) {
                    sound.tap();
                    resetScene(pack.id);
                  } else {
                    onNavigateShop();
                  }
                }}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
                style={{
                  backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: active ? 'var(--accent-primary-fg)' : unlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderColor: active ? 'var(--accent-primary)' : 'var(--border-hairline)',
                }}
              >
                {pack.name} {!unlocked ? `(◈ ${pack.price})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)]">
        {/* Interactive Pixel Canvas */}
        <div
          className="rounded-3xl border p-3.5 shadow-xl"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-4 font-mono text-xs tabular-nums">
              <span>
                Found <strong style={{ color: 'var(--accent-primary)' }}>{foundIds.size}/7</strong>
              </span>
              <span style={{ color: freezeRemainingMs > 0 ? '#38bdf8' : 'var(--text-primary)' }}>
                {freezeRemainingMs > 0
                  ? `FROZEN ${(freezeRemainingMs / 1000).toFixed(1)}s`
                  : `Timer ${seconds.toFixed(1)}s`}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>Speed Bonus +{currentSpeedBonus}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.zoom();
                  setMagnified((m) => !m);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                style={{
                  borderColor: magnified ? 'var(--accent-primary)' : 'var(--border-hairline)',
                  backgroundColor: 'var(--bg-canvas)',
                  color: magnified ? 'var(--accent-primary)' : 'var(--text-primary)',
                }}
              >
                <ZoomIn className="h-3.5 w-3.5" />
                <span>{magnified ? '1.5× Zoom' : '1× View'}</span>
              </button>
            </div>
          </div>

          <div
            className="relative overflow-auto rounded-2xl border"
            style={{
              borderColor: 'var(--border-hairline)',
              backgroundColor: '#050811',
            }}
          >
            <div
              className="relative mx-auto transition-transform duration-200 origin-center"
              style={{
                width: magnified ? '150%' : '100%',
              }}
            >
              <canvas
                ref={canvasRef}
                width={LOGICAL_W}
                height={LOGICAL_H}
                onClick={handleCanvasClick}
                className="pixelated block w-full h-auto cursor-crosshair select-none"
              />
              {clickBurst && (
                <span
                  key={clickBurst.id}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 w-6 h-6 animate-ping"
                  style={{
                    left: `${clickBurst.x}%`,
                    top: `${clickBurst.y}%`,
                    borderColor: clickBurst.ok ? '#c3f24d' : '#f96294',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Checklist & Items Sidebar */}
        <div className="space-y-4">
          {completed ? (
            <div
              className="rounded-2xl border p-6"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--accent-primary)',
              }}
            >
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                Scene Cleared
              </p>
              <p className="mt-2 font-display text-5xl font-extrabold tabular-nums">{finalScore} pts</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Completed in {seconds.toFixed(1)}s · Speed Bonus +{currentSpeedBonus} · Misclicks {misclicks}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onShare(sharePayload)}
                  className="flex-1 rounded-xl py-3 text-sm font-bold cursor-pointer"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-primary-fg)',
                  }}
                >
                  Share Clear
                </button>
                <button
                  type="button"
                  onClick={() => resetScene(selectedPack)}
                  className="rounded-xl border px-4 py-3 text-sm font-semibold cursor-pointer"
                  style={{
                    borderColor: 'var(--border-hairline)',
                    backgroundColor: 'var(--bg-canvas)',
                  }}
                >
                  Replay
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl border p-4 space-y-2.5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Power-Up Items
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleSonarItem}
                  disabled={progression.inventory.radar_ping <= 0}
                  className="flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-semibold cursor-pointer disabled:opacity-40"
                  style={{
                    borderColor: 'var(--border-hairline)',
                    backgroundColor: 'var(--bg-canvas)',
                  }}
                >
                  <Crosshair className="h-3.5 w-3.5" style={{ color: 'var(--accent-primary)' }} />
                  <span>Sonar ({progression.inventory.radar_ping})</span>
                </button>
                <button
                  type="button"
                  onClick={handleFreezeItem}
                  disabled={progression.inventory.time_freeze <= 0 || freezeRemainingMs > 0}
                  className="flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-semibold cursor-pointer disabled:opacity-40"
                  style={{
                    borderColor: 'var(--border-hairline)',
                    backgroundColor: 'var(--bg-canvas)',
                  }}
                >
                  <Snowflake className="h-3.5 w-3.5" style={{ color: '#38bdf8' }} />
                  <span>Freeze 12s ({progression.inventory.time_freeze})</span>
                </button>
              </div>
            </div>
          )}

          <div
            className="rounded-2xl border p-4"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-hairline)',
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Hidden Objects (7)
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                Tap canvas to start clock
              </span>
            </div>

            <ul className="space-y-2">
              {sceneConfig.targets.map((target) => {
                const isFound = foundIds.has(target.id);
                const isPinged = pingTargetId === target.id;
                return (
                  <li
                    key={target.id}
                    className="flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs"
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      borderColor: isPinged ? 'var(--accent-primary)' : 'var(--border-hairline)',
                      opacity: isFound ? 0.5 : 1,
                    }}
                  >
                    <div>
                      <p className={`font-semibold ${isFound ? 'line-through' : ''}`}>{target.label}</p>
                      <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {target.hint}
                      </p>
                    </div>
                    {isFound && (
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
