import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './salaryCalculator';
import { formatAttendanceType } from './attendanceCalculator';
import { getMonthName } from './fileParser';

/**
 * Generates an Excel payslip for an employee with color-coded formatting
 * @param {Object} calculationResult - Result from calculateNetSalary
 * @returns {Workbook} - Excel workbook
 */
export const generatePayslipExcel = (calculationResult) => {
  const {
    employeeName,
    baseSalary,
    attendanceDeduction,
    attendanceAddition,
    attendanceBreakdown,
    advances,
    totalAdvances,
    bonuses,
    totalBonuses,
    netSalary,
    month,
    year,
    daysInMonth
  } = calculationResult;
  
  const monthName = getMonthName(month);
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const data = [];
  
  // Row 1: Employee Name (merged across columns A-F)
  data.push([employeeName, '', '', '', '', '']);
  
  // Row 2: Month and Year
  data.push([`${monthName} ${year}`, '', '', '', '', '']);
  
  // Row 3: Base Salary
  data.push([`Base Salary: ${formatCurrency(baseSalary)}`, '', '', '', '', '']);
  
  // Row 4: Empty
  data.push(['', '', '', '', '', '']);
  
  // Row 5: Section headers (Advance | Holidays | Bonus)
  data.push(['Advance', '', 'Holidays', '', 'Bonus', '']);
  
  // Row 6: Column headers
  data.push(['Date', 'Amount', 'Date', 'Type', 'Amount', 'Date', 'Amount']);
  
  // Prepare data rows
  const deductionRows = attendanceBreakdown.filter(b => b.type === 'deduction');
  const additionRows = attendanceBreakdown.filter(b => b.type === 'addition');
  
  const maxRows = Math.max(
    advances.length,
    deductionRows.length,
    bonuses.length + additionRows.length
  );
  
  // Data rows: Fill in advances, holidays, and bonuses side by side
  for (let i = 0; i < maxRows; i++) {
    const row = ['', '', '', '', '', '', ''];
    
    // Advances (columns A-B)
    if (i < advances.length) {
      const adv = advances[i];
      row[0] = formatDate(adv.date).substring(0, 5); // DD/MM
      row[1] = adv.amount;
    }
    
    // Holidays/Deductions (columns C-E)
    if (i < deductionRows.length) {
      const ded = deductionRows[i];
      row[2] = ded.date.substring(0, 5); // DD/MM
      row[3] = formatAttendanceType(ded);
      const amount = (baseSalary / daysInMonth) * ded.days;
      row[4] = amount;
    }
    
    // Bonuses (columns F-G) - includes both manual bonuses and overtime
    if (i < bonuses.length) {
      const bonus = bonuses[i];
      row[5] = formatDate(bonus.date).substring(0, 5); // DD/MM
      row[6] = bonus.amount;
    } else if (i - bonuses.length < additionRows.length) {
      // Show attendance additions (overtime) in bonus column
      const add = additionRows[i - bonuses.length];
      row[5] = add.date.substring(0, 5); // DD/MM
      const amount = (baseSalary / daysInMonth) * add.days;
      row[6] = amount;
    }
    
    data.push(row);
  }
  
  // Totals row
  const totalBonusAmount = totalBonuses + attendanceAddition;
  data.push([
    'Total',
    totalAdvances,
    'Total',
    '',
    attendanceDeduction,
    'Total',
    totalBonusAmount
  ]);
  
  // Empty row
  data.push(['', '', '', '', '', '', '']);
  
  // Calculation formula
  const formula = `Salary (${monthName}): ${formatCurrency(baseSalary)} - ${formatCurrency(totalAdvances)} (Advance) - ${formatCurrency(attendanceDeduction)} (Holidays) + ${formatCurrency(totalBonusAmount)} (Bonus) = ${formatCurrency(netSalary)}`;
  data.push([formula, '', '', '', '', '', '']);
  
  // Empty row
  data.push(['', '', '', '', '', '', '']);
  
  // Net Salary
  data.push([`Net Salary: ${formatCurrency(netSalary)}`, '', '', '', '', '', '']);
  
  // Create worksheet from data
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // A: Date (Advance)
    { wch: 12 },  // B: Amount (Advance)
    { wch: 12 },  // C: Date (Holidays)
    { wch: 15 },  // D: Type (Holidays)
    { wch: 12 },  // E: Amount (Holidays)
    { wch: 12 },  // F: Date (Bonus)
    { wch: 12 }   // G: Amount (Bonus)
  ];
  
  // Merge cells for headers
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Employee name
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Month
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // Base Salary
    { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }, // Advance header
    { s: { r: 4, c: 2 }, e: { r: 4, c: 4 } }, // Holidays header
    { s: { r: 4, c: 5 }, e: { r: 4, c: 6 } }, // Bonus header
    { s: { r: data.length - 3, c: 0 }, e: { r: data.length - 3, c: 6 } }, // Formula
    { s: { r: data.length - 1, c: 0 }, e: { r: data.length - 1, c: 6 } }  // Net Salary
  ];
  
  // Apply styling
  const range = XLSX.utils.decode_range(ws['!ref']);
  
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      
      // Initialize cell style
      if (!ws[cellAddress].s) ws[cellAddress].s = {};
      
      // Row 1: Employee name - Light green background, bold, centered
      if (R === 0) {
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: "90EE90" } },
          font: { bold: true, sz: 16 },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      
      // Row 2: Month - Light yellow background, bold, centered
      if (R === 1) {
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: "FFFFE0" } },
          font: { bold: true, sz: 14 },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      
      // Row 3: Base Salary - Light yellow background, centered
      if (R === 2) {
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: "FFFFE0" } },
          font: { sz: 12 },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      
      // Row 5: Section headers - Light blue background, bold, centered
      if (R === 4) {
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: "ADD8E6" } },
          font: { bold: true, sz: 12 },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      
      // Row 6: Column headers - Bold
      if (R === 5) {
        ws[cellAddress].s = {
          font: { bold: true, sz: 10 },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      
      // Totals row - Light gray background, bold
      if (R === 6 + maxRows) {
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: "D3D3D3" } },
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      
      // Formula row - Light gray background
      if (R === data.length - 3) {
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: "F0F0F0" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true }
        };
      }
      
      // Net Salary row - Light green background, bold
      if (R === data.length - 1) {
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: "90EE90" } },
          font: { bold: true, sz: 14 },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      
      // Format currency cells
      if ((C === 1 || C === 4 || C === 6) && R >= 6 && R < 6 + maxRows + 1) {
        if (ws[cellAddress].v && typeof ws[cellAddress].v === 'number') {
          ws[cellAddress].z = '₹#,##0.00';
        }
      }
    }
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Payslip');
  
  return wb;
};

/**
 * Downloads an Excel payslip for an employee
 * @param {Object} calculationResult - Result from calculateNetSalary
 */
export const downloadExcelPayslip = (calculationResult) => {
  const wb = generatePayslipExcel(calculationResult);
  const fileName = `Payslip_${calculationResult.employeeName}_${getMonthName(calculationResult.month)}_${calculationResult.year}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Generates Excel blob for an employee (for ZIP creation)
 * @param {Object} calculationResult - Result from calculateNetSalary
 * @returns {Blob} - Excel blob
 */
export const generateExcelPayslipBlob = (calculationResult) => {
  const wb = generatePayslipExcel(calculationResult);
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};
