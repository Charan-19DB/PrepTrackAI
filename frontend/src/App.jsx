import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import DailyPlanner from './pages/DailyPlanner';
import TopicExplorer from './pages/TopicExplorer';
import TopicDetail from './pages/TopicDetail';
import PracticeHub from './pages/PracticeHub';
import DSATracker from './pages/DSATracker';
import AptitudePractice from './pages/AptitudePractice';
import InterviewPrep from './pages/InterviewPrep';
import PracticeInterview from './pages/PracticeInterview';
import RevisionSystem from './pages/RevisionSystem';
import ProjectsTracker from './pages/ProjectsTracker';
import Analytics from './pages/Analytics';
import CalendarView from './pages/CalendarView';
import NotesHub from './pages/NotesHub';
import MistakeBook from './pages/MistakeBook';
import GoalsTracker from './pages/GoalsTracker';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading PrepTrack AI...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="planner" element={<DailyPlanner />} />
        <Route path="topics" element={<TopicExplorer />} />
        <Route path="topics/:id" element={<TopicDetail />} />
        <Route path="practice" element={<PracticeHub />} />
        <Route path="dsa" element={<DSATracker />} />
        <Route path="aptitude" element={<AptitudePractice />} />
        <Route path="interview" element={<InterviewPrep />} />
        <Route path="interview/practice" element={<PracticeInterview />} />
        <Route path="revisions" element={<RevisionSystem />} />
        <Route path="projects" element={<ProjectsTracker />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="notes" element={<NotesHub />} />
        <Route path="mistakes" element={<MistakeBook />} />
        <Route path="goals" element={<GoalsTracker />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
