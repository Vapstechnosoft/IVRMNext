import {
    getCirculationData,
    getCirculationParameterDetails,
    getCirculationParameterTypeChange,
    saveCirculationParameter,
    toggleCirculationParameterStatus
} from '@/server/library/transactions/circulation_parameter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCirculationParameterDetails = (payload: { MI_Id: number; IVRMUL_Id: number }) => {
    return useQuery({
        queryKey: ['circulationParameterDetails', payload.MI_Id, payload.IVRMUL_Id],
        queryFn: () => getCirculationParameterDetails(payload),
        meta: {
            errorMessage: 'Failed to load circulation parameter details'
        }
    });
};

export const useCirculationData = () => {
    return useMutation({
        mutationFn: getCirculationData,
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to fetch circulation data');
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
        onSuccess: (data: any) => {
            if (data?.returnval === true) {
                toast.success('Record Saved Successfully');
            } else if (data?.returnval === false) {
                toast.error('Failed to save record');
            } else if (data?.duplicate) {
                toast.error('Record already exists');
            }
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
        onSuccess: (_data: any) => {
            toast.success('Status Updated Successfully');
            queryClient.invalidateQueries({ queryKey: ['circulationParameterDetails'] });
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to update status');
        }
    });
};
