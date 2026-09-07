import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  Lightbulb,
  Cpu,
  Code2,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Globe,
  ArrowRight,
  ListOrdered,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';

const Youtube = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const SUBJECTS = [
  'Operating Systems',
  'DBMS and SQL',
  'Data Structures and Algorithms',
  'Computer Networks',
  'Object-Oriented Programming',
  'System Design',
  'Web Development',
  'Quantitative Aptitude',
  'AI and Machine Learning',
  'Python Programming',
  'Java Programming'
];

export const TeachMeAgainModal = ({
  isOpen,
  onClose,
  initialSubject = 'Operating Systems',
  initialTopic = 'Deadlocks',
  strengthScore = 35
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('explanation'); // 'explanation', 'roadmap', 'resources', 'youtube'
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSubject(initialSubject || 'Operating Systems');
      setTopic(initialTopic || 'Deadlocks');
      if (initialTopic) {
        fetchExplanation(initialSubject || 'Operating Systems', initialTopic);
      }
    } else {
      setData(null);
      setError('');
    }
  }, [isOpen, initialSubject, initialTopic]);

  const fetchExplanation = async (subj, top) => {
    if (!top) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/resources/teach-me-again', {
        subject: subj,
        topic: top,
        strengthScore
      });
      setData(res.data);
    } catch (err) {
      console.error('Teach me again error:', err);
      setError('Could not generate explanation. Showing local curated resources.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const exp = data?.explanation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-dark-card rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-200">
                AI Pedagogical Concept Explainer
              </div>
              <h2 className="text-xl font-black flex items-center gap-2">
                <span>Teach Me Again:</span>
                <span className="underline decoration-amber-400 decoration-2">{topic}</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Concept Selector Bar */}
        <div className="p-4 bg-gray-50 dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border flex flex-col sm:flex-row items-center gap-3">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white"
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Type any concept (e.g. Normalization, B-Trees, TCP Handshake)..."
            className="w-full flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white"
          />

          <button
            onClick={() => fetchExplanation(subject, topic)}
            disabled={loading || !topic}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Analyzing...' : 'Explain Concept'}</span>
          </button>
        </div>

        {/* Tab Switcher */}
        {data && (
          <div className="px-6 pt-3 border-b border-gray-200 dark:border-dark-border flex items-center gap-2 overflow-x-auto scrollbar-none bg-white dark:bg-dark-card">
            <button
              onClick={() => setActiveTab('explanation')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'explanation'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Full Breakdown & Analogy</span>
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'roadmap'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>8-Step Recovery Path</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Authoritative Web Docs</span>
            </button>

            <button
              onClick={() => setActiveTab('youtube')}
              className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'youtube'
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Youtube className="w-4 h-4 text-rose-500" />
              <span>Recommended YouTube Lectures</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-500/30 animate-spin">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Gemini AI is crafting pedagogical explanation for "{topic}"...
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Synthesizing real-world analogies, code traces, common traps, and verified YouTube lectures.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          ) : !data ? (
            <div className="py-16 text-center text-gray-400 space-y-3">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300" />
              <p className="text-xs">Pick a subject and topic above, then click "Explain Concept".</p>
            </div>
          ) : (
            <>
              {/* TAB 1: EXPLANATION */}
              {activeTab === 'explanation' && exp && (
                <div className="space-y-6">
                  {/* Simple Explanation */}
                  <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4" /> Plain English Explanation (Zero Jargon)
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                      {exp.simpleExplanation}
                    </p>
                  </div>

                  {/* Real-world Analogy */}
                  <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" /> Real-World Analogy
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed italic">
                      "{exp.realWorldAnalogy}"
                    </p>
                  </div>

                  {/* Technical Explanation */}
                  <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      <Cpu className="w-4 h-4" /> Deep Technical Breakdown
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {exp.technicalExplanation}
                    </p>
                  </div>

                  {/* Concrete Example / Code */}
                  {exp.example && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        <Code2 className="w-4 h-4 text-emerald-500" /> Concrete Code & Logic Example
                      </div>
                      <pre className="p-4 rounded-2xl bg-gray-900 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed border border-gray-800">
                        <code>{exp.example}</code>
                      </pre>
                    </div>
                  )}

                  {/* Common Pitfalls & Interview Perspective */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" /> Common Mistakes / Traps
                      </div>
                      <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                        {exp.commonMistakes?.map((m, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        <Briefcase className="w-4 h-4" /> Placement Interview Perspective
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {exp.interviewPerspective}
                      </p>
                    </div>
                  </div>

                  {/* Quick Revision Notes */}
                  {exp.quickRevisionNotes && (
                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" /> Quick Revision Bullets
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                        {exp.quickRevisionNotes.map((note, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-white dark:bg-dark-surface border border-emerald-500/10">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: 8-STEP ROADMAP */}
              {activeTab === 'roadmap' && exp?.recoveryPlan && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 font-medium">
                    Follow this 8-step structured sequence to take your mastery from weak to placement-ready.
                  </div>
                  <div className="space-y-3">
                    {exp.recoveryPlan.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-start gap-3 shadow-sm hover:border-purple-500/40 transition-colors"
                      >
                        <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-relaxed pt-1">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: WEB DOCUMENTATION */}
              {activeTab === 'resources' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Authoritative articles, documentation, and practice sets for <strong>{topic}</strong>:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {exp?.recommendedWebpages?.map((web, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-3 shadow-sm"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600">
                              {web.source || 'Web Resource'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">{web.type}</span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-2">
                            {web.title}
                          </h4>
                        </div>
                        <a
                          href={web.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all"
                        >
                          <span>Open Webpage</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: YOUTUBE LECTURES & CHANNELS */}
              {activeTab === 'youtube' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <span>
                      High-yield educational video lectures and channels curated for <strong>{topic}</strong>. No random entertainment content.
                    </span>
                  </div>

                  {/* AI Concept-Specific YouTube Video Links */}
                  {exp?.recommendedYouTube && exp.recommendedYouTube.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Top Video Recommendations for this Concept
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {exp.recommendedYouTube.map((yt, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-3 shadow-sm"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 flex items-center gap-1">
                                  <Youtube className="w-3 h-3" /> {yt.channel || 'YouTube'}
                                </span>
                                {yt.duration && (
                                  <span className="text-[10px] text-gray-400 font-mono">{yt.duration}</span>
                                )}
                              </div>
                              <h5 className="text-xs font-bold text-gray-900 dark:text-white mt-2">
                                {yt.title}
                              </h5>
                            </div>
                            <a
                              href={yt.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm"
                            >
                              <span>Watch on YouTube</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Channels for this Subject */}
                  {data?.relatedChannels && data.relatedChannels.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Featured Channels to Learn {subject}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {data.relatedChannels.map((c) => (
                          <div
                            key={c.id}
                            className="p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-surface/60 border border-gray-200 dark:border-dark-border space-y-2 text-center"
                          >
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full inline-block">
                              {c.subscribers} Subscribers
                            </span>
                            <div className="text-xs font-bold text-gray-900 dark:text-white">{c.name}</div>
                            <p className="text-[10px] text-gray-400 line-clamp-2">{c.description}</p>
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline pt-1"
                            >
                              Visit Channel <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Learned the concept? Test your knowledge with 20–30 focused practice questions.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card"
            >
              Close
            </button>
            <Link
              to={`/practice?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`}
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <span>Practice 20–30 Qs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachMeAgainModal;
