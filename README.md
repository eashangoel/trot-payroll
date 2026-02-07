# Restaurant Payroll Automation

A web application that automates restaurant payroll processing, reducing manual work from 90 minutes to less than 5 minutes per month.

## Features

✅ **Multi-Outlet Support** - Process attendance from two outlets simultaneously  
✅ **Automated Calculations** - Handles all deductions, advances, bonuses, and overtime  
✅ **Professional Payslips** - Generate PDF payslips for each employee  
✅ **Bulk Export** - Download all payslips as ZIP or export summary to Excel  
✅ **Privacy-First** - All processing happens in your browser, no data sent to servers  
✅ **Offline Capable** - Works without internet after initial load  
✅ **Easy to Use** - Simple step-by-step interface, no technical knowledge required

## How It Works

### Step 1: Upload Files
Upload three files:
1. Attendance Sheet - Outlet 1 (CSV or Excel)
2. Attendance Sheet - Outlet 2 (CSV or Excel)
3. Salary Sheet (CSV or Excel)

**Not sure about the format?** Click the "Download Sample" button next to each file type to get a sample CSV that shows the exact format expected.

### Step 2: Preview Data
Review the parsed data and see any warnings about mismatched employees.

### Step 3: Enter Advances & Bonuses
Select employees and add any advances or bonuses with dates and amounts.

### Step 4: Calculate & Download
View the summary table and download individual PDFs or all payslips as a ZIP file.

## File Format Requirements

### Attendance Sheets (2 files)

Your attendance sheets should have this structure:

```csv
Day,Date,Employee1,Employee2,Employee3,...
Monday,01/01/2026,P,P,A,...
Tuesday,02/01/2026,P,A,P,...
...
```

**Important:**
- Column A: Day name (Monday, Tuesday, etc.)
- Column B: Date in DD/MM/YYYY format
- Columns C onwards: Employee names as headers

**Attendance Markers:**
- `P` = Present (no deduction)
- `A` = Leave/Absent (1 day deduction)
- `X` = Week Off (no deduction)
- `H` = Half Day (0.5 days deduction)
- `W` = Weekend worked (2 days deduction)
- `N` = No Show (1.5 days deduction)
- `O` = Overtime (1 day addition)

### Salary Sheet (1 file)

Your salary sheet should have this structure:

```csv
Name,Salary
Employee1,15000
Employee2,17000
Employee3,16000
...
```

**Important:**
- Column "Name": Employee name (must match names in attendance sheets)
- Column "Salary": Base monthly salary

## Salary Calculation Formula

The app calculates net salary using this formula:

```
1. Daily Rate = Base Salary ÷ Days in Month

2. Count deduction/addition days from attendance:
   - A (Absent): 1 day deduction
   - H (Half Day): 0.5 days deduction
   - W (Weekend): 2 days deduction
   - N (No Show): 1.5 days deduction
   - O (Overtime): 1 day addition

3. Calculate:
   - Attendance Deduction = Daily Rate × Total Deduction Days
   - Attendance Addition = Daily Rate × Total Addition Days
   - Total Advances = Sum of all advance amounts
   - Total Bonuses = Sum of all bonus amounts

4. Net Salary = Base Salary - Attendance Deduction - Total Advances 
                + Attendance Addition + Total Bonuses
```

## Installation & Setup

### Prerequisites

- Node.js (version 16 or higher recommended)
- npm (comes with Node.js)

### Local Installation

1. **Clone or download this project**
   ```bash
   cd /Users/eashangoel/Desktop/trot-payroll
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Testing with Sample Data

Sample CSV files are provided in the `public/sample-files/` directory:
- `outlet1_attendance.csv` - Sample attendance for Outlet 1
- `outlet2_attendance.csv` - Sample attendance for Outlet 2
- `salary_sheet.csv` - Sample salary data

Use these files to test the application before using your real data.

## Deployment (Free Hosting)

**Repository:** https://github.com/eashangoel/trot-payroll

### Quick Deploy to Vercel (Easiest - Recommended)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import `eashangoel/trot-payroll`
5. Click "Deploy"

**Done!** Get a URL like: `https://trot-payroll.vercel.app`

**Auto-Deploy:** Every GitHub push automatically deploys!

### Alternative: Netlify

1. Go to https://app.netlify.com
2. Sign in with GitHub
3. "Add new site" → Import `eashangoel/trot-payroll`
4. Click "Deploy site"

### Via Command Line

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

**See DEPLOYMENT.md for detailed instructions.**

## Usage Guide

### Monthly Payroll Processing

1. **Prepare Your Files**
   - Export attendance sheets from Google Sheets or Excel as CSV
   - Ensure date format is DD/MM/YYYY
   - Ensure employee names match exactly across all sheets

2. **Upload Files**
   - Drag and drop or click to upload your 3 files
   - Wait for validation (should take a few seconds)

3. **Review Preview**
   - Check the detected month and year
   - Review any warnings about mismatched employees
   - Verify employee count and date ranges

4. **Add Advances & Bonuses**
   - Select each employee from the dropdown
   - Add any advances (money given in advance) with dates and amounts
   - Add any bonuses with dates and amounts
   - Running totals are shown automatically

5. **Calculate Payroll**
   - Click "Calculate Payroll" to process all data
   - Review the summary table with all calculations

6. **Download Payslips**
   - Download individual PDFs for each employee
   - Download all payslips as a ZIP file
   - Export summary to Excel for your records

**Total Time: Less than 5 minutes!**

## Troubleshooting

### Common Issues

**Problem: "Could not find header row"**
- Solution: Make sure your attendance sheet has "Day" and "Date" in the first columns

**Problem: "No employees found"**
- Solution: Check that employee names are in the header row (row with Day and Date)
- Ensure employee names are not empty or "XXXX"

**Problem: "Invalid month/year"**
- Solution: Check that all dates are in DD/MM/YYYY format
- Ensure all dates are from the same month

**Problem: "Employee X appears in attendance but not in salary sheet"**
- Solution: This is a warning. The app will still work but that employee's base salary will be 0
- Add the employee to the salary sheet or ignore if they're not active

**Problem: Calculations don't match manual calculations**
- Solution: Double-check the attendance markers in your sheets
- Verify that advances and bonuses were entered correctly
- Check that dates are being parsed correctly

### File Format Tips

1. **Keep it simple**: Don't add extra formatting, colors, or merged cells
2. **Remove empty columns**: Delete any placeholder columns like "XXXX"
3. **Consistent names**: Employee names must match exactly (case-sensitive)
4. **Date format**: Always use DD/MM/YYYY (e.g., 15/01/2026)
5. **Clean data**: Remove any summary rows or totals from your sheets

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **SheetJS (xlsx)** - Excel/CSV parsing
- **jsPDF** - PDF generation
- **jspdf-autotable** - PDF table formatting
- **JSZip** - ZIP file creation

## Browser Compatibility

Works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Privacy & Security

- **No data is sent to any server** - All processing happens in your browser
- **No data is stored** - Close the tab and everything is cleared
- **No user accounts** - No login required
- **No tracking** - No analytics or cookies

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review your file formats
3. Test with the provided sample files
4. Ensure you're using a modern browser

## License

This project is provided as-is for your restaurant payroll needs. Feel free to modify and adapt it to your requirements.

## Version History

- **v1.0.0** (2026-02-07)
  - Initial release
  - Multi-outlet support
  - PDF payslip generation
  - Excel export
  - ZIP download for all payslips

---

**Made with ❤️ for restaurant owners who want to save time on payroll**
