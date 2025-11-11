'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { getLeaveCredit, addOrUpdateLeaveCredit, deleteLeaveCredit } from '@/server/hrms/leave-management/transactions/leave-credit';
import { getLeaveCreditTransaction, addOrUpdateLeaveCreditTransaction, deleteLeaveCreditTransaction } from '@/server/hrms/leave-management/transactions/leave-credit-transaction';
import { getLeaveCreditDetails, addOrUpdateLeaveCreditDetails, deleteLeaveCreditDetails } from '@/server/hrms/leave-management/transactions/leave-credit-details';
import { getLeaveCreditDeduction, addOrUpdateLeaveCreditDeduction, deleteLeaveCreditDeduction } from '@/server/hrms/leave-management/transactions/leave-credit-deduction';
import { getLeaveCreditAddition, addOrUpdateLeaveCreditAddition, deleteLeaveCreditAddition } from '@/server/hrms/leave-management/transactions/leave-credit-addition';
import { getLeaveCarryForward, addOrUpdateLeaveCarryForward, deleteLeaveCarryForward } from '@/server/hrms/leave-management/transactions/leave-carryforward';
import { getCompOffApproval, updateCompOffApprovalStatus } from '@/server/hrms/leave-management/transactions/comp-off-approval';
import type { LeaveCredit } from '@/app/(root)/hrms/leave-management/transaction/leave-credit/_components/columns';
import type { LeaveCreditTransaction } from '@/app/(root)/hrms/leave-management/transaction/leave-credit-transaction/_components/columns';
import type { LeaveCreditDetail } from '@/app/(root)/hrms/leave-management/transaction/leave-credit-details/_components/columns';
import type { LeaveCreditDeduction } from '@/app/(root)/hrms/leave-management/transaction/leave-credit-deduction/_components/columns';
import type { LeaveCreditAddition } from '@/app/(root)/hrms/leave-management/transaction/leave-credit-addition/_components/columns';
import type { LeaveCarryForward } from '@/app/(root)/hrms/leave-management/transaction/leave-carryforward/_components/columns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Leave Credit Hooks
export const useLeaveCredit = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT],
            queryFn: async () => getLeaveCredit(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT]
            });
        }
    };
};

export const useSaveLeaveCredit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credit: LeaveCredit) => addOrUpdateLeaveCredit(credit),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save leave credit');
        }
    });
};

export const useUpdateLeaveCredit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credit: LeaveCredit) => addOrUpdateLeaveCredit(credit),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update leave credit');
        }
    });
};

export const useDeleteLeaveCredit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteLeaveCredit(id),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete leave credit');
        }
    });
};

// Leave Credit Transaction Hooks
export const useLeaveCreditTransaction = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_TRANSACTION],
            queryFn: async () => getLeaveCreditTransaction(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_TRANSACTION]
            });
        }
    };
};

export const useSaveLeaveCreditTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transaction: LeaveCreditTransaction) => addOrUpdateLeaveCreditTransaction(transaction),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_TRANSACTION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save leave credit transaction');
        }
    });
};

export const useUpdateLeaveCreditTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transaction: LeaveCreditTransaction) => addOrUpdateLeaveCreditTransaction(transaction),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_TRANSACTION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update leave credit transaction');
        }
    });
};

export const useDeleteLeaveCreditTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteLeaveCreditTransaction(id),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_TRANSACTION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete leave credit transaction');
        }
    });
};

// Leave Credit Details Hooks
export const useLeaveCreditDetails = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_DETAILS],
            queryFn: async () => getLeaveCreditDetails(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_DETAILS]
            });
        }
    };
};

export const useSaveLeaveCreditDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (detail: LeaveCreditDetail) => addOrUpdateLeaveCreditDetails(detail),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_DETAILS] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save leave credit details');
        }
    });
};

export const useUpdateLeaveCreditDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (detail: LeaveCreditDetail) => addOrUpdateLeaveCreditDetails(detail),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_DETAILS] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update leave credit details');
        }
    });
};

export const useDeleteLeaveCreditDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteLeaveCreditDetails(id),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_DETAILS] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete leave credit details');
        }
    });
};

// Leave Credit Deduction Hooks
export const useLeaveCreditDeduction = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_DEDUCTION],
            queryFn: async () => getLeaveCreditDeduction(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_DEDUCTION]
            });
        }
    };
};

export const useSaveLeaveCreditDeduction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (deduction: LeaveCreditDeduction) => addOrUpdateLeaveCreditDeduction(deduction),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_DEDUCTION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save leave credit deduction');
        }
    });
};

export const useUpdateLeaveCreditDeduction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (deduction: LeaveCreditDeduction) => addOrUpdateLeaveCreditDeduction(deduction),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_DEDUCTION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update leave credit deduction');
        }
    });
};

export const useDeleteLeaveCreditDeduction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteLeaveCreditDeduction(id),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_DEDUCTION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete leave credit deduction');
        }
    });
};

// Leave Credit Addition Hooks
export const useLeaveCreditAddition = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_ADDITION],
            queryFn: async () => getLeaveCreditAddition(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_ADDITION]
            });
        }
    };
};

export const useSaveLeaveCreditAddition = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (addition: LeaveCreditAddition) => addOrUpdateLeaveCreditAddition(addition),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_ADDITION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save leave credit addition');
        }
    });
};

export const useUpdateLeaveCreditAddition = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (addition: LeaveCreditAddition) => addOrUpdateLeaveCreditAddition(addition),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_ADDITION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update leave credit addition');
        }
    });
};

export const useDeleteLeaveCreditAddition = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteLeaveCreditAddition(id),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CREDIT_ADDITION] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete leave credit addition');
        }
    });
};

// Leave Carry Forward Hooks
export const useLeaveCarryForward = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_CARRYFORWARD],
            queryFn: async () => getLeaveCarryForward(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_CARRYFORWARD]
            });
        }
    };
};

export const useSaveLeaveCarryForward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (carryForward: LeaveCarryForward) => addOrUpdateLeaveCarryForward(carryForward),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CARRYFORWARD] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save leave carry forward');
        }
    });
};

export const useUpdateLeaveCarryForward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (carryForward: LeaveCarryForward) => addOrUpdateLeaveCarryForward(carryForward),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CARRYFORWARD] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update leave carry forward');
        }
    });
};

export const useDeleteLeaveCarryForward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteLeaveCarryForward(id),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.LEAVE_CARRYFORWARD] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete leave carry forward');
        }
    });
};

// Comp Off Approval Hooks
export const useCompOffApproval = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.COMP_OFF_APPROVAL],
            queryFn: async () => getCompOffApproval(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.COMP_OFF_APPROVAL]
            });
        }
    };
};

export const useUpdateCompOffApprovalStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, hrStatus, approverRemarks }: { id: number; hrStatus: 'Approved' | 'Rejected'; approverRemarks?: string }) =>
            updateCompOffApprovalStatus(id, hrStatus, approverRemarks),
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.COMP_OFF_APPROVAL] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update comp off approval status');
        }
    });
};

