import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const router = Router();

// Mock active timer
let mockActiveTimer = null;

// GET /api/time/active - Get active timer
router.get('/active', async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.json({ data: mockActiveTimer });
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      task:tasks(title, loop:loops(project:projects(name)))
    `)
    .is('end_time', null)
    .single();

  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message });
  }

  res.json({ data: data || null });
});

// POST /api/time/start - Start a timer
router.post('/start', async (req, res) => {
  const { task_id, allocated_minutes = 60 } = req.body;

  if (!task_id) {
    return res.status(400).json({ error: 'task_id is required' });
  }

  if (!isSupabaseConfigured()) {
    mockActiveTimer = {
      id: Date.now().toString(),
      task_id,
      start_time: new Date().toISOString(),
      allocated_minutes,
      task_title: 'Mock Task',
      project_name: 'Mock Project',
    };
    return res.status(201).json({ data: mockActiveTimer });
  }

  // Stop any existing timer first
  await supabase
    .from('time_entries')
    .update({ end_time: new Date().toISOString() })
    .is('end_time', null);

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      task_id,
      start_time: new Date().toISOString(),
      allocated_minutes,
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ data });
});

// POST /api/time/:id/stop - Stop a timer
router.post('/:id/stop', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    if (mockActiveTimer && mockActiveTimer.id === id) {
      mockActiveTimer = null;
    }
    return res.json({ data: { id, end_time: new Date().toISOString() } });
  }

  const now = new Date();

  // Get start time to calculate duration
  const { data: entry } = await supabase
    .from('time_entries')
    .select('start_time')
    .eq('id', id)
    .single();

  if (!entry) {
    return res.status(404).json({ error: 'Time entry not found' });
  }

  const startTime = new Date(entry.start_time);
  const durationMinutes = Math.round((now - startTime) / 60000);

  const { data, error } = await supabase
    .from('time_entries')
    .update({
      end_time: now.toISOString(),
      duration_minutes: durationMinutes,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data });
});

// GET /api/time/report - Get time report
router.get('/report', async (req, res) => {
  const { project_id, start_date, end_date } = req.query;

  if (!isSupabaseConfigured()) {
    return res.json({
      data: {
        total_minutes: 480,
        entries: [],
      },
    });
  }

  let query = supabase
    .from('time_entries')
    .select(`
      *,
      task:tasks(title, loop:loops(name, project:projects(id, name)))
    `)
    .not('end_time', 'is', null);

  if (start_date) {
    query = query.gte('start_time', start_date);
  }
  if (end_date) {
    query = query.lte('end_time', end_date);
  }

  const { data, error } = await query.order('start_time', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Filter by project if specified
  let filteredData = data;
  if (project_id) {
    filteredData = data.filter(entry =>
      entry.task?.loop?.project?.id === project_id
    );
  }

  const totalMinutes = filteredData.reduce(
    (sum, entry) => sum + (entry.duration_minutes || 0),
    0
  );

  res.json({
    data: {
      total_minutes: totalMinutes,
      entries: filteredData,
    },
  });
});

export default router;
