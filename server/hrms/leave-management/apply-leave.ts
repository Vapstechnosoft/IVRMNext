'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { LeaveBalanceRow, LeaveHistoryRow, ApplyLeave } from '@/app/(root)/hrms/leave-management/apply-leave/_components/columns';

export async function getLeaveBalance() {
    // TODO: Implement when API is ready
    // For now, return mock data
    const mockData: LeaveBalanceRow[] = [
        { leaveType: 'Casual Leave', balance: 8 },
        { leaveType: 'Sick Leave', balance: 6 },
        { leaveType: 'Earned Leave', balance: 12 }
    ];

    return {
        success: true,
        data: mockData,
        message: 'Data fetched successfully'
    };
}

export async function getLeaveHistory() {
    // TODO: Implement when API is ready
    // For now, return mock data
    const db = createLocalCrud<LeaveHistoryRow>('leaveHistory');
    const data = db.list();

    return {
        success: true,
        data: data,
        message: 'Data fetched successfully'
    };
}

export async function applyLeave(leaveApplication: ApplyLeave) {
    // TODO: Implement when API is ready
    // For now, save to local storage
    const db = createLocalCrud<LeaveHistoryRow>('leaveHistory');
    
    const historyEntry = db.create({
        leaveType: leaveApplication.leaveType,
        fromDate: leaveApplication.fromDate,
        toDate: leaveApplication.toDate,
        days: leaveApplication.numDays,
        status: 'Applied' as const
    });

    return {
        success: true,
        data: historyEntry,
        message: 'Leave application submitted successfully'
    };
}

