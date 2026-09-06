import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, BrainCircuit, FileText, CheckCircle2, ArrowRight, Sparkles, BookOpen, Clock } from 'lucide-react';

const APTITUDE_DOMAINS = [
  {
    id: 'quant',
    name: 'Quantitative Aptitude',
    icon: Calculator,
    color: 'from-amber-500 to-orange-600',
    topicsCount: 34,
    description: 'Number systems, Percentages, Profit & Loss, Time & Work, Time Speed Distance, Probability, Data Interpretation',
    formulas: [
      { title: 'Percentage Change', formula: '[(New - Old) / Old] × 100%' },
      { title: 'Time and Work', formula: 'If A takes x days and B takes y days, together = (x × y) / (x + y) days' },
      { title: 'Compound Interest', formula: 'A = P(1 + r/n)^(nt), CI = A - P' },
      { title: 'Relative Speed (Opposite)', formula: 'S_rel = S1 + S2' },
      { title: 'Probability', formula: 'P(E) = Favorable Outcomes / Total Outcomes' }
    ]
  },
  {
    id: 'lr',
    name: 'Logical Reasoning',
    icon: BrainCircuit,
    color: 'from-purple-500 to-indigo-600',
    topicsCount: 20,
    description: 'Coding-Decoding, Blood Relations, Seating Arrangements, Floor Puzzles, Syllogisms, Clocks & Calendars',
    formulas: [
      { title: 'Clock Angle', formula: 'Angle = |(11/2) × M - 30 × H| degrees' },
      { title: 'Leap Year Rule', formula: 'Divisible by 4, except century years which must be divisible by 400' },
      { title: 'Linear Ranking', formula: 'Total = (Position from Left + Position from Right) - 1' },
      { title: 'Syllogisms All A are B', formula: 'A ⊆ B; Some A are B is automatically valid' }
    ]
  },
  {
    id: 'verbal',
    name: 'Verbal Ability',
    icon: FileText,
    color: 'from-emerald-500 to-teal-600',
    description: 'Subject-Verb Agreement, Error Spotting, Reading Comprehension, Para Jumbles, Active/Passive Voice',
    formulas: [
      { title: 'Subject-Verb Agreement', formula: 'Singular subjects take singular verbs; "Neither... nor" follows closest subject' },
      { title: 'Conditionals (Type 3)', formula: 'If + past perfect, would have + past participle' },
      { title: 'Active to Passive', formula: 'Subject + Verb + Object → Object + be + V3 + by + Subject' },
      { title: 'Articles Rule', formula: '"A/An" for singular countable general; "The" for specific/unique' }
    ]
  }
];

export const AptitudePractice = () => {
  const [selectedDomain, setSelectedDomain] = useState(APTITUDE_DOMAINS[0]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-4 h-4" /> Placement Aptitude Mastery
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Aptitude & Reasoning Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Formula sheets, sectional problem sets, and diagnostic tests for campus recruitment
          </p>
        </div>

        <Link
          to="/practice?type=Aptitude"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all w-fit"
        >
          <Sparkles className="w-4 h-4" /> Start Aptitude Quiz
        </Link>
      </div>

      {/* 3 Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {APTITUDE_DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const isSelected = selectedDomain.id === domain.id;

          return (
            <div
              key={domain.id}
              onClick={() => setSelectedDomain(domain)}
              className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white dark:bg-dark-card border-brand-500 shadow-xl ring-2 ring-brand-500/20'
                  : 'bg-white/60 dark:bg-dark-card/60 border-gray-200 dark:border-dark-border hover:border-brand-500/40'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${domain.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{domain.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{domain.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                <span>{domain.topicsCount} Topics</span>
                <span>Select Cheatsheet →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* High-Yield Formula Sheet for Selected Domain */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-500" /> High-Yield Formula Sheet: {selectedDomain.name}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Memorize these formulas for rapid solving under 60 seconds</p>
          </div>
          <Link
            to={`/practice?type=Aptitude`}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-surface hover:bg-brand-500 hover:text-white text-xs font-bold transition-all text-gray-700 dark:text-gray-300"
          >
            Practice {selectedDomain.name} Questions →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedDomain.formulas.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/40 space-y-2"
            >
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.title}</span>
              <div className="p-2.5 rounded-xl bg-gray-900 text-brand-300 font-mono text-xs border border-gray-800">
                {item.formula}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AptitudePractice;
