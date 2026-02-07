/**
 * Attendance marker configuration
 * Each marker has a deduction/addition value
 */
export const ATTENDANCE_MARKERS = {
  P: { label: 'Present', days: 0, type: 'neutral' },
  A: { label: 'Leave/Absent', days: 1, type: 'deduction' },
  X: { label: 'Week Off', days: 0, type: 'neutral' },
  H: { label: 'Half Day', days: 0.5, type: 'deduction' },
  W: { label: 'Weekend worked', days: 2, type: 'deduction' },
  N: { label: 'No Show', days: 1.5, type: 'deduction' },
  O: { label: 'Overtime', days: 1, type: 'addition' }
};

/**
 * Calculates deduction and addition days from attendance data
 * @param {Array} attendanceData - Array of { date, marker } objects
 * @returns {Object} - { deductionDays, additionDays, breakdown }
 */
export const calculateAttendanceDays = (attendanceData) => {
  let deductionDays = 0;
  let additionDays = 0;
  const breakdown = [];
  
  for (const entry of attendanceData) {
    const marker = entry.marker.toUpperCase();
    const config = ATTENDANCE_MARKERS[marker];
    
    if (!config) {
      // Unknown marker, skip it
      continue;
    }
    
    if (config.type === 'deduction' && config.days > 0) {
      deductionDays += config.days;
      breakdown.push({
        date: entry.date,
        marker,
        days: config.days,
        type: 'deduction',
        label: config.label
      });
    } else if (config.type === 'addition' && config.days > 0) {
      additionDays += config.days;
      breakdown.push({
        date: entry.date,
        marker,
        days: config.days,
        type: 'addition',
        label: config.label
      });
    }
  }
  
  return {
    deductionDays,
    additionDays,
    breakdown
  };
};

/**
 * Merges attendance data from multiple outlets for the same employee
 * @param {Array<Array>} attendanceArrays - Array of attendance arrays from different outlets
 * @returns {Array} - Combined attendance array
 */
export const mergeAttendanceData = (...attendanceArrays) => {
  const combined = [];
  
  for (const attendanceArray of attendanceArrays) {
    if (Array.isArray(attendanceArray)) {
      combined.push(...attendanceArray);
    }
  }
  
  // Sort by date
  combined.sort((a, b) => {
    const dateA = parseDateString(a.date);
    const dateB = parseDateString(b.date);
    return dateA - dateB;
  });
  
  return combined;
};

/**
 * Parses a date string in DD/MM/YYYY format
 * @param {string} dateStr - Date string
 * @returns {Date} - Date object
 */
const parseDateString = (dateStr) => {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    // Month is 0-indexed in JS Date
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date();
};

/**
 * Formats attendance breakdown for display
 * @param {Object} breakdown - Breakdown item
 * @returns {string} - Formatted string like "A (1 day)"
 */
export const formatAttendanceType = (breakdown) => {
  const dayStr = breakdown.days === 1 ? 'day' : 'days';
  return `${breakdown.marker} (${breakdown.days} ${dayStr})`;
};
