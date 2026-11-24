import type { ScenePackId } from '../types/game.ts';

export interface HiddenPixelTarget {
  id: string;
  label: string;
  hint: string;
  x: number; // logical coordinate inside 320x240 scene
  y: number;
  radius: number; // hit radius in logical pixels
  sprite: 'key' | 'duck' | 'crab' | 'compass' | 'crane' | 'pearl' | 'cassette' | 'star' | 'lantern' | 'fish' | 'cat' | 'gem' | 'mushroom' | 'teacup';
}

export interface PixelSceneConfig {
  packId: ScenePackId;
  title: string;
  subtitle: string;
  targets: HiddenPixelTarget[];
}

export const LOGICAL_W = 320;
export const LOGICAL_H = 220;

export function getSceneConfig(packId: ScenePackId, dateSeed?: string): PixelSceneConfig {
  // Deterministic small offset from dateSeed so daily scene targets subtly shift on different days
  let offsetSeed = 0;
  if (dateSeed) {
    for (let i = 0; i < dateSeed.length; i++) {
      offsetSeed = (offsetSeed * 31 + dateSeed.charCodeAt(i)) % 997;
    }
  }
  const shift = (base: number, min: number, max: number, salt: number) => {
    if (!dateSeed) return base;
    const delta = ((offsetSeed + salt * 53) % 15) - 7;
    return Math.max(min, Math.min(max, base + delta));
  };

  switch (packId) {
    case 'coral-trench':
      return {
        packId,
        title: 'Abyssal Coral Trench',
        subtitle: 'Spot all 7 miniature relics camouflaged in the reef.',
        targets: [
          { id: 'pearl', label: 'Luminous Pearl', hint: 'Nestled inside the lower coral arch', x: shift(62, 24, 296, 1), y: shift(176, 30, 200, 2), radius: 13, sprite: 'pearl' },
          { id: 'crab', label: 'Crimson King Crab', hint: 'Scuttling near the seabed rocks', x: shift(236, 24, 296, 3), y: shift(196, 30, 205, 4), radius: 13, sprite: 'crab' },
          { id: 'compass', label: 'Sunken Compass', hint: 'Resting near the submarine hull shadow', x: shift(146, 24, 296, 5), y: shift(184, 30, 205, 6), radius: 13, sprite: 'compass' },
          { id: 'key', label: 'Brass Skeleton Key', hint: 'Floating near the left kelp forest', x: shift(34, 20, 296, 7), y: shift(118, 30, 200, 8), radius: 13, sprite: 'key' },
          { id: 'duck', label: 'Lost Bath Duck', hint: 'Bobbing among the upper bubbles', x: shift(268, 24, 296, 9), y: shift(64, 24, 196, 10), radius: 13, sprite: 'duck' },
          { id: 'gem', label: 'Abyssal Prism', hint: 'Tucked in the right anemone cluster', x: shift(286, 24, 300, 11), y: shift(154, 30, 200, 12), radius: 13, sprite: 'gem' },
          { id: 'fish', label: 'Golden Lanternfish', hint: 'Gliding silently above the mid-water trench', x: shift(182, 24, 296, 13), y: shift(86, 24, 196, 14), radius: 13, sprite: 'fish' },
        ],
      };
    case 'kyoto-shrine':
      return {
        packId,
        title: 'Kyoto Maple Shrine',
        subtitle: 'Find 7 tiny tokens hidden among torii rafters, moss, and koi water.',
        targets: [
          { id: 'crane', label: 'Origami Crane', hint: 'Perched on the lower torii beam', x: shift(112, 24, 296, 1), y: shift(84, 24, 196, 2), radius: 13, sprite: 'crane' },
          { id: 'teacup', label: 'Matcha Teacup', hint: 'Resting on the temple veranda stone', x: shift(234, 24, 296, 3), y: shift(156, 24, 200, 4), radius: 13, sprite: 'teacup' },
          { id: 'mushroom', label: 'Spotted Pine Mushroom', hint: 'Growing in the dark moss corner', x: shift(42, 20, 296, 5), y: shift(188, 24, 206, 6), radius: 13, sprite: 'mushroom' },
          { id: 'lantern', label: 'Mini Amber Charm', hint: 'Tucked near the stone lantern base', x: shift(274, 24, 300, 7), y: shift(178, 24, 200, 8), radius: 13, sprite: 'lantern' },
          { id: 'fish', label: 'Tiny Gold Koi', hint: 'Swimming inside the moonlit pond', x: shift(156, 24, 296, 9), y: shift(196, 24, 206, 10), radius: 13, sprite: 'fish' },
          { id: 'cat', label: 'Lucky Calico', hint: 'Peeking from behind the shrine roof', x: shift(254, 24, 296, 11), y: shift(108, 24, 196, 12), radius: 13, sprite: 'cat' },
          { id: 'key', label: 'Garden Gate Key', hint: 'Hanging on the left maple branch', x: shift(58, 24, 296, 13), y: shift(98, 24, 196, 14), radius: 13, sprite: 'key' },
        ],
      };
    case 'orbital-cat':
      return {
        packId,
        title: 'Orbital Cat Observatory',
        subtitle: 'Scan the zero-G observatory for 7 misplaced space artifacts.',
        targets: [
          { id: 'cat', label: 'Stowaway Kitten', hint: 'Floating near the observatory dome rim', x: shift(152, 24, 296, 1), y: shift(102, 24, 196, 2), radius: 13, sprite: 'cat' },
          { id: 'cassette', label: 'Mixtape Cassette', hint: 'Drifting past the lower solar array', x: shift(74, 24, 296, 3), y: shift(168, 24, 200, 4), radius: 13, sprite: 'cassette' },
          { id: 'star', label: 'Nova Crystal Star', hint: 'Shimmering beside the pastel ringed planet', x: shift(258, 24, 296, 5), y: shift(52, 20, 196, 6), radius: 13, sprite: 'star' },
          { id: 'compass', label: 'Astrolabe Dial', hint: 'Sitting on the brass telescope stand', x: shift(216, 24, 296, 7), y: shift(176, 24, 200, 8), radius: 13, sprite: 'compass' },
          { id: 'duck', label: 'Zero-G Rubber Duck', hint: 'Orbiting the upper left starfield', x: shift(48, 20, 296, 9), y: shift(48, 20, 196, 10), radius: 13, sprite: 'duck' },
          { id: 'teacup', label: 'Floating Espresso Mug', hint: 'Hovering inside the center window bay', x: shift(122, 24, 296, 11), y: shift(134, 24, 196, 12), radius: 13, sprite: 'teacup' },
          { id: 'gem', label: 'Meteorite Shard', hint: 'Lodged in the right asteroid belt', x: shift(286, 24, 300, 13), y: shift(144, 24, 200, 14), radius: 13, sprite: 'gem' },
        ],
      };
    case 'harbor-night':
    default:
      return {
        packId: 'harbor-night',
        title: 'Harbor Night Market',
        subtitle: 'Spot all 7 tiny objects hidden along the illuminated pixel docks.',
        targets: [
          { id: 'duck', label: 'Miniature Rubber Duck', hint: 'Drifting near the wooden pier pilings', x: shift(132, 24, 296, 1), y: shift(188, 24, 206, 2), radius: 13, sprite: 'duck' },
          { id: 'key', label: 'Lighthouse Brass Key', hint: 'Resting on the cliffside steps', x: shift(264, 24, 296, 3), y: shift(132, 24, 196, 4), radius: 13, sprite: 'key' },
          { id: 'crab', label: 'Tiny Harbor Crab', hint: 'Pinching along the wet stone seawall', x: shift(212, 24, 296, 5), y: shift(166, 24, 200, 6), radius: 13, sprite: 'crab' },
          { id: 'cassette', label: 'Sailor Mixtape', hint: 'Tucked on the market stall awning', x: shift(68, 24, 296, 7), y: shift(126, 24, 196, 8), radius: 13, sprite: 'cassette' },
          { id: 'crane', label: 'Paper Crane', hint: 'Perched on the moored trawler cabin', x: shift(174, 24, 296, 9), y: shift(154, 24, 196, 10), radius: 13, sprite: 'crane' },
          { id: 'star', label: 'Fallen Starfish', hint: 'Clinging to the dark dock rocks', x: shift(34, 20, 296, 11), y: shift(196, 24, 206, 12), radius: 13, sprite: 'star' },
          { id: 'compass', label: 'Pocket Compass', hint: 'Near the lighthouse lantern window', x: shift(274, 24, 296, 13), y: shift(64, 20, 196, 14), radius: 13, sprite: 'compass' },
        ],
      };
  }
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawTargetSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HiddenPixelTarget['sprite'],
  cx: number,
  cy: number,
  found: boolean
) {
  const x = Math.round(cx) - 4;
  const y = Math.round(cy) - 4;
  ctx.save();
  if (found) {
    ctx.globalAlpha = 0.25;
  }

  switch (sprite) {
    case 'duck':
      px(ctx, x + 2, y + 1, 3, 3, '#facc15');
      px(ctx, x + 1, y + 4, 6, 3, '#eab308');
      px(ctx, x + 5, y + 2, 2, 1, '#f97316');
      px(ctx, x + 3, y + 2, 1, 1, '#0f172a');
      break;
    case 'key':
      px(ctx, x + 1, y + 2, 3, 3, '#fbbf24');
      px(ctx, x + 2, y + 3, 1, 1, '#78350f');
      px(ctx, x + 4, y + 3, 4, 1, '#f59e0b');
      px(ctx, x + 6, y + 4, 1, 2, '#f59e0b');
      px(ctx, x + 8, y + 4, 1, 1, '#f59e0b');
      break;
    case 'crab':
      px(ctx, x + 2, y + 3, 5, 3, '#ef4444');
      px(ctx, x + 1, y + 1, 1, 2, '#f87171');
      px(ctx, x + 7, y + 1, 1, 2, '#f87171');
      px(ctx, x + 1, y + 6, 1, 2, '#dc2626');
      px(ctx, x + 7, y + 6, 1, 2, '#dc2626');
      px(ctx, x + 3, y + 4, 1, 1, '#ffffff');
      px(ctx, x + 5, y + 4, 1, 1, '#ffffff');
      break;
    case 'compass':
      px(ctx, x + 2, y + 1, 5, 6, '#d97706');
      px(ctx, x + 1, y + 2, 7, 4, '#f59e0b');
      px(ctx, x + 2, y + 2, 5, 4, '#f8fafc');
      px(ctx, x + 4, y + 2, 1, 2, '#ef4444');
      px(ctx, x + 4, y + 4, 1, 2, '#334155');
      break;
    case 'crane':
      px(ctx, x + 1, y + 4, 5, 2, '#f8fafc');
      px(ctx, x + 3, y + 1, 2, 4, '#e2e8f0');
      px(ctx, x + 6, y + 2, 2, 2, '#f8fafc');
      px(ctx, x + 8, y + 2, 1, 1, '#f97316');
      break;
    case 'pearl':
      px(ctx, x + 1, y + 4, 7, 3, '#be185d');
      px(ctx, x + 2, y + 2, 5, 3, '#f472b6');
      px(ctx, x + 3, y + 3, 3, 3, '#fef9c3');
      px(ctx, x + 4, y + 3, 1, 1, '#ffffff');
      break;
    case 'cassette':
      px(ctx, x + 1, y + 2, 7, 5, '#334155');
      px(ctx, x + 2, y + 3, 5, 2, '#f43f5e');
      px(ctx, x + 2, y + 4, 1, 1, '#f8fafc');
      px(ctx, x + 6, y + 4, 1, 1, '#f8fafc');
      break;
    case 'star':
      px(ctx, x + 4, y + 1, 1, 7, '#fde047');
      px(ctx, x + 1, y + 4, 7, 1, '#fde047');
      px(ctx, x + 2, y + 2, 5, 5, '#facc15');
      px(ctx, x + 4, y + 4, 1, 1, '#ffffff');
      break;
    case 'lantern':
      px(ctx, x + 3, y + 1, 3, 1, '#78350f');
      px(ctx, x + 2, y + 2, 5, 4, '#f97316');
      px(ctx, x + 3, y + 3, 3, 2, '#fef08a');
      px(ctx, x + 3, y + 6, 3, 1, '#78350f');
      break;
    case 'fish':
      px(ctx, x + 2, y + 3, 5, 3, '#fb923c');
      px(ctx, x + 1, y + 2, 1, 5, '#f97316');
      px(ctx, x + 6, y + 4, 1, 1, '#0f172a');
      px(ctx, x + 4, y + 2, 2, 1, '#fef08a');
      break;
    case 'cat':
      px(ctx, x + 2, y + 2, 1, 2, '#f97316');
      px(ctx, x + 6, y + 2, 1, 2, '#f97316');
      px(ctx, x + 2, y + 3, 5, 4, '#fb923c');
      px(ctx, x + 3, y + 4, 1, 1, '#0f172a');
      px(ctx, x + 5, y + 4, 1, 1, '#0f172a');
      px(ctx, x + 4, y + 5, 1, 1, '#fecdd3');
      break;
    case 'gem':
      px(ctx, x + 3, y + 1, 3, 1, '#67e8f9');
      px(ctx, x + 2, y + 2, 5, 3, '#06b6d4');
      px(ctx, x + 3, y + 5, 3, 2, '#0891b2');
      px(ctx, x + 4, y + 7, 1, 1, '#164e63');
      px(ctx, x + 3, y + 2, 1, 2, '#ecfeff');
      break;
    case 'mushroom':
      px(ctx, x + 2, y + 2, 5, 3, '#ef4444');
      px(ctx, x + 3, y + 2, 1, 1, '#ffffff');
      px(ctx, x + 5, y + 3, 1, 1, '#ffffff');
      px(ctx, x + 3, y + 5, 3, 3, '#fef3c7');
      break;
    case 'teacup':
      px(ctx, x + 2, y + 4, 5, 3, '#f8fafc');
      px(ctx, x + 7, y + 4, 1, 2, '#e2e8f0');
      px(ctx, x + 3, y + 4, 3, 1, '#4ade80');
      px(ctx, x + 3, y + 2, 1, 1, '#cbd5e1');
      px(ctx, x + 5, y + 1, 1, 2, '#cbd5e1');
      break;
  }
  ctx.restore();
}

