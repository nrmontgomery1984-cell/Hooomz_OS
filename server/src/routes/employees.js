import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const router = Router();

// In-memory mock storage (falls back when Supabase not configured)
let mockEmployees = [];

// GET /api/employees - List all employees
router.get('/', async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.json({ data: mockEmployees });
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .is('deleted_at', null)
    .order('last_name', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ data });
});

// GET /api/employees/:id - Get single employee
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    const employee = mockEmployees.find(e => e.id === id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    return res.json({ data: employee });
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  res.json({ data });
});

// POST /api/employees - Create employee
router.post('/', async (req, res) => {
  if (!isSupabaseConfigured()) {
    const newEmployee = {
      id: `emp-${Date.now()}`,
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockEmployees.push(newEmployee);
    return res.status(201).json({ data: newEmployee });
  }

  const { data, error } = await supabase
    .from('employees')
    .insert(req.body)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ data });
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    const index = mockEmployees.findIndex(e => e.id === id);
    if (index === -1) {
      // If not found, create it (upsert behavior)
      const newEmployee = {
        id,
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockEmployees.push(newEmployee);
      return res.json({ data: newEmployee });
    }
    mockEmployees[index] = {
      ...mockEmployees[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    return res.json({ data: mockEmployees[index] });
  }

  const { data, error } = await supabase
    .from('employees')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data });
});

// DELETE /api/employees/:id - Soft delete employee
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isSupabaseConfigured()) {
    const index = mockEmployees.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    mockEmployees.splice(index, 1);
    return res.json({ data: { id, deleted: true } });
  }

  const { data, error } = await supabase
    .from('employees')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data });
});

export default router;
