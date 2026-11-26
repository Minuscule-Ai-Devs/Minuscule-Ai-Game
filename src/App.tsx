import { useEffect, useState } from 'react';
import type {
  DailyConfig,
  GameTab,
  ItemId,
  LeaderboardEntry,
  PlayerProgression,
  ScenePackId,
  SharePayload,
  VisualStyleId,
} from './types/game.ts';
import { TopBar } from './components/TopBar.tsx';
import { StatusStrip } from './components/StatusStrip.tsx';
import { TinyHuntGame } from './components/TinyHuntGame.tsx';
import { DailySceneChallenge } from './components/DailySceneChallenge.tsx';
import { CopyCatDuel } from './components/CopyCatDuel.tsx';
import { ShopAndRanks } from './components/ShopAndRanks.tsx';
import { ShareModal } from './components/ShareModal.tsx';
import { LeaderboardModal } from './components/LeaderboardModal.tsx';
import { HowToPlayModal } from './components/HowToPlayModal.tsx';
import { getRankForXp } from './data/specimens.ts';
import { sound } from './lib/sound.ts';

const PROGRESSION_KEY = 'minuscule:progression:v2';
const HIDE_HELP_KEY = 'minuscule:hideHowToPlay:v1';
const MUTE_KEY = 'minuscule:muted:v1';

function createDefaultProgression(): PlayerProgression {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `player-${Math.random().toString(36).slice(2, 10)}`;
  return {
    playerId: id,
    playerName: 'PixelSleuth',
    xp: 0,
    coins: 120,
    streak: 1,
    lastCompletedDate: null,
    unlockedPacks: ['harbor-night'],
    unlockedStyles: ['studio'],
    activeStyle: 'studio',
    inventory: {
      free_zoom: 1,
      radar_ping: 1,
      time_freeze: 1,
    },
    stats: {
      huntsCompleted: 0,
      dailyScenesCleared: 0,
      bestHuntScore: 0,
      bestDailySceneScore: 0,
      bestCopyScore: 0,
    },
  };
}

