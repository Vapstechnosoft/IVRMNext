'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { getEmployeeLoanList, saveEmployeeLoan } from '@/server/hrms/employee-loan';
import type {
    EmployeeLoanDeleteRequest,
    EmployeeLoanOnloadRequest,
    EmployeeLoanOnloadResponse,
    EmployeeLoanSaveRequest,
    EmployeeLoanSaveResponse
} from '@/types/hrms/employee-loan';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch employee loan list with onload data
 */
export function useEmployeeLoanList(payload: EmployeeLoanOnloadRequest) {
    return useQuery<EmployeeLoanOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, payload],
        queryFn: () =>
            getEmployeeLoanList(payload.roleId ?? 30).then((res: any) => {
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
 * Hook to save employee loan
 */
export function useSaveEmployeeLoan() {
    const queryClient = useQueryClient();

    return useMutation<EmployeeLoanSaveResponse, Error, EmployeeLoanSaveRequest>({
        mutationFn: (data: EmployeeLoanSaveRequest) =>
            saveEmployeeLoan(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data, variables) => {
            if (data.emploanList || data.HREL_Id) {
                toast.success(
                    data.retrunMsg ||
                        (variables.HREL_Id === 0 ? 'Employee loan created successfully!' : 'Employee loan updated successfully!')
                );
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST]
                });
            } else {
                toast.error(data.retrunMsg || 'Failed to save employee loan.');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save employee loan.');
        }
    });
}

/**
 * Hook to delete employee loan
 */
export function useDeleteEmployeeLoan() {
    const queryClient = useQueryClient();

    return useMutation<any, Error, EmployeeLoanDeleteRequest>({
        mutationFn: async (_data: EmployeeLoanDeleteRequest) => ({}) as any,
        onSuccess: () => {
            toast.success('Employee loan deleted successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete employee loan.');
        }
    });
}
