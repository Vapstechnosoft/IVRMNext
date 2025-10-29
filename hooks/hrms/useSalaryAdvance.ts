'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { deleteSalaryAdvance, getSalaryAdvanceList, saveSalaryAdvance } from '@/server/hrms/salary-advance';
import type {
    SalaryAdvanceDeleteRequest,
    SalaryAdvanceOnloadRequest,
    SalaryAdvanceOnloadResponse,
    SalaryAdvanceSaveRequest,
    SalaryAdvanceSaveResponse
} from '@/types/hrms/salary-advance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch salary advance list with onload data
 */
export function useSalaryAdvanceList(payload: SalaryAdvanceOnloadRequest) {
    return useQuery<SalaryAdvanceOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, payload],
        queryFn: () =>
            getSalaryAdvanceList(payload).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!payload.roleId
    });
}

/**
 * Hook to save salary advance
 */
export function useSaveSalaryAdvance() {
    const queryClient = useQueryClient();

    return useMutation<SalaryAdvanceSaveResponse, Error, SalaryAdvanceSaveRequest>({
        mutationFn: (data: SalaryAdvanceSaveRequest) =>
            saveSalaryAdvance(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data, variables) => {
            if (data.HRESA_Id) {
                toast.success(
                    data.retrunMsg ||
                        (variables.HRESA_Id === 0 ? 'Salary advance created successfully!' : 'Salary advance updated successfully!')
                );
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST]
                });
            } else {
                toast.error(data.retrunMsg || 'Failed to save salary advance.');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save salary advance.');
        }
    });
}

/**
 * Hook to delete salary advance
 */
export function useDeleteSalaryAdvance() {
    const queryClient = useQueryClient();

    return useMutation<any, Error, SalaryAdvanceDeleteRequest>({
        mutationFn: (data: SalaryAdvanceDeleteRequest) =>
            deleteSalaryAdvance(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data;
            }),
        onSuccess: () => {
            toast.success('Salary advance deleted successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete salary advance.');
        }
    });
}
