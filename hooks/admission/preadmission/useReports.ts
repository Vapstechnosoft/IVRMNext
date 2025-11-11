import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { RegisteredDropDown, getStudentCountReport } from '@/server/admission/preadmission/reports/student_count_report';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useStudentCountReport = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.STUDENT_COUNT_REPORT, searchParams ?? {}],
            queryFn: async () => getStudentCountReport(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.STUDENT_COUNT_REPORT]
            });
        }
    };
};
export const useRegisteredListDropDown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.STUDENT_COUNT_REPORT, searchParams ?? {}],
            queryFn: async () => RegisteredDropDown(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.STUDENT_COUNT_REPORT]
            });
        }
    };
};
