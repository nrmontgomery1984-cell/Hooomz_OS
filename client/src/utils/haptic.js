/**
 * Haptic Feedback Utility for Hooomz OS
 *
 * Provides physical feedback for key interactions.
 * Fails silently on unsupported devices.
 */

/**
 * Trigger haptic feedback
 * @param {'light' | 'medium' | 'heavy'} intensity - Vibration intensity
 */
export function haptic(intensity = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }

  const patterns = {
    light: [10],      // Quick tap - status changes, button presses
    medium: [20],     // Confirmation - task completion, form submit
    heavy: [30, 10, 30], // Alert - timer start/stop, delete confirm
  };

  try {
    navigator.vibrate(patterns[intensity] || patterns.light);
  } catch {
    // Silent fail - haptics are enhancement, not requirement
  }
}

/**
 * Check if haptic feedback is available
 * @returns {boolean}
 */
export function hasHapticSupport() {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}
