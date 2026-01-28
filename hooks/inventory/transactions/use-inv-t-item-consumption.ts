
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    deactiveInvTItemConsumption,
    getInvTItemConsumptionLoadData,
    getItemConsumptionDetails,
    getItemStockDetails,
    getItemsOnStoreChange,
    saveInvTItemConsumption
} from '@/server/inventory/transactions/inv-t-item-consumption';

export const useInvTItemConsumption = (searchParams?: any) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['inv-t-item-consumption', searchParams],
        queryFn: () => getInvTItemConsumptionLoadData(searchParams),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const saveMutation = useMutation({
        mutationFn: saveInvTItemConsumption,
        onSuccess: (data) => {
            if (data.returnval) {
                toast.success('Record saved successfully');
                queryClient.invalidateQueries({ queryKey: ['inv-t-item-consumption'] });
            } else {
                toast.error(data.message || 'Failed to save record');
            }
        },
        onError: (error) => {
            toast.error('An error occurred while saving');
            console.error(error);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deactiveInvTItemConsumption,
        onSuccess: (data) => {
            if (data.returnval) {
                toast.success('Record status updated successfully');
                queryClient.invalidateQueries({ queryKey: ['inv-t-item-consumption'] });
            } else {
                toast.error('Failed to update status');
            }
        },
        onError: (error) => {
            toast.error('An error occurred');
        }
    });

    const itemsOnStoreChangeMutation = useMutation({
        mutationFn: getItemsOnStoreChange,
    });

    const itemStockDetailMutation = useMutation({
        mutationFn: getItemStockDetails,
    });

    const getDetailsMutation = useMutation({
        mutationFn: getItemConsumptionDetails,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        saveMutation,
        deleteMutation,
        itemsOnStoreChangeMutation,
        itemStockDetailMutation,
        getDetailsMutation
    };
};
