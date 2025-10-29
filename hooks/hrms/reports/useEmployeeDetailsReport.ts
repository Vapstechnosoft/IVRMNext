import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    filterEmployeeDetailsReport,
    getEmployeeDetailsReportOnload,
    searchEmployeeDetailsReport
} from '@/server/hrms/reports/employee-details-report';
import type { EmployeeDetailsReportFilterRequest, EmployeeDetailsReportSearchRequest } from '@/types/hrms/reports/employee-details-report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch employee details report onload data
 */
export function useEmployeeDetailsReportOnload(MI_Id = 30, LogInUserId = 2) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_DETAILS_REPORT_ONLOAD, MI_Id, LogInUserId],
        queryFn: () => getEmployeeDetailsReportOnload(MI_Id, LogInUserId),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

/**
 * Hook to filter employee details report
 */
export function useFilterEmployeeDetailsReport() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeDetailsReportFilterRequest) => filterEmployeeDetailsReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter employee details');
            }
        },
        onError: (error: Error) => {
            console.error('Error filtering employee details:', error);
            toast.error(error.message || 'Failed to filter employee details');
        }
    });
}

/**
 * Hook to search employee details report
 */
export function useSearchEmployeeDetailsReport() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeDetailsReportSearchRequest) => searchEmployeeDetailsReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search employee details');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching employee details:', error);
            toast.error(error.message || 'Failed to search employee details');
        }
    });
}
