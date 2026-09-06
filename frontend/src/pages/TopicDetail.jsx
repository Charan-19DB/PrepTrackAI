import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Square,
  Sparkles,
  BookOpen,
  Code2,
  FileCheck,
  MessageSquareCode,
  FileText,
  ExternalLink,
  Timer,
  Save,
  RotateCcw,
  Calendar,
  Layers
} from 'lucide-react';
import api from '../api/axiosClient';
import { useTimer } from '../context/TimerContext';

export const TopicDetail = () => {
  const { id } = useParams();
  const { startTimer, setSubject, setTopic } = useTimer();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('theory'); // 'theory', 'assessment', 'practical', 'interview', 'notes', 'ai'
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // AI Tutor state
  const [aiPrompt, setAiPrompt] = useState('explain');
  const [aiOutput, setAiOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchTopicDetail();
  }, [id]);

  const fetchTopicDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/topics/${id}`);
      setData(res.data);
      setNotes(res.data.userProgress?.notes || '');
    } catch (err) {
      console.error('Failed to load topic details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChecklist = async (section, itemId, currentCompleted) => {
    try {
      const res = await api.put(`/topics/${id}/checklist`, {
        section,
        itemId,
        completed: !currentCompleted
      });
      setData(prev => ({
        ...prev,
        userProgress: res.data.userProgress
      }));
    } catch (err) {
      console.error('Error updating checklist', err);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await api.put(`/topics/${id}/notes`, { notes });
    } catch (err) {
      console.error('Error saving notes', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAskAITutor = async (queryType) => {
    try {
      setAiLoading(true);
      setAiPrompt(queryType);
      const res = await api.post('/ai/explain', {
        topic: data.topic.name,
        subject: data.topic.subjectName,
        queryType
      });
      setAiOutput(res.data.explanation);
    } catch (err) {
      console.error('AI Tutor request failed', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleStartStudy = () => {
    if (data?.topic) {
      setSubject(data.topic.subjectName);
      setTopic(data.topic.name);
      startTimer(25);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-gray-200 dark:bg-dark-card rounded-xl"></div>
        <div className="h-48 bg-gray-200 dark:bg-dark-card rounded-3xl"></div>
        <div className="h-96 bg-gray-200 dark:bg-dark-card rounded-3xl"></div>
      </div>
    );
  }

  if (!data?.topic) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Topic not found.</p>
        <Link to="/topics" className="text-brand-500 font-bold hover:underline mt-2 inline-block">
          Return to Topic Explorer
        </Link>
      </div>
    );
  }

  const { topic, userProgress } = data;
  const progressPercent = userProgress?.progressPercentage || 0;

  // Checklist helper
  const isChecked = (sectionList, itemId) => {
    return sectionList?.includes(String(itemId));
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        to="/topics"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Topics
      </Link>

      {/* Header Topic Banner */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300">
                {topic.subjectName}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                {topic.importance} Priority
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {topic.difficulty}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                {userProgress?.status || 'Not Started'}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              {topic.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
              {topic.description}
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-end gap-3 flex-shrink-0">
            <button
              onClick={handleStartStudy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
            >
              <Timer className="w-4 h-4" /> Start 25m Focus
            </button>
            {userProgress?.nextRevisionDate && (
              <span className="text-xs text-amber-500 flex items-center gap-1 font-semibold">
                <RotateCcw className="w-3.5 h-3.5" /> Due for revision: {userProgress.nextRevisionDate.split('T')[0]}
              </span>
            )}
          </div>
        </div>

        {/* Three-Layer Progress Bar Breakdown */}
        <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-dark-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300">
              Three-Layer Mastery Score (Theory 25% + Assessment 25% + Practical 30% + Interview 20%)
            </span>
            <span className="font-extrabold text-brand-600 dark:text-brand-400 text-sm">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full bg-gray-100 dark:bg-dark-surface rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                progressPercent >= 80 ? 'bg-emerald-500' : progressPercent >= 40 ? 'bg-brand-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 text-[11px] font-semibold text-center text-gray-500 dark:text-gray-400">
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border/40">
              Theory: {userProgress?.theoryCompleted?.length || 0}/{topic.theoryItems?.length || 4}
            </div>
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border/40">
              Assessment: {userProgress?.assessmentCompleted?.length || 0}/{topic.assessmentItems?.length || 3}
            </div>
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border/40">
              Practical: {userProgress?.practicalCompleted?.length || 0}/{topic.practicalItems?.length || 3}
            </div>
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border/40">
              Interview: {userProgress?.interviewCompleted?.length || 0}/{topic.interviewItems?.length || 3}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-dark-border overflow-x-auto pb-px">
        {[
          { id: 'theory', label: '1. Theory Checklist', icon: BookOpen },
          { id: 'assessment', label: '2. Assessment', icon: FileCheck },
          { id: 'practical', label: '3. Practical Labs', icon: Code2 },
          { id: 'interview', label: '4. Interview Prep', icon: MessageSquareCode },
          { id: 'notes', label: 'Personal Notes', icon: FileText },
          { id: 'ai', label: 'AI Tutor Assistant', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm">
        {/* TAB 1: THEORY */}
        {activeTab === 'theory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Layer 1: Theoretical Conceptual Checklist (25% Weight)
              </h3>
              <span className="text-xs text-gray-400">Mark completed as you study</span>
            </div>

            <div className="space-y-2.5">
              {(topic.theoryItems || []).map((item, idx) => {
                const completed = isChecked(userProgress?.theoryCompleted, item._id || idx);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklist('theory', item._id || idx, completed)}
                    className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-border hover:border-brand-500/40 bg-gray-50/50 dark:bg-dark-surface/40 cursor-pointer transition-all group"
                  >
                    <button className="mt-0.5">
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-brand-500" />
                      )}
                    </button>
                    <div>
                      <span className={`text-sm font-semibold ${completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                        {item.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ASSESSMENT */}
        {activeTab === 'assessment' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Layer 2: Diagnostic & Assessment Checklist (25% Weight)
              </h3>
              <Link to="/practice" className="text-xs font-bold text-brand-500 hover:underline">
                Open Practice Hub →
              </Link>
            </div>

            <div className="space-y-2.5">
              {(topic.assessmentItems || []).map((item, idx) => {
                const completed = isChecked(userProgress?.assessmentCompleted, item._id || idx);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklist('assessment', item._id || idx, completed)}
                    className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-border hover:border-brand-500/40 bg-gray-50/50 dark:bg-dark-surface/40 cursor-pointer transition-all group"
                  >
                    <button className="mt-0.5">
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-brand-500" />
                      )}
                    </button>
                    <div>
                      <span className={`text-sm font-semibold ${completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                        {item.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PRACTICAL */}
        {activeTab === 'practical' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Layer 3: Hands-on Practical Checklist (30% Weight)
              </h3>
              <span className="text-xs text-gray-400">Implement in code or IDE</span>
            </div>

            <div className="space-y-2.5">
              {(topic.practicalItems || []).map((item, idx) => {
                const completed = isChecked(userProgress?.practicalCompleted, item._id || idx);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklist('practical', item._id || idx, completed)}
                    className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-border hover:border-brand-500/40 bg-gray-50/50 dark:bg-dark-surface/40 cursor-pointer transition-all group"
                  >
                    <button className="mt-0.5">
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-brand-500" />
                      )}
                    </button>
                    <div>
                      <span className={`text-sm font-semibold ${completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                        {item.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: INTERVIEW */}
        {activeTab === 'interview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Layer 4: Placement Interview Readiness (20% Weight)
              </h3>
              <Link to="/interview" className="text-xs font-bold text-brand-500 hover:underline">
                Open Interview Question Bank →
              </Link>
            </div>

            <div className="space-y-2.5">
              {(topic.interviewItems || []).map((item, idx) => {
                const completed = isChecked(userProgress?.interviewCompleted, item._id || idx);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklist('interview', item._id || idx, completed)}
                    className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-100 dark:border-dark-border hover:border-brand-500/40 bg-gray-50/50 dark:bg-dark-surface/40 cursor-pointer transition-all group"
                  >
                    <button className="mt-0.5">
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-brand-500" />
                      )}
                    </button>
                    <div>
                      <span className={`text-sm font-semibold ${completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                        {item.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: PERSONAL NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Personal Markdown Notes</h3>
                <p className="text-xs text-gray-400">Write key formulas, interview traps, and code snippets</p>
              </div>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md"
              >
                <Save className="w-4 h-4" /> {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={12}
              placeholder="# Key Takeaways for Normalization\n\n- 1NF: Atomic values only\n- 2NF: No partial dependency on candidate key\n- 3NF: No transitive dependencies\n- BCNF: Determinant must be superkey"
              className="w-full p-4 text-sm font-mono rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 leading-relaxed"
            />
          </div>
        )}

        {/* TAB 6: AI TUTOR ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" /> PrepTrack AI Placement Tutor
                </h3>
                <p className="text-xs text-gray-400">Ask questions, request code examples, or mock test on {topic.name}</p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAskAITutor('explain')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-500 hover:text-white transition-all"
              >
                Explain Concept Simply
              </button>
              <button
                onClick={() => handleAskAITutor('example')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all"
              >
                Give Code Example & Invariants
              </button>
              <button
                onClick={() => handleAskAITutor('pitfalls')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all"
              >
                Top Interview Pitfalls
              </button>
            </div>

            {/* AI Output Box */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface/50 text-sm min-h-[160px]">
              {aiLoading ? (
                <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                  <Sparkles className="w-5 h-5 animate-spin text-brand-500" />
                  <span>Generating expert pedagogical explanation...</span>
                </div>
              ) : aiOutput ? (
                <div className="prose dark:prose-invert max-w-none text-xs md:text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {aiOutput}
                </div>
              ) : (
                <p className="text-gray-400 text-xs text-center py-8">
                  Click one of the prompt chips above to generate instant AI tutor guidance for <span className="font-semibold">{topic.name}</span>.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetail;
