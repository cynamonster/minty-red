import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Shield,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Plus,
  Play,
  Copy,
  ExternalLink,
  Volume2,
  VolumeX,
  Flame,
  Clock,
  Send,
  Trash2,
} from 'lucide-react';
import {
  getStudioState,
  addGameIdea,
  removeGameIdea,
  copyToClipboard,
  generateAgentPrompt,
} from '../shared/storage/studioStorage';
import { soundEngine } from '../shared/audio/soundEngine';

export function StudioDashboard({ onLaunchGame, onSwitchToArcade }) {
  const [state, setState] = useState(() => getStudioState());
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'shipped' | 'revision' | 'graveyard' | 'ideas'
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [muted, setMuted] = useState(soundEngine.isMuted());

  // New Idea form fields
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaHook, setIdeaHook] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('Linguistics / Trivia');
  const [ideaDuration, setIdeaDuration] = useState('45s');

  const readyForReview = state.games.filter((g) => g.status === 'ready_for_review');
  const shipped = state.games.filter((g) => g.status === 'shipped');
  const inRevision = state.games.filter((g) => g.status === 'in_revision');
  const rejected = state.games.filter((g) => g.status === 'rejected');
  const ideas = state.ideaBacklog || [];

  const handleToggleSound = () => {
    const isMutedNow = soundEngine.toggleMute();
    setMuted(isMutedNow);
    if (!isMutedNow) soundEngine.playTap();
  };

  const handleCopyPrompt = async (text, label = 'Copied prompt to clipboard!') => {
    soundEngine.playTap();
    await copyToClipboard(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleCreateIdea = async (e) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaHook.trim()) return;

    soundEngine.playTap();
    const { state: updatedState, idea } = addGameIdea({
      title: ideaTitle.trim(),
      hook: ideaHook.trim(),
      category: ideaCategory,
      targetDuration: ideaDuration,
    });

    setState(updatedState);
    setShowIdeaModal(false);

    // Auto copy the build prompt
    const buildPrompt = generateAgentPrompt({
      type: 'new_game',
      ideaTitle: idea.title,
      ideaPrompt: idea.hook,
    });
    await copyToClipboard(buildPrompt);
    soundEngine.playCorrect();

    setCopyFeedback(`Idea "${idea.title}" queued & agent prompt copied to clipboard!`);
    setTimeout(() => setCopyFeedback(null), 3000);

    setIdeaTitle('');
    setIdeaHook('');
  };

  const handleDeleteIdea = (id) => {
    soundEngine.playTap();
    const updated = removeGameIdea(id);
    setState(updated);
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#07090e] text-slate-100 select-none pb-12">
      {/* Top Executive Header */}
      <header className="w-full max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-sky-500/20">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white uppercase">
                dash<span className="text-emerald-400">.minty</span><span className="text-rose-500">.red</span>
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold uppercase">
                Studio Director
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Cyborg Game Lab • 95/5 Executive Triage
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch to Public Arcade */}
          <button
            onClick={() => {
              soundEngine.playTap();
              onSwitchToArcade();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-sky-400 hover:border-sky-500/40 transition-colors flex items-center gap-1.5"
          >
            <span>Public Arcade</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-5 flex flex-col gap-5">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setActiveTab('review')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeTab === 'review'
                ? 'bg-emerald-950/30 border-emerald-500/60 ring-2 ring-emerald-500/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Ready for Review</span>
              <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {readyForReview.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Awaiting 60s test</div>
          </button>

          <button
            onClick={() => setActiveTab('shipped')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeTab === 'shipped'
                ? 'bg-sky-950/30 border-sky-500/60 ring-2 ring-sky-500/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Shipped</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-400 mt-1">{shipped.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Live on minty.red</div>
          </button>

          <button
            onClick={() => setActiveTab('revision')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeTab === 'revision'
                ? 'bg-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>In Revision</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {inRevision.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Changes requested</div>
          </button>

          <button
            onClick={() => setActiveTab('graveyard')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeTab === 'graveyard'
                ? 'bg-rose-950/30 border-rose-500/60 ring-2 ring-rose-500/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Rejected</span>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1">{rejected.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Graveyard archive</div>
          </button>
        </div>

        {/* Global Feedback Toast */}
        {copyFeedback && (
          <div className="w-full p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-pulse">
            {copyFeedback}
          </div>
        )}

        {/* Tabs Bar & New Game Trigger */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-1 overflow-x-auto pr-2">
            {[
              { id: 'review', label: `Ready for Review (${readyForReview.length})` },
              { id: 'shipped', label: `Shipped (${shipped.length})` },
              { id: 'revision', label: `In Revision (${inRevision.length})` },
              { id: 'graveyard', label: `Graveyard (${rejected.length})` },
              { id: 'ideas', label: `Idea Backlog (${ideas.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playTap();
                  setActiveTab(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundEngine.playTap();
              setShowIdeaModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 whitespace-nowrap active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Prompt New Game</span>
          </button>
        </div>

        {/* TAB 1: READY FOR REVIEW (INBOX) */}
        {activeTab === 'review' && (
          <div className="flex flex-col gap-3">
            {readyForReview.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <div className="text-sm font-bold text-white">Review Inbox Zero!</div>
                <p className="text-xs text-slate-500 mt-1">
                  All active prototypes have been triaged. Prompt a new game or test live games.
                </p>
              </div>
            ) : (
              readyForReview.map((game) => (
                <div
                  key={game.slug}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/40 shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white">
                          {game.title}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          v{game.version} • Ready for Triage
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-medium">
                        {game.tagline}
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      ~{game.targetSessionSeconds}s Session
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {game.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-slate-400">
                      Category: <strong className="text-slate-200">{game.category}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const testPrompt = `@agent PLAYTEST REVIEW FOR: ${game.slug}\nPlease perform an automated browser inspection of the game mechanics, viewport responsiveness, and error logs.`;
                          handleCopyPrompt(testPrompt, 'Copied automated agent test prompt!');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Spec</span>
                      </button>

                      <button
                        onClick={() => {
                          soundEngine.playTap();
                          onLaunchGame(game.slug, true);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play & Review (60s)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: SHIPPED */}
        {activeTab === 'shipped' && (
          <div className="flex flex-col gap-3">
            {shipped.map((game) => (
              <div
                key={game.slug}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">
                        {game.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                        Live • v{game.version}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{game.tagline}</div>
                  </div>

                  {game.rating && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{game.rating}/5</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Live URL: minty.red/{game.slug}
                  </span>
                  <button
                    onClick={() => {
                      soundEngine.playTap();
                      onLaunchGame(game.slug, false);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-sky-400 font-bold transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play Live</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: IN REVISION */}
        {activeTab === 'revision' && (
          <div className="flex flex-col gap-3">
            {inRevision.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
                No games currently undergoing revision.
              </div>
            ) : (
              inRevision.map((game) => {
                const latestReview = game.feedbackHistory?.[0];
                return (
                  <div
                    key={game.slug}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/40 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white">
                          {game.title}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                          Changes Pending
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          soundEngine.playTap();
                          onLaunchGame(game.slug, true);
                        }}
                        className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Re-test</span>
                      </button>
                    </div>

                    {latestReview && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          Latest Director Feedback:
                        </div>
                        {latestReview.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 my-1.5">
                            {latestReview.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-slate-200 mt-1 italic">
                          "{latestReview.notes || 'General iteration requested'}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 4: GRAVEYARD (REJECTED) */}
        {activeTab === 'graveyard' && (
          <div className="flex flex-col gap-3">
            {rejected.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
                The graveyard is empty. No prototypes killed yet.
              </div>
            ) : (
              rejected.map((game) => (
                <div
                  key={game.slug}
                  className="p-4 rounded-2xl bg-slate-900/40 border border-rose-500/30 opacity-70"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-300 line-through">
                      {game.title}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                      Archived
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{game.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: IDEA BACKLOG & PROMPT STUDIO */}
        {activeTab === 'ideas' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Queued Game Concepts
              </span>
              <span className="text-xs text-slate-500">{ideas.length} ideas ready</span>
            </div>

            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      {idea.title}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {idea.category} • {idea.targetDuration}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {idea.hook}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleDeleteIdea(idea.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                    title="Delete Idea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      const buildPrompt = generateAgentPrompt({
                        type: 'new_game',
                        ideaTitle: idea.title,
                        ideaPrompt: idea.hook,
                      });
                      handleCopyPrompt(
                        buildPrompt,
                        `Copied agent build prompt for "${idea.title}"!`
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Copy Build Prompt for Agent</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* PROMPT NEW GAME MODAL */}
      {showIdeaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-white">
                  Prompt New Micro-Game
                </h3>
              </div>
              <button
                onClick={() => setShowIdeaModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateIdea} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Game Working Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HexGuess or Decade Slider"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Core Reflex / Loop Hook
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="What is the 45-second reflex question? (e.g. A snippet of classical music plays; guess the composer from 4 choices in 4 seconds)"
                  value={ideaHook}
                  onChange={(e) => setIdeaHook(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={ideaCategory}
                    onChange={(e) => setIdeaCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Session Length
                  </label>
                  <input
                    type="text"
                    value={ideaDuration}
                    onChange={(e) => setIdeaDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Queue Idea & Copy Build Prompt
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
