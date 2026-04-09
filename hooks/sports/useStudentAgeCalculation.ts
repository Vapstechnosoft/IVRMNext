import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getInitialData, getStudents, saveStudentAge, getStudentAgeRecords } from '@/server/sports/transactions/student-age-calculation';
import { toast } from 'sonner';

export const useStudentAgeCalculation = (searchParams?: any) => {
    const queryClient = useQueryClient();
    const initialData = useQuery({
        queryKey: ['studentAgeCalculationInitial', searchParams],
        queryFn: () => getInitialData(searchParams),
    });

    const studentsData = useMutation({
        mutationFn: getStudents,
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const saveData = useMutation({
        mutationFn: saveStudentAge,
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: ['studentAgeCalculationInitial'] });
            } else {
                toast.error(data.message);
            }
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const gridData = useQuery({
        queryKey: ['studentAgeCalculationGrid'],
        queryFn: () => getStudentAgeRecords({}),
        enabled: false, // Disabling this as we'll use initialData for the list
    });

    return {
        initialData,
        studentsData,
        saveData,
        gridData
    };
};
