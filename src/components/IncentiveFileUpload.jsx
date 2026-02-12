import { useState } from 'react';

const IncentiveFileUpload = ({ onFilesUploaded, onError }) => {
  const [files, setFiles] = useState({
    sales: null,
    attendance: null
  });
  
  const [dragActive, setDragActive] = useState({
    sales: false,
    attendance: false
  });
  
  // Function to download sample CSV files
  const downloadSampleCSV = (type) => {
    let content = '';
    let filename = '';
    
    if (type === 'sales') {
      // Sample sales sheet based on provided format
      content = `Date,Cash,Card,Other,Online,Invoice Nos.,Total no. of bills
2026-01-02,1127,3998,19358,33383,1-112,110
2026-01-03,1200,9840,35440,31309,1-143,140
2026-01-04,2335,4301,22051,36977,1-142,142
2026-01-05,0,2768,13688,19239,1-80,80
2026-01-06,2614,2884,7958,22625,1-87,87
2026-01-07,2889,2446,10512,28895,1-94,92
2026-01-08,3484,5878,9639,32425,1-107,106
2026-01-09,1261,5711,19250,37461,1-117,117
2026-01-10,7229,7246,25626,26664,1-135,133
2026-01-11,1753,6969,26100,41868,1-137,137
2026-01-12,4009,1138,9172,17814,1-73,73
2026-01-13,1659,6119,15169,26258,1-120,120
2026-01-14,1187,1278,12127,39073,1-115,114
2026-01-15,4430,322,12339,33596,1-115,114`;
      filename = 'sample_sales_sheet.csv';
    } else if (type === 'attendance') {
      // Sample attendance sheet based on provided format
      content = `Date,Vikas,Aliush,Mohan,Atik,Suman,Jai
01/01/2026,X,A,X,X,X,X
01/02/2026,P,A,P,P,P,P
01/03/2026,P,A,P,P,P,P
01/04/2026,P,A,P,P,P,P
01/05/2026,P,A,X,X,P,P
01/06/2026,P,A,P,P,P,X
01/07/2026,X,A,P,P,P,P
01/08/2026,P,A,P,P,X,P
01/09/2026,P,A,P,P,P,P
01/10/2026,P,A,P,P,P,P
01/11/2026,P,A,P,P,P,P
01/12/2026,P,A,P,P,X,P
01/13/2026,P,A,P,P,P,X
01/14/2026,P,H,X,X,P,P
01/15/2026,X,P,A,P,P,P`;
      filename = 'sample_attendance_sheet.csv';
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
    if (!files.sales || !files.attendance) {
      if (onError) {
        onError('Please upload both sales and attendance files before proceeding.');
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
        Upload Incentive Files
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
              The sales sheet should include Date, Cash, Card, Other, and Online columns. The attendance sheet should 
              have Date in the first column and employee names as headers with P/A/X/H markers.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {renderFileInput(
          'sales',
          '1. Daily Sales Sheet',
          'Upload your daily sales data with Cash, Card, Other, and Online columns (CSV or Excel)'
        )}
        
        {renderFileInput(
          'attendance',
          '2. Daily Attendance Sheet',
          'Upload the attendance sheet with employee names and daily markers (CSV or Excel)'
        )}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!files.sales || !files.attendance}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
            files.sales && files.attendance
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

export default IncentiveFileUpload;
