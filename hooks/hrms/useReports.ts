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
} from '@/server/hrms/hrmsConfig/reports/employee-profile-report';
import {
    filterEmployeeDetailsReport,
    getEmployeeDetailsReportOnload,
    searchEmployeeDetailsReport
} from '@/server/hrms/hrmsConfig/reports/employee-details-report';
import { getCumulativeSalaryReportOnload, searchCumulativeSalaryReport } from '@/server/hrms/hrmsConfig/reports/cumulative-salary-report';
import { getEmployeeInOutReportOnload } from '@/server/hrms/hrmsConfig/reports/employee-inout-report';
import { getEmployeeLateInEarlyOutReportOnload } from '@/server/hrms/hrmsConfig/reports/employee-latein-earlyout-report';
import { getEmployeeLogReportOnload, getEmployeeLogReportList } from '@/server/hrms/hrmsConfig/reports/employee-log-report';
import { getEmployeeYearlyReportOnload, getEmployeeYearlyReportList } from '@/server/hrms/hrmsConfig/reports/employee-yearly-report';
import { getEmployeeMonthlyReportOnload, getEmployeeMonthlyReportList } from '@/server/hrms/hrmsConfig/reports/employee-monthly-report';
import { getFOMonthEndReportData } from '@/server/hrms/attendance-management/reports/fo-monthend-report';
import {
    filterEmployeesByYearMonth,
    generateSalarySlip,
    getSalarySlipOnload
} from '@/server/hrms/hrmsConfig/reports/salary-slip-report';
import {
    filterEmployeesForLoanReport,
    getEmployeeLoanDetails,
    getLoanReportBasicData
} from '@/server/hrms/hrmsConfig/reports/loan-report';
import type { ApiSearchparams } from '@/types';
import type { EmployeeProfileReportFilterRequest, EmployeeProfileReportSearchRequest } from '@/types/hrms/reports/employee-profile-report';
import type { EmployeeDetailsReportFilterRequest, EmployeeDetailsReportSearchRequest } from '@/types/hrms/reports/employee-details-report';
import type { CumulativeSalaryReportSearchRequest } from '@/types/hrms/reports/cumulative-salary-report';
import type {
    SalarySlipFilterRequest,
    SalarySlipGenerateRequest
} from '@/types/hrms/reports/salary-slip-report';
import type {
    LoanReportFilterRequest,
    LoanReportSearchRequest
} from '@/types/hrms/reports/loan-report';
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

export function useCumulativeSalaryReportList(
    searchParams?: ApiSearchparams,
    filterParams?: {
        MIID?: number;
        LoginUserId?: number;
        UserRole?: string;
        is_export?: boolean;
        month?: string;
        year?: string;
        groupTypeIdList?: number[];
        hrmD_IdList?: number[];
        hrmdeS_IdList?: number[];
    },
    enabled: boolean = true
) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                HRMS_QUERY_KEYS.CUMULATIVE_SALARY_REPORT_SEARCH,
                searchParams ?? {},
                filterParams ?? {}
            ],
            queryFn: async () => {
                const { getCumulativeSalaryReportList } = await import('@/server/hrms/hrmsConfig/reports/cumulative-salary-report');
                return getCumulativeSalaryReportList(searchParams, filterParams);
            },
            staleTime: 0,
            enabled // Only fetch when enabled (when search criteria are present)
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.CUMULATIVE_SALARY_REPORT_SEARCH]
            });
        }
    };
}

// Legacy hook for backward compatibility
export function useSearchCumulativeSalaryReport() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CumulativeSalaryReportSearchRequest) => {
            const { searchCumulativeSalaryReport } = require('@/server/hrms/hrmsConfig/reports/cumulative-salary-report');
            return searchCumulativeSalaryReport(data);
        },
        onSuccess: (response: { success: boolean; message?: string }) => {
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

// ============================================================================
// EMPLOYEE IN-OUT REPORT
// ============================================================================

export function useEmployeeInOutReportOnload(MI_Id = 30, LoginUserId = 0, UserRole = '') {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT_ONLOAD, MI_Id, LoginUserId, UserRole],
        queryFn: () => getEmployeeInOutReportOnload(MI_Id, LoginUserId, UserRole),
        staleTime: 5 * 60 * 1000
    });
}

