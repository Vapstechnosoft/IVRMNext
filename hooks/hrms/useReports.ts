'use client';
// import { HRMS_MI_ID } from '@/constants/hrms-config';
/**
 * Unified HRMS Report Hooks
 * All report-related hooks consolidated in one file
 */

import { HRMS_MI_ID } from '@/constants/hrms-config';
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
import { getEmployeeMonthlyReportList, getEmployeeMonthlyReportOnload } from '@/server/hrms/hrmsConfig/reports/employee-monthly-report';
import {
    filterEmployeeOfferAndExperienceData,
    getEmployeeDetailsBySelection
} from '@/server/hrms/hrmsConfig/reports/employee-offer-and-experience-report';
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
import {
    getLeaveReport,
    getLeaveReportData,
    getLeaveReportDepartments,
    getLeaveReportYearwise,
    getPeriodLeaveReportData,
    getPeriodLeaveReportDepartments,
    getPeriodLeaveReportDesignation,
    getPeriodLeaveReportEmployees
} from '@/server/hrms/leave-management/reports/leave-report';
import {
    getMasterDepartments,
    getMasterDesignations,
    getMasterEmployeeTypes,
    getMasterGroupTypes,
    getMasterMonths,
    getMasterPaymentModeList,
    getMasterYears
} from '@/server/hrms/master';
import type { ApiSearchparams } from '@/types';
import type { EmployeeAdvanceReportSearchRequest } from '@/types/hrms/reports/advance-report';
import type { BankCashReportSearchRequest } from '@/types/hrms/reports/bank-cash-report';
import type { CumulativeSalaryReportSearchRequest } from '@/types/hrms/reports/cumulative-salary-report';
import type {
    EmployeeContributionReportFilterRequest,
    EmployeeContributionReportSearchRequest
} from '@/types/hrms/reports/employee-contribution-report';
import type { EmployeeDetailsReportFilterRequest, EmployeeDetailsReportSearchRequest } from '@/types/hrms/reports/employee-details-report';
import type {
    EmployeeOfferAndExperienceReportFilterRequest,
    EmployeeOfferAndExperienceReportSearchRequest
} from '@/types/hrms/reports/employee-offer-and-experience-report';
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
import { getEmployeeLogReportList, getEmployeeLogReportOnload } from '@/server/hrms/hrmsConfig/reports/employee-log-report';
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
    const _queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: EmployeeStrengthReportSearchRequest) => searchEmployeeStrengthReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search employee strength report');
            }
        },
        onError: (error: Error) => {
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
    const _queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ESIReportSearchRequest) => searchESIReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search ESI report');
            }
        },
        onError: (error: Error) => {
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
    const _queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: HeadWiseReportSearchRequest) => searchHeadWiseReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search head wise report');
            }
        },
        onError: (error: Error) => {
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
    const _queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: BankCashReportSearchRequest) => searchBankCashReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search bank cash report');
            }
        },
        onError: (error: Error) => {
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
    return useMutation({
        mutationFn: (data: PFChallanReportFilterRequest) => filterPFChallanEmployeeData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter PF challan employee data');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to filter PF challan employee data');
        }
    });
}
export function useSearchPFChallanReport() {
    return useMutation({
        mutationFn: (data: PFChallanReportSearchRequest) => searchPFChallanReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search PF challan report');
            }
        },
        onError: (error: Error) => {
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
    return useMutation({
        mutationFn: (data: PFForm10ReportFilterRequest) => filterPFForm10EmployeeData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter PF Form 10 employee data');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to filter PF Form 10 employee data');
        }
    });
}
export function useSearchPFForm10Report() {
    return useMutation({
        mutationFn: (data: PFForm10ReportSearchRequest) => searchPFForm10Report(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search PF Form 10 report');
            }
        },
        onError: (error: Error) => {
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
    return useMutation({
        mutationFn: (data: PFForm5ReportFilterRequest) => filterPFForm5EmployeeData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter PF Form 5 employee data');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to filter PF Form 5 employee data');
        }
    });
}
export function useSearchPFForm5Report() {
    return useMutation({
        mutationFn: (data: PFForm5ReportSearchRequest) => searchPFForm5Report(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search PF Form 5 report');
            }
        },
        onError: (error: Error) => {
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
    return useMutation({
        mutationFn: (data: PFForm3AReportFilterRequest) => filterPFForm3AEmployeeData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter PF Form 3A employee data');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to filter PF Form 3A employee data');
        }
    });
}
export function useSearchPFForm3AReport() {
    return useMutation({
        mutationFn: (data: PFForm3AReportSearchRequest) => searchPFForm3AReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search PF Form 3A report');
            }
        },
        onError: (error: Error) => {
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
    return useMutation({
        mutationFn: (data: PFForm6AReportFilterRequest) => filterPFForm6AEmployeeData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter PF Form 6A employee data');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to filter PF Form 6A employee data');
        }
    });
}
export function useSearchPFForm6AReport() {
    return useMutation({
        mutationFn: (data: PFForm6AReportSearchRequest) => searchPFForm6AReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search PF Form 6A report');
            }
        },
        onError: (error: Error) => {
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
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: MonthEndReportSearchRequest) => searchMonthEndReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search month end report');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to search month end report');
        }
    });
}
export function useFilterEmployeeContributionReport() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeContributionReportFilterRequest) => filterEmployeeContributionData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter employee contribution data');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to filter employee contribution data');
        }
    });
}
export function useSearchEmployeeContributionDetails() {
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeContributionReportSearchRequest) => searchEmployeeContributionDetails(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search employee contribution details');
            }
        },
        onError: (error: Error) => {
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
    const _queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [HRMS_QUERY_KEYS.CUMULATIVE_SALARY_REPORT_SEARCH, searchParams ?? {}, filterParams ?? {}],
        queryFn: async () => {
            const { getCumulativeSalaryReportList } = await import('@/server/hrms/hrmsConfig/reports/cumulative-salary-report');
            const result = await getCumulativeSalaryReportList(searchParams, filterParams);
            return result;
        },
        staleTime: 0,
        enabled // Only fetch when enabled (when search criteria are present)
    });
    return {
        ...query,
        refetchAll: () => {
            return _queryClient.invalidateQueries({
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
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CumulativeSalaryReportSearchRequest) => {
            return searchCumulativeSalaryReport(data);
        },
        onSuccess: (response: { success: boolean; message?: string }) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search salary report');
            } else {
                // Invalidate queries to refresh data
                _queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.CUMULATIVE_SALARY_REPORT_SEARCH]
                });
            }
        },
        onError: (error: Error) => {
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
    const _queryClient = useQueryClient();

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
            return _queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT_SEARCH]
            });
        }
    };
}
export function useEmployeeInOutReportDepartments(MI_Id = 30, UserId = 0, IVRMRT_Id = 0, multipletype = '', enabled = true) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT_DEPARTMENTS, MI_Id, UserId, IVRMRT_Id, multipletype],
        queryFn: async () => {
            const { getEmployeeInOutReportDepartments } = await import('@/server/hrms/hrmsConfig/reports/employee-inout-report');
            return getEmployeeInOutReportDepartments(MI_Id, UserId, IVRMRT_Id, multipletype);
        },
        staleTime: 2 * 60 * 1000,
        enabled: enabled && multipletype.length > 0 // Only fetch when types are selected
    });
}
export function useEmployeeInOutReportDesignations(MI_Id = 30, multipledep = '', enabled = true) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT_DESIGNATIONS, MI_Id, multipledep],
        queryFn: async () => {
            const { getEmployeeInOutReportDesignations } = await import('@/server/hrms/hrmsConfig/reports/employee-inout-report');
            return getEmployeeInOutReportDesignations(MI_Id, multipledep);
        },
        staleTime: 2 * 60 * 1000,
        enabled: enabled && multipledep.length > 0 // Only fetch when departments are selected
    });
}
export function useEmployeeInOutReportEmployees(MI_Id = 30, multipledes = '', multipledep = '', multipletype = '', enabled = true) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT_EMPLOYEES, MI_Id, multipledes, multipledep, multipletype],
        queryFn: async () => {
            const { getEmployeeInOutReportEmployees } = await import('@/server/hrms/hrmsConfig/reports/employee-inout-report');
            return getEmployeeInOutReportEmployees(MI_Id, multipledes, multipledep, multipletype);
        },
        staleTime: 2 * 60 * 1000,
        enabled: enabled && (multipledes.length > 0 || multipledep.length > 0 || multipletype.length > 0) // Only fetch when at least one filter is selected
    });
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
    const _queryClient = useQueryClient();

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
            return _queryClient.invalidateQueries({
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
    const _queryClient = useQueryClient();

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
            return _queryClient.invalidateQueries({
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
    const _queryClient = useQueryClient();

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
            return _queryClient.invalidateQueries({
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
    const _queryClient = useQueryClient();

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
            return _queryClient.invalidateQueries({
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
    const _queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmployeeAdvanceReportSearchRequest) => searchEmployeeAdvanceReport(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to search advance report');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to search advance report');
        }
    });
}
// ============================================================================
// EMPLOYEE OFFER AND EXPERIENCE REPORT
// ============================================================================
export function useFilterEmployeeOfferAndExperienceData() {
    const _queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: EmployeeOfferAndExperienceReportFilterRequest) => filterEmployeeOfferAndExperienceData(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to filter employee data');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to filter employee data');
        }
    });
}
export function useGetEmployeeDetailsBySelection() {
    const _queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: EmployeeOfferAndExperienceReportSearchRequest) => getEmployeeDetailsBySelection(data),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error(response.message || 'Failed to get employee details');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to get employee details');
        }
    });
}
// ============================================================================
// LEAVE REPORT
// ============================================================================
/**
 * Hook to fetch leave report data
 * POST /api/LeaveReportWrapperFacade/GetLeaveReport
 */
