import { useId, useState } from 'react';
import type { CopySceneBlueprint } from '../types/game.ts';

export function CopyCatSvgRenderer({ blueprint, label }: { blueprint: CopySceneBlueprint; label?: string }) {
  const gradId = useId();
  const skyTop = blueprint?.skyTop || '#e2e8f0';
  const skyBottom = blueprint?.skyBottom || '#cbd5e1';
  const shapes = Array.isArray(blueprint?.shapes) ? blueprint.shapes : [];

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full block select-none"
      role="img"
      aria-label={label || 'AI generated CopyCat illustration from your prompt'}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBottom} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${gradId})`} />
      {blueprint?.groundColor && typeof blueprint.groundY === 'number' && (
        <rect
          x="0"
          y={Math.max(0, Math.min(100, blueprint.groundY))}
          width="100"
          height={Math.max(0, 100 - blueprint.groundY)}
          fill={blueprint.groundColor}
        />
      )}
      {shapes.map((s, idx) => {
        const common = {
          fill: s.fill || '#3b5bff',
          stroke: s.stroke,
          strokeWidth: s.strokeWidth,
          opacity: typeof s.opacity === 'number' ? s.opacity : 1,
        };
        if (s.kind === 'circle') {
          return <circle key={idx} cx={s.cx ?? 50} cy={s.cy ?? 50} r={s.r ?? 15} {...common} />;
        }
        if (s.kind === 'ellipse') {
          return (
            <ellipse
              key={idx}
              cx={s.cx ?? 50}
              cy={s.cy ?? 50}
              rx={s.rx ?? 20}
              ry={s.ry ?? 12}
              {...common}
            />
          );
        }
        if (s.kind === 'triangle' || s.kind === 'polygon') {
          const pts =
            s.points ||
            `${s.cx ?? 50},${(s.cy ?? 50) - 18} ${(s.cx ?? 50) - 16},${(s.cy ?? 50) + 14} ${
              (s.cx ?? 50) + 16
            },${(s.cy ?? 50) + 14}`;
          return <polygon key={idx} points={pts} {...common} />;
        }
        if (s.kind === 'path' && s.d) {
          return <path key={idx} d={s.d} {...common} />;
        }
        return (
          <rect
            key={idx}
            x={s.x ?? 25}
            y={s.y ?? 25}
            width={s.w ?? 30}
            height={s.h ?? 30}
            rx={2}
            {...common}
          />
        );
      })}
    </svg>
  );
}

interface CopyComparisonProps {
  originalUrl: string;
  originalTitle: string;
  blueprint: CopySceneBlueprint;
  score: number;
}

export function CopyComparison({
  originalUrl,
  originalTitle,
  blueprint,
  score,
}: CopyComparisonProps) {
  const [viewMode, setViewMode] = useState<'side' | 'slider'>('side');
  const [splitPct, setSplitPct] = useState(50);

  return (
    <div
      className="rounded-2xl border p-4 shadow-sm"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          CopyCat Match · {score}% Similarity
        </span>
        <div
          className="flex items-center gap-1 rounded-lg p-1"
          style={{ backgroundColor: 'var(--bg-canvas)' }}
        >
          <button
            type="button"
            onClick={() => setViewMode('side')}
            className="rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor: viewMode === 'side' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'side' ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            Side by Side
          </button>
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className="rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor: viewMode === 'slider' ? 'var(--bg-surface)' : 'transparent',
              color: viewMode === 'slider' ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            Wipe Slider
          </button>
        </div>
      </div>

      {viewMode === 'side' ? (
        <div className="grid grid-cols-2 gap-3">
          <figure>
            <div
              className="aspect-square overflow-hidden rounded-xl border"
              style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-canvas)' }}
            >
              <img
                src={originalUrl}
                alt={originalTitle}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-2 flex items-center justify-between text-xs">
              <span className="font-mono uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                Target
              </span>
              <span className="truncate max-w-[110px]" style={{ color: 'var(--text-muted)' }}>
                {originalTitle}
              </span>
            </figcaption>
          </figure>
          <figure>
            <div
              className="aspect-square overflow-hidden rounded-xl border"
              style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-canvas)' }}
            >
              <CopyCatSvgRenderer blueprint={blueprint} label="Your CopyCat image generated from prompt" />
            </div>
            <figcaption className="mt-2 flex items-center justify-between text-xs">
              <span className="font-mono uppercase tracking-wider" style={{ color: 'var(--accent-pop)' }}>
                Your Copy
              </span>
              <span style={{ color: 'var(--text-muted)' }}>from prompt</span>
            </figcaption>
          </figure>
        </div>
      ) : (
        <div>
          <div
            className="relative aspect-square w-full overflow-hidden rounded-xl border select-none"
            style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-canvas)' }}
          >
            <img
              src={originalUrl}
              alt={originalTitle}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - splitPct}% 0 0)` }}
            >
              <CopyCatSvgRenderer blueprint={blueprint} label="Your Copy overlay" />
            </div>
            <div
              className="pointer-events-none absolute inset-y-0 w-0.5"
              style={{
                left: `${splitPct}%`,
                backgroundColor: 'var(--accent-primary)',
              }}
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-mono text-xs" style={{ color: 'var(--accent-pop)' }}>
              Your Copy
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={splitPct}
              onChange={(e) => setSplitPct(Number(e.target.value))}
              aria-label="Compare Your Copy and Target"
              className="flex-1 accent-current cursor-pointer"
              style={{ color: 'var(--accent-primary)' }}
            />
            <span className="font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>
              Target
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
