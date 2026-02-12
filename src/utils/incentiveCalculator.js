/**
 * Calculates daily incentive pool based on slab rules and distributes among present employees
 * @param {Array} salesData - Array of {date, cash, card, other, online, netSales}
 * @param {Object} attendanceData - {employees: Map, dates: Array, month, year}
 * @param {Object} slabs - {slab1Amount, slab1Incentive, slab2Amount, slab2Incentive}
 * @returns {Object} - {dailyData: Array, monthlyData: Array, warnings: Array}
 */
export const calculateIncentives = (salesData, attendanceData, slabs) => {
  const warnings = [];
  const dailyData = [];
  const employeeIncentives = new Map(); // Track incentives per employee
  
  // Create a map of sales by date for quick lookup
  const salesByDate = new Map();
  salesData.forEach(sale => {
    salesByDate.set(sale.date, sale);
  });
  
  // Create a map of attendance by date
  const attendanceByDate = new Map();
  const employeeNames = Array.from(attendanceData.employees.keys());
  
  // Initialize employee incentive tracking
  employeeNames.forEach(name => {
    employeeIncentives.set(name, {
      employee: name,
      daysPresent: 0,
      totalIncentive: 0
    });
  });
  
  // Process each employee's attendance to build date-based structure
  attendanceData.employees.forEach((attendanceRecords, employeeName) => {
    attendanceRecords.forEach(record => {
      if (!attendanceByDate.has(record.date)) {
        attendanceByDate.set(record.date, new Map());
      }
      attendanceByDate.get(record.date).set(employeeName, record.marker);
    });
  });
  
  // Get all unique dates from both sales and attendance
  const allDates = new Set([...salesByDate.keys(), ...attendanceByDate.keys()]);
  const sortedDates = Array.from(allDates).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split('/').map(Number);
    const [dayB, monthB, yearB] = b.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA - dateB;
  });
  
  // Track mismatches
  let salesOnlyDates = 0;
  let attendanceOnlyDates = 0;
  
  // Process each date
  sortedDates.forEach(date => {
    const hasSales = salesByDate.has(date);
    const hasAttendance = attendanceByDate.has(date);
    
    // Skip dates that don't have both sales and attendance
    if (!hasSales || !hasAttendance) {
      if (hasSales && !hasAttendance) {
        salesOnlyDates++;
      } else if (!hasSales && hasAttendance) {
        attendanceOnlyDates++;
      }
      return;
    }
    
    const sale = salesByDate.get(date);
    const dayAttendance = attendanceByDate.get(date);
    
    // Count employees marked as 'P' (Present)
    const presentEmployees = [];
    dayAttendance.forEach((marker, employeeName) => {
      if (marker === 'P') {
        presentEmployees.push(employeeName);
      }
    });
    
    const presentCount = presentEmployees.length;
    const netSales = sale.netSales;
    
    // Apply slab logic
    let pool = 0;
    let slabApplied = 'None';
    
    if (netSales >= slabs.slab2Amount) {
      pool = slabs.slab2Incentive;
      slabApplied = 'Slab 2';
    } else if (netSales >= slabs.slab1Amount) {
      pool = slabs.slab1Incentive;
      slabApplied = 'Slab 1';
    }
    
    // Calculate per person incentive
    let perPerson = 0;
    const employeeBreakdown = {}; // Track individual employee incentives for this day
    
    if (presentCount > 0 && pool > 0) {
      perPerson = pool / presentCount;
      
      // Distribute to each present employee
      presentEmployees.forEach(employeeName => {
        const empData = employeeIncentives.get(employeeName);
        if (empData) {
          empData.daysPresent += 1;
          empData.totalIncentive += perPerson;
        }
        employeeBreakdown[employeeName] = perPerson;
      });
    }
    
    // Set 0 for all employees not present
    employeeNames.forEach(employeeName => {
      if (!employeeBreakdown[employeeName]) {
        employeeBreakdown[employeeName] = 0;
      }
    });
    
    // Store daily result with employee breakdown
    dailyData.push({
      date,
      netSales,
      slabApplied,
      pool,
      presentCount,
      perPerson,
      employeeBreakdown
    });
  });
  
  // Generate warnings for date mismatches
  if (salesOnlyDates > 0) {
    warnings.push({
      type: 'warning',
      message: `${salesOnlyDates} date(s) found in sales sheet but not in attendance sheet. These dates were skipped.`
    });
  }
  
  if (attendanceOnlyDates > 0) {
    warnings.push({
      type: 'warning',
      message: `${attendanceOnlyDates} date(s) found in attendance sheet but not in sales sheet. These dates were skipped.`
    });
  }
  
  if (dailyData.length === 0) {
    throw new Error('No matching dates found between sales and attendance sheets. Please verify the date formats and ranges.');
  }
  
  // Convert employee incentives map to array and sort by employee name
  const monthlyData = Array.from(employeeIncentives.values())
    .sort((a, b) => a.employee.localeCompare(b.employee));
  
  return {
    dailyData,
    monthlyData,
    warnings,
    employeeNames // Return employee names in attendance sheet order
  };
};

/**
 * Validates slab configuration
 * @param {Object} slabs - {slab1Amount, slab1Incentive, slab2Amount, slab2Incentive}
 * @returns {Object} - {valid: boolean, errors: Array}
 */
export const validateSlabs = (slabs) => {
  const errors = [];
  
  // Check all fields are provided
  if (!slabs.slab1Amount && slabs.slab1Amount !== 0) {
    errors.push('Slab 1 Amount is required');
  }
  if (!slabs.slab1Incentive && slabs.slab1Incentive !== 0) {
    errors.push('Slab 1 Incentive is required');
  }
  if (!slabs.slab2Amount && slabs.slab2Amount !== 0) {
    errors.push('Slab 2 Amount is required');
  }
  if (!slabs.slab2Incentive && slabs.slab2Incentive !== 0) {
    errors.push('Slab 2 Incentive is required');
  }
  
  // Check all values are positive numbers
  if (slabs.slab1Amount < 0) {
    errors.push('Slab 1 Amount must be a positive number');
  }
  if (slabs.slab1Incentive < 0) {
    errors.push('Slab 1 Incentive must be a positive number');
  }
  if (slabs.slab2Amount < 0) {
    errors.push('Slab 2 Amount must be a positive number');
  }
  if (slabs.slab2Incentive < 0) {
    errors.push('Slab 2 Incentive must be a positive number');
  }
  
  // Check that Slab 2 Amount > Slab 1 Amount
  if (slabs.slab2Amount <= slabs.slab1Amount) {
    errors.push('Slab 2 Amount must be greater than Slab 1 Amount');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Formats currency for display
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `₹${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};