export function useLeaveReport(request?: { MI_Id?: number }, enabled = true) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT, request?.MI_Id],
        queryFn: async () => {
            try {
                const response = await getLeaveReport({
                    MI_Id: request?.MI_Id || HRMS_MI_ID
                });
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch leave report');
                }
                // Extract leave report list from API response
                const data = response.data;

                // Map GridviewDetails, leaveReportList, reportList, or leaveList to reportList
                let reportList: any[] = [];

                if (data.GridviewDetails && Array.isArray(data.GridviewDetails)) {
                    reportList = data.GridviewDetails;
                } else if (data.leaveReportList && Array.isArray(data.leaveReportList)) {
                    reportList = data.leaveReportList;
                } else if (data.reportList && Array.isArray(data.reportList)) {
                    reportList = data.reportList;
                } else if (data.leaveList && Array.isArray(data.leaveList)) {
                    reportList = data.leaveList;
                } else if (Array.isArray(data)) {
                    reportList = data;
                }
                // Map to leave report format matching LeaveReportRow interface
                const mappedReportList = reportList.map((item: any, index: number) => ({
                    slNo: index + 1,
                    employeeCode: item.HRME_EmployeeCode || item.employeeCode || '',
                    employeeName:
                        `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                        item.employeeName ||
                        '',
                    leaveName: item.HRML_LeaveName || item.leaveName || '',
                    fromDate: item.HRELAP_FromDate || item.fromDate || '',
                    toDate: item.HRELAP_ToDate || item.toDate || '',
                    appliedDays: item.HRELAP_TotalDays || item.appliedDays || 0,
                    leaveStatus: (item.HRELAP_ApplicationStatus || item.leaveStatus || 'Pending') as 'Approved' | 'Pending' | 'Rejected',
                    leaveBalance: item.HRELS_TotalLeaves || item.leaveBalance || 0
                }));
                return {
                    success: true,
                    data: {
                        reportList: mappedReportList
                    },
                    rawData: data,
                    message: response.message || 'Leave report fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch leave report');
            }
        },
        enabled: enabled && request?.MI_Id !== undefined, // Only fetch when MI_Id is provided
        staleTime: 0 // Don't cache as this might be filter-dependent
    });
}
/**
 * Hook to fetch departments for period leave report
 * POST /api/LeaveReportWrapperFacade/PeriodGetDepartments
 */
export function usePeriodLeaveReportDepartments(request?: { MI_Id?: number; emptypes?: any[] }, enabled = true) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT, 'period-departments', request?.MI_Id, request?.emptypes],
        queryFn: async () => {
            try {
                const response = await getPeriodLeaveReportDepartments({
                    MI_Id: request?.MI_Id || HRMS_MI_ID,
                    emptypes: request?.emptypes || []
                });
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch departments for period leave report');
                }
                // Extract and map department options from API response
                const data = response.data;
                // Map DepartmentTempDto to departmentOptions
                const departmentOptions = (data.DepartmentTempDto || [])
                    .map((item: any) => ({
                        label: item.HRMD_DepartmentName || item.label || '',
                        value: String(item.HRMD_Id || item.value || '')
                    }))
                    .filter((item: { label: string; value: string }) => item.label && item.value);
                // Also check other possible locations
                if (departmentOptions.length === 0 && data.departmentdropdownlist && Array.isArray(data.departmentdropdownlist)) {
                    const mapped = data.departmentdropdownlist
                        .map((item: any) => ({
                            label: item.HRMD_DepartmentName || item.label || item.name || '',
                            value: String(item.HRMD_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        departmentOptions.push(...mapped);
                    }
                }
                // Check GridviewDetails as fallback
                if (departmentOptions.length === 0 && data.GridviewDetails && Array.isArray(data.GridviewDetails)) {
                    const mapped = data.GridviewDetails.map((item: any) => ({
                        label: item.HRMD_DepartmentName || item.label || item.name || '',
                        value: String(item.HRMD_Id || item.value || item.id || '')
                    })).filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        departmentOptions.push(...mapped);
                    }
                }
                // Check departmentList or departments as fallback
                if (departmentOptions.length === 0 && data.departmentList && Array.isArray(data.departmentList)) {
                    const mapped = data.departmentList
                        .map((item: any) => ({
                            label: item.HRMD_DepartmentName || item.label || item.name || '',
                            value: String(item.HRMD_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        departmentOptions.push(...mapped);
                    }
                }
                if (departmentOptions.length === 0 && data.departments && Array.isArray(data.departments)) {
                    const mapped = data.departments
                        .map((item: any) => ({
                            label: item.HRMD_DepartmentName || item.label || item.name || '',
                            value: String(item.HRMD_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        departmentOptions.push(...mapped);
                    }
                }
                return {
                    success: true,
                    data: {
                        departmentOptions
                    },
                    rawData: data,
                    message: response.message || 'Departments for period leave report fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch departments for period leave report');
            }
        },
        enabled: enabled && request?.MI_Id !== undefined, // Only fetch when MI_Id is provided
        staleTime: 0 // Don't cache as this is filter-dependent
    });
}
/**
 * Hook to fetch designations for period leave report
 * POST /api/LeaveReportWrapperFacade/PeriodGetDesignation
 */
export function usePeriodLeaveReportDesignation(request?: { MI_Id?: number; emptypes?: any[] }, enabled = true) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT, 'period-designations', request?.MI_Id, request?.emptypes],
        queryFn: async () => {
            try {
                const response = await getPeriodLeaveReportDesignation({
                    MI_Id: request?.MI_Id || HRMS_MI_ID,
                    emptypes: request?.emptypes || []
                });
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch designations for period leave report');
                }
                // Extract and map designation options from API response
                const data = response.data;
                // Map DesignationTempDto to designationOptions
                const designationOptions = (data.DesignationTempDto || [])
                    .map((item: any) => ({
                        label: item.HRMDES_DesignationName || item.label || '',
                        value: String(item.HRMDES_Id || item.value || '')
                    }))
                    .filter((item: { label: string; value: string }) => item.label && item.value);
                // Also check other possible locations
                if (designationOptions.length === 0 && data.designationdropdownlist && Array.isArray(data.designationdropdownlist)) {
                    const mapped = data.designationdropdownlist
                        .map((item: any) => ({
                            label: item.HRMDES_DesignationName || item.label || item.name || '',
                            value: String(item.HRMDES_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        designationOptions.push(...mapped);
                    }
                }
                // Check GridviewDetails as fallback
                if (designationOptions.length === 0 && data.GridviewDetails && Array.isArray(data.GridviewDetails)) {
                    const mapped = data.GridviewDetails.map((item: any) => ({
                        label: item.HRMDES_DesignationName || item.label || item.name || '',
                        value: String(item.HRMDES_Id || item.value || item.id || '')
                    })).filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        designationOptions.push(...mapped);
                    }
                }
                // Check designationList or designations as fallback
                if (designationOptions.length === 0 && data.designationList && Array.isArray(data.designationList)) {
                    const mapped = data.designationList
                        .map((item: any) => ({
                            label: item.HRMDES_DesignationName || item.label || item.name || '',
                            value: String(item.HRMDES_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        designationOptions.push(...mapped);
                    }
                }
                if (designationOptions.length === 0 && data.designations && Array.isArray(data.designations)) {
                    const mapped = data.designations
                        .map((item: any) => ({
                            label: item.HRMDES_DesignationName || item.label || item.name || '',
                            value: String(item.HRMDES_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        designationOptions.push(...mapped);
                    }
                }
                return {
                    success: true,
                    data: {
                        designationOptions
                    },
                    rawData: data,
                    message: response.message || 'Designations for period leave report fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch designations for period leave report');
            }
        },
        enabled: enabled && request?.MI_Id !== undefined, // Only fetch when MI_Id is provided
        staleTime: 0 // Don't cache as this is filter-dependent
    });
}
/**
 * Hook to fetch employees for period leave report
 * POST /api/LeaveReportWrapperFacade/PeriodGetEmployees
 */
export function usePeriodLeaveReportEmployees(request?: { MI_Id?: number; emptypes?: any[]; empdept?: any[] }, enabled = true) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT, 'period-employees', request?.MI_Id, request?.emptypes, request?.empdept],
        queryFn: async () => {
            try {
                const response = await getPeriodLeaveReportEmployees({
                    MI_Id: request?.MI_Id || HRMS_MI_ID,
                    emptypes: request?.emptypes || [],
                    empdept: request?.empdept || []
                });
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch employees for period leave report');
                }
                // Extract employee list from API response
                const data = response.data;

                // Map GridviewDetails, employeeList, employees, or employeelist to employeeList
                let employeeList: any[] = [];

                if (data.GridviewDetails && Array.isArray(data.GridviewDetails)) {
                    employeeList = data.GridviewDetails;
                } else if (data.employeeList && Array.isArray(data.employeeList)) {
                    employeeList = data.employeeList;
                } else if (data.employees && Array.isArray(data.employees)) {
                    employeeList = data.employees;
                } else if (data.employeelist && Array.isArray(data.employeelist)) {
                    employeeList = data.employeelist;
                } else if (Array.isArray(data)) {
                    employeeList = data;
                }
                // Map to employee format for dropdowns
                const employeeOptions = employeeList
                    .map((item: any) => ({
                        id: item.HRME_Id || item.id || 0,
                        employeeCode: item.HRME_EmployeeCode || item.employeeCode || '',
                        employeeName:
                            `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                            item.employeeName ||
                            '',
                        departmentId: item.HRMD_Id || item.departmentId || 0,
                        departmentName: item.HRMD_DepartmentName || item.departmentName || '',
                        designationId: item.HRMDES_Id || item.designationId || 0,
                        designationName: item.HRMDES_DesignationName || item.designationName || '',
                        label:
                            `${item.HRME_EmployeeCode || ''} - ${`${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim()}`.trim() ||
                            item.label ||
                            '',
                        value: String(item.HRME_Id || item.value || item.id || '')
                    }))
                    .filter((item: { label: string; value: string }) => item.label && item.value);
                return {
                    success: true,
                    data: {
                        employeeOptions,
                        employeeList: employeeList.map((item: any) => ({
                            id: item.HRME_Id || item.id || 0,
                            employeeCode: item.HRME_EmployeeCode || item.employeeCode || '',
                            employeeName:
                                `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                                item.employeeName ||
                                '',
                            departmentId: item.HRMD_Id || item.departmentId || 0,
                            departmentName: item.HRMD_DepartmentName || item.departmentName || '',
                            designationId: item.HRMDES_Id || item.designationId || 0,
                            designationName: item.HRMDES_DesignationName || item.designationName || ''
                        }))
                    },
                    rawData: data,
                    message: response.message || 'Employees for period leave report fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch employees for period leave report');
            }
        },
        enabled: enabled && request?.MI_Id !== undefined, // Only fetch when MI_Id is provided
        staleTime: 0 // Don't cache as this is filter-dependent
    });
}
/**
 * Hook to fetch departments for leave report
 * POST /api/LeaveReportWrapperFacade/GetDepartments
 */
