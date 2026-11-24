import { useState } from 'react';
import { Volume2, VolumeX, Share2, Pencil, Check, HelpCircle } from 'lucide-react';
import type { PlayerProgression } from '../types/game.ts';
import { getRankForXp } from '../data/specimens.ts';

interface StatusStripProps {
  progression: PlayerProgression;
  muted: boolean;
  onToggleMute: () => void;
  onUpdateName: (name: string) => void;
  onQuickShare: () => void;
  onOpenHelp: () => void;
}

export function StatusStrip({
  progression,
  muted,
  onToggleMute,
  onUpdateName,
  onQuickShare,
  onOpenHelp,
}: StatusStripProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(progression.playerName);
  const { current, next } = getRankForXp(progression.xp);

  const xpProgressPct = next
    ? Math.min(
        100,
        Math.round(((progression.xp - current.minXp) / Math.max(1, next.minXp - current.minXp)) * 100)
      )
    : 100;

  function saveName() {
    const clean = draftName.trim().slice(0, 24) || 'PixelHunter';
    onUpdateName(clean);
    setDraftName(clean);
    setEditing(false);
  }

  return (
    <div
      className="border-b"
      style={{
        borderColor: 'var(--border-hairline)',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveName();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                maxLength={24}
                aria-label="Player name"
                className="w-32 rounded border px-2 py-0.5 text-xs font-medium outline-none"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--accent-primary)',
                  color: 'var(--text-primary)',
                }}
                autoFocus
              />
              <button
                type="submit"
                aria-label="Save name"
                className="rounded p-1 cursor-pointer"
                style={{ color: 'var(--accent-primary)' }}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftName(progression.playerName);
                setEditing(true);
              }}
              className="inline-flex items-center gap-1.5 font-semibold hover:underline cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              <span>{progression.playerName}</span>
              <Pencil className="h-3 w-3 opacity-60" />
            </button>
          )}

          <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
            ·
          </span>

          <div className="flex items-center gap-2">
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {current.name}
            </span>
            <div
              className="h-1.5 w-20 overflow-hidden rounded-full"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
              title={`${progression.xp} XP`}
            >
              <div
                className="h-full transition-[width] duration-300"
                style={{
                  width: `${xpProgressPct}%`,
                  backgroundColor: 'var(--accent-primary)',
                }}
              />
            </div>
            <span className="font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {progression.xp} XP
            </span>
          </div>

          <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
            ·
          </span>

          <span className="font-mono font-semibold tabular-nums" style={{ color: 'var(--accent-primary)' }}>
            ◈ {progression.coins} coins
          </span>

          <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
            ·
          </span>

          <span className="font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Streak {progression.streak}d
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Loupe {progression.inventory.free_zoom} · Sonar {progression.inventory.radar_ping} · Freeze{' '}
            {progression.inventory.time_freeze}
          </span>

          <button
            type="button"
            onClick={onOpenHelp}
            className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>How to Play</span>
          </button>

          <button
            type="button"
            onClick={onQuickShare}
            className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Progress</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="inline-flex items-center gap-1 font-medium transition-opacity hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
