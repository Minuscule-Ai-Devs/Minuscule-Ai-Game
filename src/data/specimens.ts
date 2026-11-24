import type { ItemId, ScenePackId, Specimen, VisualStyleId } from '../types/game.ts';

export const SPECIMENS: Specimen[] = [
  {
    id: 'lighthouse',
    title: 'Coastal Sunset Lighthouse',
    imageUrl: '/src/assets/images/specimen_lighthouse_1795505033371.jpg',
    secretPrompt:
      'Red-and-white striped coastal lighthouse perched on dark basalt cliffs at golden tangerine sunset with crashing white ocean surf.',
    palette: ['#E23D28', '#F8F6F0', '#F59E0B', '#1F2937', '#0F172A'],
    category: 'Landscape',
  },
  {
    id: 'astronaut-cat',
    title: 'Orbiting Tabby Astronaut',
    imageUrl: '/src/assets/images/specimen_astronaut_cat_1795505033735.jpg',
    secretPrompt:
      'Orange tabby cat wearing a retro brass-and-glass astronaut helmet floating in deep midnight space beside a pastel ringed planet and stars.',
    palette: ['#EA580C', '#0F172A', '#C4B5FD', '#FDE68A', '#38BDF8'],
    category: 'Space',
  },
  {
    id: 'ramen-bowl',
    title: 'Midnight Tonkotsu Ramen',
    imageUrl: '/src/assets/images/specimen_ramen_bowl_1795505034750.jpg',
    secretPrompt:
      'Overhead view of a matte black ceramic ramen bowl with golden broth, soft-boiled egg, pink-swirl narutomaki, green scallions, and wooden chopsticks.',
    palette: ['#1C1917', '#F59E0B', '#F472B6', '#22C55E', '#E7E5E4'],
    category: 'Culinary',
  },
  {
    id: 'bonsai-lantern',
    title: 'Crimson Maple & Stone Lantern',
    imageUrl: '/src/assets/images/specimen_bonsai_lantern_1795505034685.jpg',
    secretPrompt:
      'Sculptural crimson Japanese maple bonsai tree beside a glowing warm amber stone lantern on mossy dark slate against misty teal forest.',
    palette: ['#B91C1C', '#F59E0B', '#14B8A6', '#1E293B', '#4D7C0F'],
    category: 'Botanical',
  },
  {
    id: 'yellow-submarine',
    title: 'Explorer 7 Bathysphere',
    imageUrl: '/src/assets/images/specimen_yellow_submarine_1795505035381.jpg',
    secretPrompt:
      'Bright canary yellow vintage submarine with glowing brass portholes diving through deep cobalt ocean surrounded by coral pink jellyfish.',
    palette: ['#FACC15', '#1D4ED8', '#FB7185', '#0F172A', '#38BDF8'],
    category: 'Oceanic',
  },
  {
    id: 'espresso-croissant',
    title: 'Morning Marble Café',
    imageUrl: '/src/assets/images/specimen_espresso_croissant_1795505035511.jpg',
    secretPrompt:
      'Overhead café table on pale marble with a flaky golden croissant on a white plate beside a cobalt blue espresso cup with latte rosetta.',
    palette: ['#B45309', '#1D4ED8', '#F8FAFC', '#D6D3D1', '#78350F'],
    category: 'Café',
  },
  {
    id: 'cactus-neon',
    title: 'Moonlit Desert Saguaro',
    imageUrl: '/src/assets/images/specimen_cactus_neon_1795505036829.jpg',
    secretPrompt:
      'Emerald green saguaro cactus topped with a coral bloom in a terracotta pot against a warm peach sunset sky and crescent moon.',
    palette: ['#059669', '#FB7185', '#C2410C', '#FDBA74', '#FEF3C7'],
    category: 'Minimalist',
  },
  {
    id: 'rubber-duck',
    title: 'Turquoise Pool Rubber Duck',
    imageUrl: '/src/assets/images/specimen_rubber_duck_1795505036065.jpg',
    secretPrompt:
      'Bright yellow rubber duck floating in sparkling turquoise tiled swimming pool water with crisp geometric light ripples.',
    palette: ['#FACC15', '#06B6D4', '#F97316', '#E0F2FE', '#0E7490'],
    category: 'Playful',
  },
  {
    id: 'vintage-camera',
    title: 'Rangefinder & Autumn Ginkgo',
    imageUrl: '/src/assets/images/specimen_vintage_camera_1795505037686.jpg',
    secretPrompt:
      'Classic silver and black retro film camera with glass lens resting on warm mustard cloth beside two golden autumn ginkgo leaves.',
    palette: ['#18181B', '#D4D4D8', '#D97706', '#FACC15', '#F5F5F4'],
    category: 'Object',
  },
];

