'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { deleteSalaryIncrement, getSalaryIncrementOnload, saveSalaryIncrement } from '@/server/hrms/salary-increment';
import type {
    SalaryIncrementDeleteRequest,
    SalaryIncrementDeleteResponse,
    SalaryIncrementOnloadRequest,
    SalaryIncrementOnloadResponse,
    SalaryIncrementSaveRequest,
    SalaryIncrementSaveResponse
} from '@/types/hrms/salary-increment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch salary increment onload data
 */
export function useSalaryIncrementOnload(payload: SalaryIncrementOnloadRequest) {
    return useQuery<SalaryIncrementOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD, payload],
        queryFn: () =>
            getSalaryIncrementOnload(payload).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!payload.MI_Id && !!payload.roleId
    });
}

/**
 * Hook to save salary increment
 */
export function useSaveSalaryIncrement() {
    const queryClient = useQueryClient();

    return useMutation<SalaryIncrementSaveResponse, Error, SalaryIncrementSaveRequest>({
        mutationFn: (data: SalaryIncrementSaveRequest) =>
            saveSalaryIncrement(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data, variables) => {
            toast.success(
                data.retrunMsg ||
                    (variables.HREIC_Id === 0 ? 'Salary increment created successfully!' : 'Salary increment updated successfully!')
            );
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save salary increment.');
        }
    });
}

/**
 * Hook to delete salary increment
 */
export function useDeleteSalaryIncrement() {
    const queryClient = useQueryClient();

    return useMutation<SalaryIncrementDeleteResponse, Error, SalaryIncrementDeleteRequest>({
        mutationFn: (data: SalaryIncrementDeleteRequest) =>
            deleteSalaryIncrement(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: () => {
            toast.success('Salary increment deleted successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete salary increment.');
        }
    });
}
