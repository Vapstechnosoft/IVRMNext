import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getBMILoadGrid, getBMIClasses, getBMISections, getBMIStudents, saveBMIRecord, deactivateBMIRecord, editBMIRecord } from '@/server/sports/transactions/bmi-calculation';
import { IBMIClassResponse, IBMISectionResponse, IBMIStudentResponse } from '@/types/sports/transactions/bmi-calculation';

export const useBMICalculation = (searchParams?: any) => {
    const queryClient = useQueryClient();

    const loadGrid = useQuery({
        queryKey: ['bmi-calculation-list', searchParams],
        queryFn: () => getBMILoadGrid(searchParams),
        placeholderData: keepPreviousData,
        staleTime: 0
    });

    const classes = useMutation<IBMIClassResponse, Error, any>({
        mutationFn: (data: any) => getBMIClasses(data),
    });

    const sections = useMutation<IBMISectionResponse, Error, any>({
        mutationFn: (data: any) => getBMISections(data),
    });

    const students = useMutation<IBMIStudentResponse, Error, any>({
        mutationFn: (data: any) => getBMIStudents(data),
    });

    const save = useMutation({
        mutationFn: (data: any) => saveBMIRecord(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bmi-calculation-list'] });
        },
    });

    const edit = useMutation({
        mutationFn: (data: any) => editBMIRecord(data),
    });

    const deactivate = useMutation({
        mutationFn: (data: any) => deactivateBMIRecord(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Status updated successfully');
            } else {
                toast.error(response.message || 'Failed to update status');
            }
            queryClient.invalidateQueries({ queryKey: ['bmi-calculation-list'] });
        },
    });

    return {
        ...loadGrid,
        classes,
        sections,
        students,
        save,
        edit,
        deactivate,
        refetchAll: () => queryClient.invalidateQueries({ queryKey: ['bmi-calculation-list'] })
    };
};
