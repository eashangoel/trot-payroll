import { calculateAttendanceDays, mergeAttendanceData } from './attendanceCalculator';
import { getDaysInMonth } from './fileParser';

/**
 * Calculates net salary for an employee
 * @param {Object} params - Calculation parameters
 * @param {string} params.employeeName - Employee name
 * @param {number} params.baseSalary - Base monthly salary
 * @param {Array} params.attendanceOutlet1 - Attendance data from outlet 1
 * @param {Array} params.attendanceOutlet2 - Attendance data from outlet 2
 * @param {Array} params.advances - Array of { date, amount } objects
 * @param {Array} params.bonuses - Array of { date, amount } objects
 * @param {number} params.month - Month number (1-12)
 * @param {number} params.year - Year
 * @returns {Object} - Calculation result with breakdown
 */
export const calculateNetSalary = ({
  employeeName,
  baseSalary,
  attendanceOutlet1 = [],
  attendanceOutlet2 = [],
  advances = [],
  bonuses = [],
  month,
  year
}) => {
  // Step 1: Calculate daily rate
  const daysInMonth = getDaysInMonth(month, year);
  const dailyRate = baseSalary / daysInMonth;
  
  // Step 2: Merge attendance from both outlets
  const combinedAttendance = mergeAttendanceData(attendanceOutlet1, attendanceOutlet2);
  
  // Step 3: Calculate attendance deductions and additions
  const { deductionDays, additionDays, breakdown: attendanceBreakdown } = 
    calculateAttendanceDays(combinedAttendance);
  
  const attendanceDeduction = dailyRate * deductionDays;
  const attendanceAddition = dailyRate * additionDays;
  
  // Step 4: Sum manual entries
  const totalAdvances = advances.reduce((sum, adv) => sum + (parseFloat(adv.amount) || 0), 0);
  const totalBonuses = bonuses.reduce((sum, bonus) => sum + (parseFloat(bonus.amount) || 0), 0);
  
  // Step 5: Calculate net salary
  const netSalary = baseSalary - attendanceDeduction - totalAdvances + attendanceAddition + totalBonuses;
  
  return {
    employeeName,
    baseSalary,
    dailyRate,
    daysInMonth,
    deductionDays,
    additionDays,
    attendanceDeduction,
    attendanceAddition,
    attendanceBreakdown,
    advances,
    totalAdvances,
    bonuses,
    totalBonuses,
    netSalary,
    month,
    year
  };
};

/**
 * Formats currency in Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted string like ₹12,345.67
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formats date in DD/MM/YYYY format
 * @param {string} dateStr - Date string (can be various formats)
 * @returns {string} - Formatted date DD/MM/YYYY
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  
  // If already in DD/MM/YYYY format, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Try parsing as ISO date
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return dateStr;
};

/**
 * Validates employee data before calculation
 * @param {Object} params - Same as calculateNetSalary params
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export const validateEmployeeData = ({
  employeeName,
  baseSalary,
  month,
  year
}) => {
  const errors = [];
  
  if (!employeeName || employeeName.trim() === '') {
    errors.push('Employee name is required');
  }
  
  if (!baseSalary || baseSalary <= 0) {
    errors.push('Base salary must be greater than 0');
  }
  
  if (!month || month < 1 || month > 12) {
    errors.push('Invalid month');
  }
  
  if (!year || year < 2000 || year > 2100) {
    errors.push('Invalid year');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
