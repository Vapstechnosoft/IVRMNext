'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { YearRow } from '@/app/(root)/hrms/attendance-management/reports/employee-yearly-report/_components/columns';
import type { EmployeeYearlyReportFilters } from '@/app/(root)/hrms/attendance-management/reports/employee-yearly-report/_components/filters';

export async function getEmployeeYearlyReport(filters?: EmployeeYearlyReportFilters) {
    const db = createLocalCrud<YearRow>('attendance:year');
    const data = db.list();

    if (!filters) {
        return {
            success: true,
            data: data,
            message: 'Data fetched successfully'
        };
    }

    const filtered = data.filter((r: any) => {
        const okType = filters.type && filters.type.length > 0 ? filters.type.includes(r.type) : true;
        const okDept = filters.department && filters.department.length > 0 ? filters.department.includes(r.department) : true;
        const okDesg = filters.designation && filters.designation.length > 0 ? filters.designation.includes(r.designation) : true;
        const okEmp = filters.allOrIndividual === 'Individual' && filters.employee ? r.employeeName === filters.employee : true;
        const okDateFrom = filters.fromDate ? new Date(r.dateOfJoining) >= new Date(filters.fromDate) : true;
        const okDateTo = filters.toDate ? new Date(r.dateOfJoining) <= new Date(filters.toDate) : true;
        return okType && okDept && okDesg && okEmp && okDateFrom && okDateTo;
    });

    return {
        success: true,
        data: filtered,
        message: 'Data fetched successfully'
    };
}

export async function getEmployeeYearlyReportDropdowns() {
    const db = createLocalCrud<YearRow>('attendance:year');
    const data = db.list();

    const employees = [...new Set(data.map((d) => d.employeeName))];
    const types = [...new Set(data.map((d: any) => d.type).filter(Boolean))];
    const departments = [...new Set(data.map((d: any) => d.department).filter(Boolean))];
    const designations = [...new Set(data.map((d) => d.designation).filter(Boolean))];

    return {
        success: true,
        data: {
            employees,
            types,
            departments,
            designations
        },
        message: 'Dropdown data fetched successfully'
    };
}

