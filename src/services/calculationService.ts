export interface PosShiftInput {
  amStartTill: number;
  expectedDeposit: number;
  lotteryTillAdded: number;
  transferBankActuallyHave: number;
}

export interface PosShiftCalculations {
  totalPosSales: number;
  transferBankShouldHave: number;
  overShort: number;
}

export interface LotteryShiftInput {
  amStartTill: number;
  videoCashIn: number;
  onlineSales: number;
  extraMoneyAdded?: number;
  extraMoneyAddedDayshift?: number;
  extraMoneyAddedNightshift?: number;
  onlineValidate: number;
  freeTickets: number;
  scratchItValidate: number;
  miscPayout: number;
  miscPayoutDayshift?: number;
  miscPayoutNightshift?: number;
  transferBank: number;
}

export interface LotteryShiftCalculations {
  moneyGivenToPos: number;
  videoValidate: number;
  totalLottery: number;
  overShort: number;
}

/**
 * Calculate POS shift totals and over/short
 */
export function calculatePosShift(input: PosShiftInput): PosShiftCalculations {
  const { amStartTill, expectedDeposit, lotteryTillAdded, transferBankActuallyHave } = input;

  // total_pos_sales = expected_deposit - am_start_till - lottery_till_added
  const totalPosSales = expectedDeposit - amStartTill - lotteryTillAdded;

  // transfer_bank_should_have = am_start_till + total_pos_sales + lottery_till_added
  const transferBankShouldHave = amStartTill + totalPosSales + lotteryTillAdded;

  // over_short = transfer_bank_actually_have - transfer_bank_should_have
  const overShort = transferBankActuallyHave - transferBankShouldHave;

  return {
    totalPosSales: Math.round(totalPosSales * 100) / 100,
    transferBankShouldHave: Math.round(transferBankShouldHave * 100) / 100,
    overShort: Math.round(overShort * 100) / 100,
  };
}

/**
 * Calculate Lottery shift totals and over/short
 */
export function calculateLotteryShift(input: LotteryShiftInput): LotteryShiftCalculations {
  const {
    amStartTill,
    videoCashIn,
    onlineSales,
    extraMoneyAdded = 0,
    extraMoneyAddedDayshift = 0,
    extraMoneyAddedNightshift = 0,
    onlineValidate,
    freeTickets,
    scratchItValidate,
    miscPayout,
    miscPayoutDayshift = 0,
    miscPayoutNightshift = 0,
    transferBank,
  } = input;

  // Calculate total extra money added (for night shift, sum both dayshift and nightshift)
  const totalExtraMoneyAdded = extraMoneyAdded + extraMoneyAddedDayshift + extraMoneyAddedNightshift;

  // Calculate total misc payout (for night shift, sum both dayshift and nightshift)
  const totalMiscPayout = miscPayout + miscPayoutDayshift + miscPayoutNightshift;

  // money_given_to_pos = Sum of all deductions
  const moneyGivenToPos =
    onlineValidate +
    freeTickets +
    scratchItValidate +
    totalMiscPayout;

  // video_validate = video_cash_in (simplified - adjust if business logic differs)
  const videoValidate = videoCashIn;

  // total_lottery = am_start_till + video_cash_in + online_sales + extra_money_added - (all deductions) - transfer_bank
  const totalLottery =
    amStartTill +
    videoCashIn +
    onlineSales +
    totalExtraMoneyAdded -
    moneyGivenToPos -
    transferBank;

  // over_short = calculated difference (should be 0 if everything balances)
  const expectedRemaining = amStartTill + videoCashIn + onlineSales + totalExtraMoneyAdded - moneyGivenToPos - transferBank;
  const overShort = totalLottery - expectedRemaining; // Should be 0 if balanced

  return {
    moneyGivenToPos: Math.round(moneyGivenToPos * 100) / 100,
    videoValidate: Math.round(videoValidate * 100) / 100,
    totalLottery: Math.round(totalLottery * 100) / 100,
    overShort: Math.round(overShort * 100) / 100,
  };
}
