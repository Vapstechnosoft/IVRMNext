import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    filterEmployeesBySelection,
    getEmployeeProfileReportOnload,
    searchEmployeeProfileDetails
} from '@/server/hrms/reports/employee-profile-report';
import type { EmployeeProfileReportFilterRequest, EmployeeProfileReportSearchRequest } from '@/types/hrms/reports/employee-profile-report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch employee profile report onload data
 */
export function useEmployeeProfileReportOnload(roleId = 30) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_PROFILE_REPORT_ONLOAD, roleId],
        queryFn: () => getEmployeeProfileReportOnload(roleId),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

/**
 * Hook to filter employees by selection criteria
 */
export function useFilterEmployeesBySelection() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeProfileReportFilterRequest) => filterEmployeesBySelection(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter employees');
            }
        },
        onError: (error: Error) => {
            console.error('Error filtering employees:', error);
            toast.error(error.message || 'Failed to filter employees');
        }
    });
}

/**
 * Hook to search employee profile details
 */
export function useSearchEmployeeProfileDetails() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeProfileReportSearchRequest) => searchEmployeeProfileDetails(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to retrieve employee details');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching employee profile:', error);
            toast.error(error.message || 'Failed to retrieve employee details');
        }
    });
}
