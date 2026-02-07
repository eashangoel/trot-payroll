import { useState } from 'react';

const FileUpload = ({ onFilesUploaded, onError }) => {
  
  // Function to download sample CSV files
  const downloadSampleCSV = (type) => {
    let content = '';
    let filename = '';
    
    if (type === 'outlet1' || type === 'outlet2') {
      // Sample attendance sheet
      const outletNum = type === 'outlet1' ? '1' : '2';
      content = `Day,Date,Mohan,Priya,Rajesh,Amit,Sneha
Monday,01/01/2026,P,P,P,P,P
Tuesday,02/01/2026,P,P,A,P,P
Wednesday,03/01/2026,P,A,P,P,H
Thursday,04/01/2026,A,P,P,P,P
Friday,05/01/2026,P,P,P,A,P
Saturday,06/01/2026,X,X,X,X,X
Sunday,07/01/2026,X,X,X,X,X
Monday,08/01/2026,P,P,P,P,P
Tuesday,09/01/2026,P,P,P,P,P
Wednesday,10/01/2026,P,P,A,P,P
Thursday,11/01/2026,P,A,P,P,P
Friday,12/01/2026,H,P,P,P,P
Saturday,13/01/2026,X,X,X,X,X
Sunday,14/01/2026,X,X,X,X,X
Monday,15/01/2026,P,P,P,P,P
Tuesday,16/01/2026,P,P,P,A,P
Wednesday,17/01/2026,P,P,P,P,A
Thursday,18/01/2026,P,P,P,P,P
Friday,19/01/2026,A,P,P,P,P
Saturday,20/01/2026,X,X,X,X,X
Sunday,21/01/2026,X,X,X,X,X
Monday,22/01/2026,P,P,P,P,P
Tuesday,23/01/2026,P,P,P,P,P
Wednesday,24/01/2026,P,N,P,P,P
Thursday,25/01/2026,P,P,P,P,P
Friday,26/01/2026,P,P,P,P,O
Saturday,27/01/2026,X,X,X,X,X
Sunday,28/01/2026,X,X,X,X,X
Monday,29/01/2026,P,P,P,P,P
Tuesday,30/01/2026,P,P,A,P,P
Wednesday,31/01/2026,P,P,P,P,P`;
      filename = `sample_outlet${outletNum}_attendance.csv`;
    } else if (type === 'salary') {
      // Sample salary sheet
      content = `Name,Salary
Mohan,17000
Priya,15000
Rajesh,16000
Amit,14000
Sneha,15500
Vikram,18000
Anjali,16500
Rohan,17500
Kavita,15000`;
      filename = 'sample_salary_sheet.csv';
    }
    
    // Create blob and download
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const [files, setFiles] = useState({
    outlet1: null,
    outlet2: null,
    salary: null
  });
  
  const [dragActive, setDragActive] = useState({
    outlet1: false,
    outlet2: false,
    salary: false
  });
  
  const handleDrag = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [fileType]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [fileType]: false }));
    }
  };
  
  const handleDrop = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [fileType]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], fileType);
    }
  };
  
  const handleChange = (e, fileType) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0], fileType);
    }
  };
  
  const handleFile = (file, fileType) => {
    // Validate file type
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValid) {
      if (onError) {
        onError(`Invalid file type for ${fileType}. Please upload a CSV or Excel file.`);
      }
      return;
    }
    
    setFiles(prev => ({ ...prev, [fileType]: file }));
  };
  
  const handleRemoveFile = (fileType) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
  };
  
  const handleSubmit = () => {
    if (!files.outlet1 || !files.outlet2 || !files.salary) {
      if (onError) {
        onError('Please upload all three files before proceeding.');
      }
      return;
    }
    
    if (onFilesUploaded) {
      onFilesUploaded(files);
    }
  };
  
  const renderFileInput = (fileType, label, description) => {
    const file = files[fileType];
    const isDragActive = dragActive[fileType];
    
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-lg font-semibold text-gray-700">
            {label}
          </label>
          <button
            onClick={() => downloadSampleCSV(fileType)}
            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-1"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Sample</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-2">{description}</p>
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : file
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
          onDragEnter={(e) => handleDrag(e, fileType)}
          onDragLeave={(e) => handleDrag(e, fileType)}
          onDragOver={(e) => handleDrag(e, fileType)}
          onDrop={(e) => handleDrop(e, fileType)}
        >
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleRemoveFile(fileType)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              
              <div className="mt-4">
                <label
                  htmlFor={`file-${fileType}`}
                  className="cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Choose File
                </label>
                <input
                  id={`file-${fileType}`}
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleChange(e, fileType)}
                />
              </div>
              
              <p className="mt-2 text-sm text-gray-500">
                or drag and drop your file here
              </p>
              <p className="mt-1 text-xs text-gray-400">
                CSV, XLSX, or XLS (max 10MB)
              </p>
            </>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Upload Payroll Files
      </h2>
      
      {/* Info box about sample files */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
        <div className="flex items-start">
          <svg
            className="w-6 h-6 text-purple-500 mr-3 mt-0.5 flex-shrink-0"
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
            <h3 className="font-semibold text-purple-900 mb-1">
              Not sure about the format?
            </h3>
            <p className="text-purple-800 text-sm">
              Click the "Download Sample" button next to each file type to see exactly what format the app expects. 
              These sample files show the correct structure for employee names, dates, and attendance markers.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {renderFileInput(
          'outlet1',
          '1. Attendance Sheet - Outlet 1',
          'Upload the attendance sheet for your first outlet (CSV or Excel)'
        )}
        
        {renderFileInput(
          'outlet2',
          '2. Attendance Sheet - Outlet 2',
          'Upload the attendance sheet for your second outlet (CSV or Excel)'
        )}
        
        {renderFileInput(
          'salary',
          '3. Salary Sheet',
          'Upload the salary sheet with employee names and base salaries (CSV or Excel)'
        )}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!files.outlet1 || !files.outlet2 || !files.salary}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
            files.outlet1 && files.outlet2 && files.salary
              ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Process Files →
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