export function useLeaveReportDepartments(request?: { MI_Id?: number; emptypes?: any[] }, enabled = true) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT, 'departments', request?.MI_Id, request?.emptypes],
        queryFn: async () => {
            try {
                const response = await getLeaveReportDepartments({
                    MI_Id: request?.MI_Id || HRMS_MI_ID,
                    emptypes: request?.emptypes || []
                });
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch departments');
                }
                // Extract and map department options from API response
                const data = response.data;
                // Map DepartmentTempDto to departmentOptions
                const departmentOptions = (data.DepartmentTempDto || [])
                    .map((item: any) => ({
                        label: item.HRMD_DepartmentName || item.label || '',
                        value: String(item.HRMD_Id || item.value || '')
                    }))
                    .filter((item: { label: string; value: string }) => item.label && item.value);
                // Also check other possible locations
                if (departmentOptions.length === 0 && data.departmentdropdownlist && Array.isArray(data.departmentdropdownlist)) {
                    const mapped = data.departmentdropdownlist
                        .map((item: any) => ({
                            label: item.HRMD_DepartmentName || item.label || item.name || '',
                            value: String(item.HRMD_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        departmentOptions.push(...mapped);
                    }
                }
                // Check GridviewDetails as fallback
                if (departmentOptions.length === 0 && data.GridviewDetails && Array.isArray(data.GridviewDetails)) {
                    const mapped = data.GridviewDetails.map((item: any) => ({
                        label: item.HRMD_DepartmentName || item.label || item.name || '',
                        value: String(item.HRMD_Id || item.value || item.id || '')
                    })).filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        departmentOptions.push(...mapped);
                    }
                }
                // Check departmentList or departments as fallback
                if (departmentOptions.length === 0 && data.departmentList && Array.isArray(data.departmentList)) {
                    const mapped = data.departmentList
                        .map((item: any) => ({
                            label: item.HRMD_DepartmentName || item.label || item.name || '',
                            value: String(item.HRMD_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        departmentOptions.push(...mapped);
                    }
                }
                if (departmentOptions.length === 0 && data.departments && Array.isArray(data.departments)) {
                    const mapped = data.departments
                        .map((item: any) => ({
                            label: item.HRMD_DepartmentName || item.label || item.name || '',
                            value: String(item.HRMD_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        departmentOptions.push(...mapped);
                    }
                }
                return {
                    success: true,
                    data: {
                        departmentOptions
                    },
                    rawData: data,
                    message: response.message || 'Departments fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch departments');
            }
        },
        enabled: enabled && request?.MI_Id !== undefined, // Only fetch when MI_Id is provided
        staleTime: 0 // Don't cache as this is filter-dependent
    });
}
/**
 * Hook to fetch designations for leave report
 * POST /api/LeaveReportWrapperFacade/GetDesignation
 */
export function useLeaveReportDesignation(request?: { MI_Id?: number; emptypes?: any[] }, enabled = true) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT, 'designations', request?.MI_Id, request?.emptypes],
        queryFn: async () => {
            try {
                const response = await getPeriodLeaveReportDesignation({
                    MI_Id: request?.MI_Id || HRMS_MI_ID,
                    emptypes: request?.emptypes || []
                });
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch designations');
                }
                // Extract and map designation options from API response
                const data = response.data;
                // Map DesignationTempDto to designationOptions
                const designationOptions = (data.DesignationTempDto || [])
                    .map((item: any) => ({
                        label: item.HRMDES_DesignationName || item.label || '',
                        value: String(item.HRMDES_Id || item.value || '')
                    }))
                    .filter((item: { label: string; value: string }) => item.label && item.value);
                // Also check other possible locations
                if (designationOptions.length === 0 && data.designationdropdownlist && Array.isArray(data.designationdropdownlist)) {
                    const mapped = data.designationdropdownlist
                        .map((item: any) => ({
                            label: item.HRMDES_DesignationName || item.label || item.name || '',
                            value: String(item.HRMDES_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        designationOptions.push(...mapped);
                    }
                }
                // Check GridviewDetails as fallback
                if (designationOptions.length === 0 && data.GridviewDetails && Array.isArray(data.GridviewDetails)) {
                    const mapped = data.GridviewDetails.map((item: any) => ({
                        label: item.HRMDES_DesignationName || item.label || item.name || '',
                        value: String(item.HRMDES_Id || item.value || item.id || '')
                    })).filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        designationOptions.push(...mapped);
                    }
                }
                // Check designationList or designations as fallback
                if (designationOptions.length === 0 && data.designationList && Array.isArray(data.designationList)) {
                    const mapped = data.designationList
                        .map((item: any) => ({
                            label: item.HRMDES_DesignationName || item.label || item.name || '',
                            value: String(item.HRMDES_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        designationOptions.push(...mapped);
                    }
                }
                if (designationOptions.length === 0 && data.designations && Array.isArray(data.designations)) {
                    const mapped = data.designations
                        .map((item: any) => ({
                            label: item.HRMDES_DesignationName || item.label || item.name || '',
                            value: String(item.HRMDES_Id || item.value || item.id || '')
                        }))
                        .filter((item: { label: string; value: string }) => item.label && item.value);
                    if (mapped.length > 0) {
                        designationOptions.push(...mapped);
                    }
                }
                return {
                    success: true,
                    data: {
                        designationOptions
                    },
                    rawData: data,
                    message: response.message || 'Designations fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch designations');
            }
        },
        enabled: enabled && request?.MI_Id !== undefined, // Only fetch when MI_Id is provided
        staleTime: 0 // Don't cache as this is filter-dependent
    });
}
/**
 * Hook to fetch employees for leave report
 * POST /api/LeaveReportWrapperFacade/GetEmployees
 */
export function useLeaveReportEmployees(request?: { MI_Id?: number; emptypes?: any[]; empdept?: any[] }, enabled = true) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT, 'employees', request?.MI_Id, request?.emptypes, request?.empdept],
        queryFn: async () => {
            try {
                const response = await getPeriodLeaveReportEmployees({
                    MI_Id: request?.MI_Id || HRMS_MI_ID,
                    emptypes: request?.emptypes || [],
                    empdept: request?.empdept || []
                });
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch employees');
                }
                // Extract employee list from API response
                const data = response.data;

                // Map GridviewDetails, employeeList, employees, or employeelist to employeeList
                let employeeList: any[] = [];

                if (data.GridviewDetails && Array.isArray(data.GridviewDetails)) {
                    employeeList = data.GridviewDetails;
                } else if (data.employeeList && Array.isArray(data.employeeList)) {
                    employeeList = data.employeeList;
                } else if (data.employees && Array.isArray(data.employees)) {
                    employeeList = data.employees;
                } else if (data.employeelist && Array.isArray(data.employeelist)) {
                    employeeList = data.employeelist;
                } else if (Array.isArray(data)) {
                    employeeList = data;
                }
                // Map to employee format for dropdowns
                const employeeOptions = employeeList
                    .map((item: any) => ({
                        id: item.HRME_Id || item.id || 0,
                        employeeCode: item.HRME_EmployeeCode || item.employeeCode || '',
                        employeeName:
                            `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                            item.employeeName ||
                            '',
                        departmentId: item.HRMD_Id || item.departmentId || 0,
                        departmentName: item.HRMD_DepartmentName || item.departmentName || '',
                        designationId: item.HRMDES_Id || item.designationId || 0,
                        designationName: item.HRMDES_DesignationName || item.designationName || '',
                        label:
                            `${item.HRME_EmployeeCode || ''} - ${`${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim()}`.trim() ||
                            item.label ||
                            '',
                        value: String(item.HRME_Id || item.value || item.id || '')
                    }))
                    .filter((item: { label: string; value: string }) => item.label && item.value);
                return {
                    success: true,
                    data: {
                        employeeOptions,
                        employeeList: employeeList.map((item: any) => ({
                            id: item.HRME_Id || item.id || 0,
                            employeeCode: item.HRME_EmployeeCode || item.employeeCode || '',
                            employeeName:
                                `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                                item.employeeName ||
                                '',
                            departmentId: item.HRMD_Id || item.departmentId || 0,
                            departmentName: item.HRMD_DepartmentName || item.departmentName || '',
                            designationId: item.HRMDES_Id || item.designationId || 0,
                            designationName: item.HRMDES_DesignationName || item.designationName || ''
                        }))
                    },
                    rawData: data,
                    message: response.message || 'Employees fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch employees');
            }
        },
        enabled: enabled && request?.MI_Id !== undefined, // Only fetch when MI_Id is provided
        staleTime: 0 // Don't cache as this is filter-dependent
    });
}
/**
 * Hook to fetch leave report data with filters
 * POST /api/LeaveReportWrapperFacade/GetReport
 */
export function useLeaveReportData(
    request?: {
        MI_Id?: number;
        selectedLeave?: string;
        selectedEmployee?: string;
        HRELTD_FromDate?: string;
        HRELT_ToDate?: string;
        Edit_flag?: boolean;
        selectedreport?: number[];
        UserId?: number;
    },
    enabled = true
) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT, 'report-data', request],
        queryFn: async () => {
            try {
                const response = await getLeaveReportData({
                    MI_Id: request?.MI_Id || HRMS_MI_ID,
                    selectedLeave: request?.selectedLeave || '',
                    selectedEmployee: request?.selectedEmployee || '',
                    HRELTD_FromDate: request?.HRELTD_FromDate || '',
                    HRELT_ToDate: request?.HRELT_ToDate || '',
                    Edit_flag: request?.Edit_flag ?? true,
                    selectedreport: request?.selectedreport || [],
                    UserId: request?.UserId || 0
                });
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch leave report data');
                }
                // Extract report list from API response
                const data = response.data;

                // Map GridviewDetails, reportList, leaveReportList, or reportData to reportList
                let reportList: any[] = [];

                if (data.GridviewDetails && Array.isArray(data.GridviewDetails)) {
                    reportList = data.GridviewDetails;
                } else if (data.reportList && Array.isArray(data.reportList)) {
                    reportList = data.reportList;
                } else if (data.leaveReportList && Array.isArray(data.leaveReportList)) {
                    reportList = data.leaveReportList;
                } else if (data.reportData && Array.isArray(data.reportData)) {
                    reportList = data.reportData;
                } else if (Array.isArray(data)) {
                    reportList = data;
                }
                // Map to leave report format matching LeaveReportRow interface
                const mappedReportList = reportList.map((item: any, index: number) => ({
                    slNo: index + 1,
                    employeeCode: item.HRME_EmployeeCode || item.employeeCode || '',
                    employeeName:
                        `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                        item.employeeName ||
                        '',
                    leaveName: item.HRML_LeaveName || item.leaveName || '',
                    fromDate: item.HRELAP_FromDate || item.HRELTD_FromDate || item.fromDate || '',
                    toDate: item.HRELAP_ToDate || item.HRELT_ToDate || item.toDate || '',
                    appliedDays: item.HRELAP_TotalDays || item.appliedDays || 0,
                    leaveStatus: (item.HRELAP_ApplicationStatus || item.leaveStatus || 'Pending') as 'Approved' | 'Pending' | 'Rejected',
                    leaveBalance: item.HRELS_TotalLeaves || item.leaveBalance || 0
                }));
                return {
                    success: true,
                    data: {
                        reportList: mappedReportList
                    },
                    rawData: data,
                    message: response.message || 'Leave report data fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch leave report data');
            }
        },
        enabled: enabled && request?.MI_Id !== undefined, // Only fetch when MI_Id is provided
        staleTime: 0 // Don't cache as this is filter-dependent
    });
}
/**
 * Hook to fetch period leave report data with filters
 * POST /api/LeaveReportWrapperFacade/PeriodGetReport
 */
export function usePeriodLeaveReportData(
    request?: {
        MI_Id?: number;
        selectedLeave?: string;
        selectedEmployee?: string;
        HRELTD_FromDate?: string;
        HRELT_ToDate?: string;
        Edit_flag?: boolean;
        selectedreport?: number[];
        UserId?: number;
    },
    enabled = true
) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT, 'period-report-data', request],
        queryFn: async () => {
            try {
                const response = await getPeriodLeaveReportData({
                    MI_Id: request?.MI_Id || HRMS_MI_ID,
                    selectedLeave: request?.selectedLeave || '',
                    selectedEmployee: request?.selectedEmployee || '',
                    HRELTD_FromDate: request?.HRELTD_FromDate || '',
                    HRELT_ToDate: request?.HRELT_ToDate || '',
                    Edit_flag: request?.Edit_flag ?? true,
                    selectedreport: request?.selectedreport || [],
                    UserId: request?.UserId || 0
                });
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch period leave report data');
                }
                // Extract period report list from API response
                const data = response.data;

                // Map GridviewDetails, periodReportList, leavePeriodReportList, or reportData to reportList
                let reportList: any[] = [];

                if (data.GridviewDetails && Array.isArray(data.GridviewDetails)) {
                    reportList = data.GridviewDetails;
                } else if (data.periodReportList && Array.isArray(data.periodReportList)) {
                    reportList = data.periodReportList;
                } else if (data.leavePeriodReportList && Array.isArray(data.leavePeriodReportList)) {
                    reportList = data.leavePeriodReportList;
                } else if (data.reportData && Array.isArray(data.reportData)) {
                    reportList = data.reportData;
                } else if (Array.isArray(data)) {
                    reportList = data;
                }
                // Map to period leave report format
                const mappedReportList = reportList.map((item: any, index: number) => ({
                    slNo: index + 1,
                    employeeCode: item.HRME_EmployeeCode || item.employeeCode || '',
                    employeeName:
                        `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                        item.employeeName ||
                        '',
                    leaveName: item.HRML_LeaveName || item.leaveName || '',
                    period: item.period || item.periodName || '',
                    openingBalance: item.HRELS_OBLeaves || item.openingBalance || 0,
                    creditedLeaves: item.HRELS_CreditedLeaves || item.creditedLeaves || 0,
                    totalLeaves: item.HRELS_TotalLeaves || item.totalLeaves || 0,
                    carryForward: item.HRELS_CBLeaves || item.carryForward || 0,
                    transactionLeaves: item.HRELS_TransLeaves || item.transactionLeaves || 0,
                    encashedLeaves: item.HRELS_EncashedLeaves || item.encashedLeaves || 0,
                    departmentName: item.HRMD_DepartmentName || item.departmentName || '',
                    designationName: item.HRMDES_DesignationName || item.designationName || ''
                }));
                return {
                    success: true,
                    data: {
                        reportList: mappedReportList
                    },
                    rawData: data,
                    message: response.message || 'Period leave report data fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch period leave report data');
            }
        },
        enabled: enabled && request?.MI_Id !== undefined, // Only fetch when MI_Id is provided
        staleTime: 0 // Don't cache as this is filter-dependent
    });
}
/**
 * Hook to fetch yearwise leave report data with filters
 * POST /api/LeaveReportWrapperFacade/GetReportYearwise
 */
export function useLeaveReportYearwise(
    request?: {
        MI_Id?: number;
        selectedLeave?: string;
        selectedEmployee?: string;
        HRELTD_FromDate?: string;
        HRELT_ToDate?: string;
        Edit_flag?: boolean;
        selectedreport?: number[];
        UserId?: number;
        valreturn?: string;
    },
    enabled = true
) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_REPORT, 'yearwise-report', request],
        queryFn: async () => {
            try {
                const response = await getLeaveReportYearwise({
                    MI_Id: request?.MI_Id || HRMS_MI_ID,
                    selectedLeave: request?.selectedLeave || '',
                    selectedEmployee: request?.selectedEmployee || '',
                    HRELTD_FromDate: request?.HRELTD_FromDate || '',
                    HRELT_ToDate: request?.HRELT_ToDate || '',
                    Edit_flag: request?.Edit_flag ?? true,
                    selectedreport: request?.selectedreport || [],
                    UserId: request?.UserId || 0,
                    valreturn: request?.valreturn || ''
                });
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch yearwise leave report data');
                }
                // Extract yearwise report list from API response
                const data = response.data;

                // Map GridviewDetails, yearwiseReportList, leaveYearwiseReportList, or reportData to reportList
                let reportList: any[] = [];

                if (data.GridviewDetails && Array.isArray(data.GridviewDetails)) {
                    reportList = data.GridviewDetails;
                } else if (data.yearwiseReportList && Array.isArray(data.yearwiseReportList)) {
                    reportList = data.yearwiseReportList;
                } else if (data.leaveYearwiseReportList && Array.isArray(data.leaveYearwiseReportList)) {
                    reportList = data.leaveYearwiseReportList;
                } else if (data.reportData && Array.isArray(data.reportData)) {
                    reportList = data.reportData;
                } else if (Array.isArray(data)) {
                    reportList = data;
                }
                // Map to yearwise leave report format
                const mappedReportList = reportList.map((item: any, index: number) => ({
                    slNo: index + 1,
                    employeeCode: item.HRME_EmployeeCode || item.employeeCode || '',
                    employeeName:
                        `${item.HRME_EmployeeFirstName || ''} ${item.HRME_EmployeeMiddleName || ''} ${item.HRME_EmployeeLastName || ''}`.trim() ||
                        item.employeeName ||
                        '',
                    leaveName: item.HRML_LeaveName || item.leaveName || '',
                    year: item.year || item.yearName || '',
                    openingBalance: item.HRELS_OBLeaves || item.openingBalance || 0,
                    creditedLeaves: item.HRELS_CreditedLeaves || item.creditedLeaves || 0,
                    totalLeaves: item.HRELS_TotalLeaves || item.totalLeaves || 0,
                    carryForward: item.HRELS_CBLeaves || item.carryForward || 0,
                    transactionLeaves: item.HRELS_TransLeaves || item.transactionLeaves || 0,
                    encashedLeaves: item.HRELS_EncashedLeaves || item.encashedLeaves || 0,
                    departmentName: item.HRMD_DepartmentName || item.departmentName || '',
                    designationName: item.HRMDES_DesignationName || item.designationName || ''
                }));
                const dataAny = data as any;
                return {
                    success: true,
                    data: {
                        reportList: mappedReportList,
                        valreturn: dataAny.valreturn || ''
                    },
                    rawData: data,
                    message: response.message || 'Yearwise leave report data fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch yearwise leave report data');
            }
        },
        enabled: enabled && request?.MI_Id !== undefined, // Only fetch when MI_Id is provided
        staleTime: 0 // Don't cache as this is filter-dependent
    });
}

//Master dropdown

export const useMasterGroupTypes = () => {
    const _queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPES],
            queryFn: async () => getMasterGroupTypes(),
            staleTime: 0
        }),
        refetchAll: () => {
            return _queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPES]
            });
        }
    };
};

export const useMasterDepartments = () => {
    const _queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_DEAPARTMENTS],
            queryFn: async () => getMasterDepartments(),
            staleTime: 0
        }),
        refetchAll: () => {
            return _queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_DEAPARTMENTS]
            });
        }
    };
};

export const useMasterDesignations = () => {
    const _queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATIONS],
            queryFn: async () => getMasterDesignations(),
            staleTime: 0
        }),
        refetchAll: () => {
            return _queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATIONS]
            });
        }
    };
};

export const useMasterMonths = () => {
    const _queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_MONTHS],
            queryFn: async () => getMasterMonths(),
            staleTime: 0
        }),
        refetchAll: () => {
            return _queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_MONTHS]
            });
        }
    };
};

export const useMasterYears = () => {
    const _queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_YEARS],
            queryFn: async () => getMasterYears(),
            staleTime: 0
        }),
        refetchAll: () => {
            return _queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_YEARS]
            });
        }
    };
};

export const useMasterEmployeeTypes = () => {
    const _queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPES],
            queryFn: async () => getMasterEmployeeTypes(),
            staleTime: 0
        }),
        refetchAll: () => {
            return _queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPES]
            });
        }
    };
};

export const useMasterPaymentModeList = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_PAYMENT_MODE_LIST],
            queryFn: async () => getMasterPaymentModeList(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PAYMENT_MODE_LIST]
            });
        }
    };
};
