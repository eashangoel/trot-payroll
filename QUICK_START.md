# Quick Start Checklist ✓

## First Time Setup (One Time Only)

```bash
cd /Users/eashangoel/Desktop/trot-payroll
npm install
npm run dev
```

Open browser: `http://localhost:5173`

## Monthly Payroll (Every Month)

### Before You Start
- [ ] Export attendance sheets from Google Sheets as CSV
- [ ] Export salary sheet as CSV
- [ ] Ensure dates are in DD/MM/YYYY format
- [ ] Verify employee names match across all files

### Step 1: Upload (1 minute)
- [ ] (Optional) Click "Download Sample" to see format examples
- [ ] Upload Outlet 1 attendance sheet
- [ ] Upload Outlet 2 attendance sheet
- [ ] Upload salary sheet
- [ ] Click "Process Files →"

### Step 2: Preview (30 seconds)
- [ ] Check detected month/year is correct
- [ ] Review employee count
- [ ] Read any warnings
- [ ] Click "Confirm & Continue →"

### Step 3: Enter Data (2-3 minutes)
- [ ] Select first employee
- [ ] Add any advances (if applicable)
- [ ] Add any bonuses (if applicable)
- [ ] Repeat for other employees with advances/bonuses
- [ ] Click "Calculate Payroll →"

### Step 4: Download (1 minute)
- [ ] Review summary table
- [ ] Click "Download All (ZIP)" for all payslips
- [ ] Click "Export to Excel" for summary
- [ ] Done! ✓

**Total Time: Less than 5 minutes**

## Attendance Markers Quick Reference

| Code | Meaning | Impact |
|------|---------|--------|
| P | Present | None |
| A | Absent | -1 day |
| X | Week Off | None |
| H | Half Day | -0.5 day |
| W | Weekend | -2 days |
| N | No Show | -1.5 days |
| O | Overtime | +1 day |

## File Format Checklist

### Attendance Sheets ✓
- [ ] Column A: Day name
- [ ] Column B: Date (DD/MM/YYYY)
- [ ] Columns C+: Employee names
- [ ] No empty columns or "XXXX"
- [ ] All dates same month

### Salary Sheet ✓
- [ ] Column "Name": Employee name
- [ ] Column "Salary": Base salary
- [ ] Names match attendance sheets exactly

## Troubleshooting Quick Fixes

**Server won't start?**
```bash
npm install
npm run dev
```

**Calculation wrong?**
- Check attendance markers (P, A, X, H, W, N, O)
- Verify date format (DD/MM/YYYY)
- Confirm advances/bonuses entered correctly

**Employee not found?**
- Names must match exactly (case-sensitive)
- Check for extra spaces in names

## Test First! 🧪

Use sample files in `public/sample-files/`:
- `outlet1_attendance.csv`
- `outlet2_attendance.csv`
- `salary_sheet.csv`

Upload these to test before using real data.

---

**Need more help?** See README.md or USAGE_GUIDE.md
