import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { getCumulativeSalaryReportOnload, searchCumulativeSalaryReport } from '@/server/hrms/reports/cumulative-salary-report';
import type { CumulativeSalaryReportSearchRequest } from '@/types/hrms/reports/cumulative-salary-report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch cumulative salary report onload data
 */
export function useCumulativeSalaryReportOnload(MI_Id = 30) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.CUMULATIVE_SALARY_REPORT_ONLOAD, MI_Id],
        queryFn: () => getCumulativeSalaryReportOnload(MI_Id),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

/**
 * Hook to search cumulative salary report
 */
export function useSearchCumulativeSalaryReport() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CumulativeSalaryReportSearchRequest) => searchCumulativeSalaryReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search salary report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching cumulative salary report:', error);
            toast.error(error.message || 'Failed to search salary report');
        }
    });
}
