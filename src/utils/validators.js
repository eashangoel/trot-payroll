/**
 * Validates uploaded files
 * @param {Object} files - Object with outlet1, outlet2, and salary file objects
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export const validateFiles = (files) => {
  const errors = [];
  
  if (!files.outlet1) {
    errors.push('Please upload attendance sheet for Outlet 1');
  }
  
  if (!files.outlet2) {
    errors.push('Please upload attendance sheet for Outlet 2');
  }
  
  if (!files.salary) {
    errors.push('Please upload salary sheet');
  }
  
  // Validate file types
  const validExtensions = ['.csv', '.xlsx', '.xls'];
  
  for (const [key, file] of Object.entries(files)) {
    if (file) {
      const fileName = file.name.toLowerCase();
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        errors.push(`${key}: Invalid file type. Please upload CSV or Excel file`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Cross-validates employees across attendance and salary sheets
 * @param {Set} attendanceEmployees - Set of employee names from attendance sheets
 * @param {Set} salaryEmployees - Set of employee names from salary sheet
 * @returns {Object} - { warnings: Array, employeeList: Array }
 */
export const crossValidateEmployees = (attendanceEmployees, salaryEmployees) => {
  const warnings = [];
  const allEmployees = new Set([...attendanceEmployees, ...salaryEmployees]);
  
  // Check for employees in attendance but not in salary
  for (const employee of attendanceEmployees) {
    if (!salaryEmployees.has(employee)) {
      warnings.push({
        type: 'warning',
        message: `${employee} appears in attendance but not in salary sheet. Base salary will be 0.`
      });
    }
  }
  
  // Check for employees in salary but not in attendance
  for (const employee of salaryEmployees) {
    if (!attendanceEmployees.has(employee)) {
      warnings.push({
        type: 'info',
        message: `${employee} appears in salary sheet but not in attendance. No deductions will apply.`
      });
    }
  }
  
  return {
    warnings,
    employeeList: Array.from(allEmployees).sort()
  };
};

/**
 * Validates advance/bonus entry
 * @param {string} date - Date string
 * @param {number} amount - Amount
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export const validateEntry = (date, amount) => {
  const errors = [];
  
  if (!date || date.trim() === '') {
    errors.push('Date is required');
  } else {
    // Validate date format DD/MM/YYYY or YYYY-MM-DD
    const ddmmyyyy = /^\d{2}\/\d{2}\/\d{4}$/;
    const yyyymmdd = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!ddmmyyyy.test(date) && !yyyymmdd.test(date)) {
      errors.push('Date must be in DD/MM/YYYY format');
    }
  }
  
  if (!amount || amount === '' || amount === null || amount === undefined) {
    errors.push('Amount is required');
  } else {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push('Amount must be a positive number');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Checks if parsed data is valid
 * @param {Object} parsedData - Parsed attendance or salary data
 * @param {string} type - 'attendance' or 'salary'
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export const validateParsedData = (parsedData, type) => {
  const errors = [];
  
  if (type === 'attendance') {
    if (!parsedData.employees || parsedData.employees.size === 0) {
      errors.push('No employees found in attendance sheet');
    }
    
    if (!parsedData.dates || parsedData.dates.length === 0) {
      errors.push('No dates found in attendance sheet');
    }
    
    if (!parsedData.month || !parsedData.year) {
      errors.push('Could not detect month/year from attendance sheet');
    }
  } else if (type === 'salary') {
    if (!parsedData || parsedData.size === 0) {
      errors.push('No employees found in salary sheet');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
