import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterEarningsDeductions,
    getMasterEarningsDeductionsDetails,
    getMasterEarningsDeductionsList,
    saveMasterEarningsDeductions,
    saveMasterEarningsDeductionsOrder
} from '@/server/hrms/hrmsConfig/master/earnings-deductions';
import type { EarningsDeductionDetail, MasterEarningsDeductionsInput } from '@/types/hrms/master-earnings-deductions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMasterEarningsDeductions(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, roleId],
        queryFn: () => getMasterEarningsDeductionsList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterEarningsDeductionsInput) => saveMasterEarningsDeductions(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
            });
        }
    });

    const toggleActiveMutation = useMutation({
        mutationFn: (data: {
            HRMED_Id: number;
            HRMED_ActiveFlag: boolean;
            MI_Id?: number;
        }) => activateDeactivateMasterEarningsDeductions(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
            });
        }
    });

    const saveOrderMutation = useMutation({
        mutationFn: (earningsDeductions: EarningsDeductionDetail[]) => saveMasterEarningsDeductionsOrder(earningsDeductions),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
            });
        }
    });

    return {
        listQuery,
        saveMutation,
        toggleActiveMutation,
        saveOrderMutation
    };
}

export function useMasterEarningsDeductionsDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, 'details', id],
        queryFn: () => getMasterEarningsDeductionsDetails(id),
        enabled: id > 0
    });
}
