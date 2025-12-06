import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const router = Router();

// Mock data for development
const mockProjects = [
  {
    id: '1',
    name: '222 Whitney Ave',
    client_name: 'Johnson Family',
    project_type: 'Renovation',
    status: 'production',
    health_score: 78,
  },
  {
    id: '2',
    name: '445 Oak Street',
    client_name: 'Martinez',
    project_type: 'Addition',
    status: 'production',
    health_score: 45,
  },
];

// GET /api/projects - List all projects
router.get('/', async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.json({ data: mockProjects });
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ data });
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    const project = mockProjects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.json({ data: project });
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json({ data });
});

// POST /api/projects - Create project
router.post('/', async (req, res) => {
  if (!isSupabaseConfigured()) {
    const newProject = { id: Date.now().toString(), ...req.body, health_score: 100 };
    return res.status(201).json({ data: newProject });
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(req.body)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ data });
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    return res.json({ data: { id, ...req.body } });
  }

  const { data, error } = await supabase
    .from('projects')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data });
});

// DELETE /api/projects/:id - Soft delete project
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    return res.json({ data: { id, deleted: true } });
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data });
});

// GET /api/projects/:id/activity - Get project activity feed
router.get('/:id/activity', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    return res.json({ data: [] });
  }

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ data });
});

export default router;
