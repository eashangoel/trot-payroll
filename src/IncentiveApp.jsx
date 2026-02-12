import { useState } from 'react';
import IncentiveFileUpload from './components/IncentiveFileUpload';
import SlabForm from './components/SlabForm';
import IncentiveDailyTable from './components/IncentiveDailyTable';
import IncentiveMonthlyTable from './components/IncentiveMonthlyTable';
import { parseFile, parseIncentiveAttendanceSheet } from './utils/fileParser';
import { parseSalesSheet, getMonthName } from './utils/salesParser';
import { calculateIncentives, validateSlabs } from './utils/incentiveCalculator';
import { validateParsedData } from './utils/validators';

function IncentiveApp() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Parsed data
  const [parsedData, setParsedData] = useState(null);
  const [warnings, setWarnings] = useState([]);
  
  // Slabs configuration
  const [slabs, setSlabs] = useState({
    slab1Amount: '',
    slab1Incentive: '',
    slab2Amount: '',
    slab2Incentive: ''
  });
  const [slabsValid, setSlabsValid] = useState(false);
  
  // Calculation results
  const [results, setResults] = useState(null);
  
  const handleFilesUploaded = async (files) => {
    setLoading(true);
    setError(null);
    
    try {
      // Parse both files
      const salesFileData = await parseFile(files.sales);
      const attendanceFileData = await parseFile(files.attendance);
      
      // Parse sales sheet
      const salesParsed = parseSalesSheet(salesFileData.data);
      
      // Parse attendance sheet
      const attendanceParsed = parseIncentiveAttendanceSheet(attendanceFileData.data);
      
      // Validate attendance data
      const attendanceValidation = validateParsedData(attendanceParsed, 'attendance');
      if (!attendanceValidation.valid) {
        throw new Error(`Attendance: ${attendanceValidation.errors.join(', ')}`);
      }
      
      // Check if sales and attendance have compatible months/years
      if (salesParsed.month !== attendanceParsed.month || salesParsed.year !== attendanceParsed.year) {
        const salesMonth = getMonthName(salesParsed.month);
        const attendanceMonth = getMonthName(attendanceParsed.month);
        setWarnings([{
          type: 'warning',
          message: `Sales sheet is for ${salesMonth} ${salesParsed.year}, but attendance is for ${attendanceMonth} ${attendanceParsed.year}. Only matching dates will be processed.`
        }]);
      }
      
      setParsedData({
        sales: salesParsed,
        attendance: attendanceParsed,
        month: attendanceParsed.month,
        year: attendanceParsed.year
      });
      
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSlabsChange = (newSlabs, isValid) => {
    setSlabs(newSlabs);
    setSlabsValid(isValid);
  };
  
  const handleCalculate = () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate slabs one more time
      const validation = validateSlabs(slabs);
      if (!validation.valid) {
        throw new Error(`Invalid slabs: ${validation.errors.join(', ')}`);
      }
      
      // Calculate incentives
      const calculationResults = calculateIncentives(
        parsedData.sales.salesData,
        parsedData.attendance,
        slabs
      );
      
      setResults(calculationResults);
      
      // Merge calculation warnings with existing warnings
      if (calculationResults.warnings.length > 0) {
        setWarnings(prev => [...prev, ...calculationResults.warnings]);
      }
      
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackToUpload = () => {
    setStep(1);
    setParsedData(null);
    setWarnings([]);
    setSlabs({
      slab1Amount: '',
      slab1Incentive: '',
      slab2Amount: '',
      slab2Incentive: ''
    });
    setSlabsValid(false);
    setResults(null);
  };
  
  const handleBackToSlabs = () => {
    setStep(2);
    setResults(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
          Incentive Pool Calculator
        </h1>
        <p className="text-gray-600 text-center">
          Calculate daily incentive pools based on sales slabs and distribute among present staff
        </p>
      </div>
      
      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[
            { num: 1, label: 'Upload Files' },
            { num: 2, label: 'Configure Slabs' },
            { num: 3, label: 'View Results' }
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
              {index < 2 && (
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
      
      {/* Warnings */}
      {warnings.length > 0 && step >= 2 && (
        <div className="max-w-4xl mx-auto mb-6">
          {warnings.map((warning, index) => (
            <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-2">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-yellow-500 mr-3 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-yellow-900">
                    {warning.type === 'warning' ? 'Warning' : 'Info'}
                  </h3>
                  <p className="text-yellow-800">{warning.message}</p>
                </div>
              </div>
            </div>
          ))}
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
        <IncentiveFileUpload onFilesUploaded={handleFilesUploaded} onError={setError} />
      )}
      
      {step === 2 && parsedData && (
        <div className="max-w-4xl mx-auto space-y-6">
          <SlabForm
            slabs={slabs}
            onSlabsChange={handleSlabsChange}
            month={parsedData.month}
            year={parsedData.year}
          />
          
          <div className="flex justify-between">
            <button
              onClick={handleBackToUpload}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Back to Upload
            </button>
            
            <button
              onClick={handleCalculate}
              disabled={!slabsValid}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
                slabsValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Calculate Incentives →
            </button>
          </div>
        </div>
      )}
      
      {step === 3 && results && (
        <div className="max-w-7xl mx-auto space-y-6">
          <IncentiveDailyTable
            dailyData={results.dailyData}
            month={parsedData.month}
            year={parsedData.year}
          />
          
          <IncentiveMonthlyTable
            monthlyData={results.monthlyData}
            month={parsedData.month}
            year={parsedData.year}
          />
          
          <div className="text-center space-x-4">
            <button
              onClick={handleBackToSlabs}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Back to Edit Slabs
            </button>
            
            <button
              onClick={handleBackToUpload}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Start New Calculation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncentiveApp;
