import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.cwd(), 'data');
const RUNS_FILE = path.join(DATA_DIR, 'runs.json');

interface SpecimenMeta {
  id: string;
  title: string;
  imageRelPath: string;
  secretPrompt: string;
}

const SPECIMENS: SpecimenMeta[] = [
  {
    id: 'lighthouse',
    title: 'Coastal Sunset Lighthouse',
    imageRelPath: 'src/assets/images/specimen_lighthouse_1795505033371.jpg',
    secretPrompt:
      'Red-and-white striped coastal lighthouse perched on dark basalt cliffs at golden tangerine sunset with crashing white ocean surf.',
  },
  {
    id: 'astronaut-cat',
    title: 'Orbiting Tabby Astronaut',
    imageRelPath: 'src/assets/images/specimen_astronaut_cat_1795505033735.jpg',
    secretPrompt:
      'Orange tabby cat wearing a retro brass-and-glass astronaut helmet floating in deep midnight space beside a pastel ringed planet and stars.',
  },
  {
    id: 'ramen-bowl',
    title: 'Midnight Tonkotsu Ramen',
    imageRelPath: 'src/assets/images/specimen_ramen_bowl_1795505034750.jpg',
    secretPrompt:
      'Overhead view of a matte black ceramic ramen bowl with golden broth, soft-boiled egg, pink-swirl narutomaki, green scallions, and wooden chopsticks.',
  },
  {
    id: 'bonsai-lantern',
    title: 'Crimson Maple & Stone Lantern',
    imageRelPath: 'src/assets/images/specimen_bonsai_lantern_1795505034685.jpg',
    secretPrompt:
      'Sculptural crimson Japanese maple bonsai tree beside a glowing warm amber stone lantern on mossy dark slate against misty teal forest.',
  },
  {
    id: 'yellow-submarine',
    title: 'Explorer 7 Bathysphere',
    imageRelPath: 'src/assets/images/specimen_yellow_submarine_1795505035381.jpg',
    secretPrompt:
      'Bright canary yellow vintage submarine with glowing brass portholes diving through deep cobalt ocean surrounded by coral pink jellyfish.',
  },
  {
    id: 'espresso-croissant',
    title: 'Morning Marble Café',
    imageRelPath: 'src/assets/images/specimen_espresso_croissant_1795505035511.jpg',
    secretPrompt:
      'Overhead café table on pale marble with a flaky golden croissant on a white plate beside a cobalt blue espresso cup with latte rosetta.',
  },
  {
    id: 'cactus-neon',
    title: 'Moonlit Desert Saguaro',
    imageRelPath: 'src/assets/images/specimen_cactus_neon_1795505036829.jpg',
    secretPrompt:
      'Emerald green saguaro cactus topped with a coral bloom in a terracotta pot against a warm peach sunset sky and crescent moon.',
  },
  {
    id: 'rubber-duck',
    title: 'Turquoise Pool Rubber Duck',
    imageRelPath: 'src/assets/images/specimen_rubber_duck_1795505036065.jpg',
    secretPrompt:
      'Bright yellow rubber duck floating in sparkling turquoise tiled swimming pool water with crisp geometric light ripples.',
  },
  {
    id: 'vintage-camera',
    title: 'Rangefinder & Autumn Ginkgo',
    imageRelPath: 'src/assets/images/specimen_vintage_camera_1795505037686.jpg',
    secretPrompt:
      'Classic silver and black retro film camera with glass lens resting on warm mustard cloth beside two golden autumn ginkgo leaves.',
  },
];

