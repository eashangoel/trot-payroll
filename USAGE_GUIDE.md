# Quick Usage Guide

## Getting Started

### First Time Setup

1. Open Terminal
2. Navigate to the project folder:
   ```bash
   cd /Users/eashangoel/Desktop/trot-payroll
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
4. Open your browser and go to: `http://localhost:5173`

### Monthly Payroll Process

#### Step 1: Prepare Your Files

Before starting, prepare 3 CSV or Excel files:

1. **Outlet 1 Attendance** - Format:
   ```
   Day,Date,Employee1,Employee2,...
   Monday,01/01/2026,P,A,...
   ```

2. **Outlet 2 Attendance** - Same format as Outlet 1

3. **Salary Sheet** - Format:
   ```
   Name,Salary
   Employee1,15000
   Employee2,17000
   ```

**Important Tips:**
- Employee names must match exactly across all files
- Dates must be in DD/MM/YYYY format (e.g., 15/01/2026)
- All attendance sheets must be for the same month
- Remove any empty columns or "XXXX" placeholders

#### Step 2: Upload Files

1. **Download sample files** (optional but recommended):
   - Click "Download Sample" button next to each file type
   - Review the format to understand what's expected
2. Click or drag-and-drop to upload each file
3. Wait for the green checkmark on each file
4. Click "Process Files →"

#### Step 3: Review Preview

1. Check the detected month and year
2. Review total employees found
3. Read any warnings (yellow boxes)
4. Click "Confirm & Continue →"

#### Step 4: Add Advances & Bonuses

1. Select an employee from the dropdown
2. Click "Add Advance" to add money given in advance
   - Enter date and amount
   - Click "Add Advance" again for multiple entries
3. Click "Add Bonus" to add bonuses
   - Enter date and amount
   - Click "Add Bonus" again for multiple entries
4. Repeat for other employees
5. Click "Calculate Payroll →"

**Note:** You can skip this step if no advances or bonuses

#### Step 5: Download Payslips

1. Review the summary table
2. Options:
   - Click "Download PDF" for individual payslips
   - Click "Download All (ZIP)" for all payslips at once
   - Click "Export to Excel" for a summary spreadsheet

**Done! Total time: < 5 minutes**

## Attendance Markers Reference

| Marker | Meaning | Deduction/Addition |
|--------|---------|-------------------|
| P | Present | No change |
| A | Absent/Leave | 1 day deduction |
| X | Week Off | No change |
| H | Half Day | 0.5 days deduction |
| W | Weekend worked | 2 days deduction |
| N | No Show | 1.5 days deduction |
| O | Overtime | 1 day addition |

## Common Questions

### Q: Can I use Google Sheets?
**A:** Yes! Just download your Google Sheet as CSV:
1. File → Download → Comma Separated Values (.csv)

### Q: What if an employee works in both outlets?
**A:** That's fine! The app will combine their attendance from both outlets automatically.

### Q: What if employee names don't match?
**A:** You'll see a warning. Fix the names in your files to match exactly (case-sensitive).

### Q: Can I edit after calculating?
**A:** Yes! Click "← Back to Edit Advances/Bonuses" to make changes.

### Q: Where is my data stored?
**A:** Nowhere! All processing happens in your browser. Close the tab and everything is cleared.

## Testing the App

Use the sample files in `public/sample-files/`:
- `outlet1_attendance.csv`
- `outlet2_attendance.csv`
- `salary_sheet.csv`

Upload these to test the app before using your real data.

## Troubleshooting

### Problem: Dev server won't start
**Solution:** 
```bash
cd /Users/eashangoel/Desktop/trot-payroll
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problem: "Could not find header row"
**Solution:** Ensure first row has "Day" and "Date" columns

### Problem: Calculations seem wrong
**Solution:** 
1. Check attendance markers are correct (P, A, X, H, W, N, O)
2. Verify dates are DD/MM/YYYY format
3. Confirm advances/bonuses were entered correctly

### Problem: PDF won't download
**Solution:** Check your browser's download settings and popup blocker

## Need Help?

1. Check the main README.md for detailed documentation
2. Test with sample files first
3. Verify your file formats match the examples
4. Make sure all employee names match exactly

---

**Pro Tip:** Bookmark `http://localhost:5173` for quick access each month!
