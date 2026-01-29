import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJsonFile, writeJsonFile, updateJsonFile } from '../services/jsonStorage';
import { calculatePosShift, calculateLotteryShift } from '../services/calculationService';
import { AuthRequest } from '../middleware/auth';

interface ShiftReport {
  id: string;
  date: string;
  shiftType: 'day' | 'night';
  employeeName: string;
  submittedAt?: string;
  submittedBy?: string; // User ID who submitted
  status: 'draft' | 'submitted';
  editHistory?: Array<{
    editedAt: string;
    editedBy: string;
    editedByName: string;
    editedByRole: string;
    reason?: string;
  }>;
  atmReport?: any;
  posShiftData?: any;
  barbackTipOut?: any;
  lotteryShiftData?: any;
  lotteryDraws?: any[];
  transferBankDeposits?: any[];
  transferBankDetails?: any;
}

// Helper function to check if edit is within grace period (10 minutes)
function isWithinGracePeriod(submittedAt: string): boolean {
  const submitted = new Date(submittedAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - submitted.getTime()) / (1000 * 60);
  return diffMinutes <= 10;
}

// Helper function to check if user can edit report
function canEditReport(report: ShiftReport, user: any): { allowed: boolean; reason?: string } {
  // Managers and admins can always edit
  if (user.role === 'manager' || user.role === 'admin') {
    return { allowed: true };
  }
  
  // Employees can only edit their own reports
  if (user.name !== report.employeeName) {
    return { allowed: false, reason: 'You can only edit your own reports' };
  }
  
  // Cannot edit submitted reports after grace period
  if (report.status === 'submitted' && report.submittedAt) {
    if (!isWithinGracePeriod(report.submittedAt)) {
      return { allowed: false, reason: 'Cannot edit report after 10-minute grace period' };
    }
  }
  
  // Cannot edit reports from previous days
  const reportDate = new Date(report.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reportDate.setHours(0, 0, 0, 0);
  
  if (reportDate < today && user.role === 'employee') {
    return { allowed: false, reason: 'Cannot edit reports from previous days' };
  }
  
  return { allowed: true };
}

export async function createShiftReport(req: AuthRequest, res: Response) {
  try {
    const {
      date,
      shiftType,
      employeeName,
      atmReport,
      posShiftData,
      barbackTipOut,
      lotteryShiftData,
      lotteryDraws,
      transferBankDeposits,
      transferBankDetails,
    } = req.body;

    // TODO: Enable authentication when ready
    const user = req.user || { userId: 'temp-user', role: 'manager', name: employeeName, email: 'temp@temp.com' };

    // TODO: Enable when authentication is ready
    // EMPLOYEE PROTECTION: Employees can only create reports for themselves
    // if (user.role === 'employee' && user.name !== employeeName) {
    //   return res.status(403).json({ error: 'You can only create reports for yourself' });
    // }

    // Validate date is not in future
    const reportDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (reportDate > today) {
      return res.status(400).json({ error: 'Cannot create report for future date' });
    }

    // TODO: Enable when authentication is ready
    // EMPLOYEE PROTECTION: Cannot create/edit reports from previous days
    // const todayDate = new Date();
    // todayDate.setHours(0, 0, 0, 0);
    // reportDate.setHours(0, 0, 0, 0);
    // 
    // if (reportDate < todayDate && user.role === 'employee') {
    //   return res.status(403).json({ error: 'Cannot create or modify reports from previous days' });
    // }

    const reports = readJsonFile<ShiftReport>('shiftReports.json');

    // Check if report already exists
    const existingReport = reports.find(
      (r) => r.date === date && r.shiftType === shiftType && r.employeeName === employeeName
    );

    // TODO: Enable when authentication is ready
    // if (existingReport) {
    //   // Check if user can edit this report
    //   const editCheck = canEditReport(existingReport, user);
    //   if (!editCheck.allowed) {
    //     return res.status(403).json({ error: editCheck.reason });
    //   }
    // }

    // Calculate POS shift data if provided
    let posCalculations = null;
    if (posShiftData) {
      posCalculations = calculatePosShift({
        amStartTill: posShiftData.amStartTill,
        expectedDeposit: posShiftData.expectedDeposit,
        lotteryTillAdded: posShiftData.lotteryTillAdded,
        transferBankActuallyHave: posShiftData.transferBankActuallyHave,
      });
    }

    // Calculate Lottery shift data if provided
    let lotteryCalculations = null;
    if (lotteryShiftData) {
      lotteryCalculations = calculateLotteryShift({
        amStartTill: lotteryShiftData.amStartTill,
        videoCashIn: lotteryShiftData.videoCashIn,
        onlineSales: lotteryShiftData.onlineSales,
        extraMoneyAdded: lotteryShiftData.extraMoneyAdded,
        extraMoneyAddedDayshift: lotteryShiftData.extraMoneyAddedDayshift,
        extraMoneyAddedNightshift: lotteryShiftData.extraMoneyAddedNightshift,
        onlineValidate: lotteryShiftData.onlineValidate,
        freeTickets: lotteryShiftData.freeTickets,
        scratchItValidate: lotteryShiftData.scratchItValidate,
        miscPayout: lotteryShiftData.miscPayout,
        miscPayoutDayshift: lotteryShiftData.miscPayoutDayshift,
        miscPayoutNightshift: lotteryShiftData.miscPayoutNightshift,
        transferBank: lotteryShiftData.transferBank,
      });
    }

    const shiftReport: ShiftReport = {
      id: existingReport?.id || uuidv4(),
      date,
      shiftType,
      employeeName,
      status: existingReport?.status || 'draft',
      submittedAt: existingReport?.submittedAt,
      submittedBy: existingReport?.submittedBy || user.userId,
      editHistory: existingReport?.editHistory || [],
      atmReport: atmReport || undefined,
      posShiftData: posShiftData
        ? {
            ...posShiftData,
            totalPosSales: posCalculations!.totalPosSales,
            transferBankShouldHave: posCalculations!.transferBankShouldHave,
            overShort: posCalculations!.overShort,
          }
        : undefined,
      barbackTipOut: barbackTipOut || undefined,
      lotteryShiftData: lotteryShiftData
        ? {
            ...lotteryShiftData,
            moneyGivenToPos: lotteryCalculations!.moneyGivenToPos,
            videoValidate: lotteryCalculations!.videoValidate,
            totalLottery: lotteryCalculations!.totalLottery,
            overShort: lotteryCalculations!.overShort,
          }
        : undefined,
      lotteryDraws: lotteryDraws?.filter((d: any) => d.drawAmount > 0),
      transferBankDeposits: transferBankDeposits?.filter(
        (d: any) => d.transferBankAmount > 0 || d.depositAmount > 0
      ),
      transferBankDetails: transferBankDetails || undefined,
    };

    // Add audit trail if edited by manager/admin
    if (existingReport && (user.role === 'manager' || user.role === 'admin')) {
      shiftReport.editHistory!.push({
        editedAt: new Date().toISOString(),
        editedBy: user.userId,
        editedByName: user.email,
        editedByRole: user.role,
        reason: req.body.editReason || 'Manager correction',
      });
    }

    if (existingReport) {
      const updated = updateJsonFile('shiftReports.json', existingReport.id, shiftReport);
      res.status(200).json({ shiftReport: updated });
    } else {
      const reports = readJsonFile<ShiftReport>('shiftReports.json');
      reports.push(shiftReport);
      writeJsonFile('shiftReports.json', reports);
      res.status(201).json({ shiftReport });
    }
  } catch (error: any) {
    console.error('Create shift report error:', error);
    res.status(500).json({ error: 'Failed to create shift report' });
  }
}

export async function submitShiftReport(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user || { userId: 'temp-user', role: 'manager', name: '', email: '' };
    const reports = readJsonFile<ShiftReport>('shiftReports.json');
    const report = reports.find((r) => r.id === id);

    if (!report) {
      return res.status(404).json({ error: 'Shift report not found' });
    }

    // TODO: Enable when authentication is ready
    // EMPLOYEE PROTECTION: Can only submit their own reports
    // if (user.role === 'employee' && user.name !== report.employeeName) {
    //   return res.status(403).json({ error: 'You can only submit your own reports' });
    // }

    if (report.status !== 'draft') {
      return res.status(400).json({ error: 'Report already submitted' });
    }

    const updatedReport = updateJsonFile<ShiftReport>('shiftReports.json', id, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      submittedBy: user.userId,
    } as Partial<ShiftReport>);

    if (!updatedReport) {
      return res.status(404).json({ error: 'Failed to update report' });
    }

    // Update employee totals
    const posOverShort = updatedReport.posShiftData?.overShort || 0;
    const lotteryOverShort = updatedReport.lotteryShiftData?.overShort || 0;

    const employeeTotals = readJsonFile<any>('employeeTotals.json');
    let employeeTotal = employeeTotals.find((t: any) => t.employeeName === report.employeeName);

    if (!employeeTotal) {
      employeeTotal = {
        id: uuidv4(),
        employeeName: report.employeeName,
        totalShortage: 0,
        totalOverage: 0,
        lastUpdated: new Date().toISOString(),
      };
      employeeTotals.push(employeeTotal);
    }

    if (posOverShort < 0) {
      employeeTotal.totalShortage += Math.abs(posOverShort);
    } else if (posOverShort > 0) {
      employeeTotal.totalOverage += posOverShort;
    }

    if (lotteryOverShort < 0) {
      employeeTotal.totalShortage += Math.abs(lotteryOverShort);
    } else if (lotteryOverShort > 0) {
      employeeTotal.totalOverage += lotteryOverShort;
    }

    employeeTotal.lastUpdated = new Date().toISOString();

    const index = employeeTotals.findIndex((t: any) => t.id === employeeTotal.id);
    if (index !== -1) {
      employeeTotals[index] = employeeTotal;
    } else {
      employeeTotals.push(employeeTotal);
    }
    writeJsonFile('employeeTotals.json', employeeTotals);

    // Update daily aggregates
    const aggregates = readJsonFile<any>('dailyAggregates.json');
    let aggregate = aggregates.find((a: any) => a.date === report.date);

    if (!aggregate) {
      aggregate = {
        id: uuidv4(),
        date: report.date,
        totalVideoCashIn: 0,
        totalPosDeposit: 0,
        totalLotteryDeposit: 0,
      };
      aggregates.push(aggregate);
    }

    if (updatedReport.lotteryShiftData?.videoCashIn) {
      aggregate.totalVideoCashIn += updatedReport.lotteryShiftData.videoCashIn;
    }
    if (updatedReport.posShiftData?.transferBankActuallyHave) {
      aggregate.totalPosDeposit += updatedReport.posShiftData.transferBankActuallyHave;
    }
    if (updatedReport.lotteryShiftData?.transferBank) {
      aggregate.totalLotteryDeposit += updatedReport.lotteryShiftData.transferBank;
    }

    const aggIndex = aggregates.findIndex((a: any) => a.id === aggregate.id);
    if (aggIndex !== -1) {
      aggregates[aggIndex] = aggregate;
    } else {
      aggregates.push(aggregate);
    }
    writeJsonFile('dailyAggregates.json', aggregates);

    res.json({ shiftReport: updatedReport });
  } catch (error: any) {
    console.error('Submit shift report error:', error);
    res.status(500).json({ error: 'Failed to submit shift report' });
  }
}

