/**
 * Alert Rules Engine
 *
 * Auto-generates alerts based on project health thresholds.
 * These rules surface problems before they become crises.
 */

/**
 * Alert threshold definitions
 */
export const ALERT_THRESHOLDS = {
  budget: {
    warning: 0.80,  // 80% of budget used
    critical: 0.95, // 95% of budget used
  },
  schedule: {
    warning: 7,     // 7 days behind
    critical: 14,   // 14 days behind
  },
  communication: {
    warning: 7,     // 7 days since contact
    critical: 14,   // 14 days since contact
  },
  decisions: {
    warning: 3,     // 3 days overdue
    critical: 7,    // 7 days overdue
  },
  margin: {
    warning: 5,     // 5% below target margin
    critical: 10,   // 10% below target margin
  },
};

/**
 * Calculate overall health status from various factors
 * @param {Object} data - Dashboard data
 * @returns {{ status: string, reason: string }}
 */
export function calculateHealthStatus(data) {
  const issues = [];

  // Check budget health
  if (data.budget && data.budget.contractValue > 0) {
    const budgetUsed = (data.budget.totalSpent + data.budget.totalCommitted) / data.budget.contractValue;
    if (budgetUsed >= ALERT_THRESHOLDS.budget.critical) {
      return { status: 'behind', reason: 'Budget critical - over 95% used' };
    }
    if (budgetUsed >= ALERT_THRESHOLDS.budget.warning) {
      issues.push('Budget at 80%+');
    }
  }

  // Check schedule health
  if (data.schedule) {
    if (data.schedule.slippageDays >= ALERT_THRESHOLDS.schedule.critical) {
      return { status: 'behind', reason: `Schedule behind ${data.schedule.slippageDays} days` };
    }
    if (data.schedule.slippageDays >= ALERT_THRESHOLDS.schedule.warning) {
      issues.push('Schedule slipping');
    }
  }

  // Check for blockers
  if (data.actionItems?.blockers?.length > 0) {
    const criticalBlockers = data.actionItems.blockers.filter(b => b.daysSinceCreated >= 5);
    if (criticalBlockers.length > 0) {
      return { status: 'behind', reason: 'Critical blockers unresolved' };
    }
    issues.push('Active blockers');
  }

  // Check communication
  if (data.client?.daysSinceContact >= ALERT_THRESHOLDS.communication.critical) {
    issues.push('No client contact in 14+ days');
  }

  // Check pending decisions
  const overdueDecisions = data.client?.pendingDecisions?.filter(d => d.daysOverdue >= 7) || [];
  if (overdueDecisions.length > 0) {
    issues.push(`${overdueDecisions.length} decisions overdue 7+ days`);
  }

  // Determine overall status
  if (issues.length >= 3) {
    return { status: 'behind', reason: issues.join(', ') };
  }
  if (issues.length >= 1) {
    return { status: 'at_risk', reason: issues.join(', ') };
  }

  return { status: 'on_track', reason: 'All metrics healthy' };
}

/**
 * Generate alerts from project data
 * @param {Object} data - Dashboard data
 * @returns {Array} Array of alert objects
 */
