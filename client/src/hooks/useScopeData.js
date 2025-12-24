import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ALL_CATEGORIES,
  getCategoryByCode,
  getSubcategoryByCode,
  getSubcategoriesForCategory,
  formatCategoryPath,
} from '../data/scopeCategories';
import { supabase } from '../services/supabase';

/**
 * useScopeData - Hook for accessing cached scope categories and contacts
 *
 * Provides:
 * - Categories and subcategories (cached on first load)
 * - Project contacts
 * - Helper functions for lookups
 * - Options formatted for Select components
 *
 * @param {string} projectId - Optional project ID to filter contacts
 */
export function useScopeData(projectId = null) {
  // Categories are static, no need to fetch
  const categories = ALL_CATEGORIES;

  // Contacts - fetch from Supabase
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContacts() {
      setLoading(true);

      try {
        let query = supabase.from('contacts').select('*');

        // If projectId provided, get contacts linked to this project
        if (projectId) {
          const { data: projectContacts } = await supabase
            .from('project_contacts')
            .select('contact_id')
            .eq('project_id', projectId);

          if (projectContacts && projectContacts.length > 0) {
            const contactIds = projectContacts.map(pc => pc.contact_id);
            query = query.in('id', contactIds);
          }
        }

        const { data, error } = await query.order('name');

        if (error) {
          console.error('[useScopeData] Error fetching contacts:', error);
          setContacts([]);
        } else {
          setContacts(data || []);
        }
      } catch (err) {
        console.error('[useScopeData] Error:', err);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, [projectId]);

  // Format categories for Select component
  const categoryOptions = useMemo(() =>
    categories.map(cat => ({
      value: cat.code,
      label: cat.name,
    })),
    [categories]
  );

  // Get subcategory options for a given category
  const getSubcategoryOptions = useCallback((categoryCode) => {
    const subs = getSubcategoriesForCategory(categoryCode);
    return subs.map(sub => ({
      value: sub.code,
      label: sub.name,
    }));
  }, []);

  // All subcategories as flat list with grouping
  const allSubcategoryOptions = useMemo(() =>
    categories.flatMap(cat =>
      cat.subcategories.map(sub => ({
        value: sub.code,
        label: sub.name,
        group: cat.name,
      }))
    ),
    [categories]
  );

  // Format contacts for Select component
  const contactOptions = useMemo(() => {
    // Group by contact type
    const typeLabels = {
      subcontractor: 'Subcontractors',
      supplier: 'Suppliers',
      inspector: 'Inspectors',
      client: 'Clients',
      other: 'Other',
    };

    return contacts.map(c => ({
      value: c.id,
      label: c.company ? `${c.name} (${c.company})` : c.name,
      group: typeLabels[c.contact_type] || 'Other',
    }));
  }, [contacts]);

  // Subcontractors only
  const subcontractorOptions = useMemo(() =>
    contacts
      .filter(c => c.contact_type === 'subcontractor')
      .map(c => ({
        value: c.id,
        label: c.company ? `${c.name} (${c.company})` : c.name,
      })),
    [contacts]
  );

  // Lookup helpers
  const getCategoryName = useCallback((code) => {
    const cat = getCategoryByCode(code);
    return cat ? cat.name : code;
  }, []);

  const getSubcategoryName = useCallback((code) => {
    const sub = getSubcategoryByCode(code);
    return sub ? sub.name : code;
  }, []);

  const getContactName = useCallback((contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? (contact.company || contact.name) : contactId;
  }, [contacts]);

  const getContactNames = useCallback((contactIds = []) => {
    return contactIds.map(id => getContactName(id)).filter(Boolean);
  }, [getContactName]);

  // Get full contact object
  const getContact = useCallback((contactId) => {
    return contacts.find(c => c.id === contactId);
  }, [contacts]);

  return {
    // Data
    categories,
    contacts,
    loading,

    // Select options
    categoryOptions,
    getSubcategoryOptions,
    allSubcategoryOptions,
    contactOptions,
    subcontractorOptions,

    // Lookups
    getCategoryByCode,
    getSubcategoryByCode,
    getCategoryName,
    getSubcategoryName,
    formatCategoryPath,
    getContact,
    getContactName,
    getContactNames,
  };
}

// Common locations in residential construction
export const COMMON_LOCATIONS = [
  // Main Living Areas
  'Living Room',
  'Dining Room',
  'Kitchen',
  'Family Room',
  'Great Room',
  'Office',
  'Den',
  // Bedrooms
  'Master Bedroom',
  'Bedroom 2',
  'Bedroom 3',
  'Bedroom 4',
  'Guest Room',
  // Bathrooms
  'Master Bath',
  'Main Bath',
  'Half Bath',
  'Powder Room',
  'Guest Bath',
  // Utility
  'Laundry Room',
  'Mudroom',
  'Pantry',
  'Closet',
  'Walk-in Closet',
  // Circulation
  'Hallway',
  'Entryway',
  'Foyer',
  'Stairway',
  // Garage & Exterior
  'Garage',
  'Attic',
  'Basement',
  'Crawlspace',
  // Outdoor
  'Front Porch',
  'Back Porch',
  'Deck',
  'Patio',
  // Floors
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  // Whole house
  'Whole House',
  'Exterior',
];

// Location keywords for prediction
const locationKeywords = {
  'Master Bedroom': ['master bedroom', 'master bed', 'mbr'],
  'Master Bath': ['master bath', 'master bathroom', 'mbath', 'ensuite'],
  'Kitchen': ['kitchen', 'ktchn'],
  'Living Room': ['living room', 'living rm'],
  'Dining Room': ['dining room', 'dining rm'],
  'Family Room': ['family room', 'family rm'],
  'Laundry Room': ['laundry', 'laundry room'],
  'Garage': ['garage'],
  'Basement': ['basement', 'bsmt'],
  'Attic': ['attic'],
  'Hallway': ['hallway', 'hall'],
  'Bathroom': ['bathroom', 'bath'],
  '2nd Floor': ['2nd floor', 'second floor', 'upstairs'],
  '1st Floor': ['1st floor', 'first floor', 'main floor', 'downstairs'],
  'Bedroom 2': ['bedroom 2', 'bed 2', 'guest room'],
  'Bedroom 3': ['bedroom 3', 'bed 3'],
  'Closet': ['closet'],
  'Pantry': ['pantry'],
  'Mudroom': ['mudroom', 'mud room'],
  'Front Porch': ['front porch'],
  'Back Porch': ['back porch', 'rear porch'],
  'Deck': ['deck'],
  'Patio': ['patio'],
  'Exterior': ['exterior', 'outside'],
  'Whole House': ['whole house', 'entire house', 'throughout'],
};

/**
 * Simple keyword-based category prediction
 * Returns suggested category code based on description text
 *
 * This is a placeholder - in production could use ML/AI
 */
export function predictCategory(description) {
  const text = description.toLowerCase();

  const keywords = {
    // Electrical
    EL: ['electric', 'wire', 'outlet', 'switch', 'panel', 'circuit', 'voltage', 'amp'],
    // Plumbing
    PL: ['plumb', 'pipe', 'drain', 'faucet', 'toilet', 'shower', 'water', 'sewer'],
    // HVAC
    HV: ['hvac', 'duct', 'furnace', 'air condition', 'heating', 'cooling', 'vent'],
    // Drywall
    DW: ['drywall', 'sheetrock', 'gypsum', 'mud', 'tape', 'texture'],
    // Framing
    FS: ['fram', 'stud', 'joist', 'rafter', 'header', 'beam', 'sheath'],
    FI: ['partition', 'blocking', 'backing'],
    // Flooring
    FL: ['floor', 'hardwood', 'lvp', 'laminate', 'carpet', 'subfloor'],
    // Tile
    TL: ['tile', 'grout', 'backsplash', 'waterproof membrane'],
    // Painting
    PT: ['paint', 'primer', 'stain', 'finish coat'],
    // Roofing
    RF: ['roof', 'shingle', 'flashing', 'gutter', 'soffit', 'fascia'],
    // Insulation
    IA: ['insul', 'vapor barrier', 'air seal', 'weatheriz'],
    // Cabinets
    CM: ['cabinet', 'counter', 'vanity', 'millwork'],
    // Finish Carpentry
    FC: ['trim', 'baseboard', 'casing', 'crown', 'door hang', 'closet'],
    // Foundation
    FN: ['foundation', 'footing', 'concrete', 'slab', 'waterproof'],
    // Exterior
    EE: ['siding', 'window', 'house wrap', 'exterior door'],
    EF: ['deck', 'porch', 'landscape', 'hardscape'],
  };

  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (text.includes(word)) {
        return category;
      }
    }
  }

  // Default to General if no match
  return 'GN';
}

