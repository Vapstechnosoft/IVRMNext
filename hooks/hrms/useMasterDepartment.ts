import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterDepartment,
    getDepartmentById,
    getMasterDepartmentList,
    getOnloadDepartmentDetails,
    saveMasterDepartment,
    saveMasterDepartmentOrder
} from '@/server/hrms/hrmsConfig/master/department';
import type { ApiSearchparams } from '@/types';
import type { DepartmentDetail, MasterDepartmentInput } from '@/types/hrms/master-department';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterDepartment = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT, { roleId }],
        queryFn: async () => getMasterDepartmentList(roleId),
        staleTime: 0
    });

    const onloadQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT, 'onload', { roleId }],
        queryFn: async () => getOnloadDepartmentDetails(roleId),
        staleTime: 0
    });

    const getById = (id: number) =>
        useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT, 'byId', id],
            queryFn: async () => getDepartmentById(id),
            enabled: !!id,
            staleTime: 0
        });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterDepartmentInput) => saveMasterDepartment(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] })
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMD_Id: number; HRMD_ActiveFlag: boolean; roleId?: number }) =>
            activateDeactivateMasterDepartment(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] })
    });

    const saveOrderMutation = useMutation({
        mutationFn: (departments: DepartmentDetail[]) => saveMasterDepartmentOrder(departments),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] });

    return { listQuery, onloadQuery, getById, saveMutation, toggleMutation, saveOrderMutation, refetchAll };
};
