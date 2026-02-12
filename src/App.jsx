import { useState } from 'react';
import PayrollApp from './PayrollApp';
import IncentiveApp from './IncentiveApp';

function App() {
  const [activeModule, setActiveModule] = useState('payroll');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Tab Navigation */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveModule('payroll')}
              className={`px-8 py-4 font-semibold text-lg transition-all relative ${
                activeModule === 'payroll'
                  ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-indigo-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Payroll Processing</span>
              </div>
              {activeModule === 'payroll' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveModule('incentive')}
              className={`px-8 py-4 font-semibold text-lg transition-all relative ${
                activeModule === 'incentive'
                  ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-indigo-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Incentive Calculator</span>
              </div>
              {activeModule === 'incentive' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Module Content */}
      {activeModule === 'payroll' ? <PayrollApp /> : <IncentiveApp />}
    </div>
  );
}

export default App;
