import { ONLINE_EXAM_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterQuestionInitialData, getQuestionOptions } from '@/server/exam/online-exam/masters/master-question';
import { getMasterQuestionCollegeInitialData, getQuestionOptionsCollege } from '@/server/exam/online-exam/masters/master-question-college';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Hook for Master Question (School)
export function useMasterQuestion(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION, searchParams ?? {}],
        queryFn: async () => getMasterQuestionInitialData(searchParams),
        staleTime: 0
    });

    return {
        ...query,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION]
            });
        }
    };
}

// Hook for Question Options (School)
export function useQuestionOptions(questionId: number | null) {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION_OPTIONS, questionId],
        queryFn: async () => {
            if (!questionId) return null;
            return getQuestionOptions(questionId);
        },
        enabled: Boolean(questionId)
    });
}

// Hook for Question Options (College)
export function useQuestionOptionsCollege(questionId: number | null) {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION_OPTIONS, questionId],
        queryFn: async () => {
            if (!questionId) return null;
            return getQuestionOptionsCollege(questionId);
        },
        enabled: Boolean(questionId)
    });
}

// Hook for Master Question College
export function useMasterQuestionCollege(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION_COLLEGE, searchParams ?? {}],
        queryFn: async () => getMasterQuestionCollegeInitialData(searchParams),
        staleTime: 0
    });

    return {
        ...query,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION_COLLEGE]
            });
        }
    };
}
