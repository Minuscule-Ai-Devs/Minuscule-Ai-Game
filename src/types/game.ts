export type GameTab = 'hunt' | 'daily-scene' | 'copycat' | 'shop';

export type VisualStyleId = 'studio' | 'darkroom' | 'felt' | 'amber';

export type ItemId = 'free_zoom' | 'radar_ping' | 'time_freeze';

export type ScenePackId = 'harbor-night' | 'coral-trench' | 'kyoto-shrine' | 'orbital-cat';

export interface Specimen {
  id: string;
  title: string;
  imageUrl: string;
  secretPrompt: string;
  palette: string[];
  category: string;
}

export interface CopySvgShape {
  kind: 'rect' | 'circle' | 'ellipse' | 'triangle' | 'polygon' | 'path';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  cx?: number;
  cy?: number;
  r?: number;
  rx?: number;
  ry?: number;
  points?: string;
  d?: string;
}

export interface CopySceneBlueprint {
  skyTop: string;
  skyBottom: string;
  groundColor?: string;
  groundY?: number;
  shapes: CopySvgShape[];
}

export interface CopyJudgment {
  score: number;
  subjectScore: number;
  paletteScore: number;
  compositionScore: number;
  verdict: string;
  missingHint: string;
  answer: string;
  blueprint: CopySceneBlueprint;
}

export interface RoundResult {
  roundIndex: number;
  specimenId: string;
  guess: string;
  zoom: number;
  score: number;
  points: number;
  misses: number;
  judgment: CopyJudgment;
}

export interface PlayerProgression {
  playerId: string;
  playerName: string;
  xp: number;
  coins: number;
  streak: number;
  lastCompletedDate: string | null;
  unlockedPacks: ScenePackId[];
  unlockedStyles: VisualStyleId[];
  activeStyle: VisualStyleId;
  inventory: Record<ItemId, number>;
  stats: {
    huntsCompleted: number;
    dailyScenesCleared: number;
    bestHuntScore: number;
    bestDailySceneScore: number;
    bestCopyScore: number;
  };
}

export interface LeaderboardEntry {
  id: string;
  date: string;
  mode: 'hunt' | 'daily-scene' | 'copycat';
  playerId: string;
  playerName: string;
  score: number;
  detail: string;
  createdAt: string;
}

export interface SharePayload {
  title: string;
  modeLabel: string;
  headlineStat: string;
  subStat: string;
  emojiGrid: string;
  summaryText: string;
  accentHex?: string;
}

export interface DailyConfig {
  date: string;
  rounds: Array<{
    targetKey: number;
    tinySize: number;
    specimenIds: string[];
  }>;
  dailyScenePack: ScenePackId;
}
