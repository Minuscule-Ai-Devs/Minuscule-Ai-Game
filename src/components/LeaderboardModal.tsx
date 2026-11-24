import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { LeaderboardEntry } from '../types/game.ts';

interface LeaderboardModalProps {
  open: boolean;
  playerId: string;
  onClose: () => void;
}

const MODES: Array<{ id: 'all' | 'hunt' | 'daily-scene' | 'copycat'; label: string }> = [
  { id: 'all', label: 'All Modes' },
  { id: 'hunt', label: 'Tiny Hunt' },
  { id: 'daily-scene', label: 'Daily Scene' },
  { id: 'copycat', label: 'CopyCat' },
];

export function LeaderboardModal({ open, playerId, onClose }: LeaderboardModalProps) {
  const [modeFilter, setModeFilter] = useState<'all' | 'hunt' | 'daily-scene' | 'copycat'>('all');
  const [runs, setRuns] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    const qs = modeFilter === 'all' ? '' : `?mode=${encodeURIComponent(modeFilter)}`;
    fetch(`/api/runs${qs}`)
      .then((r) => r.json())
      .then((data) => {
        if (active) setRuns(Array.isArray(data.runs) ? data.runs : []);
      })
      .catch(() => {
        if (active) setRuns([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, modeFilter]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Leaderboard"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border p-6 shadow-2xl max-h-[85vh] flex flex-col"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Hall of Micro-Sleuths</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Top scores recorded across daily runs, pixel scenes, and CopyCat duels
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close leaderboard"
            className="rounded-lg p-2 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="mt-4 flex flex-wrap items-center gap-1 rounded-lg p-1"
          style={{ backgroundColor: 'var(--bg-canvas)' }}
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModeFilter(m.id)}
              className="rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0"
              style={{
                backgroundColor: modeFilter === m.id ? 'var(--bg-elevated)' : 'transparent',
                color: modeFilter === m.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Loading leaderboard...
            </div>
          ) : runs.length === 0 ? (
            <div
              className="rounded-xl border border-dashed py-10 text-center text-sm"
              style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-muted)' }}
            >
              No runs recorded in this mode yet. Finish a game to claim the top spot!
            </div>
          ) : (
            runs.map((entry, idx) => {
              const isMe = entry.playerId === playerId;
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: isMe ? 'var(--accent-primary)' : 'var(--border-hairline)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-6 font-mono text-xs font-semibold tabular-nums"
                      style={{ color: idx === 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                    >
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {entry.playerName}
                        {isMe && (
                          <span className="ml-2 font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {entry.mode} · {entry.date} · {entry.detail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="font-display text-lg font-extrabold tabular-nums"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {entry.score}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
