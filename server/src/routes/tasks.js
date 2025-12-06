import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const router = Router();

// Mock data
const mockTasks = {
  'l2': [
    { id: 't1', loop_id: 'l2', title: 'Run electrical to master bedroom', status: 'completed' },
    { id: 't2', loop_id: 'l2', title: 'Install HVAC ductwork - 2nd floor', status: 'in_progress' },
    { id: 't3', loop_id: 'l2', title: 'Plumbing rough-in - master bath', status: 'pending' },
  ],
};

// GET /api/tasks?loopId=xxx - Get tasks for a loop
router.get('/', async (req, res) => {
  const { loopId } = req.query;

  if (!loopId) {
    return res.status(400).json({ error: 'loopId is required' });
  }

  if (!isSupabaseConfigured()) {
    return res.json({ data: mockTasks[loopId] || [] });
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('loop_id', loopId)
    .order('display_order', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ data });
});

// GET /api/tasks/today - Get today's tasks
router.get('/today', async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.json({
      data: [
        { id: 't2', title: 'Install HVAC ductwork', status: 'in_progress', project_name: '222 Whitney Ave' },
      ],
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      loop:loops(name, project:projects(name))
    `)
    .or(`due_date.eq.${today},status.eq.in_progress`)
    .order('priority', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ data });
});

// POST /api/tasks - Create task
router.post('/', async (req, res) => {
  if (!isSupabaseConfigured()) {
    const newTask = { id: Date.now().toString(), ...req.body, status: 'pending' };
    return res.status(201).json({ data: newTask });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(req.body)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ data });
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    return res.json({ data: { id, ...req.body } });
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data });
});

// POST /api/tasks/:id/complete - Mark task as complete
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    return res.json({ data: { id, status: 'completed', completed_at: new Date().toISOString() } });
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data });
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    return res.json({ data: { id, deleted: true } });
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data: { id, deleted: true } });
});

export default router;
