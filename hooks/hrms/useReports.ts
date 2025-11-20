'use client';

/**
 * Unified HRMS Report Hooks
 * All report-related hooks consolidated in one file
 */

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { getFOMonthEndReportData } from '@/server/hrms/attendance-management/reports/fo-monthend-report';
import { getEmployeeAdvanceReportOnload, searchEmployeeAdvanceReport } from '@/server/hrms/hrmsConfig/reports/advance-report';
import { getBankCashReportOnload, searchBankCashReport } from '@/server/hrms/hrmsConfig/reports/bank-cash-report';
import { getCumulativeSalaryReportOnload, searchCumulativeSalaryReport } from '@/server/hrms/hrmsConfig/reports/cumulative-salary-report';
import {
    filterEmployeeContributionData,
    getEmployeeContributionReportOnload,
    searchEmployeeContributionDetails
} from '@/server/hrms/hrmsConfig/reports/employee-contribution-report';
import {
    filterEmployeeDetailsReport,
    getEmployeeDetailsReportOnload,
    searchEmployeeDetailsReport
} from '@/server/hrms/hrmsConfig/reports/employee-details-report';
import { getEmployeeInOutReportOnload } from '@/server/hrms/hrmsConfig/reports/employee-inout-report';
import { getEmployeeLateInEarlyOutReportOnload } from '@/server/hrms/hrmsConfig/reports/employee-latein-earlyout-report';
import { getEmployeeLogReportList, getEmployeeLogReportOnload } from '@/server/hrms/hrmsConfig/reports/employee-log-report';
import { getEmployeeMonthlyReportList, getEmployeeMonthlyReportOnload } from '@/server/hrms/hrmsConfig/reports/employee-monthly-report';
import {
    filterEmployeesBySelection,
    getEmployeeProfileReportOnload,
    searchEmployeeProfileDetails
} from '@/server/hrms/hrmsConfig/reports/employee-profile-report';
import { getEmployeeStrengthReportOnload, searchEmployeeStrengthReport } from '@/server/hrms/hrmsConfig/reports/employee-strength-report';
import { getEmployeeYearlyReportList, getEmployeeYearlyReportOnload } from '@/server/hrms/hrmsConfig/reports/employee-yearly-report';
import { getESIReportOnload, searchESIReport } from '@/server/hrms/hrmsConfig/reports/esi-report';
import { getHeadWiseReportOnload, searchHeadWiseReport } from '@/server/hrms/hrmsConfig/reports/head-wise-report';
import { filterEmployeesForLoanReport, getEmployeeLoanDetails, getLoanReportBasicData } from '@/server/hrms/hrmsConfig/reports/loan-report';
import { getMonthEndReportOnload, searchMonthEndReport } from '@/server/hrms/hrmsConfig/reports/month-end-report';
import {
    filterPFChallanEmployeeData,
    getPFChallanReportOnload,
    searchPFChallanReport
} from '@/server/hrms/hrmsConfig/reports/pf-challan-report';
import {
    filterPFForm3AEmployeeData,
    getPFForm3AReportOnload,
    searchPFForm3AReport
} from '@/server/hrms/hrmsConfig/reports/pf-form-3a-report';
import { filterPFForm5EmployeeData, getPFForm5ReportOnload, searchPFForm5Report } from '@/server/hrms/hrmsConfig/reports/pf-form-5-report';
import {
    filterPFForm6AEmployeeData,
    getPFForm6AReportOnload,
    searchPFForm6AReport
} from '@/server/hrms/hrmsConfig/reports/pf-form-6a-report';
import {
    filterPFForm10EmployeeData,
    getPFForm10ReportOnload,
    searchPFForm10Report
} from '@/server/hrms/hrmsConfig/reports/pf-form-10-report';
import { filterEmployeesByYearMonth, generateSalarySlip, getSalarySlipOnload } from '@/server/hrms/hrmsConfig/reports/salary-slip-report';
import type { ApiSearchparams } from '@/types';
import type { EmployeeAdvanceReportSearchRequest } from '@/types/hrms/reports/advance-report';
import type { BankCashReportSearchRequest } from '@/types/hrms/reports/bank-cash-report';
import type { CumulativeSalaryReportSearchRequest } from '@/types/hrms/reports/cumulative-salary-report';
import type {
    EmployeeContributionReportFilterRequest,
    EmployeeContributionReportSearchRequest
} from '@/types/hrms/reports/employee-contribution-report';
import type { EmployeeDetailsReportFilterRequest, EmployeeDetailsReportSearchRequest } from '@/types/hrms/reports/employee-details-report';
import type { EmployeeProfileReportFilterRequest, EmployeeProfileReportSearchRequest } from '@/types/hrms/reports/employee-profile-report';
import type { EmployeeStrengthReportSearchRequest } from '@/types/hrms/reports/employee-strength-report';
import type { ESIReportSearchRequest } from '@/types/hrms/reports/esi-report';
import type { HeadWiseReportSearchRequest } from '@/types/hrms/reports/head-wise-report';
import type { LoanReportFilterRequest, LoanReportSearchRequest } from '@/types/hrms/reports/loan-report';
import type { MonthEndReportSearchRequest } from '@/types/hrms/reports/month-end-report';
import type { PFChallanReportFilterRequest, PFChallanReportSearchRequest } from '@/types/hrms/reports/pf-challan-report';
import type { PFForm3AReportFilterRequest, PFForm3AReportSearchRequest } from '@/types/hrms/reports/pf-form-3a-report';
import type { PFForm5ReportFilterRequest, PFForm5ReportSearchRequest } from '@/types/hrms/reports/pf-form-5-report';
import type { PFForm6AReportFilterRequest, PFForm6AReportSearchRequest } from '@/types/hrms/reports/pf-form-6a-report';
import type { PFForm10ReportFilterRequest, PFForm10ReportSearchRequest } from '@/types/hrms/reports/pf-form-10-report';
import type { SalarySlipFilterRequest, SalarySlipGenerateRequest } from '@/types/hrms/reports/salary-slip-report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================================================
// EMPLOYEE PROFILE REPORT
// ============================================================================

