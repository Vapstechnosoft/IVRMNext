import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterBank,
    getMasterBankDetails,
    getMasterBankList,
    saveMasterBank
} from '@/server/hrms/hrmsConfig/master/bank';
import type { MasterBankInput } from '@/types/hrms/master-bank';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMasterBank(roleId: number) {
    const queryClient = useQueryClient();

    // Query: Fetch list of banks
    // Using global React Query defaults (5 min stale time, no auto-refetch)
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_BANK, roleId],
        queryFn: () => getMasterBankList(roleId)
    });

    // Mutation: Save (create/update) bank
    const saveMutation = useMutation({
        mutationFn: (data: MasterBankInput) => saveMasterBank(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_BANK]
            });
        }
    });

    // Mutation: Activate/Deactivate bank
    const toggleActiveMutation = useMutation({
        mutationFn: (data: {
            HRMBD_Id: number;
            HRMBD_ActiveFlag: boolean;
            MI_Id?: number;
        }) => activateDeactivateMasterBank(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_BANK]
            });
        }
    });

    return {
        listQuery,
        saveMutation,
        toggleActiveMutation
    };
}

// Hook for fetching bank details by ID
export function useMasterBankDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_BANK, 'details', id],
        queryFn: () => getMasterBankDetails(id),
        enabled: id > 0
    });
}
