// Social sharing and visual score card generator for Minty.red micro-games.
import { trackShare } from '../analytics/analyticsService';

export function formatWordleShare({ gameTitle, score, total, timeSeconds, streak, history, challengeCode }) {
  const emojiGrid = (history || []).map(item => (item.correct ? '🟩' : '🟥')).join('');
  const slug = (gameTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://minty.red';
  const hubUrl = challengeCode
    ? `${origin}/${slug}?c=${challengeCode}`
    : `${origin}/${slug}`;

  const lines = [
    `${gameTitle.toUpperCase()} ⚡ minty.red`,
    `Score: ${score}/${total} in ${timeSeconds.toFixed(1)}s`,
    emojiGrid,
  ];

  if (streak > 1) {
    lines.push(`🔥 ${streak} Day Streak`);
  }

  lines.push(challengeCode ? `Can you beat me? 👉 ${hubUrl}` : `Play 👉 ${hubUrl}`);

  return lines.join('\n');
}

export async function copyShareText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  // Fallback
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch {
    document.body.removeChild(textarea);
    return false;
  }
}

export async function shareResult({ gameTitle, score, total, timeSeconds, streak, history, challengeCode }) {
  const text = formatWordleShare({ gameTitle, score, total, timeSeconds, streak, history, challengeCode });

  try {
    const slug = (gameTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    trackShare(slug, challengeCode ? 'challenge' : 'score', score);
  } catch {}

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${gameTitle} on Minty.red`,
        text: text,
      });
      return { method: 'native', success: true };
    } catch (err) {
      if (err.name !== 'AbortError') {
        const copied = await copyShareText(text);
        return { method: 'clipboard', success: copied };
      }
      return { method: 'dismissed', success: false };
    }
  }

  const copied = await copyShareText(text);
  return { method: 'clipboard', success: copied };
}

// Generate downloadable 1200x630 social score badge via HTML5 Canvas (Style 3 Minimal Bold Typographic)
export function generateCanvasBadge({ gameTitle, score, total, timeSeconds, rankTitle, history, challengeCode }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  const slug = (gameTitle || 'game').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Background #07090e
  ctx.fillStyle = '#07090e';
  ctx.fillRect(0, 0, 1200, 630);

  // Border #1e293b
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 1198, 628);

  // Top Divider line
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 130);
  ctx.lineTo(1120, 130);
  ctx.stroke();

  // 1. Top-Left: Direct Game URL
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`MINTY.RED/${slug.toUpperCase()}`, 80, 85);

  // 2. Top-Right: Score Card / Streak Badge
  ctx.font = '600 18px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'right';
  ctx.fillText(`${total} ROUNDS // `, 980, 85);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('SCORE CARD', 1120, 85);

  // Reset text align
  ctx.textAlign = 'left';

  // 3. Category / Tag
  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 16px monospace';
  ctx.fillText(`// ${rankTitle ? rankTitle.toUpperCase() : 'EXPEDITION RESULT'}`, 80, 210);

  // 4. Headline
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 84px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(gameTitle.toUpperCase(), 80, 310);

  // 5. Score Box & Emojis
  ctx.fillStyle = '#38bdf8';
  ctx.font = '800 64px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`${score}/${total}`, 80, 410);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`in ${timeSeconds.toFixed(1)} seconds`, 280, 405);

  // History Emoji Blocks
  if (history && history.length > 0) {
    ctx.font = '40px monospace';
    const blockString = history.map(h => (h.correct ? '🟩' : '🟥')).join(' ');
    ctx.fillText(blockString, 80, 490);
  }

  // 6. Footer Challenge
  ctx.fillStyle = '#64748b';
  ctx.font = '600 20px monospace';
  const cta = challengeCode ? `Can you beat me? 👉 minty.red/${slug}?c=${challengeCode}` : `Play free in browser 👉 minty.red/${slug}`;
  ctx.fillText(cta, 80, 565);

  return canvas.toDataURL('image/png');
}

// Download score badge image to device
export function downloadScoreBadge(dataUrl, filename = 'minty-score.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