export function useEmployeeProfileReportOnload(MI_Id = 30, LogInUserId = 0) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_PROFILE_REPORT_ONLOAD, MI_Id, LogInUserId],
        queryFn: () => getEmployeeProfileReportOnload(MI_Id, LogInUserId),
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

export function useEmployeeDetailsReportOnload(MI_Id = 30, LogInUserId = 0) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_DETAILS_REPORT_ONLOAD, MI_Id, LogInUserId],
        queryFn: () => getEmployeeDetailsReportOnload(MI_Id, LogInUserId),
        staleTime: 5 * 60 * 1000
    });
}

// ============================================================================
// EMPLOYEE CONTRIBUTION REPORT
// ============================================================================

export function useEmployeeContributionReportOnload(MI_Id = 30, LogInUserId = 0) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_CONTRIBUTION_REPORT_ONLOAD, MI_Id, LogInUserId],
        queryFn: () => getEmployeeContributionReportOnload(MI_Id, LogInUserId),
        staleTime: 5 * 60 * 1000
    });
}

// ============================================================================
// EMPLOYEE STRENGTH REPORT
// ============================================================================

export function useEmployeeStrengthReportOnload(MI_Id = 30, LogInUserId = 0) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_STRENGTH_REPORT_ONLOAD, MI_Id, LogInUserId],
        queryFn: () => getEmployeeStrengthReportOnload(MI_Id, LogInUserId),
        staleTime: 5 * 60 * 1000
    });
}

export function useSearchEmployeeStrengthReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeStrengthReportSearchRequest) => searchEmployeeStrengthReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search employee strength report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching employee strength report:', error);
            toast.error(error.message || 'Failed to search employee strength report');
        }
    });
}

// ============================================================================
// ESI REPORT
// ============================================================================

export function useESIReportOnload(MI_Id = 30, LogInUserId = 0) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.ESI_REPORT_ONLOAD, MI_Id, LogInUserId],
        queryFn: () => getESIReportOnload(MI_Id, LogInUserId),
        staleTime: 5 * 60 * 1000
    });
}

export function useSearchESIReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ESIReportSearchRequest) => searchESIReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search ESI report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching ESI report:', error);
            toast.error(error.message || 'Failed to search ESI report');
        }
    });
}

// ============================================================================
// HEAD WISE REPORT
// ============================================================================

export function useHeadWiseReportOnload(MI_Id = 30, LogInUserId = 0) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.HEAD_WISE_REPORT_ONLOAD, MI_Id, LogInUserId],
        queryFn: () => getHeadWiseReportOnload(MI_Id, LogInUserId),
        staleTime: 5 * 60 * 1000
    });
}

export function useSearchHeadWiseReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: HeadWiseReportSearchRequest) => searchHeadWiseReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search head wise report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching head wise report:', error);
            toast.error(error.message || 'Failed to search head wise report');
        }
    });
}

// ============================================================================
// BANK CASH REPORT
// ============================================================================

export function useBankCashReportOnload(MI_Id = 30, LogInUserId = 0) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.BANK_CASH_REPORT_ONLOAD, MI_Id, LogInUserId],
        queryFn: () => getBankCashReportOnload(MI_Id, LogInUserId),
        staleTime: 5 * 60 * 1000
    });
}

export function useSearchBankCashReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: BankCashReportSearchRequest) => searchBankCashReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search bank cash report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching bank cash report:', error);
            toast.error(error.message || 'Failed to search bank cash report');
        }
    });
}

