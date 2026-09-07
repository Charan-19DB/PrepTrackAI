import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Compass, BookOpen, Code2, MessageSquareCode, FileText, FolderGit2, ArrowRight } from 'lucide-react';
import api from '../../api/axiosClient';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const performSearch = async (q) => {
    try {
      setLoading(true);
      const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
      setResults(res.data.results || []);
    } catch (err) {
      console.error('Search query failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-dark-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Input Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-dark-border flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, topics, questions, DSA, notes (Ctrl + K)..."
            className="w-full text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400 animate-pulse">
              Searching across entire platform...
            </div>
          ) : results.length > 0 ? (
            results.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item.url)}
                className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-surface/60 transition-colors text-left group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      {item.type}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-1">
                      {item.title}
                    </span>
                  </div>
                  {item.subtitle && (
                    <span className="text-[11px] text-gray-400 block pl-1">
                      {item.subtitle}
                    </span>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-brand-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            ))
          ) : query.length >= 2 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No results found for "{query}".
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400 space-y-1">
              <p>Type 2 or more characters to search globally.</p>
              <span className="text-[10px] text-gray-500 font-mono">Tip: Press ESC anytime to close</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
