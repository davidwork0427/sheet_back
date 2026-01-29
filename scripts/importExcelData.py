import pandas as pd
import json
from datetime import datetime
import os

# List of Excel files with their dates
excel_files = [
    ('c:\\Users\\Administrator\\Downloads\\12.4.xlsx', '2024-12-04'),
    ('c:\\Users\\Administrator\\Downloads\\5.7.xlsx', '2025-05-07'),
    ('c:\\Users\\Administrator\\Downloads\\5.8.xlsx', '2025-05-08'),
    ('c:\\Users\\Administrator\\Downloads\\5.10.xlsx', '2025-05-10'),
    ('c:\\Users\\Administrator\\Downloads\\5.12.xlsx', '2025-05-12'),
    ('c:\\Users\\Administrator\\Downloads\\5.13.xlsx', '2025-05-13'),
    ('c:\\Users\\Administrator\\Downloads\\5.19.xlsx', '2025-05-19'),
    ('c:\\Users\\Administrator\\Downloads\\6.1.xlsx', '2025-06-01'),
    ('c:\\Users\\Administrator\\Downloads\\6.3.xlsx', '2025-06-03'),
    ('c:\\Users\\Administrator\\Downloads\\6.8.xlsx', '2025-06-08'),
    ('c:\\Users\\Administrator\\Downloads\\7.6.xlsx', '2025-07-06'),
    ('c:\\Users\\Administrator\\Downloads\\7.12.xlsx', '2025-07-12'),
    ('c:\\Users\\Administrator\\Downloads\\7.18.xlsx', '2025-07-18'),
    ('c:\\Users\\Administrator\\Downloads\\8.1.xlsx', '2025-08-01'),
    ('c:\\Users\\Administrator\\Downloads\\8.8.xlsx', '2025-08-08'),
    ('c:\\Users\\Administrator\\Downloads\\9.6.xlsx', '2025-09-06'),
    ('c:\\Users\\Administrator\\Downloads\\9.13.xlsx', '2025-09-13'),
    ('c:\\Users\\Administrator\\Downloads\\10.3.xlsx', '2025-10-03'),
    ('c:\\Users\\Administrator\\Downloads\\11.10.xlsx', '2025-11-10'),
]

def safe_float(val):
    """Convert value to float, return 0 if invalid"""
    if pd.isna(val) or val == '' or val is None:
        return 0.0
    try:
        return float(val)
    except:
        return 0.0

def extract_shift_data(df, date, shift_type, col_offset):
    """Extract data for a specific shift from Excel"""
    # Column indices based on shift (Day=2, Night=7)
    value_col = col_offset
    
    data = {
        'date': date,
        'shiftType': shift_type,
        'employeeName': '',  # Will be extracted
        'status': 'submitted',
        'submittedAt': f'{date}T12:00:00.000Z',
    }
    
    # Extract POS data (rows 5-12)
    data['posShiftData'] = {
        'amStartTill': safe_float(df.iloc[5, value_col]),
        'expectedDeposit': safe_float(df.iloc[6, value_col]),
        'lotteryTillAdded': safe_float(df.iloc[7, value_col]),
        'totalPosSales': safe_float(df.iloc[8, value_col]),
        'transferBankShouldHave': safe_float(df.iloc[10, value_col]),
        'transferBankActuallyHave': safe_float(df.iloc[11, value_col]),
        'overShort': safe_float(df.iloc[12, value_col]) if str(df.iloc[12, value_col]).lower() != 'even' else 0.0,
        'comments': ''
    }
    
    # Extract Lottery Draws (Day shift only, rows 20-27)
    if shift_type == 'day':
        draws = []
        for i in range(8):
            amount = safe_float(df.iloc[20 + i, 1])  # Column B for draws
            if amount > 0:
                draws.append({'drawAmount': amount, 'drawNumber': i + 1})
        if draws:
            data['lotteryDraws'] = draws
    
    # Extract Lottery Till data (rows 35-53)
    data['lotteryShiftData'] = {
        'amStartTill': safe_float(df.iloc[35, value_col]),
        'videoCashIn': safe_float(df.iloc[36, value_col]),
        'onlineSales': safe_float(df.iloc[37, value_col]),
        'onlineValidate': safe_float(df.iloc[40, value_col]),
        'freeTickets': safe_float(df.iloc[41, value_col]),
        'scratchItValidate': safe_float(df.iloc[42, value_col]),
        'transferBank': safe_float(df.iloc[50, value_col]),
        'moneyGivenToPos': safe_float(df.iloc[47, value_col]),
        'videoValidate': safe_float(df.iloc[48, value_col]),
        'totalLottery': safe_float(df.iloc[49, value_col]),
        'overShort': safe_float(df.iloc[53, value_col]) if str(df.iloc[53, value_col]).lower() != 'even' else 0.0,
        'comments': ''
    }
    
    # Handle extra money added
    if shift_type == 'day':
        data['lotteryShiftData']['extraMoneyAdded'] = safe_float(df.iloc[38, value_col])
    else:
        data['lotteryShiftData']['extraMoneyAddedDayshift'] = safe_float(df.iloc[38, value_col])
        data['lotteryShiftData']['extraMoneyAddedNightshift'] = safe_float(df.iloc[39, value_col])
    
    # Handle misc payout
    if shift_type == 'day':
        data['lotteryShiftData']['miscPayout'] = safe_float(df.iloc[43, value_col])
    else:
        data['lotteryShiftData']['miscPayoutDayshift'] = safe_float(df.iloc[43, value_col])
        data['lotteryShiftData']['miscPayoutNightshift'] = safe_float(df.iloc[44, value_col])
    
    # Extract transfer bank deposits (Night shift only, rows 38-45, cols 10-12)
    if shift_type == 'night':
        deposits = []
        denoms = ['coin', '1', '2', '5', '10', '20', '50', '100']
        for i, denom in enumerate(denoms):
            transfer_amt = safe_float(df.iloc[38 + i, 10])
            deposit_amt = safe_float(df.iloc[38 + i, 12])
            if transfer_amt > 0 or deposit_amt > 0:
                deposits.append({
                    'denominationType': denom,
                    'transferBankAmount': transfer_amt,
                    'depositAmount': deposit_amt
                })
        if deposits:
            data['transferBankDeposits'] = deposits
        
        # Transfer bank details (Night shift)
        data['transferBankDetails'] = {
            'transferBankBlueBag': safe_float(df.iloc[50, value_col]),
            'depositShouldHave': safe_float(df.iloc[51, value_col]),
            'actuallyHaveBlackBag': safe_float(df.iloc[52, value_col]),
            'totalCashDeposit': safe_float(df.iloc[55, value_col])
        }
    
    return data