const SPECIMEN_MAP = new Map<string, SpecimenMeta>(SPECIMENS.map((s) => [s.id, s]));

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let state = seed || 1;
  for (let i = copy.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function buildDailyConfig(dateStr: string) {
  const baseSeed = hashString(`minuscule:${dateStr}`);
  const packs = ['harbor-night', 'coral-trench', 'kyoto-shrine', 'orbital-cat'];
  const dailyScenePack = packs[baseSeed % packs.length];
  const tinySizes = [15, 14, 13, 12, 11];
  const orderedTargets = seededShuffle(
    SPECIMENS.map((s) => s.id),
    baseSeed + 17
  );

  const rounds = Array.from({ length: 5 }, (_, idx) => {
    const roundSeed = hashString(`round:${dateStr}:${idx}`);
    const shuffled = seededShuffle(
      SPECIMENS.map((s) => s.id),
      roundSeed
    );
    const desiredTargetId = orderedTargets[idx % orderedTargets.length];
    const targetKey = shuffled.indexOf(desiredTargetId);
    return {
      targetKey: targetKey >= 0 ? targetKey : roundSeed % 9,
      tinySize: tinySizes[idx] ?? 13,
      specimenIds: shuffled,
    };
  });

  return {
    date: dateStr,
    rounds,
    dailyScenePack,
  };
}

interface StoredRun {
  id: string;
  date: string;
  mode: string;
  playerId: string;
  playerName: string;
  score: number;
  detail: string;
  createdAt: string;
}

function readRuns(): StoredRun[] {
  try {
    if (!fs.existsSync(RUNS_FILE)) return [];
    const raw = fs.readFileSync(RUNS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRuns(runs: StoredRun[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(RUNS_FILE, JSON.stringify(runs.slice(0, 500), null, 2), 'utf8');
}

function loadSpecimenBase64(spec: SpecimenMeta): { data: string; mimeType: string } {
  const fullPath = path.resolve(process.cwd(), spec.imageRelPath);
  const buf = fs.readFileSync(fullPath);
  return {
    data: buf.toString('base64'),
    mimeType: 'image/jpeg',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/daily', (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const dateParam = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : today;
    const config = buildDailyConfig(dateParam);
    const allRuns = readRuns();
    const todayRuns = allRuns
      .filter((r) => r.date === dateParam)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);

    res.json({ config, todayRuns });
  });

  app.get('/api/runs', (req, res) => {
    const mode = typeof req.query.mode === 'string' ? req.query.mode : '';
    const date = typeof req.query.date === 'string' ? req.query.date : '';
    let runs = readRuns();
    if (mode) runs = runs.filter((r) => r.mode === mode);
    if (date) runs = runs.filter((r) => r.date === date);
    runs.sort((a, b) => b.score - a.score);
    res.json({ runs: runs.slice(0, 100) });
  });

  app.post('/api/runs', (req, res) => {
    const body = req.body ?? {};
    const playerId = String(body.playerId || '').trim().slice(0, 64);
    const playerName = String(body.playerName || 'Player').trim().slice(0, 32) || 'Player';
    const mode = String(body.mode || 'hunt');
    const date = String(body.date || new Date().toISOString().slice(0, 10));
    const score = Math.max(0, Math.round(Number(body.score) || 0));
    const detail = String(body.detail || '').slice(0, 120);

    if (!playerId) {
      res.status(400).json({ error: 'Missing playerId' });
      return;
    }

    const runs = readRuns();
    const entry: StoredRun = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date,
      mode,
      playerId,
      playerName,
      score,
      detail,
      createdAt: new Date().toISOString(),
    };
    runs.unshift(entry);
    writeRuns(runs);
    res.json({ entry });
  });

  app.post('/api/judge-copycat', async (req, res) => {
    try {
      const specimenId = String(req.body?.specimenId || '');
      const guess = String(req.body?.guess || '').trim().slice(0, 280);
      const spec = SPECIMEN_MAP.get(specimenId);

      if (!spec || !guess) {
        res.status(400).json({ error: 'Please provide a valid specimenId and description.' });
        return;
      }

      const ai = getAiClient();
      const img = loadSpecimenBase64(spec);

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                data: img.data,
                mimeType: img.mimeType,
              },
            },
            {
              text: `You are the visual judge and vector-scene illustrator for a CopyCat + Minuscule pixel-guessing game.
Target specimen title: "${spec.title}"
Target visual truth: "${spec.secretPrompt}"
Player's prompt/description: "${guess}"

Task 1 (Visual Judge): Score how accurately the player's prompt matches the actual target image across:
- score (0-100 overall visual match)
- subjectScore (0-100)
- paletteScore (0-100)
- compositionScore (0-100)
- verdict: one crisp, witty 1-sentence judge critique (<= 18 words).
- missingHint: one concise tip for what visual element was missing or off (<= 14 words).

Task 2 (CopyCat Vector Scene Blueprint): Generate a simple, vivid 100x100 coordinate SVG scene blueprint representing ONLY what the PLAYER'S PROMPT described (so if they guessed wrong, their CopyCat picture shows what they actually described!).
Include 5 to 10 bold geometric shapes ('rect', 'circle', 'ellipse', 'triangle') in the 0..100 coordinate box with vibrant hex colors matching their prompt.`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              subjectScore: { type: Type.INTEGER },
              paletteScore: { type: Type.INTEGER },
              compositionScore: { type: Type.INTEGER },
              verdict: { type: Type.STRING },
              missingHint: { type: Type.STRING },
              blueprint: {
                type: Type.OBJECT,
                properties: {
                  skyTop: { type: Type.STRING },
                  skyBottom: { type: Type.STRING },
                  groundColor: { type: Type.STRING },
                  groundY: { type: Type.NUMBER },
                  shapes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        kind: { type: Type.STRING },
                        fill: { type: Type.STRING },
                        stroke: { type: Type.STRING },
                        strokeWidth: { type: Type.NUMBER },
                        opacity: { type: Type.NUMBER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        w: { type: Type.NUMBER },
                        h: { type: Type.NUMBER },
                        cx: { type: Type.NUMBER },
                        cy: { type: Type.NUMBER },
                        r: { type: Type.NUMBER },
                        rx: { type: Type.NUMBER },
                        ry: { type: Type.NUMBER },
                        points: { type: Type.STRING },
                      },
                      required: ['kind', 'fill'],
                    },
                  },
                },
                required: ['skyTop', 'skyBottom', 'shapes'],
              },
            },
            required: [
              'score',
              'subjectScore',
              'paletteScore',
              'compositionScore',
              'verdict',
              'missingHint',
              'blueprint',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

      res.json({
        score: clamp(parsed.score),
        subjectScore: clamp(parsed.subjectScore),
        paletteScore: clamp(parsed.paletteScore),
        compositionScore: clamp(parsed.compositionScore),
        verdict: String(parsed.verdict || 'A bold interpretation of the miniature frame.'),
        missingHint: String(parsed.missingHint || 'Look closely at foreground color contrasts.'),
        answer: spec.secretPrompt,
        blueprint: parsed.blueprint ?? {
          skyTop: '#1e293b',
          skyBottom: '#0f172a',
          shapes: [],
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to evaluate prompt right now.';
      console.error('judge-copycat error:', message);
      res.status(502).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Minuscule server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
