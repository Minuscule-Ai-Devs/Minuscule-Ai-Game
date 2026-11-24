import { Check } from 'lucide-react';
import type { ItemId, PlayerProgression, ScenePackId, VisualStyleId } from '../types/game.ts';
import {
  RANKS,
  SCENE_PACKS,
  SHOP_ITEMS,
  VISUAL_STYLES,
  getRankForXp,
} from '../data/specimens.ts';
import { sound } from '../lib/sound.ts';

interface ShopAndRanksProps {
  progression: PlayerProgression;
  onUnlockPack: (packId: ScenePackId, price: number) => void;
  onLaunchPack: (packId: ScenePackId) => void;
  onUnlockOrEquipStyle: (styleId: VisualStyleId, price: number) => void;
  onBuyItem: (itemId: ItemId, price: number) => void;
}

export function ShopAndRanks({
  progression,
  onUnlockPack,
  onLaunchPack,
  onUnlockOrEquipStyle,
  onBuyItem,
}: ShopAndRanksProps) {
  const { current, next } = getRankForXp(progression.xp);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8 space-y-12">
      {/* Progression & Rank Summary */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div
          className="rounded-3xl border p-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
            Progression & Vault
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            {current.name}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {next
              ? `${next.minXp - progression.xp} XP until ${next.name}`
              : 'Maximum rank reached — Grand Minuscule!'}
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-5" style={{ borderColor: 'var(--border-hairline)' }}>
            {[
              { label: 'Coins', value: `◈ ${progression.coins}` },
              { label: 'Best Hunt', value: `${progression.stats.bestHuntScore} pts` },
              { label: 'Best Scene', value: `${progression.stats.bestDailySceneScore} pts` },
              { label: 'Best CopyCat', value: `${progression.stats.bestCopyScore}%` },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </p>
                <p className="mt-1 font-display text-xl font-bold tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rank Ladder */}
        <div
          className="rounded-3xl border p-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Rank Ladder
          </p>
          <ol className="mt-3 space-y-2 text-xs">
            {RANKS.map((rank) => {
              const reached = progression.xp >= rank.minXp;
              const isCurrent = rank.name === current.name;
              return (
                <li key={rank.name} className="flex items-center justify-between py-1">
                  <span
                    className={isCurrent ? 'font-bold' : 'font-medium'}
                    style={{ color: isCurrent ? 'var(--accent-primary)' : reached ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    {rank.name}
                  </span>
                  <span className="font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {rank.minXp} XP
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Themed Pixel Art Packs */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold">Themed Pixel Art Packs</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Unlock intricate pixel-art dioramas for the Hidden Object Challenge.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SCENE_PACKS.map((pack) => {
            const unlocked = progression.unlockedPacks.includes(pack.id);
            const canAfford = progression.coins >= pack.price;
            return (
              <div
                key={pack.id}
                className="flex flex-col justify-between rounded-2xl border p-5"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <div>
                  <div className="mb-3 flex h-16 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-hairline)' }}>
                    {pack.previewColors.map((hex, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {pack.difficulty}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold">{pack.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {pack.subtitle}
                  </p>
                </div>

                <div className="mt-5">
                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        sound.tap();
                        onLaunchPack(pack.id);
                      }}
                      className="w-full rounded-xl border py-2.5 text-xs font-bold cursor-pointer"
                      style={{
                        borderColor: 'var(--accent-primary)',
                        color: 'var(--accent-primary)',
                        backgroundColor: 'var(--bg-canvas)',
                      }}
                    >
                      Play Scene →
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        sound.unlock();
                        onUnlockPack(pack.id, pack.price);
                      }}
                      className="w-full rounded-xl py-2.5 text-xs font-bold cursor-pointer disabled:opacity-40"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--accent-primary-fg)',
                      }}
                    >
                      Unlock · ◈ {pack.price}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visual Styles */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold">Visual Styles</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Customize your studio palette across every game mode.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VISUAL_STYLES.map((style) => {
            const unlocked = progression.unlockedStyles.includes(style.id);
            const equipped = progression.activeStyle === style.id;
            const canAfford = progression.coins >= style.price;
            return (
              <div
                key={style.id}
                className="flex flex-col justify-between rounded-2xl border p-5"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: equipped ? 'var(--accent-primary)' : 'var(--border-hairline)',
                }}
              >
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    {style.swatches.map((hex, i) => (
                      <span
                        key={i}
                        className="h-6 w-6 rounded-md border"
                        style={{ backgroundColor: hex, borderColor: 'var(--border-hairline)' }}
                      />
                    ))}
                  </div>
                  <h3 className="font-display text-lg font-bold">{style.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {style.description}
                  </p>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    disabled={!unlocked && !canAfford}
                    onClick={() => {
                      sound.unlock();
                      onUnlockOrEquipStyle(style.id, unlocked ? 0 : style.price);
                    }}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold cursor-pointer disabled:opacity-40"
                    style={{
                      backgroundColor: equipped
                        ? 'var(--bg-elevated)'
                        : unlocked
                          ? 'var(--bg-canvas)'
                          : 'var(--accent-primary)',
                      color: equipped
                        ? 'var(--accent-primary)'
                        : unlocked
                          ? 'var(--text-primary)'
                          : 'var(--accent-primary-fg)',
                      border: unlocked ? '1px solid var(--border-hairline)' : 'none',
                    }}
                  >
                    {equipped ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Equipped</span>
                      </>
                    ) : unlocked ? (
                      <span>Equip Style</span>
                    ) : (
                      <span>Unlock · ◈ {style.price}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* In-Game Helpful Items */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold">In-Game Field Gear</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Stock up on tactical tools usable inside Tiny Hunt and Daily Scene challenges.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {SHOP_ITEMS.map((item) => {
            const count = progression.inventory[item.id] ?? 0;
            const canAfford = progression.coins >= item.price;
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border p-5"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span style={{ color: 'var(--accent-primary)' }}>{item.badge}</span>
                    <span style={{ color: 'var(--text-muted)' }}>Owned: {count}</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-lg font-bold">{item.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => {
                    sound.unlock();
                    onBuyItem(item.id, item.price);
                  }}
                  className="mt-5 w-full rounded-xl py-2.5 text-xs font-bold cursor-pointer disabled:opacity-40"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-primary-fg)',
                  }}
                >
                  Buy 1 · ◈ {item.price}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
