import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { activateDeactivateMasterGender, getMasterGenderList, saveMasterGender } from '@/server/hrms/hrmsConfig/master/gender';
import type { ApiSearchparams } from '@/types';
import type { MasterGenderInput } from '@/types/hrms/master-gender';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterGender = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER, { roleId }],
        queryFn: async () => getMasterGenderList(roleId),
        staleTime: 0
    });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterGenderInput) => saveMasterGender(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER] })
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { IVRMMG_Id: number; IVRMMG_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterGender(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER] });

    return { listQuery, saveMutation, toggleMutation, refetchAll };
};
