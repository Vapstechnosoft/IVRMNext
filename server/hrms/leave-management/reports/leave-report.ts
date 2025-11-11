'use server';

import type { LeaveReportRow } from '@/app/(root)/hrms/leave-management/reports/leave-report/_components/columns';
import type { LeaveReportFilters } from '@/app/(root)/hrms/leave-management/reports/leave-report/_components/filters';

export async function getLeaveReport(filters?: LeaveReportFilters) {
    // TODO: Implement when API is ready
    // For now, return mock data based on filters
    if (!filters) {
        return {
            success: true,
            data: [] as LeaveReportRow[],
            message: 'Data fetched successfully'
        };
    }

    // Mock data generation based on filters
    const mockData: LeaveReportRow[] = Array.from({ length: 12 }).map((_, i) => ({
        slNo: i + 1,
        employeeCode: '69',
        employeeName: 'R Siddesh Kumar',
        leaveName: filters.leave === 'All' ? 'Casual Leave' : filters.leave,
        fromDate: filters.fromDate || '2025-01-01',
        toDate: filters.toDate || '2025-01-02',
        appliedDays: 8,
        leaveStatus: 'Approved' as const,
        leaveBalance: 8
    }));

    return {
        success: true,
        data: mockData,
        message: 'Data fetched successfully'
    };
}

