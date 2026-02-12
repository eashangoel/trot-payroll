import * as XLSX from 'xlsx';

/**
 * Parses an Excel or CSV file and returns the data
 * @param {File} file - The file to parse
 * @returns {Promise<Object>} - Promise resolving to { data: Array, fileName: string }
 */
export const parseFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON (with header row)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          blankrows: false
        });
        
        resolve({
          data: jsonData,
          fileName: file.name
        });
      } catch (error) {
        reject(new Error(`Failed to parse ${file.name}: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read ${file.name}`));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parses attendance sheet and extracts employee names and their attendance data
 * @param {Array} data - Raw data from parsed Excel/CSV (2D array)
 * @returns {Object} - { employees: Map, dates: Array, month: string, year: string }
 */
export const parseAttendanceSheet = (data) => {
  if (!data || data.length < 2) {
    throw new Error('Attendance sheet is empty or invalid');
  }
  
  // Find the header row (should contain "Day" and "Date")
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const row = data[i];
    if (row[0] && row[0].toString().toLowerCase().includes('day') && 
        row[1] && row[1].toString().toLowerCase().includes('date')) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) {
    throw new Error('Could not find header row with "Day" and "Date" columns');
  }
  
  const headerRow = data[headerRowIndex];
  const dataRows = data.slice(headerRowIndex + 1);
  
  // Extract employee names from columns 2 onwards (skip Day and Date)
  const employees = new Map();
  const employeeColumns = [];
  
  for (let colIndex = 2; colIndex < headerRow.length; colIndex++) {
    const employeeName = headerRow[colIndex];
    
    // Skip empty columns or columns with "XXXX" or similar placeholder names
    if (!employeeName || 
        employeeName.toString().trim() === '' || 
        /^x+$/i.test(employeeName.toString().trim())) {
      continue;
    }
    
    employeeColumns.push({ name: employeeName.toString().trim(), colIndex });
    employees.set(employeeName.toString().trim(), []);
  }
  
  // Extract dates and attendance data
  const dates = [];
  let detectedMonth = null;
  let detectedYear = null;
  
  for (const row of dataRows) {
    const dateValue = row[1];
    
    if (!dateValue || dateValue.toString().trim() === '') {
      continue;
    }
    
    // Parse date (expecting DD/MM/YYYY format or Excel date number)
    let parsedDate;
    if (typeof dateValue === 'number') {
      // Excel date number
      parsedDate = XLSX.SSF.parse_date_code(dateValue);
    } else {
      // String date
      const dateStr = dateValue.toString().trim();
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        parsedDate = {
          d: parseInt(parts[0]),
          m: parseInt(parts[1]),
          y: parseInt(parts[2])
        };
      }
    }
    
    if (!parsedDate) {
      continue;
    }
    
    // Set month and year from first valid date
    if (!detectedMonth) {
      detectedMonth = parsedDate.m;
      detectedYear = parsedDate.y;
    }
    
    const formattedDate = `${String(parsedDate.d).padStart(2, '0')}/${String(parsedDate.m).padStart(2, '0')}/${parsedDate.y}`;
    dates.push(formattedDate);
    
    // Extract attendance for each employee
    for (const { name, colIndex } of employeeColumns) {
      const attendance = row[colIndex] ? row[colIndex].toString().trim().toUpperCase() : '';
      employees.get(name).push({
        date: formattedDate,
        marker: attendance || 'A' // Default to absent if empty
      });
    }
  }
  
  return {
    employees,
    dates,
    month: detectedMonth,
    year: detectedYear
  };
};

/**
 * Parses salary sheet and extracts employee names and salaries
 * @param {Array} data - Raw data from parsed Excel/CSV (2D array)
 * @returns {Map} - Map of employee name to salary
 */
