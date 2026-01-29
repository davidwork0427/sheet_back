import json
import random
from datetime import datetime, timedelta
import uuid

# Sample employee names
employees = ["John Smith", "Sarah Johnson", "Mike Davis", "Emily Wilson", "Chris Brown", "Jessica Lee"]

# Generate realistic shift report data
shift_reports = []
daily_aggregates = []
employee_totals_map = {}

# Start from December 2024 to November 2025
start_date = datetime(2024, 12, 1)
end_date = datetime(2025, 11, 30)

dates = [
    "2024-12-04", "2025-05-07", "2025-05-08", "2025-05-10", "2025-05-12",
    "2025-05-13", "2025-05-19", "2025-06-01", "2025-06-03", "2025-06-08",
    "2025-07-06", "2025-07-12", "2025-07-18", "2025-08-01", "2025-08-08",
    "2025-09-06", "2025-09-13", "2025-10-03", "2025-11-10"
]

report_id = 1

for date_str in dates:
    # Day Shift
    day_employee = random.choice(employees)
    
    # Realistic POS values
    am_start_till = 500.00
    expected_deposit = random.uniform(2200, 3500)
    lottery_till_added = random.uniform(150, 300)
    total_pos_sales = expected_deposit - am_start_till - lottery_till_added
    transfer_bank_should_have = expected_deposit
    transfer_bank_actually_have = transfer_bank_should_have + random.uniform(-15, 15)  # Random variance
    pos_over_short = transfer_bank_actually_have - transfer_bank_should_have
    
    # Realistic Lottery values  
    lottery_am_start = 300.00
    video_cash_in = random.uniform(400, 650)
    online_sales = random.uniform(100, 200)
    extra_money = random.uniform(0, 50)
    online_validate = random.uniform(40, 80)
    free_tickets = random.uniform(20, 40)
    scratch_it_validate = random.uniform(25, 50)
    misc_payout = random.uniform(10, 30)
    
    money_given_to_pos = online_validate + free_tickets + scratch_it_validate + misc_payout
    video_validate = video_cash_in
    total_lottery = lottery_am_start + video_cash_in + online_sales + extra_money - money_given_to_pos
    transfer_bank = random.uniform(600, 900)
    lottery_over_short = total_lottery - transfer_bank
    
    # Lottery draws for day shift
    lottery_draws = []
    for i in range(1, 9):
        amount = random.uniform(0, 100) if random.random() > 0.3 else 0
        if amount > 0:
            lottery_draws.append({"drawAmount": round(amount, 2), "drawNumber": i})
    
    day_report = {
        "id": f"550e8400-e29b-41d4-a716-{str(report_id).zfill(12)}",
        "date": date_str,
        "shiftType": "day",
        "employeeName": day_employee,
        "status": "submitted",
        "submittedAt": f"{date_str}T14:30:00.000Z",
        "posShiftData": {
            "amStartTill": round(am_start_till, 2),
            "expectedDeposit": round(expected_deposit, 2),
            "lotteryTillAdded": round(lottery_till_added, 2),
            "totalPosSales": round(total_pos_sales, 2),
            "transferBankShouldHave": round(transfer_bank_should_have, 2),
            "transferBankActuallyHave": round(transfer_bank_actually_have, 2),
            "overShort": round(pos_over_short, 2),
            "comments": "Day shift completed"
        },
        "lotteryShiftData": {
            "amStartTill": round(lottery_am_start, 2),
            "videoCashIn": round(video_cash_in, 2),
            "onlineSales": round(online_sales, 2),
            "extraMoneyAdded": round(extra_money, 2),
            "onlineValidate": round(online_validate, 2),
            "freeTickets": round(free_tickets, 2),
            "scratchItValidate": round(scratch_it_validate, 2),
            "miscPayout": round(misc_payout, 2),
            "transferBank": round(transfer_bank, 2),
            "moneyGivenToPos": round(money_given_to_pos, 2),
            "videoValidate": round(video_validate, 2),
            "totalLottery": round(total_lottery, 2),
            "overShort": round(lottery_over_short, 2),
            "comments": "Lottery balanced"
        },
        "lotteryDraws": lottery_draws
    }
    shift_reports.append(day_report)
    
    # Track employee totals
    if day_employee not in employee_totals_map:
        employee_totals_map[day_employee] = {"shortage": 0, "overage": 0, "lastUpdated": f"{date_str}T14:30:00.000Z"}
    
    if pos_over_short < 0:
        employee_totals_map[day_employee]["shortage"] += abs(pos_over_short)
    elif pos_over_short > 0:
        employee_totals_map[day_employee]["overage"] += pos_over_short
    
    if lottery_over_short < 0:
        employee_totals_map[day_employee]["shortage"] += abs(lottery_over_short)
    elif lottery_over_short > 0:
        employee_totals_map[day_employee]["overage"] += lottery_over_short
    
    employee_totals_map[day_employee]["lastUpdated"] = f"{date_str}T14:30:00.000Z"
    
    report_id += 1
    
    # Night Shift
    night_employee = random.choice([e for e in employees if e != day_employee])
    
    # Night shift POS
    night_expected_deposit = random.uniform(2800, 4000)
    night_lottery_till_added = random.uniform(180, 320)
    night_total_pos_sales = night_expected_deposit - am_start_till - night_lottery_till_added
    night_transfer_bank_should_have = night_expected_deposit
    night_transfer_bank_actually_have = night_transfer_bank_should_have + random.uniform(-20, 20)
    night_pos_over_short = night_transfer_bank_actually_have - night_transfer_bank_should_have
    
    # Night shift Lottery
    night_video_cash_in = random.uniform(450, 700)
    night_online_sales = random.uniform(120, 220)
    extra_money_day = random.uniform(0, 60)
    extra_money_night = random.uniform(0, 60)
    night_online_validate = random.uniform(50, 90)
    night_free_tickets = random.uniform(25, 45)
    night_scratch_validate = random.uniform(30, 55)
    misc_payout_day = random.uniform(10, 35)
    misc_payout_night = random.uniform(15, 40)
    
    night_money_given = night_online_validate + night_free_tickets + night_scratch_validate + misc_payout_day + misc_payout_night
    night_total_lottery = lottery_am_start + night_video_cash_in + night_online_sales + extra_money_day + extra_money_night - night_money_given
    night_transfer_bank = random.uniform(700, 1000)
    night_lottery_over_short = night_total_lottery - night_transfer_bank
    
    # Transfer bank deposits
    transfer_deposits = []
    denoms = [("coin", 1), ("1", 1), ("2", 2), ("5", 5), ("10", 10), ("20", 20), ("50", 50), ("100", 100)]
    for denom_name, denom_val in denoms:
        if denom_val <= 20:
            amt = random.uniform(20, 150) if denom_val <= 5 else random.uniform(100, 400)
        else:
            amt = random.uniform(0, 200)
        transfer_deposits.append({
            "denominationType": denom_name,
            "transferBankAmount": round(amt, 2),
            "depositAmount": round(amt, 2)
        })
    
    night_report = {
        "id": f"550e8400-e29b-41d4-a716-{str(report_id).zfill(12)}",
        "date": date_str,
        "shiftType": "night",
        "employeeName": night_employee,
        "status": "submitted",
        "submittedAt": f"{date_str}T23:45:00.000Z",
        "posShiftData": {
            "amStartTill": round(am_start_till, 2),
            "expectedDeposit": round(night_expected_deposit, 2),
            "lotteryTillAdded": round(night_lottery_till_added, 2),
            "totalPosSales": round(night_total_pos_sales, 2),
            "transferBankShouldHave": round(night_transfer_bank_should_have, 2),
            "transferBankActuallyHave": round(night_transfer_bank_actually_have, 2),
            "overShort": round(night_pos_over_short, 2),
            "comments": "Night shift closed"
        },
        "lotteryShiftData": {
            "amStartTill": round(lottery_am_start, 2),
            "videoCashIn": round(night_video_cash_in, 2),
            "onlineSales": round(night_online_sales, 2),
            "extraMoneyAddedDayshift": round(extra_money_day, 2),
            "extraMoneyAddedNightshift": round(extra_money_night, 2),
            "onlineValidate": round(night_online_validate, 2),
            "freeTickets": round(night_free_tickets, 2),
            "scratchItValidate": round(night_scratch_validate, 2),
            "miscPayoutDayshift": round(misc_payout_day, 2),
            "miscPayoutNightshift": round(misc_payout_night, 2),
            "transferBank": round(night_transfer_bank, 2),
            "moneyGivenToPos": round(night_money_given, 2),
            "videoValidate": round(night_video_cash_in, 2),
            "totalLottery": round(night_total_lottery, 2),
            "overShort": round(night_lottery_over_short, 2),
            "comments": "Night shift completed"
        },
        "transferBankDeposits": transfer_deposits,
        "transferBankDetails": {
            "transferBankBlueBag": round(night_transfer_bank, 2),
            "depositShouldHave": round(night_transfer_bank_should_have, 2),
            "actuallyHaveBlackBag": round(night_transfer_bank_actually_have, 2),
            "totalCashDeposit": round(sum([d["depositAmount"] for d in transfer_deposits]), 2)
        }
    }
    shift_reports.append(night_report)
    
    # Track employee totals for night shift
    if night_employee not in employee_totals_map:
        employee_totals_map[night_employee] = {"shortage": 0, "overage": 0, "lastUpdated": f"{date_str}T23:45:00.000Z"}
    
    if night_pos_over_short < 0:
        employee_totals_map[night_employee]["shortage"] += abs(night_pos_over_short)
    elif night_pos_over_short > 0:
        employee_totals_map[night_employee]["overage"] += night_pos_over_short
    
    if night_lottery_over_short < 0:
        employee_totals_map[night_employee]["shortage"] += abs(night_lottery_over_short)
    elif night_lottery_over_short > 0:
        employee_totals_map[night_employee]["overage"] += night_lottery_over_short
    
    employee_totals_map[night_employee]["lastUpdated"] = f"{date_str}T23:45:00.000Z"
    
    report_id += 1
    
    # Create daily aggregates
    daily_aggregates.append({
        "date": date_str,
        "totalVideoCashIn": round(video_cash_in + night_video_cash_in, 2),
        "totalPosDeposit": round(expected_deposit + night_expected_deposit, 2),
        "totalLotteryDeposit": round(transfer_bank + night_transfer_bank, 2)
    })

