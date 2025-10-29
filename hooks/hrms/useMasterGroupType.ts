import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterGroupType,
    getMasterGroupTypeDetails,
    getMasterGroupTypeList,
    saveMasterGroupType,
    saveMasterGroupTypeOrder
} from '@/server/hrms/hrmsConfig/master/group-type';
import type { GroupTypeDetail, MasterGroupTypeInput } from '@/types/hrms/master-group-type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMasterGroupType(roleId: number) {
    const queryClient = useQueryClient();

    // Query: Fetch list of group types
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE, roleId],
        queryFn: () => getMasterGroupTypeList(roleId),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    // Mutation: Save (create/update) group type
    const saveMutation = useMutation({
        mutationFn: (data: MasterGroupTypeInput) => saveMasterGroupType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
            });
        }
    });

    // Mutation: Activate/Deactivate group type
    const toggleActiveMutation = useMutation({
        mutationFn: (data: {
            HRMGT_Id: number;
            HRMGT_ActiveFlag: boolean;
            MI_Id?: number;
        }) => activateDeactivateMasterGroupType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
            });
        }
    });

    // Mutation: Save order of group types
    const saveOrderMutation = useMutation({
        mutationFn: (groupTypes: GroupTypeDetail[]) => saveMasterGroupTypeOrder(groupTypes),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
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

// Hook for fetching group type details by ID
export function useMasterGroupTypeDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE, 'details', id],
        queryFn: () => getMasterGroupTypeDetails(id),
        enabled: id > 0
    });
}
