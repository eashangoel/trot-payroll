const EmployeeSelector = ({ employees, selectedEmployee, onSelect }) => {
  return (
    <div className="mb-6">
      <label className="block text-lg font-semibold mb-2 text-gray-700">
        Select Employee
      </label>
      <select
        value={selectedEmployee || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
      >
        <option value="">-- Choose an employee --</option>
        {employees.map((employee, index) => (
          <option key={index} value={employee}>
            {employee}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EmployeeSelector;
