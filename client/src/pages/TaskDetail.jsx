import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Tag,
  MapPin,
  Users,
  Camera,
  FileText,
  Play,
  Square,
  Trash2,
  Edit3,
  Plus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button, StatusDot, TextArea, Input } from '../components/ui';
import { useScopeData } from '../hooks';
import {
  getTask,
  getLoop,
  getProject,
  updateTask,
  updateTaskStatus,
  getTaskNotes,
  addTaskNote,
  getTaskPhotos,
  getTaskTimeEntries,
  startTimer,
  stopTimer,
  createActivityEntry,
} from '../services/api';

export function TaskDetail() {
  const { projectId, loopId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loop, setLoop] = useState(null);
  const [project, setProject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // details | notes | photos | time

  // Form states
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const { getCategoryName, getSubcategoryName, getContactName } = useScopeData(projectId);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [taskRes, loopRes, projectRes] = await Promise.all([
        getTask(taskId),
        getLoop(loopId),
        getProject(projectId),
      ]);

      setTask(taskRes.data);
      setLoop(loopRes.data);
      setProject(projectRes.data);

      if (taskRes.data) {
        setEditForm({
          title: taskRes.data.title,
          description: taskRes.data.description || '',
          due_date: taskRes.data.due_date || '',
          priority: taskRes.data.priority || 2,
          estimated_hours: taskRes.data.estimated_hours || '',
        });
      }

      // Load related data
      const [notesRes, photosRes, timeRes] = await Promise.all([
        getTaskNotes(taskId),
        getTaskPhotos(taskId),
        getTaskTimeEntries(taskId),
      ]);

      setNotes(notesRes.data || []);
      setPhotos(photosRes.data || []);
      setTimeEntries(timeRes.data || []);

      // Check for active timer
      const active = (timeRes.data || []).find(t => !t.end_time);
      setActiveTimer(active || null);

      setLoading(false);
    }
    loadData();
  }, [projectId, loopId, taskId]);

  const handleStatusToggle = async () => {
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    // Optimistic update
    setTask(prev => ({ ...prev, status: newStatus }));

    const { error } = await updateTaskStatus(taskId, newStatus);
    if (error) {
      setTask(prev => ({ ...prev, status: task.status }));
      return;
    }

    // Log activity
    await createActivityEntry({
      event_type: newStatus === 'completed' ? 'task.completed' : 'task.status_changed',
      event_data: {
        title: task.title,
        new_status: newStatus,
        old_status: task.status,
      },
      project_id: projectId,
      loop_id: loopId,
      task_id: taskId,
      actor_name: 'You',
    });
  };

  const handleStartTimer = async () => {
    const { data } = await startTimer(taskId, 60);
    if (data) {
      setActiveTimer(data);
      setTimeEntries(prev => [data, ...prev]);

      await createActivityEntry({
        event_type: 'time.started',
        event_data: { title: task.title },
        project_id: projectId,
        loop_id: loopId,
        task_id: taskId,
        actor_name: 'You',
      });
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    const { data } = await stopTimer(activeTimer.id);
    if (data) {
      setActiveTimer(null);
      setTimeEntries(prev => prev.map(t => t.id === data.id ? data : t));

      await createActivityEntry({
        event_type: 'time.logged',
        event_data: {
          title: task.title,
          duration_minutes: data.duration_minutes,
        },
        project_id: projectId,
        loop_id: loopId,
        task_id: taskId,
        actor_name: 'You',
      });
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);

    const { data } = await addTaskNote(taskId, {
      content: newNote.trim(),
      author_name: 'You',
    });

    if (data) {
      setNotes(prev => [data, ...prev]);
      setNewNote('');

      await createActivityEntry({
        event_type: 'note.added',
        event_data: {
          title: task.title,
          note_preview: newNote.trim().substring(0, 50),
        },
        project_id: projectId,
        loop_id: loopId,
        task_id: taskId,
        actor_name: 'You',
      });
    }
    setAddingNote(false);
  };

  const handleSaveEdit = async () => {
    const { data, error } = await updateTask(taskId, editForm);
    if (!error && data) {
      setTask(prev => ({ ...prev, ...data }));
      setIsEditing(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const totalTimeLogged = timeEntries
    .filter(t => t.duration_minutes)
    .reduce((sum, t) => sum + t.duration_minutes, 0);

  if (loading) {
    return (
      <PageContainer backTo={`/projects/${projectId}/loops/${loopId}`}>
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          <div className="bg-gray-100 rounded-lg h-48 animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  if (!task) {
    return (
      <PageContainer backTo={`/projects/${projectId}/loops/${loopId}`} title="Task Not Found">
        <p className="text-gray-500">This task doesn't exist.</p>
      </PageContainer>
    );
  }

  const isCompleted = task.status === 'completed';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
  const categoryName = task.category_code ? getCategoryName(task.category_code) : null;
  const subcategoryName = task.subcategory_code ? getSubcategoryName(task.subcategory_code) : null;

  const priorityLabels = { 1: 'High', 2: 'Medium', 3: 'Low' };
  const priorityColors = { 1: 'text-red-600', 2: 'text-yellow-600', 3: 'text-gray-500' };

  return (
    <PageContainer
      backTo={`/projects/${projectId}/loops/${loopId}`}
      title={task.title}
      subtitle={`${project?.name || 'Project'} • ${loop?.name || 'Loop'}`}
    >
      {/* Task Header Card */}
      <Card className="p-4 mb-4">
        <div className="flex items-start gap-3">
          {/* Status Toggle */}
          <button
            onClick={handleStatusToggle}
            className="mt-1 text-gray-400 hover:text-green-500 transition-colors"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>

          <div className="flex-1">
            <h2 className={`text-lg font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-charcoal'}`}>
              {task.title}
            </h2>

            {/* Meta badges */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {categoryName && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                  <Tag className="w-3 h-3" />
                  {categoryName}
                  {subcategoryName && <span className="text-gray-400">/ {subcategoryName}</span>}
                </span>
              )}
              {task.location && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-xs text-amber-700 rounded">
                  <MapPin className="w-3 h-3" />
                  {task.location}
                </span>
              )}
              {task.contact_ids?.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-xs text-blue-600 rounded">
                  <Users className="w-3 h-3" />
                  {task.contact_ids.map(id => getContactName(id)).join(', ')}
                </span>
              )}
            </div>

            {/* Due date & Priority */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              {task.due_date && (
                <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                  <Calendar className="w-4 h-4" />
                  <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                  {isOverdue && <AlertCircle className="w-4 h-4" />}
                </div>
              )}
              <div className={`flex items-center gap-1 ${priorityColors[task.priority]}`}>
                <span>{priorityLabels[task.priority]} Priority</span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        {task.description && (
          <p className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
            {task.description}
          </p>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-semibold text-charcoal">{notes.length}</p>
            <p className="text-xs text-gray-500">Notes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-charcoal">{photos.length}</p>
            <p className="text-xs text-gray-500">Photos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-charcoal">{formatDuration(totalTimeLogged)}</p>
            <p className="text-xs text-gray-500">
              {task.estimated_hours ? `of ${task.estimated_hours}h est.` : 'Logged'}
            </p>
          </div>
        </div>
      </Card>

      {/* Timer Section */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-charcoal">Time Tracking</p>
              <p className="text-xs text-gray-500">
                {activeTimer ? 'Timer running...' : 'Start tracking time on this task'}
              </p>
            </div>
          </div>
          {activeTimer ? (
            <Button variant="secondary" size="sm" onClick={handleStopTimer}>
              <Square className="w-4 h-4 mr-1 text-red-500" />
              Stop
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={handleStartTimer}>
              <Play className="w-4 h-4 mr-1 text-green-500" />
              Start
            </Button>
          )}
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4">
        {[
          { key: 'details', label: 'Details' },
          { key: 'notes', label: `Notes (${notes.length})` },
          { key: 'photos', label: `Photos (${photos.length})` },
          { key: 'time', label: `Time (${timeEntries.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex-1 px-2 py-2 text-xs font-medium rounded-md transition-colors
              ${activeTab === tab.key
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <Card className="p-4">
          <h3 className="font-medium text-charcoal mb-3">Task Details</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Status</span>
              <span className={isCompleted ? 'text-green-600' : 'text-yellow-600'}>
                {isCompleted ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Created</span>
              <span className="text-charcoal">
                {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {task.completed_at && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Completed</span>
                <span className="text-charcoal">
                  {new Date(task.completed_at).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Estimated Time</span>
              <span className="text-charcoal">
                {task.estimated_hours ? `${task.estimated_hours} hours` : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Time Logged</span>
              <span className="text-charcoal">{formatDuration(totalTimeLogged)}</span>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-3">
          {/* Add Note Form */}
          <Card className="p-4">
            <TextArea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!newNote.trim() || addingNote}
              >
                {addingNote ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </Card>

          {/* Notes List */}
          {notes.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No notes yet</p>
            </Card>
          ) : (
            notes.map(note => (
              <Card key={note.id} className="p-4">
                <p className="text-sm text-charcoal whitespace-pre-wrap">{note.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {note.author_name} • {new Date(note.created_at).toLocaleString()}
                </p>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="space-y-3">
          {/* Add Photo Button */}
          <Card className="p-4">
            <button className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
              <Camera className="w-5 h-5" />
              <span className="text-sm">Add Photo</span>
            </button>
          </Card>

          {/* Photos Grid */}
          {photos.length === 0 ? (
            <Card className="p-8 text-center">
              <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No photos yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {photos.map(photo => (
                <Card key={photo.id} className="aspect-square overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Task photo'}
                    className="w-full h-full object-cover"
                  />
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'time' && (
        <div className="space-y-3">
          {/* Time Summary */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-charcoal">{formatDuration(totalTimeLogged)}</p>
                <p className="text-xs text-gray-500">Total time logged</p>
              </div>
              {task.estimated_hours && (
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-400">{task.estimated_hours}h</p>
                  <p className="text-xs text-gray-500">Estimated</p>
                </div>
              )}
            </div>
            {task.estimated_hours && (
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    totalTimeLogged > task.estimated_hours * 60 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (totalTimeLogged / (task.estimated_hours * 60)) * 100)}%` }}
                />
              </div>
            )}
          </Card>

          {/* Time Entries List */}
          {timeEntries.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No time entries yet</p>
            </Card>
          ) : (
            <Card>
              {timeEntries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between px-4 py-3 ${
                    idx < timeEntries.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm text-charcoal">
                      {new Date(entry.start_time).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {entry.end_time && ` - ${new Date(entry.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {entry.duration_minutes ? (
                      <span className="text-sm font-medium text-charcoal">
                        {formatDuration(entry.duration_minutes)}
                      </span>
                    ) : (
                      <span className="text-xs text-green-500 animate-pulse">Running...</span>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* Edit Modal would go here - keeping simple for now */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Edit Task</h3>
            <div className="space-y-4">
              <Input
                label="Title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
              <TextArea
                label="Description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              <Input
                label="Due Date"
                type="date"
                value={editForm.due_date}
                onChange={(e) => setEditForm(prev => ({ ...prev, due_date: e.target.value }))}
              />
              <Input
                label="Estimated Hours"
                type="number"
                value={editForm.estimated_hours}
                onChange={(e) => setEditForm(prev => ({ ...prev, estimated_hours: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
