import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Tag,
  Pin,
  Trash2,
  Edit2,
  Sparkles,
  BookOpen,
  Save,
  Code2
} from 'lucide-react';
import api from '../api/axiosClient';

const NOTE_CATEGORIES = ['All', 'Summary', 'Code Snippet', 'Interview Notes', 'Cheat Sheet', 'Mistake Analysis'];

export const NotesHub = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    subjectName: 'DBMS and SQL',
    topicName: 'Normalization',
    category: 'Summary',
    content: '',
    tags: '',
    isPinned: false
  });

  useEffect(() => {
    fetchNotes();
  }, [selectedCategory, search]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      let query = `/notes?`;
      if (selectedCategory !== 'All') query += `category=${selectedCategory}&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(query);
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notes', newNote);
      setShowAddModal(false);
      setNewNote({
        title: '',
        subjectName: 'DBMS and SQL',
        topicName: 'Normalization',
        category: 'Summary',
        content: '',
        tags: '',
        isPinned: false
      });
      fetchNotes();
    } catch (err) {
      console.error('Error creating note', err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch (err) {
      console.error('Error deleting note', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" /> Global Knowledge Archive
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Personal Notes & Code Snippets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Markdown formatted topic summaries, interview cheat sheets, and edge-case code templates
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across all notes and tags..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white font-semibold focus:outline-none"
        >
          {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-56 bg-gray-200 dark:bg-dark-card rounded-3xl" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8">
          No notes found. Create your first note using the button above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <div
              key={note._id}
              className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-5 shadow-sm flex flex-col justify-between space-y-3 hover:border-brand-500/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-500">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {note.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="p-1 rounded text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {note.title}
                </h3>
                <p className="text-[11px] font-semibold text-gray-400">
                  {note.subjectName} • {note.topicName}
                </p>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border/40 text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap line-clamp-5 leading-relaxed">
                  {note.content}
                </div>
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100 dark:border-dark-border/60">
                  {note.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-surface text-gray-500">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-dark-card rounded-3xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Create Note</h3>
            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="e.g. Quick Reference: SQL Window Functions"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={newNote.subjectName}
                    onChange={(e) => setNewNote({ ...newNote, subjectName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Topic</label>
                  <input
                    type="text"
                    required
                    value={newNote.topicName}
                    onChange={(e) => setNewNote({ ...newNote, topicName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Category</label>
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  >
                    {NOTE_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newNote.tags}
                    onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                    placeholder="sql, rank, partition"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Content (Markdown / Code)</label>
                <textarea
                  required
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={6}
                  placeholder="# Summary\n\n- Syntax: ROW_NUMBER() OVER(PARTITION BY dept ORDER BY salary DESC)\n- Edge cases..."
                  className="w-full p-3 text-sm font-mono rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
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
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesHub;
