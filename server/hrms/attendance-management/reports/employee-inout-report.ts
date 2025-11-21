'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { InOutRow } from '@/app/(root)/hrms/attendance-management/reports/employee-inout-report/_components/columns';
import type { EmployeeInOutReportFilters } from '@/app/(root)/hrms/attendance-management/reports/employee-inout-report/_components/filters';

export async function getEmployeeInOutReport(filters?: EmployeeInOutReportFilters) {
    const db = createLocalCrud<InOutRow>('attendance:inout');
    const data = db.list();

    if (!filters) {
        return {
            success: true,
            data: data,
            message: 'Data fetched successfully'
        };
    }

    const filtered = data.filter((r) => {
        const okBranch = filters.branch ? r.branch === filters.branch : true;
        const okType = filters.type && filters.type.length > 0 ? filters.type.includes(r.type) : true;
        const okDept = filters.department && filters.department.length > 0 ? filters.department.includes(r.department) : true;
        const okDesg = filters.designation && filters.designation.length > 0 ? filters.designation.includes(r.designation) : true;
        const okDateFrom = filters.fromDate ? new Date(r.date) >= new Date(filters.fromDate) : true;
        const okDateTo = filters.toDate ? new Date(r.date) <= new Date(filters.toDate) : true;
        const okQuery =
            filters.allOrIndividual === 'Individual' && filters.query
                ? filters.codeOrName === 'Code'
                    ? r.employeeCode.includes(filters.query)
                    : r.employeeName.toLowerCase().includes(filters.query.toLowerCase())
                : true;
        const okTimeInOut = filters.timeInTimeOut
            ? filters.timeInTimeOut === 'Time In'
                ? r.timeIn
                : filters.timeInTimeOut === 'Time Out'
                  ? r.timeOut
                  : filters.timeInTimeOut === 'In Out'
                    ? r.timeIn && r.timeOut
                    : true
            : true;
        return okBranch && okType && okDept && okDesg && okDateFrom && okDateTo && okQuery && okTimeInOut;
    });

    return {
        success: true,
        data: filtered,
        message: 'Data fetched successfully'
    };
}

export async function getEmployeeInOutReportDropdowns() {
    const db = createLocalCrud<InOutRow>('attendance:inout');
    const data = db.list();

    const branches = [...new Set(data.map((d) => d.branch))];
    const departments = [...new Set(data.map((d) => d.department))];
    const designations = [...new Set(data.map((d) => d.designation))];

    return {
        success: true,
        data: {
            branches,
            departments,
            designations
        },
        message: 'Dropdown data fetched successfully'
    };
}

