import {
    deleteWrittenTestSchedule,
    deleteWrittenTestScheduleStudentData,
    getWrittenTestScheduleDetails,
    getWrittenTestSelectedRowDetails,
    saveWrittenTestSchedule
} from '@/server/admission/preadmission/transactions/written_test_schedule';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEY = 'writtenTestSchedule';

export const useWrittenTestScheduleDetails = (classId = 0) => {
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
