import { Request, Response } from 'express';
import { readJsonFile } from '../services/jsonStorage';

export async function getDashboardOverview(req: Request, res: Response) {
  try {
    const { date } = req.query;
    const reportDate = date ? (date as string) : new Date().toISOString().split('T')[0];

    // Get daily aggregates
    const aggregates = readJsonFile<any>('dailyAggregates.json');
    const aggregate = aggregates.find((a: any) => a.date === reportDate);

    // Get recent submissions (last 10)
    const reports = readJsonFile<any>('shiftReports.json');
    const recentSubmissions = reports
      .filter((r: any) => r.status === 'submitted')
      .sort((a: any, b: any) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
      .slice(0, 10);

    // Get employee totals
    const employeeTotals = readJsonFile<any>('employeeTotals.json');
    employeeTotals.sort((a: any, b: any) => a.employeeName.localeCompare(b.employeeName));

    res.json({
      aggregates: aggregate
        ? {
            totalVideoCashIn: aggregate.totalVideoCashIn || 0,
            totalPosDeposit: aggregate.totalPosDeposit || 0,
            totalLotteryDeposit: aggregate.totalLotteryDeposit || 0,
          }
        : {
            totalVideoCashIn: 0,
            totalPosDeposit: 0,
            totalLotteryDeposit: 0,
          },
      recentSubmissions,
      employeeTotals,
    });
  } catch (error: any) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to get dashboard overview' });
  }
}

export async function getRecentSubmissions(req: Request, res: Response) {
  try {
    const { limit = '20' } = req.query;
    const limitNum = parseInt(limit as string);

    const reports = readJsonFile<any>('shiftReports.json');
    const submissions = reports
      .filter((r: any) => r.status === 'submitted')
      .sort((a: any, b: any) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
      .slice(0, limitNum);

    res.json({ submissions });
  } catch (error: any) {
    console.error('Get recent submissions error:', error);
    res.status(500).json({ error: 'Failed to get recent submissions' });
  }
}

export async function getMissingReports(req: Request, res: Response) {
  try {
    const { date } = req.query;
    const reportDate = date ? (date as string) : new Date().toISOString().split('T')[0];

    // Get all submitted reports for the date
    const reports = readJsonFile<any>('shiftReports.json');
    const submittedReports = reports.filter(
      (r: any) => r.date === reportDate && r.status === 'submitted'
    );

    // Get unique employee names from all reports
    const allEmployees = [...new Set(reports.map((r: any) => r.employeeName))];

    // Find missing reports
    const missingReports: Array<{ employeeName: string; shiftType: string }> = [];
    const shiftTypes: Array<'day' | 'night'> = ['day', 'night'];

    for (const employeeName of allEmployees) {
      for (const shiftType of shiftTypes) {
        const hasReport = submittedReports.some(
          (r) => r.employeeName === employeeName && r.shiftType === shiftType
        );
        if (!hasReport) {
          missingReports.push({
            employeeName,
            shiftType,
          });
        }
      }
    }

    res.json({ missingReports, date: reportDate });
  } catch (error: any) {
    console.error('Get missing reports error:', error);
    res.status(500).json({ error: 'Failed to get missing reports' });
  }
}