export function generateAlerts(data) {
  const alerts = [];
  const now = new Date();

  // Budget alerts
  if (data.budget && data.budget.contractValue > 0) {
    const budgetUsed = (data.budget.totalSpent + data.budget.totalCommitted) / data.budget.contractValue;

    if (budgetUsed >= ALERT_THRESHOLDS.budget.critical) {
      alerts.push({
        id: 'budget-critical',
        type: 'budget',
        severity: 'critical',
        message: `Budget critical: ${Math.round(budgetUsed * 100)}% used or committed`,
        timestamp: now.toISOString(),
      });
    } else if (budgetUsed >= ALERT_THRESHOLDS.budget.warning) {
      alerts.push({
        id: 'budget-warning',
        type: 'budget',
        severity: 'warning',
        message: `Budget warning: ${Math.round(budgetUsed * 100)}% used or committed`,
        timestamp: now.toISOString(),
      });
    }

    // Margin alert
    if (data.budget.marginTarget && data.budget.currentMargin) {
      const marginDiff = data.budget.marginTarget - data.budget.currentMargin;
      if (marginDiff >= ALERT_THRESHOLDS.margin.critical) {
        alerts.push({
          id: 'margin-critical',
          type: 'budget',
          severity: 'critical',
          message: `Margin squeezed: ${marginDiff.toFixed(1)}% below target`,
          timestamp: now.toISOString(),
        });
      } else if (marginDiff >= ALERT_THRESHOLDS.margin.warning) {
        alerts.push({
          id: 'margin-warning',
          type: 'budget',
          severity: 'warning',
          message: `Margin pressure: ${marginDiff.toFixed(1)}% below target`,
          timestamp: now.toISOString(),
        });
      }
    }
  }

  // Schedule alerts
  if (data.schedule && data.schedule.slippageDays > 0) {
    if (data.schedule.slippageDays >= ALERT_THRESHOLDS.schedule.critical) {
      alerts.push({
        id: 'schedule-critical',
        type: 'schedule',
        severity: 'critical',
        message: `Schedule critical: ${data.schedule.slippageDays} days behind target`,
        timestamp: now.toISOString(),
      });
    } else if (data.schedule.slippageDays >= ALERT_THRESHOLDS.schedule.warning) {
      alerts.push({
        id: 'schedule-warning',
        type: 'schedule',
        severity: 'warning',
        message: `Schedule slipping: ${data.schedule.slippageDays} days behind`,
        timestamp: now.toISOString(),
      });
    }
  }

  // Communication alerts
  if (data.client && data.client.daysSinceContact > 0) {
    if (data.client.daysSinceContact >= ALERT_THRESHOLDS.communication.critical) {
      alerts.push({
        id: 'communication-critical',
        type: 'communication',
        severity: 'critical',
        message: `No client contact in ${data.client.daysSinceContact} days`,
        timestamp: now.toISOString(),
      });
    } else if (data.client.daysSinceContact >= ALERT_THRESHOLDS.communication.warning) {
      alerts.push({
        id: 'communication-warning',
        type: 'communication',
        severity: 'warning',
        message: `${data.client.daysSinceContact} days since client contact`,
        timestamp: now.toISOString(),
      });
    }
  }

  // Decision alerts
  if (data.client?.pendingDecisions) {
    const overdueDecisions = data.client.pendingDecisions.filter(
      d => d.daysOverdue >= ALERT_THRESHOLDS.decisions.warning
    );

    if (overdueDecisions.length > 0) {
      const maxOverdue = Math.max(...overdueDecisions.map(d => d.daysOverdue));
      const severity = maxOverdue >= ALERT_THRESHOLDS.decisions.critical ? 'critical' : 'warning';

      alerts.push({
        id: 'decisions-overdue',
        type: 'communication',
        severity,
        message: `${overdueDecisions.length} decision(s) overdue (max: ${maxOverdue} days)`,
        timestamp: now.toISOString(),
      });
    }
  }

  // Inspection alerts
  if (data.schedule?.upcomingMilestones) {
    const overdueInspections = data.schedule.upcomingMilestones.filter(
      m => m.type === 'inspection' && m.status === 'overdue'
    );

    if (overdueInspections.length > 0) {
      alerts.push({
        id: 'inspection-overdue',
        type: 'inspection',
        severity: 'critical',
        message: `${overdueInspections.length} inspection(s) overdue`,
        timestamp: now.toISOString(),
      });
    }
  }

  return alerts;
}

/**
 * Get severity color for UI
 * @param {'info' | 'warning' | 'critical'} severity
 * @returns {{ bg: string, text: string, border: string }}
 */
export function getSeverityColors(severity) {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' };
    case 'warning':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500' };
    case 'info':
    default:
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' };
  }
}
