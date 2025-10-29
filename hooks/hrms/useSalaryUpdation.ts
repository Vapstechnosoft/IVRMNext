'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { deleteSalaryUpdation, getSalaryUpdationList, saveSalaryUpdation } from '@/server/hrms/salary-updation';
import type {
    SalaryUpdationDeleteRequest,
    SalaryUpdationOnloadRequest,
    SalaryUpdationOnloadResponse,
    SalaryUpdationSaveRequest,
    SalaryUpdationSaveResponse
} from '@/types/hrms/salary-updation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch salary updation list
 */
export function useSalaryUpdationList(payload: SalaryUpdationOnloadRequest) {
    return useQuery<SalaryUpdationOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD, payload],
        queryFn: () =>
            getSalaryUpdationList(payload).then((res) => {
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
 * Hook to save salary updation
 */
export function useSaveSalaryUpdation() {
    const queryClient = useQueryClient();

    return useMutation<SalaryUpdationSaveResponse, Error, SalaryUpdationSaveRequest>({
        mutationFn: (data: SalaryUpdationSaveRequest) =>
            saveSalaryUpdation(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data, variables) => {
            toast.success(
                data.retrunMsg ||
                    (variables.HRESU_Id === 0 ? 'Salary updation created successfully!' : 'Salary updation updated successfully!')
            );
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save salary updation.');
        }
    });
}

/**
 * Hook to delete salary updation
 */
export function useDeleteSalaryUpdation() {
    const queryClient = useQueryClient();

    return useMutation<any, Error, SalaryUpdationDeleteRequest>({
        mutationFn: (data: SalaryUpdationDeleteRequest) =>
            deleteSalaryUpdation(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data;
            }),
        onSuccess: () => {
            toast.success('Salary updation deleted successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete salary updation.');
        }
    });
}
