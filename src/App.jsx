import { useState } from 'react';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import EmployeeSelector from './components/EmployeeSelector';
import AdvancesForm from './components/AdvancesForm';
import BonusesForm from './components/BonusesForm';
import SummaryTable from './components/SummaryTable';
import { parseFile, parseAttendanceSheet, parseSalarySheet } from './utils/fileParser';
import { crossValidateEmployees, validateParsedData } from './utils/validators';
import { calculateNetSalary, formatDate } from './utils/salaryCalculator';
import { generatePayslipBlob } from './utils/pdfGenerator';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

function App() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Parsed data
  const [parsedData, setParsedData] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  
  // Manual entries
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [advances, setAdvances] = useState({});
  const [bonuses, setBonuses] = useState({});
  
  // Calculations
  const [calculations, setCalculations] = useState([]);
  
  const handleFilesUploaded = async (files) => {
    setLoading(true);
    setError(null);
    
    try {
      // Parse all three files
      const outlet1Data = await parseFile(files.outlet1);
      const outlet2Data = await parseFile(files.outlet2);
      const salaryData = await parseFile(files.salary);
      
      // Parse attendance sheets
      const outlet1Parsed = parseAttendanceSheet(outlet1Data.data);
      const outlet2Parsed = parseAttendanceSheet(outlet2Data.data);
      
      // Validate attendance data
      const outlet1Validation = validateParsedData(outlet1Parsed, 'attendance');
      if (!outlet1Validation.valid) {
        throw new Error(`Outlet 1: ${outlet1Validation.errors.join(', ')}`);
      }
      
      const outlet2Validation = validateParsedData(outlet2Parsed, 'attendance');
      if (!outlet2Validation.valid) {
        throw new Error(`Outlet 2: ${outlet2Validation.errors.join(', ')}`);
      }
      
      // Check if both outlets have the same month/year
      if (outlet1Parsed.month !== outlet2Parsed.month || outlet1Parsed.year !== outlet2Parsed.year) {
        throw new Error('Attendance sheets must be for the same month and year');
      }
      
      // Parse salary sheet
      const salaryParsed = parseSalarySheet(salaryData.data);
      const salaryValidation = validateParsedData(salaryParsed, 'salary');
      if (!salaryValidation.valid) {
        throw new Error(`Salary sheet: ${salaryValidation.errors.join(', ')}`);
      }
      
      // Cross-validate employees
      const allAttendanceEmployees = new Set([
        ...outlet1Parsed.employees.keys(),
        ...outlet2Parsed.employees.keys()
      ]);
      
      const validation = crossValidateEmployees(
        allAttendanceEmployees,
        new Set(salaryParsed.keys())
      );
      
      setParsedData({
        outlet1: outlet1Parsed,
        outlet2: outlet2Parsed,
        salary: salaryParsed,
        month: outlet1Parsed.month,
        year: outlet1Parsed.year
      });
      
      setWarnings(validation.warnings);
      setEmployeeList(validation.employeeList);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmPreview = () => {
    setStep(3);
  };
  
  const handleBackToUpload = () => {
    setStep(1);
    setParsedData(null);
    setWarnings([]);
    setEmployeeList([]);
    setSelectedEmployee('');
    setAdvances({});
    setBonuses({});
  };
  
  const handleAdvancesChange = (employee, entries) => {
    setAdvances(prev => ({ ...prev, [employee]: entries }));
  };
  
  const handleBonusesChange = (employee, entries) => {
    setBonuses(prev => ({ ...prev, [employee]: entries }));
  };
  
  const handleCalculate = () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = [];
      
      for (const employeeName of employeeList) {
        const baseSalary = parsedData.salary.get(employeeName) || 0;
        const attendanceOutlet1 = parsedData.outlet1.employees.get(employeeName) || [];
        const attendanceOutlet2 = parsedData.outlet2.employees.get(employeeName) || [];
        const employeeAdvances = advances[employeeName] || [];
        const employeeBonuses = bonuses[employeeName] || [];
        
        // Convert date format for advances and bonuses
        const formattedAdvances = employeeAdvances.map(adv => ({
          date: formatDate(adv.date),
          amount: parseFloat(adv.amount) || 0
        })).filter(adv => adv.amount > 0);
        
        const formattedBonuses = employeeBonuses.map(bonus => ({
          date: formatDate(bonus.date),
          amount: parseFloat(bonus.amount) || 0
        })).filter(bonus => bonus.amount > 0);
        
        const calculation = calculateNetSalary({
          employeeName,
          baseSalary,
          attendanceOutlet1,
          attendanceOutlet2,
          advances: formattedAdvances,
          bonuses: formattedBonuses,
          month: parsedData.month,
          year: parsedData.year
        });
        
        results.push(calculation);
      }
      
      setCalculations(results);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadAllZIP = async () => {
    setLoading(true);
    try {
      const zip = new JSZip();
      
      for (const calc of calculations) {
        const pdfBlob = generatePayslipBlob(calc);
        zip.file(`${calc.employeeName}_Payslip.pdf`, pdfBlob);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslips_${parsedData.month}_${parsedData.year}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to create ZIP: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportExcel = () => {
    try {
      const data = calculations.map(calc => ({
        'Employee Name': calc.employeeName,
        'Base Salary': calc.baseSalary,
        'Attendance Deduction': calc.attendanceDeduction,
        'Advances': calc.totalAdvances,
        'Total Deductions': calc.attendanceDeduction + calc.totalAdvances,
        'Attendance Addition': calc.attendanceAddition,
        'Bonuses': calc.totalBonuses,
        'Total Additions': calc.attendanceAddition + calc.totalBonuses,
        'Net Salary': calc.netSalary
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Summary');
      
      XLSX.writeFile(workbook, `Payroll_Summary_${parsedData.month}_${parsedData.year}.xlsx`);
    } catch (err) {
      setError(`Failed to export Excel: ${err.message}`);
    }
  };
  
  const handleBackToManualEntry = () => {
    setStep(3);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
          Restaurant Payroll Automation
        </h1>
        <p className="text-gray-600 text-center">
          Automate your monthly payroll in minutes
        </p>
      </div>
      
      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[
            { num: 1, label: 'Upload Files' },
            { num: 2, label: 'Preview Data' },
            { num: 3, label: 'Enter Advances/Bonuses' },
            { num: 4, label: 'Calculate & Download' }
          ].map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  step >= s.num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s.num}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step >= s.num ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {s.label}
              </span>
              {index < 3 && (
                <svg
                  className="w-6 h-6 mx-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-red-500 mr-3 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Processing...</p>
          </div>
        </div>
      )}
      
      {/* Step Content */}
      {step === 1 && (
        <FileUpload onFilesUploaded={handleFilesUploaded} onError={setError} />
      )}
      
      {step === 2 && parsedData && (
        <DataPreview
          parsedData={parsedData}
          warnings={warnings}
          onConfirm={handleConfirmPreview}
          onBack={handleBackToUpload}
        />
      )}
      
      {step === 3 && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Enter Advances & Bonuses
            </h2>
            
            <p className="text-gray-600 mb-6">
              Select an employee and add any advances or bonuses for them. You can skip this step
              if there are no advances or bonuses for any employees.
            </p>
            
            <EmployeeSelector
              employees={employeeList}
              selectedEmployee={selectedEmployee}
              onSelect={setSelectedEmployee}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <AdvancesForm
                selectedEmployee={selectedEmployee}
                advances={advances}
                onAdvancesChange={handleAdvancesChange}
              />
              
              <BonusesForm
                selectedEmployee={selectedEmployee}
                bonuses={bonuses}
                onBonusesChange={handleBonusesChange}
              />
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBackToUpload}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                ← Back to Upload
              </button>
              
              <button
                onClick={handleCalculate}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Calculate Payroll →
              </button>
            </div>
          </div>
        </div>
      )}
      
      {step === 4 && (
        <div>
          <SummaryTable
            calculations={calculations}
            onDownloadAll={handleDownloadAllZIP}
            onExportExcel={handleExportExcel}
          />
          
          <div className="max-w-7xl mx-auto mt-6 text-center">
            <button
              onClick={handleBackToManualEntry}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Back to Edit Advances/Bonuses
            </button>
            
            <button
              onClick={handleBackToUpload}
              className="ml-4 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Start New Payroll
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
