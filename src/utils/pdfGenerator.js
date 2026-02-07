import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './salaryCalculator';
import { formatAttendanceType } from './attendanceCalculator';
import { getMonthName } from './fileParser';

/**
 * Generates a payslip PDF for an employee
 * @param {Object} calculationResult - Result from calculateNetSalary
 * @returns {jsPDF} - PDF document
 */
export const generatePayslipPDF = (calculationResult) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
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
    year
  } = calculationResult;
  
  const monthName = getMonthName(month);
  
  // Header - Employee Name
  doc.setFillColor(144, 238, 144); // Light green
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(employeeName, pageWidth / 2, 15, { align: 'center' });
  
  // Month
  doc.setFillColor(255, 215, 0); // Gold
  doc.rect(0, 25, pageWidth, 15, 'F');
  doc.setFontSize(16);
  doc.text(`${monthName} ${year}`, pageWidth / 2, 35, { align: 'center' });
  
  // Base Salary
  doc.setFillColor(255, 255, 224); // Light yellow
  doc.rect(0, 40, pageWidth, 12, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Base Salary: ${formatCurrency(baseSalary)}`, pageWidth / 2, 48, { align: 'center' });
  
  let yPosition = 60;
  
  // Create three-column layout: Advance | Holidays | Bonus
  const colWidth = (pageWidth - 20) / 3;
  
  // Advances Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Advance', 15, yPosition);
  
  // Holidays Section
  doc.text('Holidays', 15 + colWidth, yPosition);
  
  // Bonus Section
  doc.text('Bonus', 15 + colWidth * 2, yPosition);
  
  yPosition += 8;
  
  // Table headers
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Advance headers
  doc.text('Date', 15, yPosition);
  doc.text('Amount', 15 + 25, yPosition);
  
  // Holidays headers
  doc.text('Date', 15 + colWidth, yPosition);
  doc.text('Type', 15 + colWidth + 25, yPosition);
  doc.text('Amount', 15 + colWidth + 50, yPosition);
  
  // Bonus headers
  doc.text('Date', 15 + colWidth * 2, yPosition);
  doc.text('Amount', 15 + colWidth * 2 + 25, yPosition);
  
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  
  // Find the maximum number of rows needed
  const deductionRows = attendanceBreakdown.filter(b => b.type === 'deduction');
  const additionRows = attendanceBreakdown.filter(b => b.type === 'addition');
  const maxRows = Math.max(
    advances.length,
    deductionRows.length,
    bonuses.length
  );
  
  // Fill in the data rows
  for (let i = 0; i < maxRows; i++) {
    // Advances
    if (i < advances.length) {
      const adv = advances[i];
      doc.text(formatDate(adv.date).substring(0, 5), 15, yPosition); // Show DD/MM
      doc.text(formatCurrency(adv.amount), 15 + 25, yPosition);
    }
    
    // Holidays/Deductions
    if (i < deductionRows.length) {
      const ded = deductionRows[i];
      doc.text(ded.date.substring(0, 5), 15 + colWidth, yPosition); // Show DD/MM
      doc.text(formatAttendanceType(ded), 15 + colWidth + 25, yPosition);
      
      // Calculate amount for this deduction
      const amount = (baseSalary / calculationResult.daysInMonth) * ded.days;
      doc.text(formatCurrency(amount), 15 + colWidth + 50, yPosition);
    }
    
    // Bonuses (including overtime additions)
    if (i < bonuses.length) {
      const bonus = bonuses[i];
      doc.text(formatDate(bonus.date).substring(0, 5), 15 + colWidth * 2, yPosition);
      doc.text(formatCurrency(bonus.amount), 15 + colWidth * 2 + 25, yPosition);
    } else if (i < additionRows.length) {
      // Show attendance additions (overtime) in bonus column
      const add = additionRows[i - bonuses.length];
      if (add) {
        doc.text(add.date.substring(0, 5), 15 + colWidth * 2, yPosition);
        const amount = (baseSalary / calculationResult.daysInMonth) * add.days;
        doc.text(formatCurrency(amount), 15 + colWidth * 2 + 25, yPosition);
      }
    }
    
    yPosition += 6;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
  }
  
  // Totals row
  yPosition += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Total', 15, yPosition);
  doc.text(formatCurrency(totalAdvances), 15 + 25, yPosition);
  
  doc.text('Total', 15 + colWidth, yPosition);
  const totalDeductionAmount = attendanceDeduction;
  doc.text(formatCurrency(totalDeductionAmount), 15 + colWidth + 50, yPosition);
  
  doc.text('Total', 15 + colWidth * 2, yPosition);
  const totalBonusAmount = totalBonuses + attendanceAddition;
  doc.text(formatCurrency(totalBonusAmount), 15 + colWidth * 2 + 25, yPosition);
  
  yPosition += 15;
  
  // Calculation formula
  doc.setFillColor(240, 240, 240);
  doc.rect(10, yPosition, pageWidth - 20, 25, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const formula = `Salary (${monthName}): ${formatCurrency(baseSalary)} - ${formatCurrency(totalAdvances)} (Advance) - ${formatCurrency(attendanceDeduction)} (Holidays) + ${formatCurrency(totalBonusAmount)} (Bonus) =`;
  
  yPosition += 8;
  doc.text(formula, pageWidth / 2, yPosition, { align: 'center', maxWidth: pageWidth - 30 });
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.text(formatCurrency(netSalary), pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Net Salary box
  doc.setFillColor(144, 238, 144); // Light green
  doc.rect(10, yPosition, pageWidth - 20, 20, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  
  yPosition += 13;
  doc.text(`Net Salary: ${formatCurrency(netSalary)}`, pageWidth / 2, yPosition, { align: 'center' });
  
  return doc;
};

/**
 * Downloads a PDF payslip
 * @param {Object} calculationResult - Result from calculateNetSalary
 */
export const downloadPayslip = (calculationResult) => {
  const doc = generatePayslipPDF(calculationResult);
  const fileName = `Payslip_${calculationResult.employeeName}_${getMonthName(calculationResult.month)}_${calculationResult.year}.pdf`;
  doc.save(fileName);
};

/**
 * Generates PDF blob for an employee (for ZIP creation)
 * @param {Object} calculationResult - Result from calculateNetSalary
 * @returns {Blob} - PDF blob
 */
export const generatePayslipBlob = (calculationResult) => {
  const doc = generatePayslipPDF(calculationResult);
  return doc.output('blob');
};
