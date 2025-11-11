'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { InOutRow } from '@/app/(root)/hrms/attendance-management/reports/employee-inout-report/_components/columns';
import type { EmployeeAbsentReportRow } from '@/app/(root)/hrms/attendance-management/reports/employee-absent-report/_components/columns';
import type { EmployeeAbsentReportFilters } from '@/app/(root)/hrms/attendance-management/reports/employee-absent-report/_components/filters';

export async function getEmployeeAbsentReport(filters?: EmployeeAbsentReportFilters) {
    const db = createLocalCrud<InOutRow>('attendance:inout');
    const data = db.list();

    if (!filters) {
        return {
            success: true,
            data: [] as EmployeeAbsentReportRow[],
            message: 'Data fetched successfully'
        };
    }

    // Group by employee and calculate absent days
    const employeeMap = new Map<string, EmployeeAbsentReportRow>();

    data.forEach((record) => {
        // Filter by type
        const okType = filters.type.length === 0 || filters.type.includes(record.type);
        // Filter by department
        const okDept = filters.department.length === 0 || filters.department.includes(record.department);
        // Filter by designation
        const okDesg = filters.designation.length === 0 || filters.designation.includes(record.designation);
        // Filter by date range
        const okDateFrom = filters.fromDate ? new Date(record.date) >= new Date(filters.fromDate) : true;
        const okDateTo = filters.toDate ? new Date(record.date) <= new Date(filters.toDate) : true;
        // Filter by employee if Individual is selected
        const okEmp =
            filters.allOrIndividual === 'All' ||
            (filters.allOrIndividual === 'Individual' && filters.employee ? record.employeeName === filters.employee : false);

        if (okType && okDept && okDesg && okDateFrom && okDateTo && okEmp) {
            const key = `${record.employeeCode}-${record.employeeName}`;
            if (!employeeMap.has(key)) {
                employeeMap.set(key, {
                    id: record.id,
                    createdAt: record.createdAt,
                    employeeCode: record.employeeCode,
                    employeeName: record.employeeName,
                    designation: record.designation,
                    totalAbsent: 0
                });
            }
        }
    });

    // For this mock, we'll assume absence is when there's no attendance record
    // In a real scenario, you'd need to compare with expected working days
    const result = Array.from(employeeMap.values()).map((emp) => ({
        ...emp,
        totalAbsent: 1 // Mock value - in real scenario calculate actual absent days
    }));

    return {
        success: true,
        data: result,
        message: 'Data fetched successfully'
    };
}

export async function getEmployeeAbsentReportDropdowns() {
    const db = createLocalCrud<InOutRow>('attendance:inout');
    const data = db.list();

    const types = [...new Set(data.map((d) => d.type).filter(Boolean))];
    const departments = [...new Set(data.map((d) => d.department).filter(Boolean))];
    const designations = [...new Set(data.map((d) => d.designation).filter(Boolean))];
    const employees = [...new Set(data.map((d) => d.employeeName).filter(Boolean))];

    return {
        success: true,
        data: {
            types,
            departments,
            designations,
            employees
        },
        message: 'Dropdown data fetched successfully'
    };
}

