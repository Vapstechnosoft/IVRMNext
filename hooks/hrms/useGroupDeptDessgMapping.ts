'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateGroupDeptDessgMapping,
    getGroupDeptDessgMappingList,
    saveGroupDeptDessgMapping
} from '@/server/hrms/hrmsConfig/master/group-dept-dessg-mapping';
import type { GroupDeptDessgMappingInput } from '@/types/hrms/group-dept-dessg-mapping';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch group dept dessg mapping list with dropdowns
 */
export function useGroupDeptDessgMapping() {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING],
        queryFn: () => getGroupDeptDessgMappingList(0),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

/**
 * Hook to create or update group dept dessg mapping
 */
export function useSaveGroupDeptDessgMapping() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: GroupDeptDessgMappingInput) => saveGroupDeptDessgMapping(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Mapping saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
                });
            } else {
                toast.error(response.message || 'Failed to save mapping');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving mapping');
        }
    });
}

/**
 * Hook to activate/deactivate group dept dessg mapping
 */
export function useActivateDeactivateGroupDeptDessgMapping() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { HRGTDDS_Id: number; HRGTDDS_ActiveFlg: boolean }) => activateDeactivateGroupDeptDessgMapping(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Mapping status updated successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
                });
            } else {
                toast.error(response.message || 'Failed to update mapping status');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while updating mapping status');
        }
    });
}
