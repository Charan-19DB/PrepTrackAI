import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquareCode,
  ArrowLeft,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Award,
  TrendingUp,
  User,
  Bot,
  Radio,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axiosClient';

const INTERVIEW_TYPES = ['Technical', 'HR', 'Behavioral', 'CSE Core', 'Full Placement'];
const DURATIONS = [10, 15, 20, 30];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const AIInterviewRoom = () => {
  const navigate = useNavigate();

  // Setup state
  const [setupMode, setSetupMode] = useState(true);
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState(15);
  const [selectedTopics, setSelectedTopics] = useState(['DBMS', 'Operating Systems', 'DSA']);

  // Active Session state
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [candidateText, setCandidateText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);

  // Audio / Mic states
  const [isListening, setIsListening] = useState(false);
  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);

  // Conclude / Report state
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [isConcluding, setIsConcluding] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        if (event.results[event.results.length - 1].isFinal) {
          setCandidateText(prev => (prev ? `${prev.trim()} ${current.trim()}` : current.trim()));
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (!setupMode && !evaluationReport && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(s => Math.max(0, s - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [setupMode, evaluationReport, remainingSeconds]);

  // Mic speaking timer
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => setSpeakingSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setSpeakingSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isListening]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const speakText = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStartInterview = async () => {
    try {
      setIsProcessing(true);
      const res = await api.post('/interview-room/start', {
        interviewType,
        difficulty,
        durationMinutes: duration,
        topics: selectedTopics
      });
      setSession(res.data);
      setMessages(res.data.messages || []);
      setSetupMode(false);
      setRemainingSeconds(duration * 60);

      // Speak first question
      if (autoPlayAudio && res.data.messages?.[0]?.text) {
        setTimeout(() => speakText(res.data.messages[0].text), 600);
      }
    } catch (err) {
      console.error('Failed to start interview', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSendResponse = async (e) => {
    if (e) e.preventDefault();
    if (!candidateText.trim() || !session || isProcessing) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const responseText = candidateText.trim();
    setCandidateText('');

    // Optimistically append candidate message
    const tempMessages = [...messages, { role: 'candidate', text: responseText, timestamp: new Date() }];
    setMessages(tempMessages);

    try {
      setIsProcessing(true);
      const res = await api.post(`/interview-room/${session._id}/respond`, {
        candidateResponse: responseText
      });

      setMessages(res.data.session.messages);

      // Speak AI question
      if (autoPlayAudio && res.data.nextQuestion) {
        speakText(res.data.nextQuestion);
      }
    } catch (err) {
      console.error('Failed to send interview response', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConcludeInterview = async () => {
    if (!session) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      setIsConcluding(true);
      const res = await api.post(`/interview-room/${session._id}/conclude`);
      setEvaluationReport(res.data.evaluation);
      if (res.data.evaluation?.overallScore >= 70) {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Failed to conclude interview', err);
    } finally {
      setIsConcluding(false);
    }
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        to="/interview"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Question Bank
      </Link>

      {setupMode ? (
        /* SETUP SCREEN */
        <div className="p-6 md:p-10 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xl space-y-8 animate-in zoom-in-95">
          <div>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Realistic Mock Simulator
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
              AI Interview Room Setup
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Experience a multi-turn conversational placement interview. The AI acts as your interviewer, asks realistic technical/HR questions, and evaluates your answers on the spot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Interview Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                1. Interview Type
              </label>
              <div className="space-y-2">
                {INTERVIEW_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInterviewType(type)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      interviewType === type
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {type} Round
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty & Duration */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  2. Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTIES.map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        difficulty === diff
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                          : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  3. Duration (Minutes)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DURATIONS.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={`py-2 rounded-xl border text-xs font-bold text-center transition-all ${
                        duration === dur
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Core Subjects */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                4. Focus Subjects
              </label>
              <div className="space-y-1.5">
                {['DBMS & SQL', 'Operating Systems', 'Data Structures', 'Computer Networks', 'OOP & Java', 'HR & Projects'].map((sub) => {
                  const isChecked = selectedTopics.includes(sub);
                  return (
                    <label
                      key={sub}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface text-xs font-medium cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedTopics(prev => prev.filter(t => t !== sub));
                          } else {
                            setSelectedTopics(prev => [...prev, sub]);
                          }
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>{sub}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
            <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPlayAudio}
                onChange={(e) => setAutoPlayAudio(e.target.checked)}
                className="rounded text-brand-500"
              />
              <span>Auto-play interviewer voice (Speech Synthesis)</span>
            </label>

            <button
              type="button"
              onClick={handleStartInterview}
              disabled={isProcessing}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-black text-sm shadow-xl shadow-purple-500/25 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Enter AI Interview Room</span>
            </button>
          </div>
        </div>
      ) : evaluationReport ? (
        /* EVALUATION REPORT VIEW */
        <div className="p-6 md:p-10 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xl space-y-8 animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-dark-border pb-6">
            <div>
              <span className="text-xs font-bold text-purple-500 uppercase tracking-wider block">
                Official Hiring Assessment
              </span>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                Interview Performance & Placement Report
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Evaluated across technical depth, problem-solving, communication, and confidence
              </p>
            </div>

            <div className="text-center p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-[11px] font-bold text-gray-400 block uppercase">Overall Score</span>
              <span className="text-3xl font-black text-purple-600 dark:text-purple-400">
                {evaluationReport.overallScore}/100
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 mt-1 inline-block">
                {evaluationReport.hiringRecommendation}
              </span>
            </div>
          </div>

          {/* Dimension Rubrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Technical</span>
              <span className="text-xl font-black text-blue-500">{evaluationReport.technicalScore}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Problem Solving</span>
              <span className="text-xl font-black text-purple-500">{evaluationReport.problemSolvingScore}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Communication</span>
              <span className="text-xl font-black text-emerald-500">{evaluationReport.communicationScore}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Confidence</span>
              <span className="text-xl font-black text-amber-500">{evaluationReport.confidenceScore}%</span>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Key Strengths:
              </h4>
              <ul className="space-y-1.5 pl-2 text-xs text-gray-700 dark:text-gray-300">
                {evaluationReport.strengths?.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Critical Weaknesses:
              </h4>
              <ul className="space-y-1.5 pl-2 text-xs text-gray-700 dark:text-gray-300">
                {evaluationReport.weaknesses?.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Plan */}
          {evaluationReport.recommendedActions && (
            <div className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/20 space-y-2">
              <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" /> Actionable Next Steps Before Placements:
              </h4>
              <div className="space-y-1 text-xs text-gray-800 dark:text-gray-200">
                {evaluationReport.recommendedActions.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-brand-500">{idx + 1}.</span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
            <button
              type="button"
              onClick={() => {
                setSetupMode(true);
                setEvaluationReport(null);
                setSession(null);
                setMessages([]);
              }}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md"
            >
              Start Another Mock Interview
            </button>
          </div>
        </div>
      ) : (
        /* LIVE INTERVIEW ROOM INTERFACE */
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-2xl overflow-hidden flex flex-col h-[750px] animate-in zoom-in-95">
          {/* Top Room Bar */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gray-50/70 dark:bg-dark-surface/70">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                {isSpeakingQuestion && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  AI Lead Interviewer
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                    {interviewType}
                  </span>
                </h3>
                <span className="text-[11px] text-gray-400">
                  {isSpeakingQuestion ? 'Speaking question...' : 'Listening to candidate...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-dark-card px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <span>{formatTimer(remainingSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={handleConcludeInterview}
                disabled={isConcluding}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {isConcluding ? 'Generating Report...' : 'End & Evaluate'}
              </button>
            </div>
          </div>

          {/* Conversation Bubble Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/30 dark:bg-[#0B0F17]/30">
            {messages.map((m, idx) => {
              const isInterviewer = m.role === 'interviewer';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${isInterviewer ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                    isInterviewer ? 'bg-purple-600' : 'bg-brand-500'
                  }`}>
                    {isInterviewer ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isInterviewer
                      ? 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white shadow-sm'
                      : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                  }`}>
                    {m.isFollowUp && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 block mb-1">
                        ⚡ Follow-up Inquiry
                      </span>
                    )}
                    {m.text}

                    {isInterviewer && (
                      <button
                        type="button"
                        onClick={() => speakText(m.text)}
                        className="mt-2 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Replay Audio
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex gap-3 max-w-[80%] mr-auto animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white text-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-xs text-gray-400">
                  Interviewer is analyzing your response...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Candidate Response & Microphone Controls */}
          <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                      : 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Stop Recording ({speakingSeconds}s)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-rose-500" />
                      <span>Speak into Mic</span>
                    </>
                  )}
                </button>

                {isListening && (
                  <span className="text-xs font-mono text-rose-500 font-bold flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 animate-spin" /> Speaking now...
                  </span>
                )}
              </div>

              <span className="text-[11px] text-gray-400">
                {candidateText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <form onSubmit={handleSendResponse} className="flex gap-2">
              <input
                type="text"
                value={candidateText}
                onChange={(e) => setCandidateText(e.target.value)}
                placeholder="Type or speak your answer here (e.g. 'In a relational database, B+ trees are used because...')"
                className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={isProcessing || !candidateText.trim()}
                className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Submit</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInterviewRoom;
