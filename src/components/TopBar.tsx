import type { GameTab } from '../types/game.ts';

interface TopBarProps {
  activeTab: GameTab;
  onSelectTab: (tab: GameTab) => void;
  onOpenLeaderboard: () => void;
}

const NAV_ITEMS: Array<{ id: GameTab; label: string }> = [
  { id: 'hunt', label: 'Tiny Hunt' },
  { id: 'daily-scene', label: 'Daily Scene' },
  { id: 'copycat', label: 'CopyCat' },
  { id: 'shop', label: 'Shop & Ranks' },
];

export function TopBar({ activeTab, onSelectTab, onOpenLeaderboard }: TopBarProps) {
  return (
    <header
      className="border-b"
      style={{
        borderColor: 'var(--border-hairline)',
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-8 px-6 py-4">
        <button
          type="button"
          onClick={() => onSelectTab('hunt')}
          className="font-display text-xl font-extrabold tracking-tight whitespace-nowrap shrink-0 cursor-pointer"
          style={{ color: 'var(--text-primary)' }}
        >
          Minuscule
        </button>

        <nav
          aria-label="Game Modes"
          className="hidden md:flex items-center gap-6 overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className="relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                style={{
                  color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute inset-x-0 -bottom-[17px] h-0.5"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="rounded-lg px-4 py-2 text-xs font-semibold transition-transform hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-primary-fg)',
            }}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Mobile horizontal mode switcher */}
      <div
        className="flex md:hidden items-center gap-4 overflow-x-auto border-t px-6 py-2.5"
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className="text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              style={{
                color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
