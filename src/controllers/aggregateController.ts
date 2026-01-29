import { Request, Response } from 'express';
import { readJsonFile } from '../services/jsonStorage';

export async function getDailyAggregate(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const aggregates = readJsonFile<any>('dailyAggregates.json');
    const aggregate = aggregates.find((a: any) => a.date === date);

    if (!aggregate) {
      return res.json({
        aggregates: {
          totalVideoCashIn: 0,
          totalPosDeposit: 0,
          totalLotteryDeposit: 0,
        },
      });
    }

    res.json({
      aggregates: {
        totalVideoCashIn: aggregate.totalVideoCashIn || 0,
        totalPosDeposit: aggregate.totalPosDeposit || 0,
        totalLotteryDeposit: aggregate.totalLotteryDeposit || 0,
      },
    });
  } catch (error: any) {
    console.error('Get daily aggregate error:', error);
    res.status(500).json({ error: 'Failed to get daily aggregates' });
  }
}

export async function getMonthlyAggregate(req: Request, res: Response) {
  try {
    const { year, month } = req.params;
    const aggregates = readJsonFile<any>('dailyAggregates.json');

    const filtered = aggregates.filter((a: any) => {
      const reportDate = new Date(a.date);
      return reportDate.getFullYear() === parseInt(year) && reportDate.getMonth() + 1 === parseInt(month);
    });

    const totals = filtered.reduce(
      (acc: any, agg: any) => ({
        totalVideoCashIn: acc.totalVideoCashIn + (agg.totalVideoCashIn || 0),
        totalPosDeposit: acc.totalPosDeposit + (agg.totalPosDeposit || 0),
        totalLotteryDeposit: acc.totalLotteryDeposit + (agg.totalLotteryDeposit || 0),
      }),
      { totalVideoCashIn: 0, totalPosDeposit: 0, totalLotteryDeposit: 0 }
    );

    res.json({ aggregates: totals });
  } catch (error: any) {
    console.error('Get monthly aggregate error:', error);
    res.status(500).json({ error: 'Failed to get monthly aggregates' });
  }
}

export async function getEmployeeTotal(req: Request, res: Response) {
  try {
    const { employeeId } = req.params;
    const totals = readJsonFile<any>('employeeTotals.json');
    const total = totals.find((t: any) => t.id === employeeId || t.employeeName === employeeId);

    if (!total) {
      return res.json({
        totals: {
          employeeId,
          totalShortage: 0,
          totalOverage: 0,
          lastUpdated: new Date().toISOString(),
        },
      });
    }

    res.json({ totals: total });
  } catch (error: any) {
    console.error('Get employee total error:', error);
    res.status(500).json({ error: 'Failed to get employee totals' });
  }
}

export async function getAllEmployeeTotalsHandler(req: Request, res: Response) {
  try {
    const totals = readJsonFile<any>('employeeTotals.json');
    totals.sort((a: any, b: any) => a.employeeName.localeCompare(b.employeeName));

    res.json({ totals });
  } catch (error: any) {
    console.error('Get all employee totals error:', error);
    res.status(500).json({ error: 'Failed to get employee totals' });
  }
}
