import { getMonthName } from './salesParser';

/**
 * Exports daily incentive data to CSV
 * @param {Array} dailyData - Array of daily calculations
 * @param {number} month - Month number
 * @param {number} year - Year
 */
export const exportDailyCSV = (dailyData, month, year) => {
  if (!dailyData || dailyData.length === 0) {
    throw new Error('No data to export');
  }
  
  // Create CSV header
  const headers = ['Date', 'Net Sales', 'Slab Applied', 'Pool Amount', 'Present Count', 'Per Person Incentive'];
  
  // Create CSV rows
  const rows = dailyData.map(day => [
    day.date,
    day.netSales.toFixed(2),
    day.slabApplied,
    day.pool.toFixed(2),
    day.presentCount,
    day.perPerson.toFixed(2)
  ]);
  
  // Calculate totals
  const totalNetSales = dailyData.reduce((sum, day) => sum + day.netSales, 0);
  const totalPool = dailyData.reduce((sum, day) => sum + day.pool, 0);
  const totalPresent = dailyData.reduce((sum, day) => sum + day.presentCount, 0);
  
  // Add total row
  rows.push([
    'TOTAL',
    totalNetSales.toFixed(2),
    '',
    totalPool.toFixed(2),
    totalPresent,
    ''
  ]);
  
  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape cells that contain commas or quotes
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const monthName = getMonthName(month);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `Daily_Incentives_${monthName}_${year}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports monthly employee summary to CSV
 * @param {Array} monthlyData - Array of employee monthly summaries
 * @param {number} month - Month number
 * @param {number} year - Year
 */
export const exportMonthlyCSV = (monthlyData, month, year) => {
  if (!monthlyData || monthlyData.length === 0) {
    throw new Error('No data to export');
  }
  
  // Create CSV header
  const headers = ['Employee', 'Total Days Present', 'Total Incentive Earned'];
  
  // Create CSV rows
  const rows = monthlyData.map(emp => [
    emp.employee,
    emp.daysPresent,
    emp.totalIncentive.toFixed(2)
  ]);
  
  // Calculate totals
  const totalDays = monthlyData.reduce((sum, emp) => sum + emp.daysPresent, 0);
  const totalIncentive = monthlyData.reduce((sum, emp) => sum + emp.totalIncentive, 0);
  
  // Add total row
  rows.push([
    'TOTAL',
    totalDays,
    totalIncentive.toFixed(2)
  ]);
  
  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape cells that contain commas or quotes
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const monthName = getMonthName(month);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `Monthly_Incentive_Summary_${monthName}_${year}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
