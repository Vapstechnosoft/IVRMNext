import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getWrittenTestScheduleDetails,
    saveWrittenTestSchedule,
    deleteWrittenTestSchedule,
    getWrittenTestSelectedRowDetails,
    deleteWrittenTestScheduleStudentData,
    getWrittenTestStudentDetails,
    getWrittenTestRemainStudentDetails
} from '@/server/admission/preadmission/transactions/written_test_schedule';

const QUERY_KEY = 'writtenTestSchedule';

export const useWrittenTestScheduleDetails = (classId: number = 0) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [QUERY_KEY, 'details', classId],
            queryFn: async () => getWrittenTestScheduleDetails(classId),
            staleTime: 0
        }),
        refetchAll: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    };
};

export const useSaveWrittenTestSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveWrittenTestSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        }
    });
};

export const useDeleteWrittenTestSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWrittenTestSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        }
    });
};

export const useWrittenTestSelectedRowDetails = (id?: number) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'selectedRowDetails', id],
        queryFn: async () => {
            if (!id) return null;
            return await getWrittenTestSelectedRowDetails(id);
        },
        enabled: !!id,
        staleTime: 0
    });
};

export const useDeleteWrittenTestScheduleStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWrittenTestScheduleStudentData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        }
    });
};
