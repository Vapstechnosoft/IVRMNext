
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getInitialLeaveData,
    getLeaveHistory,
    applyLeave,
    cancelLeave
} from '@/server/staff-portal/online-leave';
import { ILeaveBalance, ILeaveApplicationRequest } from '@/types/staff-portal/online-leave';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { getMasterLeave } from '@/server/hrms/leave-management/masters/master-leave';

export function useOnlineLeave() {
    const queryClient = useQueryClient();

    // 1. Queries
    const { data: initialData, isLoading: isInitLoading } = useQuery({
        queryKey: ['online-leave-initial'],
        queryFn: () => getInitialLeaveData(1207), // Using 1207 as requested
    });

    const { data: masterLeaveData, isLoading: isMasterLoading } = useQuery({
        queryKey: ['master-leave-list'],
        queryFn: () => getMasterLeave(),
    });

    const { data: historyData, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['online-leave-history'],
        queryFn: () => getLeaveHistory(1207),
    });

    // 2. Mutations
    const applyMutation = useMutation({
        mutationFn: (payload: ILeaveApplicationRequest) => applyLeave(payload),
        onSuccess: (res: any) => {
            if (res.success) {
                toast.success(res.message || 'Leave applied successfully');
                queryClient.invalidateQueries({ queryKey: ['online-leave-history'] });
                queryClient.invalidateQueries({ queryKey: ['online-leave-initial'] });
            } else {
                toast.error(res.message || 'Failed to apply leave');
            }
        },
        onError: (err: any) => toast.error(err.message || 'An error occurred while applying leave'),
    });

    const cancelMutation = useMutation({
        mutationFn: (id: number) => cancelLeave(id),
        onSuccess: (res: any) => {
            if (res.success) {
                toast.success(res.message || 'Leave cancelled successfully');
                queryClient.invalidateQueries({ queryKey: ['online-leave-history'] });
                queryClient.invalidateQueries({ queryKey: ['online-leave-initial'] });
            } else {
                toast.error(res.message || 'Failed to cancel leave');
            }
        },
        onError: (err: any) => toast.error(err.message || 'An error occurred while cancelling leave'),
    });

    return {
        initialData,
        masterLeaveData,
        historyData,
        isLoading: isInitLoading || isHistoryLoading || isMasterLoading,
        applyMutation,
        cancelMutation
    };
}