export const parseSalarySheet = (data) => {
  if (!data || data.length < 2) {
    throw new Error('Salary sheet is empty or invalid');
  }
  
  // Find the header row
  let headerRowIndex = -1;
  let nameColIndex = -1;
  let salaryColIndex = -1;
  
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const row = data[i];
    
    for (let j = 0; j < row.length; j++) {
      const cell = row[j] ? row[j].toString().toLowerCase() : '';
      
      if (cell.includes('name') && nameColIndex === -1) {
        nameColIndex = j;
      }
      if (cell.includes('salary') && salaryColIndex === -1) {
        salaryColIndex = j;
      }
    }
    
    if (nameColIndex !== -1 && salaryColIndex !== -1) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1 || nameColIndex === -1 || salaryColIndex === -1) {
    throw new Error('Could not find "Name" and "Salary" columns in salary sheet');
  }
  
  const salaries = new Map();
  const dataRows = data.slice(headerRowIndex + 1);
  
  for (const row of dataRows) {
    const name = row[nameColIndex];
    const salary = row[salaryColIndex];
    
    if (!name || name.toString().trim() === '') {
      continue;
    }
    
    const employeeName = name.toString().trim();
    const employeeSalary = parseFloat(salary) || 0;
    
    salaries.set(employeeName, employeeSalary);
  }
  
  return salaries;
};

/**
 * Gets the month name from month number
 * @param {number} month - Month number (1-12)
 * @returns {string} - Month name
 */
export const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
};

/**
 * Parses attendance sheet for incentive calculator (only needs Date column)
 * @param {Array} data - Raw data from parsed Excel/CSV (2D array)
 * @returns {Object} - { employees: Map, dates: Array, month: string, year: string }
 */
export const parseIncentiveAttendanceSheet = (data) => {
  if (!data || data.length < 2) {
    throw new Error('Attendance sheet is empty or invalid');
  }
  
  // Find the header row (should contain "Date" in first column)
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const row = data[i];
    if (row[0] && row[0].toString().toLowerCase().includes('date')) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) {
    throw new Error('Could not find header row with "Date" column');
  }
  
  const headerRow = data[headerRowIndex];
  const dataRows = data.slice(headerRowIndex + 1);
  
  // Extract employee names from columns 1 onwards (skip Date column)
  const employees = new Map();
  const employeeColumns = [];
  
  for (let colIndex = 1; colIndex < headerRow.length; colIndex++) {
    const employeeName = headerRow[colIndex];
    
    // Skip empty columns or columns with "XXXX" or similar placeholder names
    if (!employeeName || 
        employeeName.toString().trim() === '' || 
        /^x+$/i.test(employeeName.toString().trim())) {
      continue;
    }
    
    employeeColumns.push({ name: employeeName.toString().trim(), colIndex });
    employees.set(employeeName.toString().trim(), []);
  }
  
  // Extract dates and attendance data
  const dates = [];
  let detectedMonth = null;
  let detectedYear = null;
  
  for (const row of dataRows) {
    const dateValue = row[0];
    
    if (!dateValue || dateValue.toString().trim() === '') {
      continue;
    }
    
    // Parse date (expecting DD/MM/YYYY or MM/DD/YYYY format or Excel date number)
    let parsedDate;
    if (typeof dateValue === 'number') {
      // Excel date number
      parsedDate = XLSX.SSF.parse_date_code(dateValue);
    } else {
      // String date
      const dateStr = dateValue.toString().trim();
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        // Detect format based on first number
        const first = parseInt(parts[0]);
        const second = parseInt(parts[1]);
        
        // If first number > 12, it must be DD/MM/YYYY
        // If second number > 12, it must be MM/DD/YYYY
        if (first > 12) {
          parsedDate = {
            d: first,
            m: second,
            y: parseInt(parts[2])
          };
        } else if (second > 12) {
          parsedDate = {
            m: first,
            d: second,
            y: parseInt(parts[2])
          };
        } else {
          // Ambiguous - assume MM/DD/YYYY
          parsedDate = {
            m: first,
            d: second,
            y: parseInt(parts[2])
          };
        }
      }
    }
    
    if (!parsedDate) {
      continue;
    }
    
    // Set month and year from first valid date
    if (!detectedMonth) {
      detectedMonth = parsedDate.m;
      detectedYear = parsedDate.y;
    }
    
    const formattedDate = `${String(parsedDate.d).padStart(2, '0')}/${String(parsedDate.m).padStart(2, '0')}/${parsedDate.y}`;
    dates.push(formattedDate);
    
    // Extract attendance for each employee
    for (const { name, colIndex } of employeeColumns) {
      const attendance = row[colIndex] ? row[colIndex].toString().trim().toUpperCase() : '';
      employees.get(name).push({
        date: formattedDate,
        marker: attendance || 'A' // Default to absent if empty
      });
    }
  }
  
  return {
    employees,
    dates,
    month: detectedMonth,
    year: detectedYear
  };
};

/**
 * Gets the number of days in a month
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year
 * @returns {number} - Number of days in the month
 */
export const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};
