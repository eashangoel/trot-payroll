import { useState } from 'react';

const BonusesForm = ({ selectedEmployee, bonuses, onBonusesChange }) => {
  const [entries, setEntries] = useState(bonuses[selectedEmployee] || []);
  
  const addEntry = () => {
    const newEntry = { date: '', amount: '' };
    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    onBonusesChange(selectedEmployee, updatedEntries);
  };
  
  const removeEntry = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
    onBonusesChange(selectedEmployee, updatedEntries);
  };
  
  const updateEntry = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
    onBonusesChange(selectedEmployee, updatedEntries);
  };
  
  const calculateTotal = () => {
    return entries.reduce((sum, entry) => {
      const amount = parseFloat(entry.amount) || 0;
      return sum + amount;
    }, 0);
  };
  
  // Update entries when selected employee changes
  if (selectedEmployee && entries !== (bonuses[selectedEmployee] || [])) {
    const employeeBonuses = bonuses[selectedEmployee] || [];
    setEntries(employeeBonuses);
  }
  
  if (!selectedEmployee) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 text-center text-gray-500">
        Please select an employee first
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Bonuses for {selectedEmployee}
        </h3>
        <button
          onClick={addEntry}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Bonus</span>
        </button>
      </div>
      
      {entries.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No bonuses added yet. Click "Add Bonus" to add one.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={entry.date}
                  onChange={(e) => updateEntry(index, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={entry.amount}
                  onChange={(e) => updateEntry(index, 'amount', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <button
                onClick={() => removeEntry(index)}
                className="mt-5 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="Remove"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {entries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Total Bonuses:</span>
            <span className="text-2xl font-bold text-green-600">
              ₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusesForm;
