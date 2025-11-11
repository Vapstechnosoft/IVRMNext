'use server';

import type { OverallReportRow } from '@/app/(root)/hrms/leave-management/reports/overAll-report/_components/columns';
import type { OverallReportFilters } from '@/app/(root)/hrms/leave-management/reports/overAll-report/_components/filters';

export async function getOverallReport(filters?: OverallReportFilters) {
    // TODO: Implement when API is ready
    // For now, return mock data based on filters
    if (!filters) {
        return {
            success: true,
            data: [] as OverallReportRow[],
            message: 'Data fetched successfully'
        };
    }

    // Mock data generation based on filters
    const mockData: OverallReportRow[] = [
        {
            employee: 'Steffi Halian',
            leaveName: 'Sick Leave',
            fromDate: filters.fromDate || '2025-01-03',
            toDate: filters.toDate || '2025-01-04',
            status: filters.status
        },
        {
            employee: 'Shruthi NA',
            leaveName: 'Casual Leave',
            fromDate: filters.fromDate || '2025-02-10',
            toDate: filters.toDate || '2025-02-11',
            status: filters.status
        }
    ];

    return {
        success: true,
        data: mockData,
        message: 'Data fetched successfully'
    };
}

