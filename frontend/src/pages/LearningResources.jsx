import React, { useState, useEffect } from 'react';
import {
  Compass,
  BookOpen,
  Video,
  FileText,
  Code2,
  ExternalLink,
  Star,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Search,
  Filter,
  Bookmark,
  Globe,
  Layers,
  GraduationCap,
  Play,
  ArrowRight,
  TrendingUp,
  Sliders
} from 'lucide-react';
import api from '../api/axiosClient';
import TeachMeAgainModal from '../components/common/TeachMeAgainModal';

const Youtube = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const RESOURCE_TYPES = ['All', 'Article', 'YouTube', 'Documentation', 'Practice'];
const SUBJECT_FILTERS = [
  'All',
  'Operating Systems',
  'DBMS and SQL',
  'Data Structures and Algorithms',
  'Computer Networks',
  'System Design',
  'Quantitative Aptitude',
  'Object-Oriented Programming'
];

const YOUTUBE_CATEGORIES = [
  'All',
  'Programming',
  'DSA',
  'DBMS',
  'OS',
  'CN',
  'Aptitude',
  'English',
  'AI/ML',
  'System Design',
  'Web Development',
  'Cloud/DevOps'
];

export const LearningResources = () => {
  const [resources, setResources] = useState([]);
  const [youtubeChannels, setYoutubeChannels] = useState([]);
  const [webDocs, setWebDocs] = useState([]);
  const [weakInfo, setWeakInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedYtCategory, setSelectedYtCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended', 'youtube', 'docs', 'all', 'saved'

  // Teach Me Again Modal state
  const [teachModalOpen, setTeachModalOpen] = useState(false);
  const [selectedTeachTopic, setSelectedTeachTopic] = useState('Deadlocks');
  const [selectedTeachSubject, setSelectedTeachSubject] = useState('Operating Systems');
  const [teachConceptInput, setTeachConceptInput] = useState('');

  useEffect(() => {
    fetchResources();
  }, [selectedType, selectedSubject, activeTab]);

  useEffect(() => {
    fetchChannels();
    fetchWebDocs();
  }, [selectedYtCategory]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      if (activeTab === 'recommended') {
        const res = await api.get('/resources/recommended');
        setResources(res.data.resources || []);
        setWeakInfo(res.data.weakTopics || []);
      } else if (activeTab === 'all' || activeTab === 'saved') {
        let url = `/resources?`;
        if (selectedType !== 'All') url += `type=${selectedType}&`;
        if (selectedSubject !== 'All') url += `subject=${encodeURIComponent(selectedSubject)}&`;
        if (activeTab === 'saved') url += `savedOnly=true&`;
        const res = await api.get(url);
        setResources(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      let url = `/resources/youtube-channels?`;
      if (selectedYtCategory !== 'All') url += `category=${encodeURIComponent(selectedYtCategory)}`;
      const res = await api.get(url);
      setYoutubeChannels(res.data.channels || []);
    } catch (err) {
      console.error('Failed to load YouTube channels', err);
    }
  };

  const fetchWebDocs = async () => {
    try {
      const res = await api.get('/resources/web-docs');
      setWebDocs(res.data.docs || []);
    } catch (err) {
      console.error('Failed to load web docs', err);
    }
  };

  const handleToggleSave = async (id) => {
    try {
      await api.post(`/resources/${id}/toggle-save`);
      fetchResources();
    } catch (err) {
      console.error('Toggle save failed', err);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await api.post(`/resources/${id}/toggle-complete`);
      fetchResources();
    } catch (err) {
      console.error('Toggle complete failed', err);
    }
  };

  const openTeachModal = (subj, top) => {
    setSelectedTeachSubject(subj || 'Operating Systems');
    setSelectedTeachTopic(top || 'Deadlocks');
    setTeachModalOpen(true);
  };

  const filteredResources = resources.filter(r => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.title?.toLowerCase().includes(query) ||
      r.topic?.toLowerCase().includes(query) ||
      r.subject?.toLowerCase().includes(query) ||
      r.channelOrAuthor?.toLowerCase().includes(query)
    );
  });

  const filteredChannels = youtubeChannels.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.topPlaylists.some(p => p.toLowerCase().includes(query))
    );
  });

  const filteredWebDocs = webDocs.filter(d => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(query) ||
      d.subject.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      d.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'YouTube': return Video;
      case 'Documentation': return FileText;
      case 'Practice': return Code2;
      default: return BookOpen;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" /> Comprehensive Learning Library & Video Directory
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Learning Resources & Video Guides
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Authoritative webpages, top educational YouTube channels, and on-demand AI concept coaching
          </p>
        </div>

        {/* Global Action: Teach Me Any Concept */}
        <button
          onClick={() => openTeachModal(selectedSubject === 'All' ? 'Operating Systems' : selectedSubject, 'Deadlocks')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-500/25 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>✨ "Teach Me Again" AI Explainer</span>
        </button>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center p-1.5 rounded-2xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'recommended'
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>⭐ AI Recommended & Weak Areas</span>
        </button>

        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'youtube'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Youtube className="w-4 h-4 text-rose-500" />
          <span>📺 Top YouTube Channels (11 Categories)</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'docs'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>🌐 Authoritative Web Docs</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📚 All Curated Resources</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'saved'
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Queue</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI RECOMMENDED & WEAK CONCEPTS */}
      {/* ========================================================================= */}
      {activeTab === 'recommended' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Concept Explainer Search Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-brand-500/10 border border-purple-500/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Struggling with any Concept? Learn it Now
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Get plain-English explanations, real-world analogies, code traces, and verified YouTube lectures in 1 click
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={teachConceptInput}
                onChange={(e) => setTeachConceptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && teachConceptInput.trim()) {
                    openTeachModal(selectedSubject === 'All' ? 'Operating Systems' : selectedSubject, teachConceptInput);
                  }
                }}
                placeholder="Enter any concept (e.g. Deadlocks, Normalization, Sliding Window, TCP Handshake, B+ Trees)..."
                className="w-full flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs text-gray-900 dark:text-white shadow-sm focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => {
                  const query = teachConceptInput.trim() || 'Deadlocks';
                  openTeachModal(selectedSubject === 'All' ? 'Operating Systems' : selectedSubject, query);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explain & Suggest Videos</span>
              </button>
            </div>

            {/* Weak topics quick chips */}
            {weakInfo && weakInfo.length > 0 && (
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Your Identified Weak Topics:
                </span>
                {weakInfo.map((w, idx) => (
                  <button
                    key={idx}
                    onClick={() => openTeachModal(w.subject, w.topic)}
                    className="px-3 py-1 rounded-xl bg-white dark:bg-dark-card border border-rose-300 dark:border-rose-900/60 hover:border-purple-500 text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 shadow-sm transition-all group"
                  >
                    <span>{w.emoji || '🔴'}</span>
                    <span>{w.topic}</span>
                    <span className="text-[10px] text-rose-500 font-mono">({w.strengthScore}%)</span>
                    <Sparkles className="w-3 h-3 text-purple-500 group-hover:rotate-12 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Resources List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand-500" />
                Targeted Articles, Documentation & Video Lectures
              </h3>
              <span className="text-xs text-gray-400 font-medium">
                {filteredResources.length} items prioritized
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-56 rounded-3xl bg-gray-200 dark:bg-dark-card animate-pulse" />
                ))}
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
                <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No weak topic recommendations yet. Try clicking "Explain Concept" above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResources.map((res) => renderResourceCard(res))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: YOUTUBE EDUCATIONAL CHANNELS DIRECTORY (11 CATEGORIES) */}
      {/* ========================================================================= */}
      {activeTab === 'youtube' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
                <Youtube className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Top Educational YouTube Channels
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Verified, high-authority channels for CSE concepts, DSA, system design, and placement training.
                </p>
              </div>
            </div>

            {/* Search filter for channels */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channel or playlist..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* 11 Category Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {YOUTUBE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedYtCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedYtCategory === cat
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25'
                    : 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChannels.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-rose-500/40 transition-all shadow-sm flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-rose-600 transition-colors">
                          {c.name}
                        </h4>
                        <span className="text-[11px] text-gray-400 font-mono">{c.handle}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 flex-shrink-0">
                      {c.subscribers}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Top Playlists */}
                  {c.topPlaylists && c.topPlaylists.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-dark-border/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Must-Watch Playlists:
                      </span>
                      <div className="space-y-1">
                        {c.topPlaylists.map((pl, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-700 dark:text-gray-300 font-medium truncate">
                            <Play className="w-2.5 h-2.5 text-rose-500 flex-shrink-0" />
                            <span className="truncate">{pl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-surface text-gray-500">
                    {c.authorityBadge || c.category}
                  </span>

                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-600/20 transition-all"
                  >
                    <span>Visit Channel</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUTHORITATIVE WEB DOCUMENTATION */}
      {/* ========================================================================= */}
      {activeTab === 'docs' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Curated Web Documentation & Practice Portals
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Official specifications, interactive SQL tutorials, system design primers, and interview pattern sheets.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWebDocs.map((doc, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-indigo-500/40 transition-all shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600">
                      {doc.type}
                    </span>
                    <span className="text-[10px] font-bold text-amber-500">
                      ★ {doc.rating}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      {doc.subject}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {doc.tags?.map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-500">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-end">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <span>Read Documentation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ALL RESOURCES & SAVED QUEUE */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'saved') && (
        <div className="space-y-6 animate-in fade-in">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources, topics, channels, or authors..."
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white"
            >
              {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Formats' : t}</option>)}
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white"
            >
              {SUBJECT_FILTERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-56 rounded-3xl bg-gray-200 dark:bg-dark-card animate-pulse" />
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No resources found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResources.map((res) => renderResourceCard(res))}
            </div>
          )}
        </div>
      )}

      {/* Render Card Helper */}
      {/* Teach Me Again Modal */}
      <TeachMeAgainModal
        isOpen={teachModalOpen}
        onClose={() => setTeachModalOpen(false)}
        initialSubject={selectedTeachSubject}
        initialTopic={selectedTeachTopic}
      />
    </div>
  );

  function renderResourceCard(res) {
    const Icon = getTypeIcon(res.type);
    const isYouTube = res.type === 'YouTube';

    return (
      <div
        key={res._id}
        className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-brand-500/40 transition-all shadow-sm flex flex-col justify-between space-y-4"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                isYouTube
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
              }`}>
                <Icon className="w-4 h-4" />
                <span>{res.type}</span>
              </span>
              <span className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-500 font-bold">
                {res.duration}
              </span>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
              ★ {res.rating || 4.8}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              {res.subject} • {res.topic}
            </span>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mt-1 leading-snug">
              {res.title}
            </h3>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium truncate max-w-[120px]">
            {res.channelOrAuthor || res.source}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleSave(res._id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
              title="Save resource"
            >
              <Star className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => openTeachModal(res.subject, res.topic)}
              className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
              title="Teach Me Again (AI Breakdown)"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <a
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs text-white shadow-sm transition-all ${
                isYouTube ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-500 hover:bg-brand-600'
              }`}
            >
              <span>{isYouTube ? 'Watch' : 'Read'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }
};

export default LearningResources;
