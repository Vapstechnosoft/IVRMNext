'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { getLeaveReport } from '@/server/hrms/leave-management/reports/leave-report';
import type { LeaveReportFilters } from '@/app/(root)/hrms/leave-management/reports/leave-report/_components/filters';
import { getOverallReport } from '@/server/hrms/leave-management/reports/overall-report';
import type { OverallReportFilters } from '@/app/(root)/hrms/leave-management/reports/overAll-report/_components/filters';
import { getUnauthorizedLeaveCountReport } from '@/server/hrms/leave-management/reports/unauthorized-leave-count-report';
import type { UnauthorizedLeaveCountFilters } from '@/app/(root)/hrms/leave-management/reports/unauthorizedLeaveCount-report/_components/filters';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Leave Report Hook
export const useLeaveReport = (filters?: LeaveReportFilters) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT, filters ?? {}],
            queryFn: async () => getLeaveReport(filters),
            staleTime: 0,
            enabled: !!filters
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT]
            });
        }
    };
};

// Overall Report Hook
export const useOverallReport = (filters?: OverallReportFilters) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.OVERALL_REPORT, filters ?? {}],
            queryFn: async () => getOverallReport(filters),
            staleTime: 0,
            enabled: !!filters
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.OVERALL_REPORT]
            });
        }
    };
};

// Unauthorized Leave Count Report Hook
export const useUnauthorizedLeaveCountReport = (filters?: UnauthorizedLeaveCountFilters) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.UNAUTHORIZED_LEAVE_COUNT_REPORT, filters ?? {}],
            queryFn: async () => getUnauthorizedLeaveCountReport(filters),
            staleTime: 0,
            enabled: !!filters
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.UNAUTHORIZED_LEAVE_COUNT_REPORT]
            });
        }
    };
};

