'use client';

/**
 * Unified HRMS Report Hooks
 * All report-related hooks consolidated in one file
 */

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    filterEmployeesBySelection,
    getEmployeeProfileReportOnload,
    searchEmployeeProfileDetails
} from '@/server/hrms/reports/employee-profile-report';
import {
    filterEmployeeDetailsReport,
    getEmployeeDetailsReportOnload,
    searchEmployeeDetailsReport
} from '@/server/hrms/reports/employee-details-report';
import { getCumulativeSalaryReportOnload, searchCumulativeSalaryReport } from '@/server/hrms/reports/cumulative-salary-report';
import type { EmployeeProfileReportFilterRequest, EmployeeProfileReportSearchRequest } from '@/types/hrms/reports/employee-profile-report';
import type { EmployeeDetailsReportFilterRequest, EmployeeDetailsReportSearchRequest } from '@/types/hrms/reports/employee-details-report';
import type { CumulativeSalaryReportSearchRequest } from '@/types/hrms/reports/cumulative-salary-report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================================================
// EMPLOYEE PROFILE REPORT
// ============================================================================

export function useEmployeeProfileReportOnload(roleId = 30) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_PROFILE_REPORT_ONLOAD, roleId],
        queryFn: () => getEmployeeProfileReportOnload(roleId),
        staleTime: 5 * 60 * 1000
    });
}

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

// ============================================================================
// EMPLOYEE DETAILS REPORT
// ============================================================================

export function useEmployeeDetailsReportOnload(MI_Id = 30, LogInUserId = 2) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_DETAILS_REPORT_ONLOAD, MI_Id, LogInUserId],
        queryFn: () => getEmployeeDetailsReportOnload(MI_Id, LogInUserId),
        staleTime: 5 * 60 * 1000
    });
}

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

// ============================================================================
// CUMULATIVE SALARY REPORT
// ============================================================================

export function useCumulativeSalaryReportOnload(MI_Id = 30) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.CUMULATIVE_SALARY_REPORT_ONLOAD, MI_Id],
        queryFn: () => getCumulativeSalaryReportOnload(MI_Id),
        staleTime: 5 * 60 * 1000
    });
}

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

