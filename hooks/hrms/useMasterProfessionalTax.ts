import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterProfessionalTax,
    getMasterProfessionalTaxDetails,
    getMasterProfessionalTaxList,
    saveMasterProfessionalTax
} from '@/server/hrms/hrmsConfig/master/professional-tax';
import type { MasterProfessionalTaxInput } from '@/types/hrms/master-professional-tax';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMasterProfessionalTax(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX, roleId],
        queryFn: () => getMasterProfessionalTaxList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterProfessionalTaxInput) => saveMasterProfessionalTax(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX]
            });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMPT_Id: number; HRMPT_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterProfessionalTax(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX]
            });
        }
    });

    return {
        listQuery,
        saveMutation,
        toggleMutation
    };
}

export function useMasterProfessionalTaxDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX, 'details', id],
        queryFn: () => getMasterProfessionalTaxDetails(id),
        enabled: id > 0
    });
}
