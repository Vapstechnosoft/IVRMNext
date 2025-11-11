'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterLeave, addOrUpdateMasterLeave, deleteMasterLeave } from '@/server/hrms/leave-management/masters/master-leave';
import { getMasterLeaveYear, addOrUpdateMasterLeaveYear, deleteMasterLeaveYear } from '@/server/hrms/leave-management/masters/master-leaveYear';
import { getLeaveAuthorization, addOrUpdateLeaveAuthorization, deleteLeaveAuthorization } from '@/server/hrms/leave-management/masters/leave-authorization';
import type { MasterLeave } from '@/app/(root)/hrms/leave-management/masters/master-leave/_components/columns';
import type { LeaveYear } from '@/app/(root)/hrms/leave-management/masters/master-leaveYear/_components/columns';
import type { LeaveAuthorization } from '@/app/(root)/hrms/leave-management/masters/leave-authorization/_components/columns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Master Leave Hooks
export const useMasterLeave = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE],
            queryFn: async () => getMasterLeave(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
            });
        }
    };
};

export const useSaveMasterLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (leave: MasterLeave) => addOrUpdateMasterLeave(leave),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save master leave');
        }
    });
};

export const useUpdateMasterLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (leave: MasterLeave) => addOrUpdateMasterLeave(leave),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update master leave');
        }
    });
};

export const useDeleteMasterLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteMasterLeave(id),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete master leave');
        }
    });
};

// Master Leave Year Hooks
export const useMasterLeaveYear = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR],
            queryFn: async () => getMasterLeaveYear(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        }
    };
};

export const useSaveMasterLeaveYear = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (leaveYear: LeaveYear) => addOrUpdateMasterLeaveYear(leaveYear),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save leave year');
        }
    });
};

export const useUpdateMasterLeaveYear = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (leaveYear: LeaveYear) => addOrUpdateMasterLeaveYear(leaveYear),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update leave year');
        }
    });
};

export const useDeleteMasterLeaveYear = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteMasterLeaveYear(id),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete leave year');
        }
    });
};

// Leave Authorization Hooks
export const useLeaveAuthorization = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION],
            queryFn: async () => getLeaveAuthorization(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION]
            });
        }
    };
};

export const useSaveLeaveAuthorization = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (authorization: LeaveAuthorization) => addOrUpdateLeaveAuthorization(authorization),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save leave authorization');
        }
    });
};

export const useUpdateLeaveAuthorization = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (authorization: LeaveAuthorization) => addOrUpdateLeaveAuthorization(authorization),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update leave authorization');
        }
    });
};

export const useDeleteLeaveAuthorization = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteLeaveAuthorization(id),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete leave authorization');
        }
    });
};

