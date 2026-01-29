import json
import random
from datetime import datetime

# Read existing data
with open(r'C:\Users\Administrator\Music\sheetPro\backend\data\shiftReports.json', 'r') as f:
    shift_reports = json.load(f)

with open(r'C:\Users\Administrator\Music\sheetPro\backend\data\dailyAggregates.json', 'r') as f:
    daily_aggregates = json.load(f)

with open(r'C:\Users\Administrator\Music\sheetPro\backend\data\employeeTotals.json', 'r') as f:
    employee_totals = json.load(f)

# Add January 2026 data (multiple dates)
employees = ["John Smith", "Sarah Johnson", "Mike Davis", "Emily Wilson", "Chris Brown", "Jessica Lee"]
january_dates = ["2026-01-05", "2026-01-10", "2026-01-15", "2026-01-20", "2026-01-25", "2026-01-28"]

report_id = len(shift_reports) + 1

for date_str in january_dates:
    # Day Shift
    day_employee = random.choice(employees)
    am_start_till = 500.00
    expected_deposit = random.uniform(2200, 3500)
    lottery_till_added = random.uniform(150, 300)
    total_pos_sales = expected_deposit - am_start_till - lottery_till_added
    transfer_bank_should_have = expected_deposit
    transfer_bank_actually_have = transfer_bank_should_have + random.uniform(-15, 15)
    pos_over_short = transfer_bank_actually_have - transfer_bank_should_have
    
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
    
    lottery_draws = []
    for i in range(1, 9):
        amount = random.uniform(0, 100) if random.random() > 0.3 else 0
        if amount > 0:
            lottery_draws.append({"drawAmount": round(amount, 2), "drawNumber": i})
    
    day_report = {
        "id": f"jan-{report_id:04d}",
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
            "comments": "Day shift completed"
        },
        "lotteryDraws": lottery_draws
    }
    shift_reports.append(day_report)
    report_id += 1
    
    # Night Shift
    night_employee = random.choice([e for e in employees if e != day_employee])
    night_expected_deposit = random.uniform(2800, 4000)
    night_lottery_till_added = random.uniform(180, 320)
    night_total_pos_sales = night_expected_deposit - am_start_till - night_lottery_till_added
    night_transfer_bank_should_have = night_expected_deposit
    night_transfer_bank_actually_have = night_transfer_bank_should_have + random.uniform(-20, 20)
    night_pos_over_short = night_transfer_bank_actually_have - night_transfer_bank_should_have
    
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
        "id": f"jan-{report_id:04d}",
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
    report_id += 1
    
    # Add daily aggregate
    daily_aggregates.append({
        "date": date_str,
        "totalVideoCashIn": round(video_cash_in + night_video_cash_in, 2),
        "totalPosDeposit": round(expected_deposit + night_expected_deposit, 2),
        "totalLotteryDeposit": round(transfer_bank + night_transfer_bank, 2)
    })

# Save updated data
with open(r'C:\Users\Administrator\Music\sheetPro\backend\data\shiftReports.json', 'w') as f:
    json.dump(shift_reports, f, indent=2)
print(f'[SUCCESS] Added January 2026 data. Total reports: {len(shift_reports)}')

with open(r'C:\Users\Administrator\Music\sheetPro\backend\data\dailyAggregates.json', 'w') as f:
    json.dump(daily_aggregates, f, indent=2)
print(f'[SUCCESS] Total daily aggregates: {len(daily_aggregates)}')

print('\nJanuary 2026 aggregates:')
for agg in [a for a in daily_aggregates if a['date'].startswith('2026-01')]:
    print(f'  {agg["date"]}: Video=${agg["totalVideoCashIn"]:.2f}, POS=${agg["totalPosDeposit"]:.2f}, Lottery=${agg["totalLotteryDeposit"]:.2f}')
