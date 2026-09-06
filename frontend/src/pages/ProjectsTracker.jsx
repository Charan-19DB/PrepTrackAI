import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Code2,
  Layers,
  ChevronRight
} from 'lucide-react';
import api from '../api/axiosClient';

export const ProjectsTracker = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    status: 'In Progress',
    progress: 50,
    skillsDemonstrated: '',
    interviewPitch: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowAddModal(false);
      setNewProject({
        title: '',
        description: '',
        technologies: '',
        githubUrl: '',
        liveUrl: '',
        status: 'In Progress',
        progress: 50,
        skillsDemonstrated: '',
        interviewPitch: ''
      });
      fetchProjects();
    } catch (err) {
      console.error('Error creating project', err);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <FolderGit2 className="w-4 h-4" /> Technical Portfolio & Resume Builders
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Projects Tracker
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showcase architectures, code repositories, feature checklists, and interview pitches
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map(i => <div key={i} className="h-72 bg-gray-200 dark:bg-dark-card rounded-3xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8">
          No projects added yet. Click "Add Project" to begin logging your technical work.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-500/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-500 uppercase tracking-wider">
                      {proj.status}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {proj.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-gray-100 dark:bg-dark-surface hover:text-brand-500 text-gray-600 dark:text-gray-300 transition-colors"
                        title="View GitHub"
                      >
                        <GitBranch className="w-4 h-4" />
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-gray-100 dark:bg-dark-surface hover:text-brand-500 text-gray-600 dark:text-gray-300 transition-colors"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteProject(proj._id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {proj.description}
                </p>

                {/* Tech stack pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(proj.technologies || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 font-mono text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* 60-second interview elevator pitch */}
                {proj.interviewPitch && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider text-[10px] block">
                      🎤 60-Second Interview Pitch:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                      "{proj.interviewPitch}"
                    </p>
                  </div>
                )}
              </div>

              {/* Progress & skills footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-dark-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Implementation Progress</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">{proj.progress || 100}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-dark-surface rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-brand-500 h-1.5 rounded-full"
                    style={{ width: `${proj.progress || 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-dark-card rounded-3xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. SmartAid — Emergency Incident Router"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  required
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={2}
                  placeholder="What problem does this project solve?"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Technologies (comma separated)</label>
                <input
                  type="text"
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                  placeholder="React, Node.js, Express, MongoDB, Docker"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">60-Second Interview Pitch</label>
                <textarea
                  value={newProject.interviewPitch}
                  onChange={(e) => setNewProject({ ...newProject, interviewPitch: e.target.value })}
                  rows={2}
                  placeholder="Engineered a RAG PDF Assistant that cut lookup latency by 40%..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsTracker;