// ============================================================================
// PF CHALLAN REPORT
// ============================================================================

export function usePFChallanReportOnload(MI_Id = 30) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.PF_CHALLAN_REPORT_ONLOAD, MI_Id],
        queryFn: () => getPFChallanReportOnload(MI_Id),
        staleTime: 5 * 60 * 1000
    });
}

export function useFilterPFChallanEmployeeData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PFChallanReportFilterRequest) => filterPFChallanEmployeeData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter PF challan employee data');
            }
        },
        onError: (error: Error) => {
            console.error('Error filtering PF challan employee data:', error);
            toast.error(error.message || 'Failed to filter PF challan employee data');
        }
    });
}

export function useSearchPFChallanReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PFChallanReportSearchRequest) => searchPFChallanReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search PF challan report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching PF challan report:', error);
            toast.error(error.message || 'Failed to search PF challan report');
        }
    });
}

// ============================================================================
// PF FORM 10 REPORT
// ============================================================================

export function usePFForm10ReportOnload(MI_Id = 30) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.PF_FORM_10_REPORT_ONLOAD, MI_Id],
        queryFn: () => getPFForm10ReportOnload(MI_Id),
        staleTime: 5 * 60 * 1000
    });
}

export function useFilterPFForm10EmployeeData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PFForm10ReportFilterRequest) => filterPFForm10EmployeeData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter PF Form 10 employee data');
            }
        },
        onError: (error: Error) => {
            console.error('Error filtering PF Form 10 employee data:', error);
            toast.error(error.message || 'Failed to filter PF Form 10 employee data');
        }
    });
}

export function useSearchPFForm10Report() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PFForm10ReportSearchRequest) => searchPFForm10Report(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search PF Form 10 report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching PF Form 10 report:', error);
            toast.error(error.message || 'Failed to search PF Form 10 report');
        }
    });
}

// ============================================================================
// PF FORM 5 REPORT
// ============================================================================

export function usePFForm5ReportOnload(MI_Id = 30) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.PF_FORM_5_REPORT_ONLOAD, MI_Id],
        queryFn: () => getPFForm5ReportOnload(MI_Id),
        staleTime: 5 * 60 * 1000
    });
}

export function useFilterPFForm5EmployeeData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PFForm5ReportFilterRequest) => filterPFForm5EmployeeData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter PF Form 5 employee data');
            }
        },
        onError: (error: Error) => {
            console.error('Error filtering PF Form 5 employee data:', error);
            toast.error(error.message || 'Failed to filter PF Form 5 employee data');
        }
    });
}

export function useSearchPFForm5Report() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PFForm5ReportSearchRequest) => searchPFForm5Report(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search PF Form 5 report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching PF Form 5 report:', error);
            toast.error(error.message || 'Failed to search PF Form 5 report');
        }
    });
}

// ============================================================================
// PF FORM 3A REPORT
// ============================================================================

export function usePFForm3AReportOnload(MI_Id = 30) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.PF_FORM_3A_REPORT_ONLOAD, MI_Id],
        queryFn: () => getPFForm3AReportOnload(MI_Id),
        staleTime: 5 * 60 * 1000
    });
}

export function useFilterPFForm3AEmployeeData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PFForm3AReportFilterRequest) => filterPFForm3AEmployeeData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter PF Form 3A employee data');
            }
        },
        onError: (error: Error) => {
            console.error('Error filtering PF Form 3A employee data:', error);
            toast.error(error.message || 'Failed to filter PF Form 3A employee data');
        }
    });
}

export function useSearchPFForm3AReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PFForm3AReportSearchRequest) => searchPFForm3AReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search PF Form 3A report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching PF Form 3A report:', error);
            toast.error(error.message || 'Failed to search PF Form 3A report');
        }
    });
}

// ============================================================================
// PF FORM 6A REPORT
// ============================================================================

export function usePFForm6AReportOnload(MI_Id = 30) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.PF_FORM_6A_REPORT_ONLOAD, MI_Id],
        queryFn: () => getPFForm6AReportOnload(MI_Id),
        staleTime: 5 * 60 * 1000
    });
}

export function useFilterPFForm6AEmployeeData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PFForm6AReportFilterRequest) => filterPFForm6AEmployeeData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter PF Form 6A employee data');
            }
        },
        onError: (error: Error) => {
            console.error('Error filtering PF Form 6A employee data:', error);
            toast.error(error.message || 'Failed to filter PF Form 6A employee data');
        }
    });
}

export function useSearchPFForm6AReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PFForm6AReportSearchRequest) => searchPFForm6AReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search PF Form 6A report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching PF Form 6A report:', error);
            toast.error(error.message || 'Failed to search PF Form 6A report');
        }
    });
}

