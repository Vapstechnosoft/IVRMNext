import {
    getCirculationParameterDetails,
    getCirculationParameterTypeChange,
    saveCirculationParameter,
    toggleCirculationParameterStatus
} from '@/server/library/transactions/circulation_parameter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCirculationParameterDetails = (categoryName: string) => {
    return useQuery({
        queryKey: ['circulationParameterDetails', categoryName],
        queryFn: () => getCirculationParameterDetails({ LMC_CategoryName: categoryName }),
        meta: {
            errorMessage: 'Failed to load circulation parameter details'
        }
    });
};

export const useCirculationParameterTypeChange = () => {
    return useMutation({
        mutationFn: getCirculationParameterTypeChange,
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to fetch book types');
        }
    });
};

export const useSaveCirculationParameter = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveCirculationParameter,
        onSuccess: (data) => {
            if (data.data?.returnval === true) {
                toast.success('Record Saved Successfully');
            } else if (data.data?.returnval === false) {
                toast.error('Failed to save record');
            } else if (data.data?.duplicate) {
                toast.error('Record already exists');
            }
            // Depending on the exact API response flag properties
            queryClient.invalidateQueries({ queryKey: ['circulationParameterDetails'] });
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to save circulation parameter');
        }
    });
};

export const useToggleCirculationParameterStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleCirculationParameterStatus,
        onSuccess: (data) => {
            toast.success('Status Updated Successfully');
            queryClient.invalidateQueries({ queryKey: ['circulationParameterDetails'] });
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to update status');
        }
    });
};
