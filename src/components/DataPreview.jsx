import { getMonthName } from '../utils/fileParser';

const DataPreview = ({ parsedData, warnings, onConfirm, onBack }) => {
  const { outlet1, outlet2, salary, month, year } = parsedData;
  
  const monthName = getMonthName(month);
  
  // Get first few employees for preview
  const previewEmployees = Array.from(salary.keys()).slice(0, 5);
  
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Data Preview & Validation
      </h2>
      
      {/* Summary Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-start">
          <svg
            className="w-6 h-6 text-blue-500 mr-3 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Detected Period: {monthName} {year}
            </h3>
            <p className="text-blue-800">
              Total Employees: {salary.size} | 
              Outlet 1: {outlet1.employees.size} employees | 
              Outlet 2: {outlet2.employees.size} employees
            </p>
          </div>
        </div>
      </div>
      
      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 ${
                warning.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex items-start">
                <svg
                  className={`w-5 h-5 mr-3 mt-0.5 ${
                    warning.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`}
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
                <p
                  className={`text-sm ${
                    warning.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
                  }`}
                >
                  {warning.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Employee Preview Table */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">
          Employee Salary Preview (First 5)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In Outlet 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In Outlet 2
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previewEmployees.map((employeeName, index) => {
                const baseSalary = salary.get(employeeName);
                const inOutlet1 = outlet1.employees.has(employeeName);
                const inOutlet2 = outlet2.employees.has(employeeName);
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹{baseSalary.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {inOutlet1 ? (
                        <span className="text-green-600 font-medium">✓ Yes</span>
                      ) : (
                        <span className="text-gray-400">✗ No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {inOutlet2 ? (
                        <span className="text-green-600 font-medium">✓ Yes</span>
                      ) : (
                        <span className="text-gray-400">✗ No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {salary.size > 5 && (
          <p className="text-sm text-gray-500 mt-2">
            ... and {salary.size - 5} more employees
          </p>
        )}
      </div>
      
      {/* Attendance Dates Preview */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">
          Attendance Date Range
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Outlet 1:</span> {outlet1.dates[0]} to {outlet1.dates[outlet1.dates.length - 1]} 
            ({outlet1.dates.length} days)
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <span className="font-semibold">Outlet 2:</span> {outlet2.dates[0]} to {outlet2.dates[outlet2.dates.length - 1]} 
            ({outlet2.dates.length} days)
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          ← Back to Upload
        </button>
        
        <button
          onClick={onConfirm}
          className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
        >
          Confirm & Continue →
        </button>
      </div>
    </div>
  );
};

export default DataPreview;
