'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { getLeaveBalance, getLeaveHistory, applyLeave } from '@/server/hrms/leave-management/apply-leave';
import type { ApplyLeave } from '@/app/(root)/hrms/leave-management/apply-leave/_components/columns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Leave Balance Hook
export const useLeaveBalance = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_BALANCE],
            queryFn: async () => getLeaveBalance(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_BALANCE]
            });
        }
    };
};

// Leave History Hook
export const useLeaveHistory = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_HISTORY],
            queryFn: async () => getLeaveHistory(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_HISTORY]
            });
        }
    };
};

// Apply Leave Hook
export const useApplyLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (leaveApplication: ApplyLeave) => applyLeave(leaveApplication),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_HISTORY] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to submit leave application');
        }
    });
};

