'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddVisitorData, saveAddVisitor, getPreviousVisitors, getAppointmentVisitors } from '@/server/visitors-management/transactions/add-visitor';
import { toast } from 'sonner';

export const useAddVisitor = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['add-visitor-data'],
        queryFn: async () => {
            const response = await getAddVisitorData();
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        },
    });

    const saveMutation = useMutation({
        mutationFn: saveAddVisitor,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({ queryKey: ['add-visitor-data'] });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save visitor data');
        },
    });

    const searchPrevious = async (query: string) => {
        const response = await getPreviousVisitors(query);
        if (!response.success) {
            toast.error(response.message);
            return [];
        }
        return response.data;
    };

    const searchAppointment = async (query: string) => {
        const response = await getAppointmentVisitors(query);
        if (!response.success) {
             toast.error(response.message);
             return [];
        }
        return response.data;
    }

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        saveVisitor: saveMutation.mutateAsync,
        isSaving: saveMutation.isPending,
        refetch: query.refetch,
        searchPrevious,
        searchAppointment
    };
};
