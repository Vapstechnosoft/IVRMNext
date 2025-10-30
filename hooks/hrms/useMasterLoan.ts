import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { activateDeactivateMasterLoan, getMasterLoanDetails, getMasterLoanList, saveMasterLoan } from '@/server/hrms/hrmsConfig/master/loan';
import type { MasterLoanInput } from '@/types/hrms/master-loan';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMasterLoan(roleId: number) {
    const queryClient = useQueryClient();

    // Query: Fetch list of loans
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN, roleId],
        queryFn: () => getMasterLoanList(roleId),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    // Mutation: Save (create/update) loan
    const saveMutation = useMutation({
        mutationFn: (data: MasterLoanInput) => saveMasterLoan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN]
            });
        }
    });

    // Mutation: Activate/Deactivate loan
    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMLN_Id: number; HRMLN_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterLoan(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN]
            });
        }
    });

    return {
        listQuery,
        saveMutation,
        toggleMutation
    };
}

// Hook for fetching loan details by ID
export function useMasterLoanDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN, 'details', id],
        queryFn: () => getMasterLoanDetails(id),
        enabled: id > 0
    });
}
