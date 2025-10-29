import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterDesignation,
    getDesignationById,
    getMasterDesignationList,
    getOnchangeDesignationDetails,
    getOnloadDesignationDetails,
    saveMasterDesignation,
    saveMasterDesignationOrder
} from '@/server/hrms/hrmsConfig/master/designation';
import type { ApiSearchparams } from '@/types';
import type { DesignationDetail, MasterDesignationInput } from '@/types/hrms/master-designation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterDesignation = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION, { roleId }],
        queryFn: async () => getMasterDesignationList(roleId),
        staleTime: 0
    });

    const onloadQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION, 'onload', { roleId }],
        queryFn: async () => getOnloadDesignationDetails(roleId),
        staleTime: 0
    });

    const getById = (id: number) =>
        useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION, 'byId', id],
            queryFn: async () => getDesignationById(id),
            enabled: !!id,
            staleTime: 0
        });

    const onchangeMutation = useMutation({
        mutationFn: ({ designationId }: { designationId: number }) => getOnchangeDesignationDetails(designationId, roleId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] })
    });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterDesignationInput) => saveMasterDesignation(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] })
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMDES_Id: number; HRMDES_ActiveFlag: boolean; roleId?: number }) =>
            activateDeactivateMasterDesignation(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] })
    });

    const saveOrderMutation = useMutation({
        mutationFn: (designations: DesignationDetail[]) => saveMasterDesignationOrder(designations),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] });

    return { listQuery, onloadQuery, getById, onchangeMutation, saveMutation, toggleMutation, saveOrderMutation, refetchAll };
};
