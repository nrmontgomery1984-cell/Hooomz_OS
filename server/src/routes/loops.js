import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const router = Router();

// Mock data
const mockLoops = {
  '1': [
    { id: 'l1', project_id: '1', name: 'Demo & Prep', loop_type: 'phase', status: 'completed', health_score: 100 },
    { id: 'l2', project_id: '1', name: 'Rough-In', loop_type: 'phase', status: 'active', health_score: 68 },
    { id: 'l3', project_id: '1', name: 'Finishes', loop_type: 'phase', status: 'pending', health_score: 100 },
  ],
};

// GET /api/loops?projectId=xxx - Get loops for a project
router.get('/', async (req, res) => {
  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: 'projectId is required' });
  }

  if (!isSupabaseConfigured()) {
    return res.json({ data: mockLoops[projectId] || [] });
  }

  const { data, error } = await supabase
    .from('loops')
    .select('*')
    .eq('project_id', projectId)
    .order('display_order', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ data });
});

// GET /api/loops/:id - Get single loop
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    for (const loops of Object.values(mockLoops)) {
      const loop = loops.find(l => l.id === id);
      if (loop) return res.json({ data: loop });
    }
    return res.status(404).json({ error: 'Loop not found' });
  }

  const { data, error } = await supabase
    .from('loops')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Loop not found' });
  }

  res.json({ data });
});

// POST /api/loops - Create loop
router.post('/', async (req, res) => {
  if (!isSupabaseConfigured()) {
    const newLoop = { id: Date.now().toString(), ...req.body, health_score: 100 };
    return res.status(201).json({ data: newLoop });
  }

  const { data, error } = await supabase
    .from('loops')
    .insert(req.body)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ data });
});

// PUT /api/loops/:id - Update loop
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    return res.json({ data: { id, ...req.body } });
  }

  const { data, error } = await supabase
    .from('loops')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data });
});

// DELETE /api/loops/:id - Delete loop
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    return res.json({ data: { id, deleted: true } });
  }

  const { error } = await supabase
    .from('loops')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data: { id, deleted: true } });
});

export default router;
