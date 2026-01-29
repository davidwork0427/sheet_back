import { PrismaClient } from '@prisma/client';
import { decimalToNumber, numberToDecimal } from './calculationService';

const prisma = new PrismaClient();

/**
 * Update employee totals based on over/short from a shift report
 */
export async function updateEmployeeTotals(
  employeeId: string,
  posOverShort: number | null,
  lotteryOverShort: number | null,
  locationId?: string
): Promise<void> {
  // Get or create employee total record
  const normalizedLocationId: string | null = locationId ? locationId : null;
  const employeeTotal = await prisma.employeeTotal.upsert({
    where: {
      employeeId_locationId: {
        employeeId,
        locationId: normalizedLocationId as any,
      },
    },
    create: {
      employeeId,
      locationId: normalizedLocationId as any,
      totalShortage: numberToDecimal(0),
      totalOverage: numberToDecimal(0),
    },
    update: {},
  });

  let newShortage = decimalToNumber(employeeTotal.totalShortage);
  let newOverage = decimalToNumber(employeeTotal.totalOverage);

  // Update totals based on over/short values
  // Negative over/short = shortage, Positive = overage
  if (posOverShort !== null) {
    if (posOverShort < 0) {
      newShortage += Math.abs(posOverShort);
    } else if (posOverShort > 0) {
      newOverage += posOverShort;
    }
  }

  if (lotteryOverShort !== null) {
    if (lotteryOverShort < 0) {
      newShortage += Math.abs(lotteryOverShort);
    } else if (lotteryOverShort > 0) {
      newOverage += lotteryOverShort;
    }
  }

  // Update the record
  await prisma.employeeTotal.update({
    where: {
      id: employeeTotal.id,
    },
    data: {
      totalShortage: numberToDecimal(newShortage),
      totalOverage: numberToDecimal(newOverage),
    },
  });
}

/**
 * Get employee totals
 */
export async function getEmployeeTotals(employeeId: string, locationId?: string) {
  const normalizedLocationId: string | null = locationId ? locationId : null;
  const totals = await prisma.employeeTotal.findUnique({
    where: {
      employeeId_locationId: {
        employeeId,
        locationId: normalizedLocationId as any,
      },
    },
  });

  if (!totals) {
    return {
      employeeId,
      totalShortage: 0,
      totalOverage: 0,
      lastUpdated: new Date(),
    };
  }

  return {
    employeeId: totals.employeeId,
    totalShortage: decimalToNumber(totals.totalShortage),
    totalOverage: decimalToNumber(totals.totalOverage),
    lastUpdated: totals.lastUpdated,
  };
}

/**
 * Get all employee totals (for managers)
 */
export async function getAllEmployeeTotals(locationId?: string) {
  const normalizedLocationId: string | null = locationId ? locationId : null;
  const totals = await prisma.employeeTotal.findMany({
    where: {
      locationId: normalizedLocationId,
    },
    orderBy: {
      employeeId: 'asc',
    },
  });

  return totals.map((total: any) => ({
    employeeId: total.employeeId,
    totalShortage: decimalToNumber(total.totalShortage),
    totalOverage: decimalToNumber(total.totalOverage),
    lastUpdated: total.lastUpdated,
  }));
}
