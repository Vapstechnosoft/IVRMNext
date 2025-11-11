'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { getEmployeeInOutReport, getEmployeeInOutReportDropdowns } from '@/server/hrms/attendance-management/reports/employee-inout-report';
import type { EmployeeInOutReportFilters } from '@/app/(root)/hrms/attendance-management/reports/employee-inout-report/_components/filters';
import { getEmployeeAbsentReport, getEmployeeAbsentReportDropdowns } from '@/server/hrms/attendance-management/reports/employee-absent-report';
import type { EmployeeAbsentReportFilters } from '@/app/(root)/hrms/attendance-management/reports/employee-absent-report/_components/filters';
import { getEmployeeLateInEarlyOutReport, getEmployeeLateInEarlyOutReportDropdowns } from '@/server/hrms/attendance-management/reports/employee-latein-earlyout-report';
import type { EmployeeLateInEarlyOutReportFilters } from '@/app/(root)/hrms/attendance-management/reports/employee-lateInEarlyOut-report/_components/filters';
import { getEmployeeLogReport } from '@/server/hrms/attendance-management/reports/employee-log-report';
import type { LogReportFiltersState } from '@/app/(root)/hrms/attendance-management/reports/employee-log-report/_components/filters';
import { getEmployeeYearlyReport, getEmployeeYearlyReportDropdowns } from '@/server/hrms/attendance-management/reports/employee-yearly-report';
import type { EmployeeYearlyReportFilters } from '@/app/(root)/hrms/attendance-management/reports/employee-yearly-report/_components/filters';
import { getGPSLocationReport, getGPSLocationReportDropdowns } from '@/server/hrms/attendance-management/reports/gps-location-report';
import type { GPSLocationReportFilters } from '@/app/(root)/hrms/attendance-management/reports/gps-location-report/_components/filters';
import { getHolidayReport } from '@/server/hrms/attendance-management/reports/holiday-report';
import type { HolidayReportFilters } from '@/app/(root)/hrms/attendance-management/reports/holiday-report/_components/filters';
import { getFOMonthEndReport } from '@/server/hrms/attendance-management/reports/fo-monthend-report';
import type { FOMonthEndReportFilters } from '@/app/(root)/hrms/attendance-management/reports/fo-monthend-report/_components/filters';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Employee In/Out Report
export const useEmployeeInOutReport = (filters?: EmployeeInOutReportFilters) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT, filters ?? {}],
            queryFn: async () => getEmployeeInOutReport(filters),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT]
            });
        }
    };
};

export const useEmployeeInOutReportDropdowns = () => {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT, 'dropdowns'],
        queryFn: async () => getEmployeeInOutReportDropdowns(),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};

// Employee Absent Report
export const useEmployeeAbsentReport = (filters?: EmployeeAbsentReportFilters) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ABSENT_REPORT, filters ?? {}],
            queryFn: async () => getEmployeeAbsentReport(filters),
            staleTime: 0,
            enabled: !!filters
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ABSENT_REPORT]
            });
        }
    };
};

export const useEmployeeAbsentReportDropdowns = () => {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ABSENT_REPORT, 'dropdowns'],
        queryFn: async () => getEmployeeAbsentReportDropdowns(),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};

// Employee Late In Early Out Report
export const useEmployeeLateInEarlyOutReport = (filters?: EmployeeLateInEarlyOutReportFilters) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT, filters ?? {}],
            queryFn: async () => getEmployeeLateInEarlyOutReport(filters),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT]
            });
        }
    };
};

export const useEmployeeLateInEarlyOutReportDropdowns = () => {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT, 'dropdowns'],
        queryFn: async () => getEmployeeLateInEarlyOutReportDropdowns(),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};

// Employee Log Report
export const useEmployeeLogReport = (filters?: LogReportFiltersState) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOG_REPORT, filters ?? {}],
            queryFn: async () => getEmployeeLogReport(filters),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOG_REPORT]
            });
        }
    };
};

// Employee Yearly Report
export const useEmployeeYearlyReport = (filters?: EmployeeYearlyReportFilters) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_YEARLY_REPORT, filters ?? {}],
            queryFn: async () => getEmployeeYearlyReport(filters),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_YEARLY_REPORT]
            });
        }
    };
};

export const useEmployeeYearlyReportDropdowns = () => {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_YEARLY_REPORT, 'dropdowns'],
        queryFn: async () => getEmployeeYearlyReportDropdowns(),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};

// GPS Location Report
export const useGPSLocationReport = (filters?: GPSLocationReportFilters) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.GPS_LOCATION_REPORT, filters ?? {}],
            queryFn: async () => getGPSLocationReport(filters),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.GPS_LOCATION_REPORT]
            });
        }
    };
};

export const useGPSLocationReportDropdowns = () => {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.GPS_LOCATION_REPORT, 'dropdowns'],
        queryFn: async () => getGPSLocationReportDropdowns(),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};

// Holiday Report
export const useHolidayReport = (filters?: HolidayReportFilters) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.HOLIDAY_REPORT, filters ?? {}],
            queryFn: async () => getHolidayReport(filters),
            staleTime: 0,
            enabled: !!filters?.calendarYear && !!filters?.holidayType
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.HOLIDAY_REPORT]
            });
        }
    };
};

// FO Month End Report
export const useFOMonthEndReport = (filters?: FOMonthEndReportFilters) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.FO_MONTHEND_REPORT, filters ?? {}],
            queryFn: async () => getFOMonthEndReport(filters),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.FO_MONTHEND_REPORT]
            });
        }
    };
};

