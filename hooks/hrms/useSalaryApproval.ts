'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { approveSalaries, getSalaryApprovalOnload, searchSalaryApprovalEmployees } from '@/server/hrms/salary-approval';
import type {
    SalaryApprovalOnloadRequest,
    SalaryApprovalOnloadResponse,
    SalaryApprovalRequest,
    SalaryApprovalResponse,
    SalaryApprovalSearchRequest,
    SalaryApprovalSearchResponse
} from '@/types/hrms/salary-approval';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch salary approval onload data
 */
export function useSalaryApprovalOnload(payload: SalaryApprovalOnloadRequest) {
    return useQuery<SalaryApprovalOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_ONLOAD, payload],
        queryFn: () =>
            getSalaryApprovalOnload(payload).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!payload.MI_Id
    });
}

/**
 * Hook to search employees for salary approval
 */
export function useSearchSalaryApproval() {
    return useMutation<SalaryApprovalSearchResponse, Error, SalaryApprovalSearchRequest>({
        mutationFn: (data: SalaryApprovalSearchRequest) =>
            searchSalaryApprovalEmployees(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onError: (error) => {
            toast.error(error.message || 'Failed to search employees for approval.');
        }
    });
}

/**
 * Hook to approve/reject salaries
 */
export function useApproveSalaries() {
    const queryClient = useQueryClient();

    return useMutation<SalaryApprovalResponse, Error, SalaryApprovalRequest>({
        mutationFn: (data: SalaryApprovalRequest) =>
            approveSalaries(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data, variables) => {
            if (data.approvedCount > 0) {
                toast.success(
                    data.message || `${data.approvedCount} salary record(s) ${variables.approvalStatus.toLowerCase()} successfully!`
                );
            }
            if (data.failedCount > 0) {
                toast.warning(`Failed to process ${data.failedCount} record(s).`);
            }
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to process salary approval.');
        }
    });
}
