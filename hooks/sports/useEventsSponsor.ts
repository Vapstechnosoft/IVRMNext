import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEventsSponsorMapping, saveEventsSponsorMapping, deactivateEventsSponsorMapping, getEditEventsSponsorMapping } from '@/server/sports/transactions/events-sponsor';
import { toast } from 'sonner';
import { ApiSearchparams } from '@/types';

export const useEventsSponsor = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const details = useQuery({
        queryKey: ['events-sponsor-mapping-details', searchParams || {}],
        queryFn: () => getEventsSponsorMapping(searchParams),
    });

    const refetchAll = () => {
        return queryClient.invalidateQueries({
            queryKey: ['events-sponsor-mapping-details']
        });
    };

    const saveMutation = useMutation({
        mutationFn: saveEventsSponsorMapping,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message || 'Saved successfully');
                queryClient.invalidateQueries({ queryKey: ['events-sponsor-mapping-details'] });
            } else {
                toast.error(data.message || 'Failed to save');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred');
        }
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateEventsSponsorMapping,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message || 'Status updated successfully');
                queryClient.invalidateQueries({ queryKey: ['events-sponsor-mapping-details'] });
            } else {
                toast.error(data.message || 'Failed to update status');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred');
        }
    });

    const useEditDetails = (id?: number) => {
        return useQuery({
            queryKey: ['events-sponsor-mapping-edit', id],
            queryFn: () => getEditEventsSponsorMapping(id!),
            enabled: !!id
        });
    };

    return {
        details,
        saveMutation,
        deactivateMutation,
        useEditDetails,
        // For backward compatibility if needed, but we should refactor usages
        data: details.data,
        isLoading: details.isLoading,
        error: details.error,
        refetch: details.refetch,
        refetchAll
    };
};
