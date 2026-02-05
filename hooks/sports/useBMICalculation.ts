import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBMILoadGrid, getBMISections, getBMIStudents, saveBMIRecord, deactivateBMIRecord } from '@/server/sports/transactions/bmi-calculation';
import { IBMISectionResponse } from '@/types/sports/transactions/bmi-calculation';

export const useBMICalculation = (searchParams?: any) => {
    const queryClient = useQueryClient();

    const loadGrid = useQuery({
        queryKey: ['bmi-calculation-list', searchParams],
        queryFn: () => getBMILoadGrid(searchParams),
    });

    const sections = useMutation<IBMISectionResponse, Error, any>({
        mutationFn: (data: any) => getBMISections(data),
    });

    const students = useMutation({
        mutationFn: (data: any) => getBMIStudents(data),
    });

    const save = useMutation({
        mutationFn: (data: any) => saveBMIRecord(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bmi-calculation-list'] });
        },
    });

    const deactivate = useMutation({
        mutationFn: (data: any) => deactivateBMIRecord(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bmi-calculation-list'] });
        },
    });

    return {
        ...loadGrid,
        sections,
        students,
        save,
        deactivate,
        refetchAll: () => queryClient.invalidateQueries({ queryKey: ['bmi-calculation-list'] })
    };
};
