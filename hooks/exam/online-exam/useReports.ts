import { ONLINE_EXAM_QUERY_KEYS } from '@/constants/query-keys';
import { getOnlineExamReportInitialData } from '@/server/exam/online-exam/reports/online-exam-report';
import { getStaffWiseReportInitialData } from '@/server/exam/online-exam/reports/staff-wise-report';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Hook for Online Exam Report Initial Data
export function useOnlineExamReportInitialData() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.ONLINE_EXAM_REPORT],
        queryFn: async () => getOnlineExamReportInitialData(),
        staleTime: 0
    });

    return {
        ...query,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ONLINE_EXAM_QUERY_KEYS.ONLINE_EXAM_REPORT]
            });
        }
    };
}

// Hook for Staff-Wise / Not-Submitted Report Initial Data
export function useStaffWiseReportInitialData() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.STAFF_WISE_REPORT],
        queryFn: async () => getStaffWiseReportInitialData(),
        staleTime: 0
    });

    return {
        ...query,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ONLINE_EXAM_QUERY_KEYS.STAFF_WISE_REPORT]
            });
        }
    };
}
