import React, { useState } from 'react';
import {
  Star,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  ChevronDown,
  MessageSquare,
  Send,
} from 'lucide-react';
import { updateGameReview, copyToClipboard, generateAgentPrompt } from '../storage/studioStorage';
import { soundEngine } from '../audio/soundEngine';

const QUICK_TAGS = [
  'Timer too fast',
  'Timer too slow',
  'Font too small',
  'Add audio cues',
  'Data too hard',
  'Data too easy',
  'Confusing rules',
  'Add more categories',
];

export function ReviewDrawer({ gameSlug, gameTitle, onReviewSubmitted }) {
  const [isOpen, setIsOpen] = useState(false);
  const [verdict, setVerdict] = useState('iterate'); // 'ship' | 'iterate' | 'kill'
  const [rating, setRating] = useState(4);
  const [selectedTags, setSelectedTags] = useState([]);
  const [notes, setNotes] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  const toggleTag = (tag) => {
    soundEngine.playTap();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    soundEngine.playTap();
    const prompt = generateAgentPrompt({
      type: 'review',
      gameSlug,
      verdict,
      rating,
      critique: notes,
      tags: selectedTags,
    });

    // Save to local studio storage & queue
    updateGameReview(gameSlug, {
      verdict,
      rating,
      notes,
      tags: selectedTags,
    });

    // Copy formatted prompt to clipboard for Antigravity
    await copyToClipboard(prompt);
    soundEngine.playCorrect();

    setFeedbackStatus('Saved to Studio! Agent prompt copied to clipboard.');
    setTimeout(() => {
      setFeedbackStatus(null);
      setIsOpen(false);
      if (onReviewSubmitted) onReviewSubmitted();
    }, 2200);
  };

  return (
    <>
      {/* Floating Review Pill */}
      {!isOpen && (
        <button
          onClick={() => {
            soundEngine.playTap();
            setIsOpen(true);
          }}
          className="fixed bottom-3 right-3 z-50 px-3.5 py-2 rounded-full bg-slate-900/95 border border-sky-500/50 text-sky-400 font-extrabold text-xs shadow-2xl backdrop-blur flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Director Review</span>
        </button>
      )}

      {/* Slide-Up Review Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90dvh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Triage & Review: {gameTitle}
                  </h3>
                  <div className="text-[10px] text-slate-400">
                    60-Second Taste Test Feedback
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Verdict Triage (Ship / Iterate / Kill) */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Executive Verdict
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    setVerdict('ship');
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    verdict === 'ship'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ship (Approve)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    setVerdict('iterate');
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    verdict === 'iterate'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Iterate (Rework)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    setVerdict('kill');
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    verdict === 'kill'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Kill (Archive)</span>
                </button>
              </div>
            </div>

            {/* Star Rating */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      soundEngine.playTap();
                      setRating(star);
                    }}
                    className="p-1 text-slate-600 hover:scale-110 active:scale-95 transition-all"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-extrabold text-amber-400 ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Quick Critique Tags */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        active
                          ? 'bg-sky-500 text-slate-950 font-bold'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Director Notes */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Specific Instructions for Agent
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Slow down timer to 6.0s, make Baltic surnames harder, improve the green flash..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            {feedbackStatus && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-pulse">
                {feedbackStatus}
              </div>
            )}

            {/* Submit Action */}
            <button
              onClick={handleSubmit}
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-sky-500/20"
            >
              <Send className="w-4 h-4" />
              Submit Review & Copy Agent Prompt
            </button>
          </div>
        </div>
      )}
    </>
  );
}
