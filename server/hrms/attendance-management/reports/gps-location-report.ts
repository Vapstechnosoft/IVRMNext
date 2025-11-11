'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { GPSLog } from '@/app/(root)/hrms/attendance-management/reports/gps-location-report/_components/columns';
import type { GPSLocationReportFilters } from '@/app/(root)/hrms/attendance-management/reports/gps-location-report/_components/filters';

export async function getGPSLocationReport(filters?: GPSLocationReportFilters) {
    const db = createLocalCrud<GPSLog>('attendance:gps-location-attendance');
    const data = db.list();

    if (!filters) {
        return {
            success: true,
            data: data,
            message: 'Data fetched successfully'
        };
    }

    const filtered = data.filter((r) => {
        if (filters.filterType === 'Employee Wise') {
            return filters.employee ? r.employeeName === filters.employee : false;
        } else {
            const okFrom = filters.fromDate ? new Date(r.gpsDate) >= new Date(filters.fromDate) : true;
            const okTo = filters.toDate ? new Date(r.gpsDate) <= new Date(filters.toDate) : true;
            return okFrom && okTo;
        }
    });

    return {
        success: true,
        data: filtered,
        message: 'Data fetched successfully'
    };
}

export async function getGPSLocationReportDropdowns() {
    const db = createLocalCrud<GPSLog>('attendance:gps-location-attendance');
    const data = db.list();

    const employees = [...new Set(data.map((d) => d.employeeName))];

    return {
        success: true,
        data: {
            employees
        },
        message: 'Dropdown data fetched successfully'
    };
}

