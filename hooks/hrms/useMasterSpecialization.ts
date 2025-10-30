import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterSpecialization,
    getMasterSpecializationDetails,
    getMasterSpecializationList,
    saveMasterSpecialization
} from '@/server/hrms/hrmsConfig/master/specialization';
import type { MasterSpecializationInput } from '@/types/hrms/master-specialization';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMasterSpecialization(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION, roleId],
        queryFn: () => getMasterSpecializationList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterSpecializationInput) => saveMasterSpecialization(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION]
            });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMSPL_Id: number; HRMSPL_ActiveFlg: boolean; MI_Id?: number }) =>
            activateDeactivateMasterSpecialization(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION]
            });
        }
    });

    return {
        listQuery,
        saveMutation,
        toggleMutation
    };
}

export function useMasterSpecializationDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION, 'details', id],
        queryFn: () => getMasterSpecializationDetails(id),
        enabled: id > 0
    });
}
