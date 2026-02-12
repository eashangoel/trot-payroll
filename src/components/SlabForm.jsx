import { useState, useEffect } from 'react';

const SlabForm = ({ slabs, onSlabsChange, month, year }) => {
  const [localSlabs, setLocalSlabs] = useState({
    slab1Amount: slabs?.slab1Amount || '',
    slab1Incentive: slabs?.slab1Incentive || '',
    slab2Amount: slabs?.slab2Amount || '',
    slab2Incentive: slabs?.slab2Incentive || ''
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (slabs) {
      setLocalSlabs({
        slab1Amount: slabs.slab1Amount || '',
        slab1Incentive: slabs.slab1Incentive || '',
        slab2Amount: slabs.slab2Amount || '',
        slab2Incentive: slabs.slab2Incentive || ''
      });
    }
  }, [slabs]);
  
  const validateField = (name, value) => {
    const numValue = parseFloat(value);
    
    if (value === '' || value === null || value === undefined) {
      return 'This field is required';
    }
    
    if (isNaN(numValue)) {
      return 'Must be a valid number';
    }
    
    if (numValue < 0) {
      return 'Must be a positive number';
    }
    
    return null;
  };
  
  const validateSlabs = (slabValues) => {
    const newErrors = {};
    
    // Validate individual fields
    Object.keys(slabValues).forEach(key => {
      const error = validateField(key, slabValues[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    
    // Check Slab 2 Amount > Slab 1 Amount
    const slab1Amt = parseFloat(slabValues.slab1Amount);
    const slab2Amt = parseFloat(slabValues.slab2Amount);
    
    if (!isNaN(slab1Amt) && !isNaN(slab2Amt) && slab2Amt <= slab1Amt) {
      newErrors.slab2Amount = 'Slab 2 Amount must be greater than Slab 1 Amount';
    }
    
    return newErrors;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedSlabs = { ...localSlabs, [name]: value };
    setLocalSlabs(updatedSlabs);
    
    // Validate and update errors
    const newErrors = validateSlabs(updatedSlabs);
    setErrors(newErrors);
    
    // Update parent component
    if (onSlabsChange) {
      const parsedSlabs = {
        slab1Amount: parseFloat(updatedSlabs.slab1Amount) || 0,
        slab1Incentive: parseFloat(updatedSlabs.slab1Incentive) || 0,
        slab2Amount: parseFloat(updatedSlabs.slab2Amount) || 0,
        slab2Incentive: parseFloat(updatedSlabs.slab2Incentive) || 0
      };
      onSlabsChange(parsedSlabs, Object.keys(newErrors).length === 0);
    }
  };
  
  const renderInput = (name, label, placeholder) => {
    const hasError = errors[name];
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <input
          type="number"
          name={name}
          value={localSlabs[name]}
          onChange={handleChange}
          placeholder={placeholder}
          step="0.01"
          min="0"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {hasError && (
          <p className="mt-1 text-sm text-red-600">{hasError}</p>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Configure Incentive Slabs
      </h2>
      
      {month && year && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-blue-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="font-semibold text-blue-900">
                Processing data for: {month}/{year}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
        <div className="flex items-start">
          <svg
            className="w-6 h-6 text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
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
            <h3 className="font-semibold text-yellow-900 mb-1">
              How Slabs Work
            </h3>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• If Net Sales &lt; Slab 1 Amount → No incentive</li>
              <li>• If Slab 1 Amount ≤ Net Sales &lt; Slab 2 Amount → Slab 1 Incentive applies</li>
              <li>• If Net Sales ≥ Slab 2 Amount → Slab 2 Incentive applies</li>
              <li>• The pool is divided equally among all employees marked Present (P) that day</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slab 1 */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              1
            </span>
            Slab 1
          </h3>
          {renderInput('slab1Amount', 'Sales Amount (₹)', 'e.g., 30000')}
          {renderInput('slab1Incentive', 'Incentive Pool (₹)', 'e.g., 500')}
        </div>
        
        {/* Slab 2 */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              2
            </span>
            Slab 2
          </h3>
          {renderInput('slab2Amount', 'Sales Amount (₹)', 'e.g., 50000')}
          {renderInput('slab2Incentive', 'Incentive Pool (₹)', 'e.g., 1000')}
        </div>
      </div>
      
      {/* Example calculation */}
      {localSlabs.slab1Amount && localSlabs.slab1Incentive && 
       localSlabs.slab2Amount && localSlabs.slab2Incentive && 
       Object.keys(errors).length === 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Example Calculation</h3>
          <div className="text-sm text-green-800 space-y-1">
            <p>• Net Sales of ₹{parseFloat(localSlabs.slab1Amount) - 1000} → Pool: ₹0</p>
            <p>• Net Sales of ₹{localSlabs.slab1Amount} → Pool: ₹{localSlabs.slab1Incentive}</p>
            <p>• Net Sales of ₹{localSlabs.slab2Amount} → Pool: ₹{localSlabs.slab2Incentive}</p>
            <p className="mt-2 font-medium">
              If 5 employees are present and pool is ₹{localSlabs.slab2Incentive}, 
              each gets ₹{(parseFloat(localSlabs.slab2Incentive) / 5).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlabForm;
