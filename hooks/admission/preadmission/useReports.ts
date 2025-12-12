import { ADMISSION_QUERY_KEYS, PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { getStudentTcReport } from '@/server/admission/preadmission/reports/report';
import { addOrUpdateStudentCountReport, getParentDashboardDetails } from '@/server/admission/preadmission/reports/student_count_report';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useStudentCountReport = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.STUDENT_COUNT_REPORT, searchParams ?? {}],
            queryFn: async () => addOrUpdateStudentCountReport(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.STUDENT_COUNT_REPORT]
            });
        }
    };
};

export const useParentDashboard = (asmay_id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.PARENTS_DASHBOARD, asmay_id],
            queryFn: async () => getParentDashboardDetails(asmay_id),
            staleTime: 0,
            enabled: !!asmay_id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.PARENTS_DASHBOARD]
            });
        }
    };
};
export const useStudentTcReport = (data: any, searchParams: ApiSearchparams, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDENT_TC_REPORT, data, searchParams],
            queryFn: async () => getStudentTcReport(data, searchParams),
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDENT_TC_REPORT]
            });
        }
    };
};