export async function getShiftReports(req: AuthRequest, res: Response) {
  try {
    const { date, shiftType, employeeName, startDate, endDate } = req.query;
    const user = req.user || { role: 'manager', name: '' }; // Temp for development
    let reports = readJsonFile<ShiftReport>('shiftReports.json');

    // TODO: Enable when authentication is ready
    // EMPLOYEE PROTECTION: Employees can only see their own reports
    // if (user.role === 'employee') {
    //   reports = reports.filter((r) => r.employeeName === user.name);
    // }

    // Apply filters
    if (date) {
      reports = reports.filter((r) => r.date === date);
    }
    if (startDate && endDate) {
      reports = reports.filter((r) => r.date >= startDate && r.date <= endDate);
    }
    if (shiftType) {
      reports = reports.filter((r) => r.shiftType === shiftType);
    }
    if (employeeName && user.role !== 'employee') {
      reports = reports.filter((r) => r.employeeName === employeeName);
    }

    reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ reports });
  } catch (error: any) {
    console.error('Get shift reports error:', error);
    res.status(500).json({ error: 'Failed to get shift reports' });
  }
}

export async function getShiftReport(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user || { role: 'manager', name: '' };
    const reports = readJsonFile<ShiftReport>('shiftReports.json');
    const report = reports.find((r) => r.id === id);

    if (!report) {
      return res.status(404).json({ error: 'Shift report not found' });
    }

    // TODO: Enable when authentication is ready
    // EMPLOYEE PROTECTION: Can only view their own reports
    // if (user.role === 'employee' && user.name !== report.employeeName) {
    //   return res.status(403).json({ error: 'You can only view your own reports' });
    // }

    res.json({ report });
  } catch (error: any) {
    console.error('Get shift report error:', error);
    res.status(500).json({ error: 'Failed to get shift report' });
  }
}

