'use server';

import { createLocalCrud } from '@/lib/localdb';
import type { MasterHoliday } from '@/app/(root)/hrms/attendance-management/masters/master-holiday/_components/columns';
import type { HolidayReportRow } from '@/app/(root)/hrms/attendance-management/reports/holiday-report/_components/columns';
import type { HolidayReportFilters } from '@/app/(root)/hrms/attendance-management/reports/holiday-report/_components/filters';

export async function getHolidayReport(filters?: HolidayReportFilters) {
    const holidayDB = createLocalCrud<MasterHoliday>('master:holiday');
    const allHolidays = holidayDB.list();

    if (!filters) {
        return {
            success: true,
            data: [] as HolidayReportRow[],
            message: 'Data fetched successfully'
        };
    }

    const filtered = allHolidays
        .filter((holiday) => {
            const okYear = filters.calendarYear ? holiday.calendarYear === filters.calendarYear : true;
            const okType = filters.holidayType ? holiday.holidayType === filters.holidayType : true;
            return okYear && okType;
        })
        .map((holiday) => ({
            id: holiday.id,
            createdAt: holiday.createdAt,
            calendarYear: holiday.calendarYear,
            department: holiday.department,
            holidayType: holiday.holidayType,
            name: holiday.name,
            fromDate: holiday.fromDate,
            toDate: holiday.toDate,
            isActive: holiday.isActive
        })) as HolidayReportRow[];

    return {
        success: true,
        data: filtered,
        message: 'Data fetched successfully'
    };
}

