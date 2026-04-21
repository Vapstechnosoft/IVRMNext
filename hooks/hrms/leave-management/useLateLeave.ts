'use client';
import { useQueries, useMutation } from '@tanstack/react-query';
import { getLateLeaveReport, submitLateLeave } from '@/server/hrms/leave-management/reports/lateLeave-report';
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { SubmitLateLeaveRequest } from '@/server/hrms/leave-management/reports/lateLeave-report';

export function useLateLeaveReport(page: number = 1, pageSize: number = 10) {
    return useQueries({
        queries: [
            {
                queryKey: [HRMS_QUERY_KEYS.LATE_LEAVE_REPORT, page, pageSize],
                queryFn:() => getLateLeaveReport(page, pageSize),
                staleTime: 0
            }
        ]
    })
}

export function useSubmitLateLeave() {
    return useMutation({
        mutationFn:(data: SubmitLateLeaveRequest) => submitLateLeave(data),
        onError:(error: any) => {
            return error;
        },
        // onSuccess:(data: any) => {
        //     return data;
        // }
    });
}