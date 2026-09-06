import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, Code2, MessageSquareCode, FileText, FolderGit2, Compass, ArrowRight } from 'lucide-react';
import api from '../../api/axiosClient';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results || []);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url) => {
    onClose(false);
    navigate(url);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Subject': return <Compass className="w-4 h-4 text-amber-500" />;
      case 'Topic': return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'DSA': return <Code2 className="w-4 h-4 text-emerald-500" />;
      case 'Interview': return <MessageSquareCode className="w-4 h-4 text-purple-500" />;
      case 'Note': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'Project': return <FolderGit2 className="w-4 h-4 text-rose-500" />;
      default: return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden flex flex-col max-h-[80vh]">
        {/* Input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, subject, topic, or DSA problem..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-base"
          />
          <button
            onClick={() => onClose(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-gray-100 dark:divide-dark-border/40">
          {loading && (
            <div className="py-8 text-center text-sm text-gray-400">
              Searching PrepTrack index...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">
              No results found for <span className="font-semibold text-gray-700 dark:text-gray-200">"{query}"</span>
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="py-6 px-4 text-xs text-gray-400 space-y-2">
              <span className="font-semibold uppercase tracking-wider text-gray-500">Quick suggestions:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Normalization', 'Sliding Window', 'Deadlocks', 'TCP Handshake', 'Binary Search', 'Two Sum'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-brand-500 hover:text-white transition-all text-xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(item.url)}
              className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-surface/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-surface">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-brand-500 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    <span className="font-medium text-gray-500 dark:text-gray-400">{item.type}</span> • {item.subtitle}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