export function useEmployeeInOutReportList(
    searchParams?: ApiSearchparams,
    filterParams?: {
        MIID?: number;
        LoginUserId?: number;
        UserRole?: string;
        is_export?: boolean;
        fromDate?: string;
        toDate?: string;
        typeIdList?: number[];
        departmentIdList?: number[];
        designationIdList?: number[];
        allOrIndividual?: 'All' | 'Individual';
        employeeCode?: string;
        timeInTimeOut?: 'Time In' | 'Time Out' | 'In Out';
    },
    enabled: boolean = true
) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT_SEARCH,
                searchParams ?? {},
                filterParams ?? {}
            ],
            queryFn: async () => {
                const { getEmployeeInOutReportList } = await import('@/server/hrms/hrmsConfig/reports/employee-inout-report');
                return getEmployeeInOutReportList(searchParams, filterParams);
            },
            staleTime: 0,
            enabled // Only fetch when enabled (when search criteria are present)
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT_SEARCH]
            });
        }
    };
}

// ============================================================================
// EMPLOYEE LATE IN EARLY OUT REPORT
// ============================================================================

export function useEmployeeLateInEarlyOutReportOnload(MI_Id = 30, LoginUserId = 0, UserRole = '') {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT_ONLOAD, MI_Id, LoginUserId, UserRole],
        queryFn: () => getEmployeeLateInEarlyOutReportOnload(MI_Id, LoginUserId, UserRole),
        staleTime: 5 * 60 * 1000
    });
}

export function useEmployeeLateInEarlyOutReportList(
    searchParams?: ApiSearchparams,
    filterParams?: {
        MIID?: number;
        LoginUserId?: number;
        UserRole?: string;
        is_export?: boolean;
        fromDate?: string;
        toDate?: string;
        typeIdList?: number[];
        departmentIdList?: number[];
        designationIdList?: number[];
        employeeIdList?: number[];
        allOrIndividual?: 'All' | 'Individual';
        employeeCode?: string;
        mode?: 'Late By' | 'Early Out' | 'Late In Early Out';
        month?: string;
        year?: string;
    },
    enabled: boolean = true
) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT_SEARCH,
                searchParams ?? {},
                filterParams ?? {}
            ],
            queryFn: async () => {
                const { getEmployeeLateInEarlyOutReportList } = await import('@/server/hrms/hrmsConfig/reports/employee-latein-earlyout-report');
                return getEmployeeLateInEarlyOutReportList(searchParams, filterParams);
            },
            staleTime: 0,
            enabled // Only fetch when enabled (when search criteria are present)
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT_SEARCH]
            });
        }
    };
}

// ============================================================================
// EMPLOYEE LOG REPORT
// ============================================================================

export function useEmployeeLogReportOnload(MI_Id = 30, LoginUserId = 0, UserRole = '') {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOG_REPORT_ONLOAD, MI_Id, LoginUserId, UserRole],
        queryFn: () => getEmployeeLogReportOnload(MI_Id, LoginUserId, UserRole),
        staleTime: 5 * 60 * 1000
    });
}

export function useEmployeeLogReportList(
    searchParams?: ApiSearchparams,
    filterParams?: {
        MIID?: number;
        LoginUserId?: number;
        UserRole?: string;
        is_export?: boolean;
        typeIdList?: number[];
        departmentIdList?: number[];
        designationIdList?: number[];
        allOrIndividual?: 'All' | 'Individual';
        employeeCode?: string;
        employeeName?: string;
        codeOrName?: 'Code' | 'Name';
        dateMode?: 'Date' | 'Monthly' | 'From Date';
        date?: string;
        month?: string;
        fromDate?: string;
        toDate?: string;
        metric?: 'Punch Time' | 'Late In' | 'Early Out';
    },
    enabled: boolean = true
) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                HRMS_QUERY_KEYS.EMPLOYEE_LOG_REPORT_SEARCH,
                searchParams ?? {},
                filterParams ?? {}
            ],
            queryFn: async () => {
                return getEmployeeLogReportList(searchParams, filterParams);
            },
            staleTime: 0,
            enabled // Only fetch when enabled (when search criteria are present)
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOG_REPORT_SEARCH]
            });
        }
    };
}

// ============================================================================
// EMPLOYEE YEARLY REPORT
// ============================================================================

export function useEmployeeYearlyReportOnload(MI_Id = 30, LoginUserId = 0, UserRole = '') {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_YEARLY_REPORT_ONLOAD, MI_Id, LoginUserId, UserRole],
        queryFn: () => getEmployeeYearlyReportOnload(MI_Id, LoginUserId, UserRole),
        staleTime: 5 * 60 * 1000
    });
}