function loadProgression(): PlayerProgression {
  try {
    const raw = localStorage.getItem(PROGRESSION_KEY);
    if (!raw) return createDefaultProgression();
    const parsed = JSON.parse(raw);
    const def = createDefaultProgression();
    return {
      ...def,
      ...parsed,
      inventory: { ...def.inventory, ...(parsed.inventory || {}) },
      stats: { ...def.stats, ...(parsed.stats || {}) },
    };
  } catch {
    return createDefaultProgression();
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<GameTab>('hunt');
  const [progression, setProgression] = useState<PlayerProgression>(() => loadProgression());
  const [dailyConfig, setDailyConfig] = useState<DailyConfig | null>(null);
  const [todayRuns, setTodayRuns] = useState<LeaderboardEntry[]>([]);
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(MUTE_KEY) === 'true';
      sound.setMuted(saved);
      return saved;
    } catch {
      return false;
    }
  });
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [dontShowHelpAgain, setDontShowHelpAgain] = useState<boolean>(() => {
    try {
      return localStorage.getItem(HIDE_HELP_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [helpOpen, setHelpOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(HIDE_HELP_KEY) !== 'true';
    } catch {
      return true;
    }
  });
  const [launchPackId, setLaunchPackId] = useState<ScenePackId | undefined>(undefined);

  // Sync visual style data-theme attribute
  useEffect(() => {
    if (progression.activeStyle === 'studio') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', progression.activeStyle);
    }
    try {
      localStorage.setItem(PROGRESSION_KEY, JSON.stringify(progression));
    } catch {
      // ignore storage quota errors
    }
  }, [progression]);

  // Keep SoundEngine muted state synced with App state
  useEffect(() => {
    sound.setMuted(muted);
    try {
      localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
    } catch {
      // ignore storage quota errors
    }
  }, [muted]);

  // Fetch daily challenge & runs
  useEffect(() => {
    fetch('/api/daily')
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setDailyConfig(data.config);
        if (Array.isArray(data.todayRuns)) setTodayRuns(data.todayRuns);
      })
      .catch(() => {
        // Fallback deterministic local config if backend unreachable briefly
        const today = new Date().toISOString().slice(0, 10);
        setDailyConfig({
          date: today,
          dailyScenePack: 'harbor-night',
          rounds: [
            { targetKey: 4, tinySize: 15, specimenIds: ['lighthouse', 'astronaut-cat', 'ramen-bowl', 'bonsai-lantern', 'yellow-submarine', 'espresso-croissant', 'cactus-neon', 'rubber-duck', 'vintage-camera'] },
            { targetKey: 1, tinySize: 14, specimenIds: ['ramen-bowl', 'lighthouse', 'astronaut-cat', 'yellow-submarine', 'bonsai-lantern', 'cactus-neon', 'espresso-croissant', 'vintage-camera', 'rubber-duck'] },
            { targetKey: 7, tinySize: 13, specimenIds: ['rubber-duck', 'vintage-camera', 'cactus-neon', 'espresso-croissant', 'lighthouse', 'ramen-bowl', 'bonsai-lantern', 'astronaut-cat', 'yellow-submarine'] },
            { targetKey: 2, tinySize: 12, specimenIds: ['bonsai-lantern', 'yellow-submarine', 'ramen-bowl', 'lighthouse', 'rubber-duck', 'astronaut-cat', 'vintage-camera', 'cactus-neon', 'espresso-croissant'] },
            { targetKey: 5, tinySize: 11, specimenIds: ['espresso-croissant', 'cactus-neon', 'rubber-duck', 'vintage-camera', 'yellow-submarine', 'bonsai-lantern', 'astronaut-cat', 'lighthouse', 'ramen-bowl'] },
          ],
        });
      });
  }, []);

  function handleReward(
    xpDelta: number,
    coinsDelta: number,
    statPatch?: Partial<PlayerProgression['stats']>,
    markDailyDate?: string
  ) {
    setProgression((prev) => {
      let nextStreak = prev.streak;
      let nextLastDate = prev.lastCompletedDate;
      if (markDailyDate && prev.lastCompletedDate !== markDailyDate) {
        if (prev.lastCompletedDate) {
          const prevTime = new Date(`${prev.lastCompletedDate}T00:00:00Z`).getTime();
          const curTime = new Date(`${markDailyDate}T00:00:00Z`).getTime();
          const diffDays = Math.round((curTime - prevTime) / 86400000);
          nextStreak = diffDays === 1 ? prev.streak + 1 : 1;
        } else {
          nextStreak = 1;
        }
        nextLastDate = markDailyDate;
      }

      return {
        ...prev,
        xp: prev.xp + xpDelta,
        coins: prev.coins + coinsDelta,
        streak: nextStreak,
        lastCompletedDate: nextLastDate,
        stats: statPatch ? { ...prev.stats, ...statPatch } : prev.stats,
      };
    });
  }

  function handleUseItem(itemId: ItemId): boolean {
    if ((progression.inventory[itemId] ?? 0) <= 0) return false;
    setProgression((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [itemId]: Math.max(0, (prev.inventory[itemId] ?? 0) - 1),
      },
    }));
    return true;
  }

  function handleUnlockPack(packId: ScenePackId, price: number) {
    setProgression((prev) => {
      if (prev.unlockedPacks.includes(packId) || prev.coins < price) return prev;
      return {
        ...prev,
        coins: prev.coins - price,
        unlockedPacks: [...prev.unlockedPacks, packId],
      };
    });
  }

  function handleUnlockOrEquipStyle(styleId: VisualStyleId, price: number) {
    setProgression((prev) => {
      const already = prev.unlockedStyles.includes(styleId);
      if (!already && prev.coins < price) return prev;
      return {
        ...prev,
        coins: already ? prev.coins : prev.coins - price,
        unlockedStyles: already ? prev.unlockedStyles : [...prev.unlockedStyles, styleId],
        activeStyle: styleId,
      };
    });
  }

  function handleBuyItem(itemId: ItemId, price: number) {
    setProgression((prev) => {
      if (prev.coins < price) return prev;
      return {
        ...prev,
        coins: prev.coins - price,
        inventory: {
          ...prev.inventory,
          [itemId]: (prev.inventory[itemId] ?? 0) + 1,
        },
      };
    });
  }

  async function handleRecordRun(
    mode: 'hunt' | 'daily-scene' | 'copycat',
    score: number,
    detail: string
  ) {
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: progression.playerId,
          playerName: progression.playerName,
          mode,
          date: dailyConfig?.date ?? new Date().toISOString().slice(0, 10),
          score,
          detail,
        }),
      });
      const data = await res.json();
      if (data.entry && mode === 'hunt') {
        setTodayRuns((prev) => [data.entry, ...prev].sort((a, b) => b.score - a.score));
      }
    } catch {
      // ignore network failures for background leaderboard sync
    }
  }

  function handleQuickShare() {
    const { current } = getRankForXp(progression.xp);
    setSharePayload({
      title: `Minuscule Profile · ${progression.playerName}`,
      modeLabel: `${current.name} · ${progression.streak}d Streak`,
      headlineStat: `${progression.xp} XP`,
      subStat: `Best Hunt ${progression.stats.bestHuntScore} · Best Scene ${progression.stats.bestDailySceneScore} · Best CopyCat ${progression.stats.bestCopyScore}%`,
      emojiGrid: `◈ ${progression.coins} coins · 🔥 ${progression.streak}d · 🏆 ${progression.stats.huntsCompleted + progression.stats.dailyScenesCleared} clears`,
      summaryText: `MINUSCULE · ${progression.playerName} (${current.name})\nXP: ${progression.xp} · Streak: ${progression.streak}d\nBest Hunt: ${progression.stats.bestHuntScore} · Best Scene: ${progression.stats.bestDailySceneScore} · Best CopyCat: ${progression.stats.bestCopyScore}%`,
      accentHex: '#3b5bff',
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          sound.tap();
          setActiveTab(tab);
        }}
        onOpenLeaderboard={() => {
          sound.tap();
          setLeaderboardOpen(true);
        }}
      />

      <StatusStrip
        progression={progression}
        muted={muted}
        onToggleMute={() => {
          const next = !muted;
          sound.setMuted(next);
          setMuted(next);
          if (!next) sound.tap();
        }}
        onUpdateName={(name) => setProgression((p) => ({ ...p, playerName: name }))}
        onQuickShare={handleQuickShare}
        onOpenHelp={() => {
          sound.tap();
          setHelpOpen(true);
        }}
      />

      <div className="flex-1">
        {!dailyConfig ? (
          <div className="mx-auto max-w-6xl px-6 py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
            Preparing today’s specimens...
          </div>
        ) : activeTab === 'hunt' ? (
          <TinyHuntGame
            dailyConfig={dailyConfig}
            todayRuns={todayRuns}
            progression={progression}
            onReward={handleReward}
            onUseItem={handleUseItem}
            onShare={setSharePayload}
            onRecordRun={handleRecordRun}
          />
        ) : activeTab === 'daily-scene' ? (
          <DailySceneChallenge
            dailyConfig={dailyConfig}
            progression={progression}
            initialPackId={launchPackId}
            onReward={handleReward}
            onUseItem={handleUseItem}
            onShare={setSharePayload}
            onRecordRun={handleRecordRun}
            onNavigateShop={() => setActiveTab('shop')}
          />
        ) : activeTab === 'copycat' ? (
          <CopyCatDuel
            progression={progression}
            onReward={handleReward}
            onShare={setSharePayload}
            onRecordRun={handleRecordRun}
          />
        ) : (
          <ShopAndRanks
            progression={progression}
            onUnlockPack={handleUnlockPack}
            onLaunchPack={(packId) => {
              setLaunchPackId(packId);
              setActiveTab('daily-scene');
            }}
            onUnlockOrEquipStyle={handleUnlockOrEquipStyle}
            onBuyItem={handleBuyItem}
          />
        )}
      </div>

      <ShareModal
        payload={sharePayload}
        playerName={progression.playerName}
        onClose={() => setSharePayload(null)}
      />

      <LeaderboardModal
        open={leaderboardOpen}
        playerId={progression.playerId}
        onClose={() => setLeaderboardOpen(false)}
      />

      <HowToPlayModal
        open={helpOpen}
        dontShowAgain={dontShowHelpAgain}
        onToggleDontShowAgain={(val) => {
          setDontShowHelpAgain(val);
          try {
            localStorage.setItem(HIDE_HELP_KEY, val ? 'true' : 'false');
          } catch {
            // ignore storage errors
          }
        }}
        onSelectMode={(tab) => {
          sound.tap();
          setActiveTab(tab);
        }}
        onClose={() => {
          sound.tap();
          setHelpOpen(false);
        }}
      />
    </div>
  );
}
