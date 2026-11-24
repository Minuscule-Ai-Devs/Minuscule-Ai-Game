import type { SharePayload } from '../types/game.ts';

export async function generateShareCardDataUrl(payload: SharePayload, playerName: string): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, 1200, 630);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(248, 246, 240, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1200; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 630);
    ctx.stroke();
  }
  for (let y = 0; y <= 630; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1200, y);
    ctx.stroke();
  }

  // Card frame
  ctx.fillStyle = '#161b22';
  ctx.strokeStyle = 'rgba(248, 246, 240, 0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(56, 56, 1088, 518, 28);
  ctx.fill();
  ctx.stroke();

  // Brand top left
  ctx.fillStyle = '#c3f24d';
  ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('MINUSCULE', 104, 128);

  ctx.fillStyle = '#9aa4b2';
  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.fillText(payload.modeLabel.toUpperCase(), 104, 168);

  // Player handle top right
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f8f6f0';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(playerName || 'Player', 1096, 128);
  ctx.textAlign = 'left';

  // Main headline stat
  ctx.fillStyle = payload.accentHex || '#c3f24d';
  ctx.font = '800 112px "Bricolage Grotesque", sans-serif';
  ctx.fillText(payload.headlineStat, 104, 318);

  // Subtitle stat
  ctx.fillStyle = '#f8f6f0';
  ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(payload.subStat, 104, 378);

  // Emoji grid / summary row
  ctx.fillStyle = '#9aa4b2';
  ctx.font = '500 30px "JetBrains Mono", monospace';
  ctx.fillText(payload.emojiGrid, 104, 462);

  // Footer
  ctx.fillStyle = 'rgba(248, 246, 240, 0.45)';
  ctx.font = '400 20px "JetBrains Mono", monospace';
  ctx.fillText('Find the smallest pixel · CopyCat prompt duel · Daily pixel scenes', 104, 524);

  return canvas.toDataURL('image/png');
}
