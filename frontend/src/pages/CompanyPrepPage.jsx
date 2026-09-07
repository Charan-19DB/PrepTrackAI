import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Play,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  Target,
  CheckSquare,
  Square
} from 'lucide-react';
import api from '../api/axiosClient';

export const CompanyPrepPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedIndexes, setCompletedIndexes] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company-prep');
      setCompanies(res.data || []);
      if (res.data && res.data.length > 0) {
        loadCompanyDetail(res.data[0].slug);
      }
    } catch (err) {
      console.error('Failed to load companies', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDetail = async (slug) => {
    try {
      const res = await api.get(`/company-prep/${slug}`);
      setSelectedCompany(res.data);
      setCompletedIndexes(res.data.completedTaskIndexes || []);
    } catch (err) {
      console.error('Failed to load company detail', err);
    }
  };

  const handleToggleTask = async (taskIndex) => {
    if (!selectedCompany) return;
    try {
      const res = await api.post(`/company-prep/${selectedCompany.slug}/toggle-task`, {
        taskIndex
      });
      setCompletedIndexes(res.data.completedTaskIndexes);
      fetchCompanies(); // Refresh checklist progress bar
    } catch (err) {
      console.error('Toggle task failed', err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-4 h-4" /> Company-Specific Placement Roadmaps
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
          Target Company Preparation Hub
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Interview round breakdowns, high-frequency topics, and verified preparation checklists
        </p>
      </div>

      {/* Company Selection Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-36 rounded-3xl bg-gray-200 dark:bg-dark-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {companies.map((c) => {
            const isSelected = selectedCompany?.slug === c.slug;
            return (
              <div
                key={c.slug}
                onClick={() => loadCompanyDetail(c.slug)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-white dark:bg-dark-card border-brand-500 shadow-xl ring-2 ring-brand-500/20'
                    : 'bg-white/60 dark:bg-dark-card/60 border-gray-200 dark:border-dark-border hover:border-brand-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-surface text-gray-500">
                      {c.tier}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{c.name}</h3>
                  <span className="text-[11px] text-gray-400 block mt-0.5 font-medium">
                    DSA: {c.dsaDifficulty}
                  </span>
                </div>

                {/* Progress Mini Bar */}
                <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-dark-border">
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                    <span>Checklist</span>
                    <span>{c.completionPercentage || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${c.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Company Detail Panel */}
      {selectedCompany && (
        <div className="p-6 md:p-10 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xl space-y-8 animate-in fade-in">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-dark-border pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  {selectedCompany.tier}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500">
                  Aptitude: {selectedCompany.aptitudeImportance}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-2">
                {selectedCompany.name} Placement Guide
              </h2>
            </div>

            <Link
              to="/interview/room"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all w-fit"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch {selectedCompany.name} Mock Interview</span>
            </Link>
          </div>

          {/* Rounds & Recruitment Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" /> Interview & Selection Rounds ({selectedCompany.interviewRounds?.length || 0} Stages)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCompany.interviewRounds?.map((r) => (
                <div
                  key={r.roundNumber}
                  className="p-5 rounded-2xl border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-brand-500">Round #{r.roundNumber}</span>
                    <span className="text-[10px] font-mono text-gray-400">{r.duration}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{r.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-sans">{r.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* High-Frequency Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-500/20 space-y-3">
              <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Frequently Tested Technical Topics:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCompany.technicalFocusTopics?.map((top, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-white dark:bg-dark-card border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300"
                  >
                    {top}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-500/20 space-y-3">
              <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Behavioral & Leadership Principles:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCompany.hrBehavioralFocus?.map((top, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-white dark:bg-dark-card border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300"
                  >
                    {top}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Preparation Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {selectedCompany.name} Readiness Checklist
              </h3>
              <span className="text-xs font-bold text-gray-400">
                {completedIndexes.length} of {selectedCompany.preparationChecklist?.length || 0} tasks completed
              </span>
            </div>

            <div className="space-y-2">
              {selectedCompany.preparationChecklist?.map((taskItem, idx) => {
                const isChecked = completedIndexes.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleTask(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                        : 'bg-white dark:bg-dark-card border-gray-100 dark:border-dark-border hover:border-brand-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`text-xs sm:text-sm font-medium ${isChecked ? 'line-through opacity-75' : ''}`}>
                        {taskItem.task}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-surface text-gray-500">
                        {taskItem.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        ~{taskItem.estimatedHours}h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyPrepPage;
