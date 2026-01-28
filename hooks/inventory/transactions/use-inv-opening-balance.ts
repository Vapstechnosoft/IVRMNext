
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    getInvOpeningBalanceLoadData,
    saveInvOpeningBalance,
    deactiveInvOpeningBalance,
    getSelectionItemDetails,
    getOpeningBalanceDetails
} from '@/server/inventory/transactions/inv-opening-balance';
import type { IInvOpeningBalance } from '@/types/inventory/transactions/inv-opening-balance';

export const useInvOpeningBalance = (searchParams?: any) => {
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['inv-opening-balance', searchParams],
        queryFn: () => getInvOpeningBalanceLoadData(searchParams),
    });

    const refetchAll = () => {
        queryClient.invalidateQueries({ queryKey: ['inv-opening-balance'] });
    };

    const saveMutation = useMutation({
        mutationFn: saveInvOpeningBalance,
        onSuccess: (result) => {
            if (result.returnval) {
                toast.success(result.message);
                refetchAll();
            } else {
                toast.error(result.message);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while saving');
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: deactiveInvOpeningBalance,
        onSuccess: (result) => {
            if (result.returnval) {
                toast.success(result.message);
                refetchAll();
            } else {
                toast.error(result.message);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while updating status');
        },
    });

    return {
        data,
        isLoading,
        error,
        refetch,
        refetchAll,
        saveMutation,
        toggleActiveMutation,
    };
};

export const useInvOpeningBalanceItemDetails = () => {
    return useMutation({
        mutationFn: getSelectionItemDetails
    });
};

export const useInvOpeningBalanceDetails = () => {
    return useMutation({
        mutationFn: getOpeningBalanceDetails
    });
};
