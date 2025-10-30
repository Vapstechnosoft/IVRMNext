import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { activateDeactivateMasterMaritalStatus, getMasterMaritalStatusList, saveMasterMaritalStatus } from '@/server/hrms/hrmsConfig/master/marital-status';
import type { ApiSearchparams } from '@/types';
import type { MasterMaritalStatusInput } from '@/types/hrms/master-marital-status';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterMaritalStatus = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS, { roleId }],
        queryFn: async () => getMasterMaritalStatusList(roleId),
        staleTime: 0
    });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterMaritalStatusInput) => saveMasterMaritalStatus(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] })
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { IVRMMMS_Id: number; IVRMMMS_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterMaritalStatus(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] });

    return { listQuery, saveMutation, toggleMutation, refetchAll };
};
