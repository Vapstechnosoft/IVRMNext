'use client';

import { STAFF_PORTAL_QUERY_KEYS } from '@/constants/query-keys';
import { getEmployeeDailyTimetable, getEmployeeTimetableDetails } from '@/server/staff-portal/timetable';
import { useQuery } from '@tanstack/react-query';

export const useEmployeeTimetable = () => {
    return useQuery({
        queryKey: [STAFF_PORTAL_QUERY_KEYS.EMPLOYEE_TIMETABLE],
        queryFn: async () => {
            const resp = await getEmployeeTimetableDetails();
            return resp.data;
        },
        staleTime: 5 * 60 * 1000
    });
};

export const useEmployeeDailyTimetable = (dayId: number | null) => {
    return useQuery({
        queryKey: [STAFF_PORTAL_QUERY_KEYS.EMPLOYEE_DAILY_TIMETABLE, dayId],
        queryFn: async () => {
            if (!dayId) return null;
            const resp = await getEmployeeDailyTimetable(dayId);
            return resp.data;
        },
        enabled: !!dayId
    });
};
