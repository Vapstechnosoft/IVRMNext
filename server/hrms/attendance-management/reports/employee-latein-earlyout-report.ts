'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { LIEORow } from '@/app/(root)/hrms/attendance-management/reports/employee-lateInEarlyOut-report/_components/columns';
import type { EmployeeLateInEarlyOutReportFilters } from '@/app/(root)/hrms/attendance-management/reports/employee-lateInEarlyOut-report/_components/filters';

export async function getEmployeeLateInEarlyOutReport(filters?: EmployeeLateInEarlyOutReportFilters) {
    const db = createLocalCrud<LIEORow>('attendance:lieo');
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
        const okDateFrom = filters.fromDate ? new Date(r.date) >= new Date(filters.fromDate) : true;
        const okDateTo = filters.toDate ? new Date(r.date) <= new Date(filters.toDate) : true;
        const okQuery =
            filters.allOrIndividual === 'Individual' && filters.query
                ? filters.codeOrName === 'Code'
                    ? r.employeeCode.includes(filters.query)
                    : r.employeeName.toLowerCase().includes(filters.query.toLowerCase())
                : true;
        const okMode = filters.mode
            ? filters.mode === 'Late By'
                ? r.lateBy
                : filters.mode === 'Early Out'
                  ? r.earlyOut
                  : filters.mode === 'Late In Early Out'
                    ? r.lateBy && r.earlyOut
                    : true
            : true;
        return okType && okDept && okDesg && okDateFrom && okDateTo && okQuery && okMode;
    });

    return {
        success: true,
        data: filtered,
        message: 'Data fetched successfully'
    };
}

export async function getEmployeeLateInEarlyOutReportDropdowns() {
    const db = createLocalCrud<LIEORow>('attendance:lieo');
    const data = db.list();

    const types = [...new Set(data.map((d) => d.type).filter(Boolean))];
    const departments = [...new Set(data.map((d) => d.department))];
    const designations = [...new Set(data.map((d) => d.designation))];

    return {
        success: true,
        data: {
            types,
            departments,
            designations
        },
        message: 'Dropdown data fetched successfully'
    };
}

