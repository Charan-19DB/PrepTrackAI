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
  Bookmark
} from 'lucide-react';
import api from '../api/axiosClient';

const RESOURCE_TYPES = ['All', 'Article', 'YouTube', 'Documentation', 'Practice'];
const SUBJECT_FILTERS = ['All', 'Operating Systems', 'DBMS and SQL', 'Data Structures and Algorithms', 'Computer Networks'];

export const LearningResources = () => {
  const [resources, setResources] = useState([]);
  const [weakInfo, setWeakInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended', 'all', 'saved', 'completed'

  useEffect(() => {
    fetchResources();
  }, [selectedType, selectedSubject, activeTab]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      if (activeTab === 'recommended') {
        const res = await api.get('/resources/recommended');
        setResources(res.data.resources || []);
        setWeakInfo(res.data.weakTopics || []);
      } else {
        let url = `/resources?`;
        if (selectedType !== 'All') url += `type=${selectedType}&`;
        if (selectedSubject !== 'All') url += `subject=${encodeURIComponent(selectedSubject)}&`;
        if (activeTab === 'saved') url += `savedOnly=true&`;
        if (activeTab === 'completed') url += `completedOnly=true&`;
        const res = await api.get(url);
        setResources(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'YouTube': return Video;
      case 'Documentation': return FileText;
      case 'Practice': return Code2;
      default: return BookOpen;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" /> Curated Placement Knowledge
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Learning Resources & Video Guides
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            High-yield articles, video lectures, and documentation targeted to your identified weak areas
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recommended'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            ⭐ AI Recommended
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            All Resources
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'saved'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Saved Queue
          </button>
        </div>
      </div>

      {/* Weak Areas Recommendation Banner */}
      {activeTab === 'recommended' && weakInfo && weakInfo.length > 0 && (
        <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/20 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" /> Curated Based on Your Lowest Strength Scores
          </div>
          <div className="flex flex-wrap gap-2">
            {weakInfo.map((w, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-white dark:bg-dark-card border border-purple-300 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 shadow-sm"
              >
                <span>{w.emoji || '🔴'}</span>
                <span>{w.topic}</span>
                <span className="text-[10px] text-gray-400 font-mono">({w.strengthScore}%)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
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

      {/* Resources Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 rounded-3xl bg-gray-200 dark:bg-dark-card animate-pulse" />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No resources found matching your filters.</p>
          <button
            onClick={() => {
              setSelectedType('All');
              setSelectedSubject('All');
              setSearchQuery('');
              setActiveTab('all');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
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

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearningResources;
