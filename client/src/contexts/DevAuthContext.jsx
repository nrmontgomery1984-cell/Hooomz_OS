import { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { TEST_PERSONAS, TEST_PROJECT, TEST_PROJECT_2, getInitialTestData } from '../lib/devData';

// Always enable persona switcher - used for demo/testing across all environments
const isPersonaSwitcherEnabled = () => true;

export const DevAuthContext = createContext(null);

const STORAGE_KEY = 'hooomz_dev_persona';
const TEST_DATA_KEY = 'hooomz_dev_test_data';

/**
 * DevAuthProvider - Provides dev mode authentication and persona switching
 *
 * Only active in development mode. In production, this provider
 * will pass through without any dev functionality.
 */
export function DevAuthProvider({ children }) {
  const isDevMode = isPersonaSwitcherEnabled();

  // Get initial persona from localStorage or default to contractor
  const getInitialPersona = () => {
    if (!isDevMode) return null;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && TEST_PERSONAS[saved]) {
        return TEST_PERSONAS[saved];
      }
    } catch (e) {
      // localStorage not available
    }
    return TEST_PERSONAS.contractor;
  };

  // Get test data from localStorage or use defaults
  const getTestData = () => {
    if (!isDevMode) return null;

    try {
      const saved = localStorage.getItem(TEST_DATA_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // localStorage not available or invalid JSON
    }
    return getInitialTestData();
  };

  const [currentPersona, setCurrentPersona] = useState(getInitialPersona);
  const [testData, setTestData] = useState(getTestData);

  // Persist persona selection
  useEffect(() => {
    if (!isDevMode || !currentPersona) return;

    try {
      const personaKey = Object.keys(TEST_PERSONAS).find(
        (key) => TEST_PERSONAS[key].id === currentPersona.id
      );
      if (personaKey) {
        localStorage.setItem(STORAGE_KEY, personaKey);
      }
    } catch (e) {
      // localStorage not available
    }
  }, [currentPersona, isDevMode]);

  // Persist test data changes
  useEffect(() => {
    if (!isDevMode || !testData) return;

    try {
      localStorage.setItem(TEST_DATA_KEY, JSON.stringify(testData));
    } catch (e) {
      // localStorage not available
    }
  }, [testData, isDevMode]);

  /**
   * Switch to a different persona
   */
  const switchPersona = useCallback(
    (personaKey) => {
      if (!isDevMode) return;

      const persona = TEST_PERSONAS[personaKey];
      if (persona) {
        setCurrentPersona(persona);
      }
    },
    [isDevMode]
  );

  /**
   * Reset test data to initial state
   */
  const resetTestData = useCallback(() => {
    if (!isDevMode) return;

    const initialData = getInitialTestData();
    setTestData(initialData);

    // Also clear from localStorage and re-save
    try {
      localStorage.removeItem(TEST_DATA_KEY);
      localStorage.setItem(TEST_DATA_KEY, JSON.stringify(initialData));
    } catch (e) {
      // localStorage not available
    }
  }, [isDevMode]);

  /**
   * Update test project data
   */
  const updateTestProject = useCallback(
    (updates) => {
      if (!isDevMode) return;

      setTestData((prev) => ({
        ...prev,
        project: {
          ...prev.project,
          ...updates,
        },
      }));
    },
    [isDevMode]
  );

  /**
   * Approve a decision in test data
   */
  const approveDecision = useCallback(
    (decisionId, selectedOptionId) => {
      if (!isDevMode) return;

      setTestData((prev) => ({
        ...prev,
        project: {
          ...prev.project,
          pendingDecisions: prev.project.pendingDecisions.map((d) =>
            d.id === decisionId
              ? { ...d, status: 'approved', selectedOption: selectedOptionId }
              : d
          ),
        },
      }));
    },
    [isDevMode]
  );

  /**
   * Approve a change order in test data
   */
  const approveChangeOrder = useCallback(
    (changeOrderId) => {
      if (!isDevMode) return;

      setTestData((prev) => ({
        ...prev,
        project: {
          ...prev.project,
          pendingChangeOrders: prev.project.pendingChangeOrders.map((co) =>
            co.id === changeOrderId ? { ...co, status: 'approved' } : co
          ),
        },
      }));
    },
    [isDevMode]
  );

  /**
   * Update task status in test data
   */
  const updateTaskStatus = useCallback(
    (taskId, newStatus) => {
      if (!isDevMode) return;

      setTestData((prev) => ({
        ...prev,
        project: {
          ...prev.project,
          assignedSubs: prev.project.assignedSubs.map((sub) => ({
            ...sub,
            tasks: sub.tasks?.map((task) =>
              task.id === taskId ? { ...task, status: newStatus } : task
            ),
          })),
        },
      }));
    },
    [isDevMode]
  );

  /**
   * Log hours for a task
   */
  const logHours = useCallback(
    (taskId, hours) => {
      if (!isDevMode) return;

      setTestData((prev) => ({
        ...prev,
        project: {
          ...prev.project,
          assignedSubs: prev.project.assignedSubs.map((sub) => ({
            ...sub,
            tasks: sub.tasks?.map((task) =>
              task.id === taskId
                ? { ...task, loggedHours: (task.loggedHours || 0) + hours }
                : task
            ),
          })),
        },
      }));
    },
    [isDevMode]
  );

  const value = useMemo(
    () => ({
      // State
      currentPersona,
      isDevMode,
      testData,
      testProject: testData?.project || TEST_PROJECT,
      testProject2: testData?.project2 || TEST_PROJECT_2,
      personas: TEST_PERSONAS,

      // Actions
      switchPersona,
      resetTestData,
      updateTestProject,
      approveDecision,
      approveChangeOrder,
      updateTaskStatus,
      logHours,
    }),
    [
      currentPersona,
      isDevMode,
      testData,
      switchPersona,
      resetTestData,
      updateTestProject,
      approveDecision,
      approveChangeOrder,
      updateTaskStatus,
      logHours,
    ]
  );

  // In production, just render children without any dev functionality
  if (!isDevMode) {
    return children;
  }

  return <DevAuthContext.Provider value={value}>{children}</DevAuthContext.Provider>;
}

export default DevAuthProvider;
