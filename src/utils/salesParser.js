import * as XLSX from 'xlsx';

/**
 * Parses a sales sheet and extracts date, cash, card, other, online columns
 * @param {Array} data - Raw data from parsed Excel/CSV (2D array)
 * @returns {Object} - { salesData: Array, month: number, year: number }
 */
export const parseSalesSheet = (data) => {
  if (!data || data.length < 2) {
    throw new Error('Sales sheet is empty or invalid');
  }
  
  // Find the header row
  let headerRowIndex = -1;
  let dateColIndex = -1;
  let cashColIndex = -1;
  let cardColIndex = -1;
  let otherColIndex = -1;
  let onlineColIndex = -1;
  
  // Search for header row (usually first 10 rows)
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const row = data[i];
    
    for (let j = 0; j < row.length; j++) {
      const cell = row[j] ? row[j].toString().toLowerCase().trim() : '';
      
      if (cell === 'date' && dateColIndex === -1) {
        dateColIndex = j;
      }
      if (cell === 'cash' && cashColIndex === -1) {
        cashColIndex = j;
      }
      if (cell === 'card' && cardColIndex === -1) {
        cardColIndex = j;
      }
      if (cell === 'other' && otherColIndex === -1) {
        otherColIndex = j;
      }
      if (cell === 'online' && onlineColIndex === -1) {
        onlineColIndex = j;
      }
    }
    
    // If we found all required columns, this is our header row
    if (dateColIndex !== -1 && cashColIndex !== -1 && cardColIndex !== -1 && 
        otherColIndex !== -1 && onlineColIndex !== -1) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) {
    const missing = [];
    if (dateColIndex === -1) missing.push('Date');
    if (cashColIndex === -1) missing.push('Cash');
    if (cardColIndex === -1) missing.push('Card');
    if (otherColIndex === -1) missing.push('Other');
    if (onlineColIndex === -1) missing.push('Online');
    throw new Error(`Could not find required columns in sales sheet: ${missing.join(', ')}`);
  }
  
  const salesData = [];
  const dataRows = data.slice(headerRowIndex + 1);
  let detectedMonth = null;
  let detectedYear = null;
  
  for (const row of dataRows) {
    const dateValue = row[dateColIndex];
    
    // Skip empty rows or rows without dates
    if (!dateValue || dateValue.toString().trim() === '') {
      continue;
    }
    
    // Skip total/subtotal rows
    const dateStr = dateValue.toString().toLowerCase().trim();
    if (dateStr.includes('total') || dateStr.includes('sub')) {
      continue;
    }
    
    // Parse date - handle both YYYY-MM-DD and DD/MM/YYYY formats
    let parsedDate;
    if (typeof dateValue === 'number') {
      // Excel date number
      parsedDate = XLSX.SSF.parse_date_code(dateValue);
    } else {
      // String date
      const dateString = dateValue.toString().trim();
      
      // Try YYYY-MM-DD format first
      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          parsedDate = {
            y: parseInt(parts[0]),
            m: parseInt(parts[1]),
            d: parseInt(parts[2])
          };
        }
      } 
      // Try DD/MM/YYYY or MM/DD/YYYY format
      else if (dateString.includes('/')) {
        const parts = dateString.split('/');
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
            // Ambiguous - assume MM/DD/YYYY (US format)
            parsedDate = {
              m: first,
              d: second,
              y: parseInt(parts[2])
            };
          }
        }
      }
    }
    
    if (!parsedDate || !parsedDate.d || !parsedDate.m || !parsedDate.y) {
      continue; // Skip invalid dates
    }
    
    // Set month and year from first valid date
    if (!detectedMonth) {
      detectedMonth = parsedDate.m;
      detectedYear = parsedDate.y;
    }
    
    // Normalize date to DD/MM/YYYY format for consistency
    const normalizedDate = `${String(parsedDate.d).padStart(2, '0')}/${String(parsedDate.m).padStart(2, '0')}/${parsedDate.y}`;
    
    // Parse numeric values
    const cash = parseFloat(row[cashColIndex]) || 0;
    const card = parseFloat(row[cardColIndex]) || 0;
    const other = parseFloat(row[otherColIndex]) || 0;
    const online = parseFloat(row[onlineColIndex]) || 0;
    
    // Calculate net sales: (Cash + Card + Other) + (Online × 0.4)
    const netSales = (cash + card + other) + (online * 0.4);
    
    salesData.push({
      date: normalizedDate,
      cash,
      card,
      other,
      online,
      netSales
    });
  }
  
  if (salesData.length === 0) {
    throw new Error('No valid sales data found in the sheet');
  }
  
  return {
    salesData,
    month: detectedMonth,
    year: detectedYear
  };
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
