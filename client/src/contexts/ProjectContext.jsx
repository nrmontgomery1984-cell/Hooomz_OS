import { createContext, useContext, useState, useCallback } from 'react';

/**
 * ProjectContext - Global state for the currently viewed project
 *
 * Provides:
 * - Current project data when viewing a project page
 * - Methods to update project state
 * - Enables components like Sidebar to know which project/phase is active
 */
const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [currentProject, setCurrentProject] = useState(null);

  // Set the current project (called when entering a project view)
  const setProject = useCallback((project) => {
    setCurrentProject(project);
  }, []);

  // Clear the current project (called when leaving project views)
  const clearProject = useCallback(() => {
    setCurrentProject(null);
  }, []);

  // Update specific fields on the current project
  const updateProject = useCallback((updates) => {
    setCurrentProject(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const value = {
    currentProject,
    currentPhase: currentProject?.phase || null,
    currentProjectId: currentProject?.id || null,
    setProject,
    clearProject,
    updateProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useCurrentProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useCurrentProject must be used within a ProjectProvider');
  }
  return context;
}

// Safe version that doesn't throw - for components that may be outside provider
export function useCurrentProjectSafe() {
  const context = useContext(ProjectContext);
  return context || {
    currentProject: null,
    currentPhase: null,
    currentProjectId: null,
    setProject: () => {},
    clearProject: () => {},
    updateProject: () => {},
  };
}
