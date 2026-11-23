// Social sharing and visual score card generator for Minty.red micro-games.

export function formatWordleShare({ gameTitle, score, total, timeSeconds, streak, history, challengeCode }) {
  const emojiGrid = history.map(item => (item.correct ? '🟩' : '🟥')).join('');
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

// Generate downloadable 1200x630 social badge via HTML5 Canvas
export function generateCanvasBadge({ gameTitle, score, total, timeSeconds, rankTitle, history }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 560;
  const ctx = canvas.getContext('2d');

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1000, 560);
  bgGrad.addColorStop(0, '#0c0f17');
  bgGrad.addColorStop(1, '#151d2d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1000, 560);

  // Border Glow
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 960, 520);

  // Brand Header
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('MINTY.RED ARCADE', 60, 80);

  // Game Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 68px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(gameTitle.toUpperCase(), 60, 165);

  // Rank / Subtitle
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`Rank: ${rankTitle}`, 60, 215);

  // Score Box
  ctx.fillStyle = '#1e293b';
  ctx.roundRect(60, 260, 400, 160, 16);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.font = '800 72px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`${score}/${total}`, 90, 355);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`⚡ ${timeSeconds.toFixed(1)}s elapsed`, 90, 395);

  // Emojis / Blocks Box
  ctx.fillStyle = '#1e293b';
  ctx.roundRect(490, 260, 450, 160, 16);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const blockString = history.map(h => (h.correct ? '🟩' : '🟥')).join(' ');
  ctx.fillText(blockString, 520, 355);

  // Footer
  ctx.fillStyle = '#64748b';
  ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('Play free in browser • Zero ads • Zero install', 60, 490);

  return canvas.toDataURL('image/png');
}
