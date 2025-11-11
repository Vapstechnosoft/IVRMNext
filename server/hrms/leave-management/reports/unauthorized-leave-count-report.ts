'use server';

import type { UnauthorizedLeaveCountRow } from '@/app/(root)/hrms/leave-management/reports/unauthorizedLeaveCount-report/_components/columns';
import type { UnauthorizedLeaveCountFilters } from '@/app/(root)/hrms/leave-management/reports/unauthorizedLeaveCount-report/_components/filters';

export async function getUnauthorizedLeaveCountReport(filters?: UnauthorizedLeaveCountFilters) {
    // TODO: Implement when API is ready
    // For now, return mock data based on filters
    if (!filters) {
        return {
            success: true,
            data: [] as UnauthorizedLeaveCountRow[],
            message: 'Data fetched successfully'
        };
    }

    // Mock data generation based on filters
    let mockData: UnauthorizedLeaveCountRow[] = [];

    if (filters.detailLevel === 'Only Count') {
        mockData = [
            {
                slNo: 1,
                companyOrDept: filters.mode === 'Company Wise' ? 'VKS' : 'Hardware and Network',
                unauthorizedLeaveCount: 100
            }
        ];
    } else {
        mockData = [
            { slNo: 1, employeeName: 'Sarath Kumar A J', absentDate: '2025-01-05' },
            { slNo: 2, employeeName: 'Priyanka Ashok Shilke', absentDate: '2025-01-12' }
        ];
    }

    return {
        success: true,
        data: mockData,
        message: 'Data fetched successfully'
    };
}