export const SPECIMEN_BY_ID: Record<string, Specimen> = Object.fromEntries(
  SPECIMENS.map((s) => [s.id, s])
);

export interface PackInfo {
  id: ScenePackId;
  name: string;
  subtitle: string;
  price: number;
  difficulty: 'Standard' | 'Hard' | 'Expert';
  previewColors: [string, string, string];
}

export const SCENE_PACKS: PackInfo[] = [
  {
    id: 'harbor-night',
    name: 'Harbor Night Market',
    subtitle: 'Lantern piers, fishing boats & dockside curiosities',
    price: 0,
    difficulty: 'Standard',
    previewColors: ['#0f172a', '#f59e0b', '#38bdf8'],
  },
  {
    id: 'coral-trench',
    name: 'Abyssal Coral Trench',
    subtitle: 'Bioluminescent reefs, sunken bells & abyss creatures',
    price: 180,
    difficulty: 'Hard',
    previewColors: ['#082f49', '#fb7185', '#facc15'],
  },
  {
    id: 'kyoto-shrine',
    name: 'Kyoto Maple Shrine',
    subtitle: 'Torii gates, stone lanterns, koi ponds & autumn leaves',
    price: 260,
    difficulty: 'Hard',
    previewColors: ['#132a27', '#ef4444', '#fbbf24'],
  },
  {
    id: 'orbital-cat',
    name: 'Orbital Cat Observatory',
    subtitle: 'Zero-G domes, star charts, nebulae & tiny satellites',
    price: 340,
    difficulty: 'Expert',
    previewColors: ['#1e1b4b', '#c084fc', '#f97316'],
  },
];

export interface StyleInfo {
  id: VisualStyleId;
  name: string;
  description: string;
  price: number;
  swatches: [string, string, string];
}

export const VISUAL_STYLES: StyleInfo[] = [
  {
    id: 'studio',
    name: 'CopyCat Studio',
    description: 'Crisp gallery canvas with electric cobalt & coral accents',
    price: 0,
    swatches: ['#f6f7fb', '#3b5bff', '#ff4d6d'],
  },
  {
    id: 'darkroom',
    name: 'Obsidian Darkroom',
    description: 'Deep slate canvas with acid chartreuse & rose accents',
    price: 140,
    swatches: ['#0d1117', '#c3f24d', '#f96294'],
  },
  {
    id: 'felt',
    name: 'Emerald Arcade Felt',
    description: 'Classic tabletop felt green with warm gold highlights',
    price: 180,
    swatches: ['#0b291c', '#f5c451', '#ff7a6b'],
  },
  {
    id: 'amber',
    name: 'CRT Amber Terminal',
    description: 'Phosphor-warm dark espresso with amber arcade glow',
    price: 220,
    swatches: ['#12100c', '#ffb830', '#ff6b4a'],
  },
];

export interface ItemInfo {
  id: ItemId;
  name: string;
  description: string;
  price: number;
  badge: string;
}

export const SHOP_ITEMS: ItemInfo[] = [
  {
    id: 'free_zoom',
    name: 'Precision Loupe',
    description: 'Zoom any tiny specimen to 2.6× with zero point penalty.',
    price: 60,
    badge: '0% COST',
  },
  {
    id: 'radar_ping',
    name: 'Sonar Ping',
    description: 'Highlights the zone holding the tiny pixel or hidden object.',
    price: 75,
    badge: 'LOCATE',
  },
  {
    id: 'time_freeze',
    name: 'Chrono Freeze',
    description: 'Freezes the Daily Scene challenge clock for 12 seconds.',
    price: 80,
    badge: 'FREEZE',
  },
];

export const RANKS = [
  { name: 'Pixel Spotter', minXp: 0 },
  { name: 'Micro Sleuth', minXp: 250 },
  { name: 'Loupe Artisan', minXp: 650 },
  { name: 'CopyCat Pro', minXp: 1200 },
  { name: 'Master Observer', minXp: 2000 },
  { name: 'Grand Minuscule', minXp: 3200 },
];

export function getRankForXp(xp: number) {
  let current = RANKS[0];
  let next = RANKS[1] ?? null;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
    }
  }
  return { current, next };
}
