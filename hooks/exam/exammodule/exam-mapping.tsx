import { EXAM_QUERY_KEYS } from '@/constants/query-keys';
import { getExamLoginPrivileges } from '@/server/exam/exam-module/exam-mapping/exam-login-privilages';
import { getExamSubjectGroupMapping } from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import { getYearlyCategoryDatesMapping } from '@/server/exam/exam-module/exam-mapping/yearly-category-dates-mapping';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useYearlyCategorySubjectMapping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.YEARLY_CATEGORY_SUBJECT_MAPPING, searchParams ?? {}],
            queryFn: async () => getExamLoginPrivileges(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.YEARLY_CATEGORY_SUBJECT_MAPPING]
            });
        }
    };
};

export const useExamLoginPrivileges = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.EXAM_LOGIN_PRIVILAGES, searchParams ?? {}],
            queryFn: async () => getExamLoginPrivileges(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.EXAM_LOGIN_PRIVILAGES]
            });
        }
    };
};

export const useYearlyCategoryDateMapping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.YEARLY_CATEGORY_DATES_MAPPING, searchParams ?? {}],
            queryFn: async () => getYearlyCategoryDatesMapping(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.YEARLY_CATEGORY_DATES_MAPPING]
            });
        }
    };
};

export const useExamSubjectGroupMapping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [EXAM_QUERY_KEYS.EXAM_SUBJECT_GROUP_MAPPING, searchParams ?? {}],
            queryFn: async () => getExamSubjectGroupMapping(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [EXAM_QUERY_KEYS.EXAM_SUBJECT_GROUP_MAPPING]
            });
        }
    };
};
