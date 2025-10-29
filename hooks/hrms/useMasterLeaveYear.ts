import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterLeaveYear,
    getMasterLeaveYearDetails,
    getMasterLeaveYearList,
    saveMasterLeaveYear,
    saveMasterLeaveYearOrder
} from '@/server/hrms/hrmsConfig/master/leave-year';
import type { LeaveYearDetail, MasterLeaveYearInput } from '@/types/hrms/master-leave-year';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMasterLeaveYear(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR, roleId],
        queryFn: () => getMasterLeaveYearList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterLeaveYearInput) => saveMasterLeaveYear(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        }
    });

    const toggleActiveMutation = useMutation({
        mutationFn: (data: {
            HRMLY_Id: number;
            HRMLY_ActiveFlag: boolean;
            MI_Id?: number;
        }) => activateDeactivateMasterLeaveYear(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        }
    });

    const saveOrderMutation = useMutation({
        mutationFn: (leaveYears: LeaveYearDetail[]) => saveMasterLeaveYearOrder(leaveYears),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
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

export function useMasterLeaveYearDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR, 'details', id],
        queryFn: () => getMasterLeaveYearDetails(id),
        enabled: id > 0
    });
}
