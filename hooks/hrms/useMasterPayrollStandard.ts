import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    getMasterPayrollStandardDetails,
    getMasterPayrollStandardList,
    saveMasterPayrollStandard
} from '@/server/hrms/hrmsConfig/master/payroll-standard';
import type { MasterPayrollStandardInput } from '@/types/hrms/master-payroll-standard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMasterPayrollStandard(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD, roleId],
        queryFn: () => getMasterPayrollStandardList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterPayrollStandardInput) => saveMasterPayrollStandard(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD]
            });
        }
    });

    return {
        listQuery,
        saveMutation
    };
}

export function useMasterPayrollStandardDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD, 'details', id],
        queryFn: () => getMasterPayrollStandardDetails(id),
        enabled: id > 0
    });
}
