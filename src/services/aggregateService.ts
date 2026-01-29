import { PrismaClient, Prisma } from '@prisma/client';
import { decimalToNumber } from './calculationService';

const prisma = new PrismaClient();

export interface DailyAggregateData {
  totalVideoCashIn: number;
  totalPosDeposit: number;
  totalLotteryDeposit: number;
}

/**
 * Calculate and update daily aggregates for a specific date
 */
export async function calculateDailyAggregates(
  date: Date,
  locationId?: string
): Promise<DailyAggregateData> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all submitted shift reports for the date
  const shiftReports = await prisma.dailyShiftReport.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: 'submitted',
      locationId: locationId || null,
    },
    include: {
      lotteryShiftData: true,
      posShiftData: true,
    },
  });

  let totalVideoCashIn = 0;
  let totalPosDeposit = 0;
  let totalLotteryDeposit = 0;

  for (const report of shiftReports) {
    // Sum video cash in from lottery shift data
    if (report.lotteryShiftData) {
      totalVideoCashIn += decimalToNumber(report.lotteryShiftData.videoCashIn);
      totalLotteryDeposit += decimalToNumber(report.lotteryShiftData.transferBank);
    }

    // Sum POS deposits
    if (report.posShiftData) {
      totalPosDeposit += decimalToNumber(report.posShiftData.transferBankActuallyHave);
    }
  }

  // Upsert daily aggregate
  await prisma.dailyAggregate.upsert({
    where: {
      date_locationId: {
        date: startOfDay,
        locationId: locationId || null,
      },
    },
    create: {
      date: startOfDay,
      locationId: locationId || null,
      totalVideoCashIn,
      totalPosDeposit,
      totalLotteryDeposit,
    },
    update: {
      totalVideoCashIn,
      totalPosDeposit,
      totalLotteryDeposit,
    },
  });

  return {
    totalVideoCashIn: Math.round(totalVideoCashIn * 100) / 100,
    totalPosDeposit: Math.round(totalPosDeposit * 100) / 100,
    totalLotteryDeposit: Math.round(totalLotteryDeposit * 100) / 100,
  };
}

/**
 * Get daily aggregates for a specific date
 */
export async function getDailyAggregates(
  date: Date,
  locationId?: string
): Promise<DailyAggregateData | null> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const aggregate = await prisma.dailyAggregate.findUnique({
    where: {
      date_locationId: {
        date: startOfDay,
        locationId: locationId || null,
      },
    },
  });

  if (!aggregate) {
    // Calculate if not exists
    return await calculateDailyAggregates(date, locationId);
  }

  return {
    totalVideoCashIn: decimalToNumber(aggregate.totalVideoCashIn),
    totalPosDeposit: decimalToNumber(aggregate.totalPosDeposit),
    totalLotteryDeposit: decimalToNumber(aggregate.totalLotteryDeposit),
  };
}

/**
 * Calculate monthly aggregates
 */
export async function getMonthlyAggregates(
  year: number,
  month: number,
  locationId?: string
): Promise<DailyAggregateData> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const aggregates = await prisma.dailyAggregate.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      locationId: locationId || null,
    },
  });

  let totalVideoCashIn = 0;
  let totalPosDeposit = 0;
  let totalLotteryDeposit = 0;

  for (const agg of aggregates) {
    totalVideoCashIn += decimalToNumber(agg.totalVideoCashIn);
    totalPosDeposit += decimalToNumber(agg.totalPosDeposit);
    totalLotteryDeposit += decimalToNumber(agg.totalLotteryDeposit);
  }

  return {
    totalVideoCashIn: Math.round(totalVideoCashIn * 100) / 100,
    totalPosDeposit: Math.round(totalPosDeposit * 100) / 100,
    totalLotteryDeposit: Math.round(totalLotteryDeposit * 100) / 100,
  };
}
