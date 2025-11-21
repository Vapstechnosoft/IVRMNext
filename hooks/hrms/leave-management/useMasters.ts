'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { createLocalCrud } from '@/lib/localdb';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MasterLeave } from '@/app/(root)/hrms/leave-management/masters/master-leave/_components/columns';
import type { LeaveAuthorization } from '@/app/(root)/hrms/leave-management/masters/leave-authorization/_components/columns';

// MasterLeaveYear type - placeholder until actual type is defined
interface MasterLeaveYear {
    id: number;
    createdAt: Date;
    leaveYear: string;
    fromDate: string;
    toDate: string;
    isActive: boolean;
}

// Master Leave hooks
export function useMasterLeave() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeave>('masterLeave');

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE],
            queryFn: async () => {
                return {
                    success: true,
                    data: db.list(),
                    message: 'Master leave fetched successfully'
                };
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
            });
        }
    };
}

export function useSaveMasterLeave() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeave>('masterLeave');

    return useMutation<
        { success: boolean; data: MasterLeave; message: string },
        Error,
        Omit<MasterLeave, 'id' | 'createdAt'>
    >({
        mutationFn: async (data: Omit<MasterLeave, 'id' | 'createdAt'>) => {
            const newLeave = db.create(data);
            return {
                success: true,
                data: newLeave,
                message: 'Master leave saved successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save master leave');
        }
    });
}

export function useUpdateMasterLeave() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeave>('masterLeave');

    return useMutation<
        { success: boolean; data: MasterLeave; message: string },
        Error,
        MasterLeave
    >({
        mutationFn: async (data: MasterLeave) => {
            if (data.id) {
                db.update(data.id, data);
                return {
                    success: true,
                    data,
                    message: 'Master leave updated successfully'
                };
            }
            throw new Error('ID is required for update');
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update master leave');
        }
    });
}

// Master Leave Year hooks
export function useMasterLeaveYear() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeaveYear>('masterLeaveYear');

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR],
            queryFn: async () => {
                return {
                    success: true,
                    data: db.list(),
                    message: 'Master leave year fetched successfully'
                };
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        }
    };
}

export function useSaveMasterLeaveYear() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeaveYear>('masterLeaveYear');

    return useMutation<
        { success: boolean; data: MasterLeaveYear; message: string },
        Error,
        Omit<MasterLeaveYear, 'id' | 'createdAt'>
    >({
        mutationFn: async (data: Omit<MasterLeaveYear, 'id' | 'createdAt'>) => {
            const newLeaveYear = db.create(data);
            return {
                success: true,
                data: newLeaveYear,
                message: 'Master leave year saved successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save master leave year');
        }
    });
}

export function useUpdateMasterLeaveYear() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeaveYear>('masterLeaveYear');

    return useMutation<
        { success: boolean; data: MasterLeaveYear; message: string },
        Error,
        MasterLeaveYear
    >({
        mutationFn: async (data: MasterLeaveYear) => {
            if (data.id) {
                db.update(data.id, data);
                return {
                    success: true,
                    data,
                    message: 'Master leave year updated successfully'
                };
            }
            throw new Error('ID is required for update');
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update master leave year');
        }
    });
}

// Leave Authorization hooks
export function useLeaveAuthorization() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<LeaveAuthorization>('leaveAuthorization');

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION],
            queryFn: async () => {
                return {
                    success: true,
                    data: db.list(),
                    message: 'Leave authorization fetched successfully'
                };
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION]
            });
        }
    };
}

export function useSaveLeaveAuthorization() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<LeaveAuthorization>('leaveAuthorization');

    return useMutation<
        { success: boolean; data: LeaveAuthorization; message: string },
        Error,
        Omit<LeaveAuthorization, 'id' | 'createdAt'>
    >({
        mutationFn: async (data: Omit<LeaveAuthorization, 'id' | 'createdAt'>) => {
            const newAuth = db.create(data);
            return {
                success: true,
                data: newAuth,
                message: 'Leave authorization saved successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save leave authorization');
        }
    });
}

export function useUpdateLeaveAuthorization() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<LeaveAuthorization>('leaveAuthorization');

    return useMutation<
        { success: boolean; data: LeaveAuthorization; message: string },
        Error,
        LeaveAuthorization
    >({
        mutationFn: async (data: LeaveAuthorization) => {
            if (data.id) {
                db.update(data.id, data);
                return {
                    success: true,
                    data,
                    message: 'Leave authorization updated successfully'
                };
            }
            throw new Error('ID is required for update');
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update leave authorization');
        }
    });
}

