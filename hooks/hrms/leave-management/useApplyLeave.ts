'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApplyLeave, LeaveHistoryRow } from '@/app/(root)/hrms/leave-management/apply-leave/_components/columns';

// Extend ApplyLeave with BaseEntity fields for storage
type ApplyLeaveWithEntity = ApplyLeave & {
    id: number;
    createdAt: Date;
};

const getStorageKey = () => 'localdb_leaveHistory';

const loadData = (): LeaveHistoryRow[] => {
    try {
        const data = localStorage.getItem(getStorageKey());
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
        return [];
    }
};

const saveData = (data: LeaveHistoryRow[]): void => {
    try {
        localStorage.setItem(getStorageKey(), JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
    }
};

export function useLeaveHistory() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_HISTORY],
            queryFn: async () => {
                return {
                    success: true,
                    data: loadData(),
                    message: 'Leave history fetched successfully'
                };
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_HISTORY]
            });
        }
    };
}

export function useApplyLeave() {
    const queryClient = useQueryClient();

    return useMutation<
        { success: boolean; data: LeaveHistoryRow; message: string },
        Error,
        ApplyLeave
    >({
        mutationFn: async (data: ApplyLeave) => {
            const history = loadData();
            const newLeave: LeaveHistoryRow = {
                leaveType: data.leaveType || '',
                fromDate: data.fromDate || '',
                toDate: data.toDate || '',
                noOfDays: data.numDays,
                days: data.numDays,
                status: 'Applied',
                remark: data.reason || ''
            };
            history.push(newLeave);
            saveData(history);
            return {
                success: true,
                data: newLeave,
                message: 'Leave applied successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.LEAVE_HISTORY]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to apply leave');
        }
    });
}

