import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterEmployeeType,
    getMasterEmployeeTypeList,
    saveMasterEmployeeType
} from '@/server/hrms/hrmsConfig/master/employee-type';
import type { ApiSearchparams } from '@/types';
import type { MasterEmployeeTypeInput } from '@/types/hrms/master-employee-type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterEmployeeType = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE, { roleId }],
        queryFn: async () => getMasterEmployeeTypeList(roleId),
        staleTime: 0
    });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterEmployeeTypeInput) => saveMasterEmployeeType(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] })
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMET_Id: number; HRMET_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterEmployeeType(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] });

    return { listQuery, saveMutation, toggleMutation, refetchAll };
};