/**
 * Predict subcategory based on description and category
 * Returns suggested subcategory code
 */
export function predictSubcategory(description, categoryCode) {
  const text = description.toLowerCase();

  // Subcategory keywords by category
  const subcategoryKeywords = {
    EL: {
      'EL-01': ['rough', 'wire', 'run cable', 'junction'],
      'EL-02': ['trim', 'device', 'outlet', 'switch', 'cover plate'],
      'EL-03': ['service', 'panel', 'meter', 'breaker'],
    },
    PL: {
      'PL-01': ['rough', 'supply', 'drain', 'vent', 'stack'],
      'PL-02': ['gas', 'gas line'],
      'PL-03': ['trim', 'fixture', 'faucet', 'toilet', 'install'],
    },
    HV: {
      'HV-01': ['rough', 'duct', 'trunk', 'branch'],
      'HV-02': ['equipment', 'furnace', 'air handler', 'condenser', 'unit'],
      'HV-03': ['trim', 'register', 'grille', 'vent cover', 'thermostat'],
    },
    DW: {
      'DW-01': ['hang', 'install', 'sheetrock'],
      'DW-02': ['tape', 'mud', 'finish', 'smooth'],
      'DW-03': ['texture', 'knockdown', 'orange peel', 'smooth'],
    },
    FS: {
      'FS-01': ['floor', 'deck', 'joist', 'subfloor'],
      'FS-02': ['wall', 'stud', 'header', 'exterior'],
      'FS-03': ['roof', 'truss', 'rafter', 'sheathing'],
    },
    FL: {
      'FL-01': ['prep', 'level', 'subfloor', 'underlayment'],
      'FL-02': ['hardwood', 'engineered', 'lvp', 'laminate', 'install'],
      'FL-03': ['carpet', 'pad'],
    },
    PT: {
      'PT-01': ['prep', 'sand', 'fill', 'prime'],
      'PT-02': ['paint', 'coat', 'wall', 'ceiling'],
      'PT-03': ['trim', 'door', 'cabinet', 'detail'],
    },
    TL: {
      'TL-01': ['prep', 'waterproof', 'membrane', 'board'],
      'TL-02': ['wall tile', 'shower', 'backsplash'],
      'TL-03': ['floor tile', 'floor'],
    },
  };

  const catKeywords = subcategoryKeywords[categoryCode];
  if (!catKeywords) return null;

  for (const [subcode, words] of Object.entries(catKeywords)) {
    for (const word of words) {
      if (text.includes(word)) {
        return subcode;
      }
    }
  }

  // Return first subcategory as default (usually "Rough" or "Prep")
  return Object.keys(catKeywords)[0];
}

/**
 * Predict location from description text
 * Returns suggested location string
 */
export function predictLocation(description) {
  const text = description.toLowerCase();

  for (const [location, keywords] of Object.entries(locationKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return location;
      }
    }
  }

  return null;
}
