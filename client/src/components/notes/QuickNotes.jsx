import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Check,
  Trash2,
  ListTodo,
  StickyNote,
  Building2,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import { Card } from '../ui';
import { getProjects } from '../../services/api';

const COLORS = [
  { name: 'default', bg: 'bg-white', border: 'border-gray-200' },
  { name: 'yellow', bg: 'bg-amber-50', border: 'border-amber-200' },
  { name: 'green', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { name: 'blue', bg: 'bg-blue-50', border: 'border-blue-200' },
  { name: 'purple', bg: 'bg-purple-50', border: 'border-purple-200' },
  { name: 'pink', bg: 'bg-pink-50', border: 'border-pink-200' },
];

const STORAGE_KEY = 'hooomz_quick_notes';

function loadNotesFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveNotesToStorage(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function QuickNotes({ projectFilter = null, compact = false }) {
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({
    type: 'note', // 'note' or 'list'
    title: '',
    content: '',
    items: [],
    color: 'default',
    projectId: null,
  });
  const [newItem, setNewItem] = useState('');

  // Load notes and projects on mount
  useEffect(() => {
    setNotes(loadNotesFromStorage());
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data } = await getProjects();
    setProjects(data || []);
  }

  // Filter notes by project if filter is set
  const filteredNotes = projectFilter
    ? notes.filter(n => n.projectId === projectFilter)
    : notes;

  const saveNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim() && newNote.items.length === 0) {
      setShowAddNote(false);
      return;
    }

    const noteToSave = {
      ...newNote,
      id: editingNote?.id || crypto.randomUUID(),
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedNotes;
    if (editingNote) {
      updatedNotes = notes.map(n => n.id === editingNote.id ? noteToSave : n);
    } else {
      updatedNotes = [noteToSave, ...notes];
    }

    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    resetForm();
  };

  const deleteNote = (noteId) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
  };

  const toggleListItem = (noteId, itemIndex) => {
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        const updatedItems = note.items.map((item, idx) =>
          idx === itemIndex ? { ...item, checked: !item.checked } : item
        );
        return { ...note, items: updatedItems, updatedAt: new Date().toISOString() };
      }
      return note;
    });
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
  };

  const resetForm = () => {
    setShowAddNote(false);
    setEditingNote(null);
    setNewNote({
      type: 'note',
      title: '',
      content: '',
      items: [],
      color: 'default',
      projectId: projectFilter || null,
    });
    setNewItem('');
  };

  const startEdit = (note) => {
    setEditingNote(note);
    setNewNote({ ...note });
    setShowAddNote(true);
  };

  const addListItem = () => {
    if (!newItem.trim()) return;
    setNewNote(prev => ({
      ...prev,
      items: [...prev.items, { text: newItem.trim(), checked: false }]
    }));
    setNewItem('');
  };

  const removeListItem = (index) => {
    setNewNote(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const getColorClasses = (colorName) => {
    const color = COLORS.find(c => c.name === colorName) || COLORS[0];
    return `${color.bg} ${color.border}`;
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal">Quick Notes</h2>
        <button
          onClick={() => {
            setNewNote(prev => ({ ...prev, projectId: projectFilter || null }));
            setShowAddNote(true);
          }}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Add/Edit Note Form */}
      {showAddNote && (
        <Card className={`p-4 border ${getColorClasses(newNote.color)}`}>
          {/* Type Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setNewNote(prev => ({ ...prev, type: 'note' }))}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                newNote.type === 'note'
                  ? 'bg-charcoal text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              Note
            </button>
            <button
              type="button"
              onClick={() => setNewNote(prev => ({ ...prev, type: 'list' }))}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                newNote.type === 'list'
                  ? 'bg-charcoal text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Title"
            value={newNote.title}
            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            className="w-full font-medium text-charcoal placeholder-gray-400 bg-transparent border-none outline-none mb-2"
          />

          {/* Content based on type */}
          {newNote.type === 'note' ? (
            <textarea
              placeholder="Take a note..."
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              onKeyDown={(e) => {
                // Allow Enter for new lines in notes - don't let it submit
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
              rows={3}
              className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none resize-none"
            />
          ) : (
            <div className="space-y-2">
              {/* Existing items */}
              {newNote.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-gray-300 rounded" />
                  <span className="flex-1 text-sm text-gray-600">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => removeListItem(idx)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {/* Add new item */}
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Add item"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem())}
                  className="flex-1 text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none"
                />
              </div>
            </div>
          )}

          {/* Project Tag */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <select
                value={newNote.projectId || ''}
                onChange={(e) => setNewNote(prev => ({ ...prev, projectId: e.target.value || null }))}
                className="flex-1 text-sm text-gray-600 bg-transparent border-none outline-none cursor-pointer"
              >
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2 mt-3">
            {COLORS.map(color => (
              <button
                key={color.name}
                type="button"
                onClick={() => setNewNote(prev => ({ ...prev, color: color.name }))}
                className={`w-6 h-6 rounded-full border-2 ${color.bg} ${
                  newNote.color === color.name ? 'ring-2 ring-offset-1 ring-blue-500' : color.border
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveNote}
              className="px-3 py-1.5 text-sm bg-charcoal text-white rounded-lg hover:bg-gray-800"
            >
              {editingNote ? 'Update' : 'Save'}
            </button>
          </div>
        </Card>
      )}

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className={compact ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              projectName={getProjectName(note.projectId)}
              colorClasses={getColorClasses(note.color)}
              onEdit={() => startEdit(note)}
              onDelete={() => deleteNote(note.id)}
              onToggleItem={(idx) => toggleListItem(note.id, idx)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <StickyNote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No notes yet</p>
          <p className="text-xs text-gray-400">Click "Add" to create a note or list</p>
        </Card>
      )}
    </div>
  );
}

function NoteCard({ note, projectName, colorClasses, onEdit, onDelete, onToggleItem }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`relative p-3 rounded-lg border ${colorClasses} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onEdit}
    >
      {/* Menu Button */}
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 w-full"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      {note.title && (
        <h3 className="font-medium text-charcoal text-sm mb-1 pr-6">{note.title}</h3>
      )}

      {/* Content */}
      {note.type === 'note' && note.content && (
        <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">{note.content}</p>
      )}

      {/* List Items */}
      {note.type === 'list' && note.items.length > 0 && (
        <div className="space-y-1.5">
          {note.items.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onToggleItem(idx);
              }}
            >
              <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
              }`}>
                {item.checked && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm ${item.checked ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                {item.text}
              </span>
            </div>
          ))}
          {note.items.length > 5 && (
            <p className="text-xs text-gray-400">+{note.items.length - 5} more items</p>
          )}
        </div>
      )}

      {/* Project Tag */}
      {projectName && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200/50">
          <Building2 className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{projectName}</span>
        </div>
      )}
    </div>
  );
}

export default QuickNotes;