# Convert employee totals to list
employee_totals = []
for idx, (emp_name, totals) in enumerate(employee_totals_map.items(), 1):
    employee_totals.append({
        "id": f"emp-{str(idx).zfill(4)}",
        "employeeName": emp_name,
        "totalShortage": round(totals["shortage"], 2),
        "totalOverage": round(totals["overage"], 2),
        "lastUpdated": totals["lastUpdated"]
    })

# Save all data
output_base = r'C:\Users\Administrator\Music\sheetPro\backend\data'

with open(f'{output_base}\\shiftReports.json', 'w') as f:
    json.dump(shift_reports, f, indent=2)
print(f'[SUCCESS] Saved {len(shift_reports)} shift reports')

with open(f'{output_base}\\dailyAggregates.json', 'w') as f:
    json.dump(daily_aggregates, f, indent=2)
print(f'[SUCCESS] Saved {len(daily_aggregates)} daily aggregates')

with open(f'{output_base}\\employeeTotals.json', 'w') as f:
    json.dump(employee_totals, f, indent=2)
print(f'[SUCCESS] Saved {len(employee_totals)} employee totals')

# Print summary
print('\n=== DATA SUMMARY ===')
print(f'Total Reports: {len(shift_reports)}')
print(f'Date Range: {dates[0]} to {dates[-1]}')
print(f'Employees: {len(employee_totals)}')
print('\nEmployee Performance:')
for emp in employee_totals:
    net = emp['totalOverage'] - emp['totalShortage']
    status = 'SHORT' if net < 0 else 'OVER' if net > 0 else 'EVEN'
    print(f'  {emp["employeeName"]}: Net ${net:.2f} ({status})')