export function useEmployeeYearlyReportList(
    searchParams?: ApiSearchparams,
    filterParams?: {
        MIID?: number;
        LoginUserId?: number;
        UserRole?: string;
        is_export?: boolean;
        typeIdList?: number[];
        departmentIdList?: number[];
        designationIdList?: number[];
        allOrIndividual?: 'All' | 'Individual';
        employeeCode?: string;
        employeeName?: string;
        fromDate?: string;
        toDate?: string;
        mode?: ('Date Of Joining' | 'Show Holiday Punch' | 'Total working Day')[];
    },
    enabled: boolean = true
) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                HRMS_QUERY_KEYS.EMPLOYEE_YEARLY_REPORT_SEARCH,
                searchParams ?? {},
                filterParams ?? {}
            ],
            queryFn: async () => {
                return getEmployeeYearlyReportList(searchParams, filterParams);
            },
            staleTime: 0,
            enabled // Only fetch when enabled (when search criteria are present)
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_YEARLY_REPORT_SEARCH]
            });
        }
    };
}

// ============================================================================
// EMPLOYEE MONTHLY REPORT
// ============================================================================

export function useEmployeeMonthlyReportOnload(MI_Id = 30, LoginUserId = 0, UserRole = '') {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MONTHLY_REPORT_ONLOAD, MI_Id, LoginUserId, UserRole],
        queryFn: () => getEmployeeMonthlyReportOnload(MI_Id, LoginUserId, UserRole),
        staleTime: 5 * 60 * 1000
    });
}

export function useEmployeeMonthlyReportList(
    searchParams?: ApiSearchparams,
    filterParams?: {
        MIID?: number;
        LoginUserId?: number;
        UserRole?: string;
        is_export?: boolean;
        typeIdList?: number[];
        departmentIdList?: number[];
        designationIdList?: number[];
        allOrIndividual?: 'All' | 'Individual';
        employeeName?: string;
        fromDate?: string;
        toDate?: string;
        reportOptions?: ('Total Working Days' | 'Show Holiday Punch' | 'Format One' | 'Date Of Joining' | 'Total Absent Days')[];
    },
    enabled: boolean = true
) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                HRMS_QUERY_KEYS.EMPLOYEE_MONTHLY_REPORT_SEARCH,
                searchParams ?? {},
                filterParams ?? {}
            ],
            queryFn: async () => {
                return getEmployeeMonthlyReportList(searchParams, filterParams);
            },
            staleTime: 0,
            enabled // Only fetch when enabled (when search criteria are present)
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MONTHLY_REPORT_SEARCH]
            });
        }
    };
}

// ============================================================================
// FRONT OFFICE MONTH END REPORT
// ============================================================================

export function useFOMonthEndReportOnload(MI_Id = 30, LoginUserId = 0, UserRole = '') {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.FO_MONTHEND_REPORT, MI_Id, LoginUserId, UserRole],
        queryFn: () => getFOMonthEndReportData(MI_Id, LoginUserId, UserRole),
        staleTime: 5 * 60 * 1000
    });
}

// ============================================================================
// SALARY SLIP REPORT
// ============================================================================

export function useSalarySlipOnload(MI_Id = 30, LogInUserId = 2) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.SALARY_SLIP_ONLOAD, MI_Id, LogInUserId],
        queryFn: () => getSalarySlipOnload(MI_Id, LogInUserId),
        staleTime: 5 * 60 * 1000
    });
}

export function useFilterEmployeesByYearMonth() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SalarySlipFilterRequest) => filterEmployeesByYearMonth(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter employees');
            }
        },
        onError: (error: Error) => {
            console.error('Error filtering employees by year/month:', error);
            toast.error(error.message || 'Failed to filter employees');
        }
    });
}

export function useGenerateSalarySlip() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SalarySlipGenerateRequest) => generateSalarySlip(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to generate salary slip');
            }
        },
        onError: (error: Error) => {
            console.error('Error generating salary slip:', error);
            toast.error(error.message || 'Failed to generate salary slip');
        }
    });
}

// ============================================================================
// LOAN REPORT
// ============================================================================

export function useLoanReportOnload(MI_Id = 30, roleId = 0, LogInUserId = 0) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LOAN_REPORT_ONLOAD, MI_Id, roleId, LogInUserId],
        queryFn: () => getLoanReportBasicData(MI_Id, roleId, LogInUserId),
        staleTime: 5 * 60 * 1000
    });
}

export function useFilterEmployeesForLoanReport() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoanReportFilterRequest) => filterEmployeesForLoanReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter employees');
            }
        },
        onError: (error: Error) => {
            console.error('Error filtering employees for loan report:', error);
            toast.error(error.message || 'Failed to filter employees');
        }
    });
}

export function useGetEmployeeLoanDetails() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoanReportSearchRequest) => getEmployeeLoanDetails(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to get loan details');
            }
        },
        onError: (error: Error) => {
            console.error('Error getting employee loan details:', error);
            toast.error(error.message || 'Failed to get loan details');
        }
    });
}