// NEW: Get employee's own submissions
export async function getMyReports(req: AuthRequest, res: Response) {
  try {
    let reports = readJsonFile<ShiftReport>('shiftReports.json');

    // Filter to only this employee's reports (when auth is enabled)
    if (req.user && req.user.name) {
      reports = reports.filter((r) => r.employeeName === req.user!.name);
    } else {
      // For now, return sample employee's reports
      reports = reports.filter((r) => r.employeeName === 'John Smith');
    }
    
    // Sort by date descending
    reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ reports });
  } catch (error: any) {
    console.error('Get my reports error:', error);
    res.status(500).json({ error: 'Failed to get your reports' });
  }
}

// NEW: Check if report can be edited (for frontend to disable/enable edit)
export async function checkEditPermission(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user || { role: 'manager', name: '' };
    const reports = readJsonFile<ShiftReport>('shiftReports.json');
    const report = reports.find((r) => r.id === id);

    if (!report) {
      return res.status(404).json({ error: 'Shift report not found' });
    }

    // For now, always allow editing (authentication will enforce later)
    const canEdit = !req.user || user.role === 'manager' || user.role === 'admin';
    
    res.json({ 
      canEdit: canEdit,
      reason: canEdit ? null : 'Editing restricted',
      gracePeriodRemaining: report.submittedAt ? Math.max(0, 10 - (new Date().getTime() - new Date(report.submittedAt).getTime()) / (1000 * 60)) : null
    });
  } catch (error: any) {
    console.error('Check edit permission error:', error);
    res.status(500).json({ error: 'Failed to check edit permission' });
  }
}

export async function getDailyReports(req: Request, res: Response) {
  try {
    const { date } = req.params;
    const reports = readJsonFile<ShiftReport>('shiftReports.json');
    const filtered = reports.filter((r) => r.date === date);
    filtered.sort((a, b) => (a.shiftType === 'day' ? -1 : 1));

    res.json({ reports: filtered });
  } catch (error: any) {
    console.error('Get daily reports error:', error);
    res.status(500).json({ error: 'Failed to get daily reports' });
  }
}