// ============================================================================
// MONTH END REPORT
// ============================================================================

export function useMonthEndReportOnload(MI_Id = 30) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MONTH_END_REPORT_ONLOAD, MI_Id],
        queryFn: () => getMonthEndReportOnload(MI_Id),
        staleTime: 5 * 60 * 1000
    });
}

export function useSearchMonthEndReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: MonthEndReportSearchRequest) => searchMonthEndReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search month end report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching month end report:', error);
            toast.error(error.message || 'Failed to search month end report');
        }
    });
}

export function useFilterEmployeeContributionReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeContributionReportFilterRequest) => filterEmployeeContributionData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter employee contribution data');
            }
        },
        onError: (error: Error) => {
            console.error('Error filtering employee contribution data:', error);
            toast.error(error.message || 'Failed to filter employee contribution data');
        }
    });
}

export function useSearchEmployeeContributionDetails() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeContributionReportSearchRequest) => searchEmployeeContributionDetails(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search employee contribution details');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching employee contribution details:', error);
            toast.error(error.message || 'Failed to search employee contribution details');
        }
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

export function useCumulativeSalaryReportOnload(MI_Id = 30, LoginUserId = 0, UserRole = '', is_export = false, page = 1, page_size = 10) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.CUMULATIVE_SALARY_REPORT_ONLOAD, MI_Id, LoginUserId, UserRole, is_export, page, page_size],
        queryFn: () => getCumulativeSalaryReportOnload(MI_Id, LoginUserId, UserRole, is_export, page, page_size),
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
    enabled = true
) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [HRMS_QUERY_KEYS.CUMULATIVE_SALARY_REPORT_SEARCH, searchParams ?? {}, filterParams ?? {}],
        queryFn: async () => {
            console.log('🔵 [CUMULATIVE SALARY] Query function called', {
                searchParams,
                filterParams,
                timestamp: new Date().toISOString()
            });
            const { getCumulativeSalaryReportList } = await import('@/server/hrms/hrmsConfig/reports/cumulative-salary-report');
            const result = await getCumulativeSalaryReportList(searchParams, filterParams);
            console.log('🔵 [CUMULATIVE SALARY] Query function completed', {
                success: result.success,
                hasData: !!result.data,
                timestamp: new Date().toISOString()
            });
            return result;
        },
        staleTime: 0,
        enabled // Only fetch when enabled (when search criteria are present)
    });

    console.log('🔵 [CUMULATIVE SALARY] useQuery hook state', {
        enabled,
        status: query.status,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        hasData: !!query.data,
        queryKey: [HRMS_QUERY_KEYS.CUMULATIVE_SALARY_REPORT_SEARCH, searchParams ?? {}, filterParams ?? {}]
    });

    return {
        ...query,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.CUMULATIVE_SALARY_REPORT_SEARCH]
            });
        }
    };
}

/**
 * Search cumulative salary report by selection criteria
 * Uses the GetEmployeedetailsBySelection endpoint
 */
export function useSearchCumulativeSalaryReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CumulativeSalaryReportSearchRequest) => {
            return searchCumulativeSalaryReport(data);
        },
        onSuccess: (response: { success: boolean; message?: string }) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search salary report');
            } else {
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.CUMULATIVE_SALARY_REPORT_SEARCH]
                });
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
    enabled = true
) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT_SEARCH, searchParams ?? {}, filterParams ?? {}],
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
    enabled = true
) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT_SEARCH, searchParams ?? {}, filterParams ?? {}],
            queryFn: async () => {
                const { getEmployeeLateInEarlyOutReportList } = await import(
                    '@/server/hrms/hrmsConfig/reports/employee-latein-earlyout-report'
                );
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
    enabled = true
) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOG_REPORT_SEARCH, searchParams ?? {}, filterParams ?? {}],
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
    enabled = true
) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_YEARLY_REPORT_SEARCH, searchParams ?? {}, filterParams ?? {}],
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
    enabled = true
) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MONTHLY_REPORT_SEARCH, searchParams ?? {}, filterParams ?? {}],
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

// ============================================================================
// ADVANCE REPORT
// ============================================================================

export function useEmployeeAdvanceReportOnload(MI_Id = 30, LogInUserId = 0) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.ADVANCE_REPORT_ONLOAD, MI_Id, LogInUserId],
        queryFn: () => getEmployeeAdvanceReportOnload(MI_Id, LogInUserId),
        staleTime: 5 * 60 * 1000
    });
}

export function useSearchEmployeeAdvanceReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeAdvanceReportSearchRequest) => searchEmployeeAdvanceReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search advance report');
            }
        },
        onError: (error: Error) => {
            console.error('Error searching advance report:', error);
            toast.error(error.message || 'Failed to search advance report');
        }
    });
}