# Parse all Excel files
all_reports = []
report_id_counter = 1

for file_path, date in excel_files:
    if not os.path.exists(file_path):
        print(f'Skipping {file_path} - file not found')
        continue
    
    try:
        print(f'Processing {file_path} for date {date}...')
        df = pd.read_excel(file_path, header=None)
        
        # Extract Day Shift (column 2)
        day_data = extract_shift_data(df, date, 'day', 2)
        day_data['id'] = f'import-{report_id_counter:04d}'
        day_data['employeeName'] = 'Employee ' + str(report_id_counter)
        all_reports.append(day_data)
        report_id_counter += 1
        
        # Extract Night Shift (column 7)
        night_data = extract_shift_data(df, date, 'night', 7)
        night_data['id'] = f'import-{report_id_counter:04d}'
        night_data['employeeName'] = 'Employee ' + str(report_id_counter)
        all_reports.append(night_data)
        report_id_counter += 1
        
        print(f'  [OK] Extracted Day and Night shifts')
    except Exception as e:
        print(f'  [ERROR] Error processing {file_path}: {e}')

print(f'\n[SUCCESS] Successfully extracted {len(all_reports)} shift reports from {len(excel_files)} Excel files')

# Save to JSON file
output_path = r'C:\Users\Administrator\Music\sheetPro\backend\data\shiftReports.json'
with open(output_path, 'w') as f:
    json.dump(all_reports, f, indent=2)

print(f'[SUCCESS] Saved to {output_path}')

# Calculate aggregates
aggregates = {}
for report in all_reports:
    date = report['date']
    if date not in aggregates:
        aggregates[date] = {
            'date': date,
            'totalVideoCashIn': 0,
            'totalPosDeposit': 0,
            'totalLotteryDeposit': 0
        }
    
    if 'lotteryShiftData' in report:
        aggregates[date]['totalVideoCashIn'] += report['lotteryShiftData'].get('videoCashIn', 0)
    if 'posShiftData' in report:
        aggregates[date]['totalPosDeposit'] += report['posShiftData'].get('expectedDeposit', 0)
    if 'lotteryShiftData' in report:
        aggregates[date]['totalLotteryDeposit'] += report['lotteryShiftData'].get('transferBank', 0)

# Save aggregates
agg_output_path = r'C:\Users\Administrator\Music\sheetPro\backend\data\dailyAggregates.json'
with open(agg_output_path, 'w') as f:
    json.dump(list(aggregates.values()), f, indent=2)

print(f'[SUCCESS] Saved aggregates to {agg_output_path}')

# Calculate employee totals
employee_totals = {}
for report in all_reports:
    emp_name = report['employeeName']
    if emp_name not in employee_totals:
        employee_totals[emp_name] = {
            'employeeName': emp_name,
            'totalShortage': 0,
            'totalOverage': 0,
            'lastUpdated': report['submittedAt']
        }
    
    # POS over/short
    if 'posShiftData' in report:
        over_short = report['posShiftData'].get('overShort', 0)
        if over_short < 0:
            employee_totals[emp_name]['totalShortage'] += abs(over_short)
        elif over_short > 0:
            employee_totals[emp_name]['totalOverage'] += over_short
    
    # Lottery over/short
    if 'lotteryShiftData' in report:
        over_short = report['lotteryShiftData'].get('overShort', 0)
        if over_short < 0:
            employee_totals[emp_name]['totalShortage'] += abs(over_short)
        elif over_short > 0:
            employee_totals[emp_name]['totalOverage'] += over_short
    
    if report['submittedAt'] > employee_totals[emp_name]['lastUpdated']:
        employee_totals[emp_name]['lastUpdated'] = report['submittedAt']

# Add IDs
for idx, (name, data) in enumerate(employee_totals.items(), 1):
    data['id'] = f'emp-{idx:04d}'

# Save employee totals
emp_output_path = r'C:\Users\Administrator\Music\sheetPro\backend\data\employeeTotals.json'
with open(emp_output_path, 'w') as f:
    json.dump(list(employee_totals.values()), f, indent=2)

print(f'[SUCCESS] Saved employee totals to {emp_output_path}')
print(f'\n[COMPLETE] Import complete! Imported {len(all_reports)} reports from {len(excel_files)} dates')
