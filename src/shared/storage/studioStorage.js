import defaultRegistry from '../../data/studioRegistry.json';

const STORAGE_KEY = 'bobby_studio_state';

export function getStudioState() {
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    return defaultRegistry;
  }
  try {
    const parsed = JSON.parse(local);
    // Ensure all default games exist even if local was stored earlier
    const mergedGames = [...parsed.games || []];
    defaultRegistry.games.forEach((defG) => {
      if (!mergedGames.some((g) => g.slug === defG.slug)) {
        mergedGames.push(defG);
      }
    });
    return {
      games: mergedGames,
      ideaBacklog: parsed.ideaBacklog || defaultRegistry.ideaBacklog,
      queue: parsed.queue || [],
    };
  } catch {
    return defaultRegistry;
  }
}

export function saveStudioState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function updateGameReview(gameSlug, { verdict, rating, notes, tags }) {
  const state = getStudioState();
  const game = state.games.find((g) => g.slug === gameSlug);
  if (!game) return state;

  const reviewEntry = {
    verdict, // 'ship' | 'iterate' | 'kill'
    rating,  // 1 - 5
    notes: notes || '',
    tags: tags || [],
    timestamp: new Date().toISOString(),
  };

  // Map verdict to game status
  let newStatus = game.status;
  if (verdict === 'ship') {
    newStatus = 'shipped';
    game.rating = rating;
  } else if (verdict === 'iterate') {
    newStatus = 'in_revision';
  } else if (verdict === 'kill') {
    newStatus = 'rejected';
  }

  game.status = newStatus;
  game.feedbackHistory = [reviewEntry, ...(game.feedbackHistory || [])];
  game.updatedAt = new Date().toISOString();

  // Push to pending dispatch queue
  state.queue = [
    {
      id: `queue-${Date.now()}`,
      type: 'game_review',
      gameSlug,
      verdict,
      rating,
      notes,
      tags,
      timestamp: new Date().toISOString(),
      prompt: generateAgentPrompt({
        type: 'review',
        gameSlug,
        verdict,
        rating,
        critique: notes,
        tags,
      }),
    },
    ...(state.queue || []),
  ];

  saveStudioState(state);
  return { state, reviewEntry };
}

export function addGameIdea({ title, hook, category, targetDuration }) {
  const state = getStudioState();
  const idea = {
    id: `idea-${Date.now()}`,
    title,
    hook,
    category: category || 'Micro-Game',
    targetDuration: targetDuration || '45s',
    status: 'queued',
    createdAt: new Date().toISOString(),
  };

  state.ideaBacklog = [idea, ...(state.ideaBacklog || [])];

  state.queue = [
    {
      id: `queue-${Date.now()}`,
      type: 'new_game_prompt',
      ideaId: idea.id,
      title,
      hook,
      timestamp: new Date().toISOString(),
      prompt: generateAgentPrompt({
        type: 'new_game',
        ideaTitle: title,
        ideaPrompt: hook,
      }),
    },
    ...(state.queue || []),
  ];

  saveStudioState(state);
  return { state, idea };
}

export function removeGameIdea(id) {
  const state = getStudioState();
  state.ideaBacklog = (state.ideaBacklog || []).filter((item) => item.id !== id);
  saveStudioState(state);
  return state;
}

export function generateAgentPrompt({
  type,
  gameSlug,
  verdict,
  rating,
  critique,
  tags = [],
  ideaTitle,
  ideaPrompt,
}) {
  if (type === 'review') {
    const verdictText =
      verdict === 'ship'
        ? 'SHIP (APPROVED)'
        : verdict === 'kill'
        ? 'KILL (REJECT / ARCHIVE)'
        : 'ITERATE (REQUEST CHANGES)';

    return [
      `@agent UPDATE GAME: ${gameSlug}`,
      `Verdict: ${verdictText}`,
      `Rating: ${rating ? `${rating}/5 Stars` : 'Unrated'}`,
      tags.length > 0 ? `Critique Tags: ${tags.join(', ')}` : '',
      critique ? `Director Notes: "${critique}"` : '',
      `Action Required: Please implement these requested modifications, update the game version, and stage the updated preview on minty.red.`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  if (type === 'new_game') {
    return [
      `@agent SCAFFOLD NEW MICRO-GAME: "${ideaTitle}"`,
      `Concept & Loop: ${ideaPrompt}`,
      `Target Session Length: 45-60 seconds`,
      `Requirements:`,
      `- Mobile-first responsive layout (h-dvh, 48px tap targets)`,
      `- Procedural Web Audio API sound effects via soundEngine`,
      `- Wordle-style share card & 1v1 challenge links`,
      `- Zero external assets, self-contained dataset`,
      `- Register inside minty.red hub and studioRegistry.json with status "ready_for_review"`,
    ].join('\n');
  }

  return '';
}

export async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  } catch {
    document.body.removeChild(el);
    return false;
  }
}