export function renderPixelScene(
  ctx: CanvasRenderingContext2D,
  config: PixelSceneConfig,
  foundIds: Set<string>,
  tick: number,
  pingTargetId: string | null
) {
  ctx.imageSmoothingEnabled = false;
  const W = LOGICAL_W;
  const H = LOGICAL_H;

  if (config.packId === 'harbor-night') {
    // Sky gradient bands
    const skyColors = ['#070b14', '#0b1324', '#111c36', '#18284a', '#1e325c'];
    skyColors.forEach((c, i) => px(ctx, 0, i * 26, W, 27, c));

    // Twinkling stars
    for (let i = 0; i < 36; i++) {
      const sx = (i * 73 + 19) % W;
      const sy = (i * 37 + 11) % 105;
      const bright = (tick + i) % 12 < 6;
      px(ctx, sx, sy, 1, 1, bright ? '#fef9c3' : '#64748b');
    }

    // Crescent Moon
    px(ctx, 210, 22, 14, 14, '#fef08a');
    px(ctx, 215, 20, 12, 12, '#0b1324');

    // Distant city silhouette
    for (let i = 0; i < 18; i++) {
      const bw = 12 + ((i * 7) % 10);
      const bh = 18 + ((i * 13) % 28);
      px(ctx, i * 18, 125 - bh, bw, bh, '#0d1729');
      if (i % 2 === 0) {
        px(ctx, i * 18 + 3, 125 - bh + 4, 2, 2, '#fbbf24');
        px(ctx, i * 18 + 7, 125 - bh + 9, 2, 2, '#f59e0b');
      }
    }

    // Sea surface
    px(ctx, 0, 125, W, 95, '#0c2440');
    for (let y = 128; y < H; y += 6) {
      for (let x = ((y + Math.floor(tick / 4)) % 14); x < W; x += 18) {
        px(ctx, x, y, 6, 1, y < 150 ? '#1d4ed8' : '#0ea5e9');
      }
    }

    // Wooden pier on left
    px(ctx, 0, 134, 124, 12, '#451a03');
    px(ctx, 0, 132, 124, 3, '#78350f');
    for (let p = 10; p < 120; p += 22) {
      px(ctx, p, 144, 5, 46, '#2e1005');
    }

    // Night Market Stall on pier
    px(ctx, 28, 96, 76, 36, '#1e293b');
    for (let s = 0; s < 10; s++) {
      px(ctx, 24 + s * 8, 90, 8, 9, s % 2 === 0 ? '#ef4444' : '#f8fafc');
    }
    // Glowing paper lanterns on stall
    for (let l = 32; l <= 96; l += 16) {
      px(ctx, l, 102, 5, 6, '#f59e0b');
      px(ctx, l + 1, 103, 3, 4, '#fef08a');
    }
    // Hanging lamp posts
    px(ctx, 112, 96, 2, 36, '#334155');
    px(ctx, 110, 94, 6, 4, '#fde047');

    // Moored Trawler Boat
    px(ctx, 140, 152, 62, 14, '#7f1d1d');
    px(ctx, 136, 148, 70, 5, '#991b1b');
    px(ctx, 154, 136, 28, 12, '#f1f5f9');
    px(ctx, 160, 139, 8, 5, '#38bdf8');
    px(ctx, 172, 139, 8, 5, '#38bdf8');

    // Rocky Basalt Cliff & Lighthouse on right
    px(ctx, 232, 118, 88, 102, '#1e293b');
    px(ctx, 248, 102, 72, 24, '#334155');
    px(ctx, 260, 42, 24, 64, '#f8fafc');
    px(ctx, 260, 54, 24, 10, '#dc2626');
    px(ctx, 260, 74, 24, 10, '#dc2626');
    px(ctx, 260, 94, 24, 10, '#dc2626');
    px(ctx, 264, 30, 16, 12, '#fef08a');
    px(ctx, 262, 26, 20, 4, '#dc2626');
    // Lighthouse beam sweep
    const beamAlpha = Math.sin(tick * 0.08) * 0.08 + 0.14;
    ctx.save();
    ctx.fillStyle = `rgba(254, 240, 138, ${beamAlpha})`;
    ctx.beginPath();
    ctx.moveTo(264, 36);
    ctx.lineTo(140, 12);
    ctx.lineTo(140, 56);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Foreground dock rocks
    px(ctx, 0, 184, 52, 36, '#0f172a');
    px(ctx, 10, 178, 30, 12, '#1e293b');
  } else if (config.packId === 'coral-trench') {
    const bands = ['#0c4a6e', '#075985', '#0369a1', '#082f49', '#041c2c'];
    bands.forEach((c, i) => px(ctx, 0, i * 44, W, 45, c));

    // Sunbeams from surface
    for (let r = 0; r < 5; r++) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.09)';
      ctx.fillRect(30 + r * 60, 0, 18, 130);
    }

    // Bubbles rising
    for (let b = 0; b < 22; b++) {
      const bx = (b * 43 + 12) % W;
      const by = (200 - ((tick * 1 + b * 29) % 195));
      px(ctx, bx, by, 2, 2, '#bae6fd');
    }

    // Kelp forest left
    for (let k = 0; k < 5; k++) {
      const kx = 14 + k * 11;
      for (let ky = 60; ky < 200; ky += 8) {
        const sway = Math.round(Math.sin((tick + ky) * 0.12) * 2);
        px(ctx, kx + sway, ky, 4, 7, k % 2 === 0 ? '#15803d' : '#16a34a');
      }
    }

    // Sunken Yellow Submarine silhouette
    px(ctx, 102, 146, 78, 30, '#ca8a04');
    px(ctx, 114, 140, 54, 8, '#eab308');
    px(ctx, 132, 126, 18, 16, '#eab308');
    px(ctx, 118, 155, 8, 8, '#fef08a');
    px(ctx, 138, 155, 8, 8, '#fef08a');
    px(ctx, 158, 155, 8, 8, '#fef08a');

    // Coral Arch & Anemones
    px(ctx, 0, 194, W, 26, '#1e293b');
    px(ctx, 30, 164, 62, 34, '#be185d');
    px(ctx, 44, 174, 34, 24, '#041c2c');
    px(ctx, 250, 142, 54, 54, '#e11d48');
    px(ctx, 262, 154, 30, 42, '#082f49');
    px(ctx, 212, 172, 42, 24, '#7e22ce');

    // Jellyfish floating
    for (let j = 0; j < 4; j++) {
      const jx = 80 + j * 64;
      const jy = 40 + ((j * 23) % 40) + Math.round(Math.sin(tick * 0.08 + j) * 4);
      px(ctx, jx, jy, 14, 8, '#fb7185');
      px(ctx, jx + 2, jy + 8, 2, 10, '#fda4af');
      px(ctx, jx + 6, jy + 8, 2, 12, '#fda4af');
      px(ctx, jx + 10, jy + 8, 2, 9, '#fda4af');
    }
  } else if (config.packId === 'kyoto-shrine') {
    const sky = ['#0f2926', '#133a35', '#1a4b44', '#265c53'];
    sky.forEach((c, i) => px(ctx, 0, i * 32, W, 33, c));

    // Distant misty hills
    px(ctx, 0, 96, 140, 50, '#0f2e2a');
    px(ctx, 120, 86, 200, 60, '#133732');

    // Pond & Stone path
    px(ctx, 0, 144, W, 76, '#1c1917');
    px(ctx, 88, 172, 140, 48, '#0c4a6e');
    for (let w = 96; w < 216; w += 20) {
      px(ctx, w + ((tick >> 2) % 6), 186, 8, 1, '#38bdf8');
    }

    // Crimson Torii Gate
    px(ctx, 76, 62, 86, 6, '#dc2626');
    px(ctx, 82, 58, 74, 4, '#1c1917');
    px(ctx, 84, 78, 70, 5, '#b91c1c');
    px(ctx, 90, 68, 8, 76, '#dc2626');
    px(ctx, 140, 68, 8, 76, '#dc2626');

    // Temple Pavilion right
    px(ctx, 204, 108, 92, 46, '#292524');
    px(ctx, 194, 98, 112, 12, '#44403c');
    px(ctx, 220, 122, 24, 24, '#fef08a');
    px(ctx, 260, 152, 24, 34, '#57534e');
    px(ctx, 266, 158, 12, 10, '#f59e0b');

    // Autumn Maple Canopy left
    for (let m = 0; m < 16; m++) {
      const mx = 10 + ((m * 17) % 68);
      const my = 38 + ((m * 13) % 58);
      px(ctx, mx, my, 16, 12, m % 2 === 0 ? '#dc2626' : '#ea580c');
    }
    px(ctx, 32, 84, 10, 74, '#451a03');
  } else {
    // orbital-cat
    const cosmos = ['#09071a', '#110d2e', '#191342', '#1e1b4b'];
    cosmos.forEach((c, i) => px(ctx, 0, i * 55, W, 56, c));

    for (let s = 0; s < 55; s++) {
      const sx = (s * 67 + 13) % W;
      const sy = (s * 41 + 19) % H;
      px(ctx, sx, sy, s % 5 === 0 ? 2 : 1, s % 5 === 0 ? 2 : 1, (tick + s) % 10 < 5 ? '#f8fafc' : '#a78bfa');
    }

    // Ringed pastel planet
    px(ctx, 230, 34, 42, 42, '#c4b5fd');
    px(ctx, 236, 44, 30, 6, '#f9a8d4');
    px(ctx, 214, 52, 74, 6, '#fde68a');

    // Observatory Glass Dome
    px(ctx, 76, 86, 168, 92, '#1e293b');
    px(ctx, 94, 66, 132, 24, '#334155');
    px(ctx, 102, 74, 116, 76, '#0f172a');
    // Cat silhouette mural / console inside dome
    px(ctx, 104, 148, 112, 22, '#312e81');
    // Brass Telescope
    px(ctx, 198, 152, 34, 8, '#d97706');
    px(ctx, 210, 160, 6, 26, '#78350f');
    // Solar array left
    px(ctx, 18, 144, 62, 28, '#1d4ed8');
    px(ctx, 20, 148, 58, 2, '#60a5fa');
    px(ctx, 20, 158, 58, 2, '#60a5fa');
    // Asteroids right
    px(ctx, 272, 132, 28, 22, '#475569');
    px(ctx, 260, 174, 22, 18, '#334155');
  }

  // Draw all 7 hidden target sprites
  for (const t of config.targets) {
    const isFound = foundIds.has(t.id);
    drawTargetSprite(ctx, t.sprite, t.x, t.y, isFound);

    if (pingTargetId === t.id && !isFound) {
      const pulse = 10 + Math.round(Math.sin(tick * 0.25) * 3);
      ctx.strokeStyle = '#c3f24d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(t.x, t.y, pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
