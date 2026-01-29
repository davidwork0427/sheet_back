import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['employee', 'manager', 'admin']).optional(),
  employeeId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const shiftReportSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  shiftType: z.enum(['day', 'night']),
  employeeName: z.string().min(1, 'Employee name is required'),
  atmReport: z.object({
    amount: z.number().nonnegative(),
  }).optional(),
  posShiftData: z.object({
    amStartTill: z.number().nonnegative(),
    expectedDeposit: z.number().nonnegative(),
    lotteryTillAdded: z.number().nonnegative(),
    transferBankActuallyHave: z.number().nonnegative(),
    comments: z.string().optional(),
  }).optional(),
  barbackTipOut: z.object({
    totalTipsMade: z.number().nonnegative(),
    barbackTipOut: z.number().nonnegative(),
  }).optional(),
  lotteryShiftData: z.object({
    amStartTill: z.number().nonnegative(),
    videoCashIn: z.number().nonnegative(),
    onlineSales: z.number().nonnegative(),
    extraMoneyAdded: z.number().nonnegative().optional(),
    extraMoneyAddedDayshift: z.number().nonnegative().optional(),
    extraMoneyAddedNightshift: z.number().nonnegative().optional(),
    onlineValidate: z.number().nonnegative(),
    freeTickets: z.number().nonnegative(),
    scratchItValidate: z.number().nonnegative(),
    miscPayout: z.number().nonnegative(),
    miscPayoutDayshift: z.number().nonnegative().optional(),
    miscPayoutNightshift: z.number().nonnegative().optional(),
    transferBank: z.number().nonnegative(),
    comments: z.string().optional(),
  }).optional(),
  lotteryDraws: z.array(z.object({
    drawAmount: z.number().nonnegative(),
    drawNumber: z.number().int().min(1).max(8),
  })).optional(),
  transferBankDeposits: z.array(z.object({
    denominationType: z.enum(['coin', '1', '2', '5', '10', '20', '50', '100']),
    transferBankAmount: z.number().nonnegative(),
    depositAmount: z.number().nonnegative(),
  })).optional(),
  transferBankDetails: z.object({
    transferBankBlueBag: z.number().nonnegative().optional(),
    depositShouldHave: z.number().nonnegative().optional(),
    actuallyHaveBlackBag: z.number().nonnegative().optional(),
    totalCashDeposit: z.number().nonnegative().optional(),
  }).optional(),
});
