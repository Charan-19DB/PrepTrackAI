import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  PenTool,
  Mic,
  MicOff,
  Headphones,
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Radio,
  Trash2,
  RotateCcw,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axiosClient';

const MODULES = [
  { id: 'writing', name: 'Writing Coach', icon: PenTool, desc: 'Grammar, vocabulary, and professional rewrite' },
  { id: 'speaking', name: 'Speaking Practice', icon: Mic, desc: 'Voice mic, filler word detection, and fluency scoring' },
  { id: 'listening', name: 'Listening Practice', icon: Headphones, desc: 'Audio comprehension and technical listening' },
  { id: 'reading', name: 'Reading Practice', icon: BookOpen, desc: 'Speed reading (WPM) & comprehension' }
];

export const CommunicationCoach = () => {
  const [activeTab, setActiveTab] = useState('writing');

  // Writing Coach State
  const [writingText, setWritingText] = useState('');
  const [writingType, setWritingType] = useState('Technical Explanation');
  const [analyzingWriting, setAnalyzingWriting] = useState(false);
  const [writingResult, setWritingResult] = useState(null);

  // Speaking Practice State
  const [speakingTopic, setSpeakingTopic] = useState('Tell me about a challenging technical project you built.');
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [analyzingSpeech, setAnalyzingSpeech] = useState(false);
  const [speakingResult, setSpeakingResult] = useState(null);
  const [micSupported, setMicSupported] = useState(true);

  // Listening Practice State
  const [listeningData, setListeningData] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [listeningSubmitted, setListeningSubmitted] = useState(false);

  // Reading Practice State
  const [readingData, setReadingData] = useState(null);
  const [readingStartTime, setReadingStartTime] = useState(null);
  const [readingWpm, setReadingWpm] = useState(null);
  const [readingAnswers, setReadingAnswers] = useState({});
  const [readingSubmitted, setReadingSubmitted] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Speech Recognition setup for Speaking Tab
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
          setSpeechTranscript(prev => (prev ? `${prev.trim()} ${current.trim()}` : current.trim()));
        }
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    } else {
      setMicSupported(false);
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

  // Speaking timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Load listening / reading exercises
  useEffect(() => {
    if (activeTab === 'listening' && !listeningData) {
      loadListeningExercise();
    }
    if (activeTab === 'reading' && !readingData) {
      loadReadingExercise();
    }
  }, [activeTab]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        setIsRecording(false);
      }
    }
  };

  const handleAnalyzeWriting = async (e) => {
    e.preventDefault();
    if (!writingText.trim()) return;
    try {
      setAnalyzingWriting(true);
      const res = await api.post('/communication/writing/analyze', {
        text: writingText,
        type: writingType
      });
      setWritingResult(res.data.evaluation);
      if (res.data.evaluation?.overallScore >= 80) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      }
    } catch (err) {
      console.error('Writing analysis error', err);
    } finally {
      setAnalyzingWriting(false);
    }
  };

  const handleAnalyzeSpeech = async () => {
    if (!speechTranscript.trim()) return;
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    try {
      setAnalyzingSpeech(true);
      const res = await api.post('/communication/speaking/analyze', {
        transcript: speechTranscript,
        topic: speakingTopic
      });
      setSpeakingResult(res.data.evaluation);
      if (res.data.evaluation?.overallScore >= 75) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error('Speaking analysis error', err);
    } finally {
      setAnalyzingSpeech(false);
    }
  };

  const loadListeningExercise = async () => {
    try {
      const res = await api.get('/communication/listening/exercise');
      setListeningData(res.data);
      setListeningAnswers({});
      setListeningSubmitted(false);
    } catch (err) {
      console.error('Listening exercise fetch failed', err);
    }
  };

  const togglePlayListening = () => {
    if (!window.speechSynthesis || !listeningData?.passage) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(listeningData.passage);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const loadReadingExercise = async () => {
    try {
      const res = await api.get('/communication/reading/exercise');
      setReadingData(res.data);
      setReadingStartTime(Date.now());
      setReadingWpm(null);
      setReadingAnswers({});
      setReadingSubmitted(false);
    } catch (err) {
      console.error('Reading exercise fetch failed', err);
    }
  };

  const handleFinishReading = () => {
    if (!readingStartTime || !readingData?.wordCount) return;
    const elapsedMinutes = Math.max(0.1, (Date.now() - readingStartTime) / 60000);
    const wpm = Math.round(readingData.wordCount / elapsedMinutes);
    setReadingWpm(wpm);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" /> Comprehensive Communication Coach
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            LSRW Communication Mastery
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Polish your technical writing, speaking fluency, listening comprehension, and reading speed
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeTab === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveTab(mod.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-white dark:bg-dark-card border-brand-500 shadow-md ring-2 ring-brand-500/20'
                  : 'bg-white/60 dark:bg-dark-card/60 border-gray-200 dark:border-dark-border hover:border-brand-500/40'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                isActive ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-extrabold text-gray-900 dark:text-white">{mod.name}</h3>
              <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{mod.desc}</p>
            </button>
          );
        })}
      </div>

      {/* TAB 1: WRITING COACH */}
      {activeTab === 'writing' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-dark-border pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-brand-500" /> Technical & Placement Writing Analyzer
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Paste emails, technical answers, LinkedIn posts, or resume points for instant rubric grading
                </p>
              </div>

              <select
                value={writingType}
                onChange={(e) => setWritingType(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-800 dark:text-gray-200"
              >
                <option value="Technical Explanation">Technical Explanation</option>
                <option value="HR Interview Answer">HR Interview Answer</option>
                <option value="Cold Email / Outreach">Cold Email / Outreach</option>
                <option value="Resume Bullet Point">Resume Bullet Point</option>
              </select>
            </div>

            <form onSubmit={handleAnalyzeWriting} className="space-y-4">
              <textarea
                value={writingText}
                onChange={(e) => setWritingText(e.target.value)}
                rows={6}
                placeholder="Paste or type your text here. e.g.: 'I have completed the project yesterday and resolved the memory leaks in the backend database system...'"
                className="w-full p-4 text-sm rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {writingText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  type="submit"
                  disabled={analyzingWriting || !writingText.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${analyzingWriting ? 'animate-spin' : ''}`} />
                  <span>{analyzingWriting ? 'Analyzing Writing...' : 'Analyze & Enhance Writing'}</span>
                </button>
              </div>
            </form>

            {/* Writing Result */}
            {writingResult && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border space-y-6 animate-in zoom-in-95">
                {/* Score Rubric Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Overall</span>
                    <span className="text-xl font-black text-brand-600 dark:text-brand-400">
                      {writingResult.overallScore}/100
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Grammar</span>
                    <span className="text-lg font-black text-emerald-500">
                      {writingResult.grammarScore}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Clarity</span>
                    <span className="text-lg font-black text-blue-500">
                      {writingResult.clarityScore}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Vocabulary</span>
                    <span className="text-lg font-black text-purple-500">
                      {writingResult.vocabularyScore}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Professionalism</span>
                    <span className="text-lg font-black text-amber-500">
                      {writingResult.professionalismScore}
                    </span>
                  </div>
                </div>

                {/* Specific Corrections */}
                {writingResult.corrections && writingResult.corrections.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Identified Corrections & Grammar Rules:
                    </h4>
                    <div className="space-y-2">
                      {writingResult.corrections.map((corr, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs space-y-1">
                          <div className="text-rose-600 dark:text-rose-400 font-mono">
                            <span className="line-through font-bold">Original:</span> "{corr.original}"
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-mono">
                            <span className="font-bold">Correction:</span> "{corr.correction}"
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 pt-0.5">
                            <strong>Why:</strong> {corr.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Polished Rewrite */}
                {writingResult.improvedVersion && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-500/10 to-purple-500/10 border border-brand-500/30 space-y-2">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block">
                      AI Polished & Professional Version:
                    </span>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white leading-relaxed font-sans font-medium">
                      "{writingResult.improvedVersion}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SPEAKING PRACTICE */}
      {activeTab === 'speaking' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                Microphone Speaking Practice
              </span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                Prompt: "{speakingTopic}"
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Speak for 45–60 seconds into your microphone. The AI will evaluate fluency, grammar, and count conversational filler words.
              </p>
            </div>

            {/* Mic Recording Area */}
            <div className="p-6 rounded-3xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center space-y-4">
              <button
                type="button"
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all shadow-xl ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 ring-4 ring-rose-500/20'
                    : 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/30'
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">
                  {isRecording ? `Recording... (${recordingSeconds}s) Speak clearly` : 'Click to Start Speaking'}
                </span>
                <span className="text-xs text-gray-400 mt-0.5 block">
                  Microphone speech is transcribed in real-time below
                </span>
              </div>
            </div>

            {/* Live Transcript Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Live Speech Transcript:
                </label>
                {speechTranscript && (
                  <button
                    type="button"
                    onClick={() => setSpeechTranscript('')}
                    className="text-xs text-gray-400 hover:text-rose-500 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
              <textarea
                value={speechTranscript}
                onChange={(e) => setSpeechTranscript(e.target.value)}
                rows={5}
                placeholder="Your spoken words will appear here in real-time as you speak..."
                className="w-full p-4 text-sm rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 font-sans leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAnalyzeSpeech}
                disabled={analyzingSpeech || !speechTranscript.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${analyzingSpeech ? 'animate-spin' : ''}`} />
                <span>{analyzingSpeech ? 'Evaluating Speech...' : 'Analyze Spoken Fluency'}</span>
              </button>
            </div>

            {/* Speaking Result */}
            {speakingResult && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border space-y-6 animate-in zoom-in-95">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Speaking Score</span>
                    <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                      {speakingResult.overallScore}/100
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Fluency</span>
                    <span className="text-lg font-black text-emerald-500">
                      {speakingResult.fluencyScore}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Grammar</span>
                    <span className="text-lg font-black text-blue-500">
                      {speakingResult.grammarScore}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Confidence</span>
                    <span className="text-lg font-black text-amber-500">
                      {speakingResult.confidenceScore}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Clarity</span>
                    <span className="text-lg font-black text-brand-500">
                      {speakingResult.clarityScore}
                    </span>
                  </div>
                </div>

                {/* Filler Words Detected */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Filler Words Detected:
                    </span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                      Total: {speakingResult.totalFillers || 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {speakingResult.fillerWords && Object.keys(speakingResult.fillerWords).length > 0 ? (
                      Object.entries(speakingResult.fillerWords).map(([word, count]) => (
                        <span key={word} className="px-3 py-1 rounded-xl bg-white dark:bg-dark-card border border-amber-300 dark:border-amber-800 text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
                          "{word}" → {count}x
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        🎉 Zero filler words detected! Excellent speech control.
                      </span>
                    )}
                  </div>
                </div>

                {/* Actionable Tip */}
                {speakingResult.actionableTip && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200">
                    <strong className="block mb-0.5">Speaking Coach Tip:</strong>
                    {speakingResult.actionableTip}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LISTENING PRACTICE */}
      {activeTab === 'listening' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-6">
            {listeningData ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-dark-border pb-4">
                  <div>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      Technical Audio Passage
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                      {listeningData.title}
                    </h2>
                    <p className="text-xs text-gray-400">Speaker: {listeningData.speaker}</p>
                  </div>

                  <button
                    type="button"
                    onClick={togglePlayListening}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md transition-all ${
                      isPlayingAudio ? 'bg-rose-500 animate-pulse' : 'bg-brand-500 hover:bg-brand-600'
                    }`}
                  >
                    {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isPlayingAudio ? 'Stop Audio' : '▶ Play Audio Passage'}</span>
                  </button>
                </div>

                {/* Passage Audio Box */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Transcript (Listen carefully, then answer the questions below):
                  </span>
                  <p className="italic">"{listeningData.passage}"</p>
                </div>

                {/* Comprehension Questions */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Comprehension Questions:
                  </h3>

                  {(listeningData.questions || []).map((q, qIdx) => (
                    <div key={q.id} className="p-4 rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card space-y-2.5">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {qIdx + 1}. {q.question}
                      </span>
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = listeningAnswers[q.id] === opt;
                          let style = 'border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-gray-700 dark:text-gray-300';
                          if (listeningSubmitted) {
                            if (opt === q.correctAnswer) {
                              style = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                            } else if (isSelected) {
                              style = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold';
                            }
                          } else if (isSelected) {
                            style = 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={listeningSubmitted}
                              onClick={() => setListeningAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${style}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-2">
                    {!listeningSubmitted ? (
                      <button
                        type="button"
                        onClick={() => {
                          setListeningSubmitted(true);
                          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                        }}
                        className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-md"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={loadListeningExercise}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 font-bold text-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Next Listening Exercise
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center animate-pulse text-xs text-gray-400">
                Loading listening exercise...
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: READING PRACTICE */}
      {activeTab === 'reading' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-6">
            {readingData ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-dark-border pb-4">
                  <div>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      Technical Speed Reading Test
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                      {readingData.title}
                    </h2>
                    <p className="text-xs text-gray-400">{readingData.wordCount} words</p>
                  </div>

                  {readingWpm ? (
                    <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Reading Speed</span>
                      <span className="text-lg font-black text-emerald-500">{readingWpm} WPM</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinishReading}
                      className="px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md"
                    >
                      I Finished Reading!
                    </button>
                  )}
                </div>

                {/* Passage Text */}
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-sm leading-relaxed text-gray-800 dark:text-gray-200 font-serif">
                  {readingData.passage}
                </div>

                {/* Comprehension Quiz */}
                {readingWpm && (
                  <div className="space-y-4 pt-2 animate-in fade-in">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Reading Comprehension Check:
                    </h3>

                    {(readingData.questions || []).map((q, qIdx) => (
                      <div key={q.id} className="p-4 rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card space-y-2.5">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          {qIdx + 1}. {q.question}
                        </span>
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = readingAnswers[q.id] === opt;
                            let style = 'border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-gray-700 dark:text-gray-300';
                            if (readingSubmitted) {
                              if (opt === q.correctAnswer) {
                                style = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                              } else if (isSelected) {
                                style = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold';
                              }
                            } else if (isSelected) {
                              style = 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={readingSubmitted}
                                onClick={() => setReadingAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${style}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-2">
                      {!readingSubmitted ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReadingSubmitted(true);
                            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                          }}
                          className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-md"
                        >
                          Submit Comprehension Answers
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={loadReadingExercise}
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 font-bold text-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Next Reading Passage
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-64 flex items-center justify-center animate-pulse text-xs text-gray-400">
                Loading reading exercise...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationCoach;
