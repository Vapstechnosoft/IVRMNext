'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { LogRow } from '@/app/(root)/hrms/attendance-management/reports/employee-log-report/_components/columns';
import type { LogReportFiltersState } from '@/app/(root)/hrms/attendance-management/reports/employee-log-report/_components/filters';

export async function getEmployeeLogReport(filters?: LogReportFiltersState) {
    const db = createLocalCrud<LogRow & { id: string; createdAt: string }>('attendance:log');
    const data = db.list();

    if (!filters) {
        return {
            success: true,
            data: data,
            message: 'Data fetched successfully'
        };
    }

    const filtered = data.filter((r) => {
        const okType = filters.type && filters.type.length > 0 ? filters.type.includes(r.type) : true;
        const okDept = filters.department && filters.department.length > 0 ? filters.department.includes(r.department) : true;
        const okDesg = filters.designation && filters.designation.length > 0 ? filters.designation.includes(r.designation) : true;
        const okQuery =
            filters.allOrIndividual === 'Individual' && filters.query
                ? filters.codeOrName === 'Code'
                    ? r.employeeCode.includes(filters.query)
                    : r.employeeName.toLowerCase().includes(filters.query.toLowerCase())
                : true;
        const okDate =
            filters.dateMode === 'Date'
                ? filters.date
                    ? r.date === filters.date
                    : true
                : filters.dateMode === 'Monthly'
                  ? filters.month
                      ? r.date.startsWith(filters.month)
                      : true
                  : (filters.fromDate ? new Date(r.date) >= new Date(filters.fromDate) : true) &&
                    (filters.toDate ? new Date(r.date) <= new Date(filters.toDate) : true);
        const okMetric =
            filters.metric === 'Punch Time' ? r.punchTime : filters.metric === 'Late In' ? r.lateIn : r.earlyOut;
        return okType && okDept && okDesg && okQuery && okDate && okMetric;
    });

    return {
        success: true,
        data: filtered,
        message: 'Data fetched successfully'
    };
}

