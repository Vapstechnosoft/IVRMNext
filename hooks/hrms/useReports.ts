'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getLeaveStatusReport,
    type LeaveStatusReportRequest
} from '@/server/hrms/reports/leave-status-report';
import {
    getCumulativeSalaryReport,
    getDepartmentsByGroupType,
    getDesignationsByGroupAndDept,
    getEmployeesByDeptAndDesignation,
    getEmployeesByGroupTypeDeptAndDesignation,
    getGroupTypes,
    type CumulativeSalaryReportRequest
} from '@/server/hrms/reports/cumulative-salary-report';
import {
    getEmployeesBankCashReport,
    type BankCashReportRequest
} from '@/server/hrms/reports/bank-cash-report';
import {
    getHeadWiseEmployeeDetails,
    type HeadWiseReportRequest
} from '@/server/hrms/reports/head-wise-report';
import {
    getDepartmentSalaryReport,
    type DepartmentSalaryReportRequest
} from '@/server/hrms/reports/department-salary-report';
import {
    getEmployeeAdvanceReportOnload,
    searchEmployeeAdvanceReport
} from '@/server/hrms/hrmsConfig/reports/advance-report';
import {
    getEmployeeContributionReportOnload,
    searchEmployeeContributionDetails
} from '@/server/hrms/hrmsConfig/reports/employee-contribution-report';
import {
    getBankCashReportOnload,
    searchBankCashReport
} from '@/server/hrms/hrmsConfig/reports/bank-cash-report';
import {
    getMasterDepartments,
    getMasterDesignations,
    getMasterEmployeeTypes,
    getMasterGroupTypes,
    getMasterMonths,
    getMasterPaymentModeList,
    getMasterYears,
    type MasterDropdown
} from '@/server/hrms/master';
import {
    getEmployeeStrengthReportOnload,
    searchEmployeeStrengthReport,
} from '@/server/hrms/hrmsConfig/reports/employee-strength-report';
import {
    searchEmployeeProfileDetails,
} from '@/server/hrms/hrmsConfig/reports/employee-profile-report';
import type { EmployeeProfileReportSearchRequest } from '@/types/hrms/reports/employee-profile-report';
import {
    getEmployeesByFilter,
    getEmployeeLetterDetails
} from '@/server/hrms/reports/employee-offer-letter';
import {
    getESIReportOnload,
    searchESIReport
} from '@/server/hrms/hrmsConfig/reports/esi-report';
import {
    getPFChallan,
    getESIReport,
    getPFForm10,
    getPFForm5,
    getPFForm6A,
    type ESIReportRequest,
    type PFForm10Request,
    type PFForm5Request,
    type PFChallanRequest,
    type PFForm6ARequest
} from '@/server/hrms/reports/esi-pf-reports';
import {
    getPFChallanReportOnload,
} from '@/server/hrms/hrmsConfig/reports/pf-challan-report';
import {
    getSalarySlipOnload,
    filterEmployeesByYearMonth,
    generateSalarySlip
} from '@/server/hrms/hrmsConfig/reports/salary-slip-report';
import {
    getYearWiseSalaryDetails,
    getMonthWiseSalaryDetails,
    type YearWiseSalaryResponse,
    type MonthWiseSalaryResponse
} from '@/server/hrms/reports/employee-salary-details';
import type {
    SalarySlipFilterRequest,
    SalarySlipGenerateRequest
} from '@/types/hrms/reports/salary-slip-report';
import {
    getEmployeeDetailsReportOnload,
    searchEmployeeDetailsReport,
    getEmployeeAndEmployeeType,
    getLoginBasedDepartmentsByGroupType,
    filterEmployeeDetailsReport,
    type EmployeeDetailsReportRequest
} from '@/server/hrms/reports/employee-details-report';
import {
    getMonthEndReport,
    type MonthEndReportRequest
} from '@/server/hrms/reports/month-end-report';

export type { EmployeeDetailsReportRequest };

import { toast } from 'sonner';
import {
    getGroupTypes as getMasterDropdownGroupTypes,
    getDepartmentsByGroupType as getMasterDropdownDepartments,
    getDesignationsByDepartment as getMasterDropdownDesignations,
    getEmployeesByDeptAndDesignation as getMasterDropdownEmployees
} from '@/server/hrms/master-dropdown';


export function useCumulativeSalaryReport() {
    return useMutation({
        mutationFn: (data: CumulativeSalaryReportRequest) => getCumulativeSalaryReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch report');
        }
    });
}

export function useReportGroupTypes() {
    return useQuery({
        queryKey: ['report-group-types'],
        queryFn: () => getGroupTypes(),
        staleTime: 1000 * 60 * 10
    });
}

export function useReportDepartments(groupTypeIds: string) {
    return useQuery({
        queryKey: ['report-departments', groupTypeIds],
        queryFn: () => getDepartmentsByGroupType(groupTypeIds),
        enabled: !!groupTypeIds && groupTypeIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}

export function useReportDesignations(groupTypeIds: string, deptIds: string) {
    return useQuery({
        queryKey: ['report-designations', groupTypeIds, deptIds],
        queryFn: () => getDesignationsByGroupAndDept(groupTypeIds, deptIds),
        enabled: !!groupTypeIds && !!deptIds,
        staleTime: 1000 * 60 * 5
    });
}

export function useReportEmployeesByDeptAndDesignation(deptIds: string, desigIds: string) {
    console.log('📡 [HOOK] Fetching employees with:', { deptIds, desigIds });
    return useQuery({
        queryKey: ['report-employees', deptIds, desigIds],
        queryFn: () => getEmployeesByDeptAndDesignation(deptIds, desigIds),
        enabled: !!deptIds && !!desigIds,
        staleTime: 1000 * 60 * 5
    });
}

// Get EMployees by Group Type, Department and Designation

export function useReportEmployeesByGroupTypeDeptAndDesignation( groupTypeIds: number[],
    deptIds: number[],
    desigIds: number[]) {
    console.log('📡 [HOOK] Fetching employees with:', { groupTypeIds, deptIds, desigIds });
    return useQuery({
        queryKey: ['report-employees', groupTypeIds, deptIds, desigIds],
        queryFn: () => getEmployeesByGroupTypeDeptAndDesignation(groupTypeIds, deptIds, desigIds),
        enabled: !!groupTypeIds && !!deptIds && !!desigIds,
        staleTime: 1000 * 60 * 5
    });
}

export function useDepartmentSalaryReport() {
    return useMutation({
        mutationFn: (data: DepartmentSalaryReportRequest) => getDepartmentSalaryReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch report');
        }
    });
}

/**
 * Hook for Employee Advance Report Onload
 */
export function useEmployeeAdvanceReportOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['employee-advance-report-onload', MI_Id, LogInUserId],
        queryFn: () => getEmployeeAdvanceReportOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

/**
 * Hook for Bank Cash Report Onload
 */
export function useBankCashReportOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['bank-cash-report-onload', MI_Id, LogInUserId],
        queryFn: () => getBankCashReportOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

/**
 * Hook for searching Bank Cash Report
 */
export function useSearchBankCashReport() {
    return useMutation({
        mutationFn: (data: any) => searchBankCashReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to search bank cash report');
        }
    });
}

export function useMasterGroupTypes() {
    return useQuery({
        queryKey: ['master-group-types'],
        queryFn: () => getMasterGroupTypes(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterDepartments() {
    return useQuery({
        queryKey: ['master-departments'],
        queryFn: () => getMasterDepartments(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterDesignations() {
    return useQuery({
        queryKey: ['master-designations'],
        queryFn: () => getMasterDesignations(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterMonths() {
    return useQuery({
        queryKey: ['master-months'],
        queryFn: () => getMasterMonths(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterYears() {
    return useQuery({
        queryKey: ['master-years'],
        queryFn: () => getMasterYears(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterPaymentModeList() {
    return useQuery({
        queryKey: ['master-payment-mode-list'],
        queryFn: () => getMasterPaymentModeList(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterEmployeeTypes() {
    return useQuery({
        queryKey: ['master-employee-types'],
        queryFn: () => getMasterEmployeeTypes(),
        staleTime: 1000 * 60 * 10
    });
}

/**
 * Hook for searching Employee Advance Report
 */
export function useSearchEmployeeAdvanceReport() {
    return useMutation({
        mutationFn: (data: any) => searchEmployeeAdvanceReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to search employee advance report');
        }
    });
}

export function useEmployeeStrengthReport() {
    return useMutation({
        mutationFn: (data: any) => searchEmployeeStrengthReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch strength report');
        }
    });
}

export function useEmployeeStrengthOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['employee-strength-report-onload', MI_Id, LogInUserId],
        queryFn: () => getEmployeeStrengthReportOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

export function useReportEmployees(designationId: number, deptId: number, groupTypeId: number) {
    return useQuery({
        queryKey: ['report-employees-filter', designationId, deptId, groupTypeId],
        queryFn: () => getEmployeesByFilter(designationId, deptId, groupTypeId),
        enabled: !!designationId && !!deptId && !!groupTypeId,
        staleTime: 1000 * 60 * 5
    });
}

export function useEmployeeLetterDetails() {
    return useMutation({
        mutationFn: ({ designationId, deptId, groupTypeId, employeeId }: { designationId: number, deptId: number, groupTypeId: number, employeeId: number }) =>
            getEmployeeLetterDetails(designationId, deptId, groupTypeId, employeeId),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch details');
        }
    });
}

export function useESIReport() {
    return useMutation({
        mutationFn: (data: ESIReportRequest) => getESIReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch ESI report');
        }
    });
}

export function useESIReportOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['esi-report-onload', MI_Id, LogInUserId],
        queryFn: () => getESIReportOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

export function usePFForm10() {
    return useMutation({
        mutationFn: (data: PFForm10Request) => getPFForm10(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch PF Form 10');
        }
    });
}

export function usePFForm5() {
    return useMutation({
        mutationFn: (data: PFForm5Request) => getPFForm5(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch PF Form 5');
        }
    });
}

export function usePFChallan() {
    return useMutation({
        mutationFn: (data: PFChallanRequest) => getPFChallan(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch PF Challan');
        }
    });
}

export function usePFChallanOnload(MI_Id: number) {
    return useQuery({
        queryKey: ['pf-challan-onload', MI_Id],
        queryFn: () => getPFChallanReportOnload(MI_Id),
        staleTime: 1000 * 60 * 10
    });
}

export function usePFForm6A() {
    return useMutation({
        mutationFn: (data: PFForm6ARequest) => getPFForm6A(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch PF Form 6A');
        }
    });
}

export function useEmployeeContributionOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['employee-contribution-onload', MI_Id, LogInUserId],
        queryFn: () => getEmployeeContributionReportOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

export function useSearchEmployeeContribution() {
    return useMutation({
        mutationFn: (data: any) => searchEmployeeContributionDetails(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch employee contribution');
        }
    });
}

/**
 * Hook for Salary Slip Onload
 */
export function useSalarySlipOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['salary-slip-onload', MI_Id, LogInUserId],
        queryFn: () => getSalarySlipOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

/**
 * Hook for Filtering Employees for Salary Slip
 */
export function useFilterEmployeesByYearMonth() {
    return useMutation({
        mutationFn: (data: SalarySlipFilterRequest) => filterEmployeesByYearMonth(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to filter employees');
        }
    });
}

/**
 * Hook for Generating Salary Slip
 */
export function useGenerateSalarySlip() {
    return useMutation({
        mutationFn: (data: SalarySlipGenerateRequest) => generateSalarySlip(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to generate salary slip');
        }
    });
}

/**
 * Hook for Year-wise Employee Salary Details
 */
export function useYearWiseSalaryDetails(year: string) {
    return useQuery({
        queryKey: ['year-wise-salary-details', year],
        queryFn: () => getYearWiseSalaryDetails(year),
        enabled: !!year,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * Hook for Month-wise Employee Salary Details (Department breakdown)
 */
export function useMonthWiseSalaryDetails(year: string, month: string) {
    return useQuery({
        queryKey: ['month-wise-salary-details', year, month],
        queryFn: () => getMonthWiseSalaryDetails(year, month),
        enabled: !!year && !!month,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * Hook for fetching Group Types for cascading dropdowns
 * Used in leave report and other forms
 */
export function useLeaveReportGroupTypes() {
    return useQuery({
        queryKey: ['leave-report-group-types'],
        queryFn: async () => {
            const response = await getMasterDropdownGroupTypes();
            return response.data || [];
        },
        staleTime: 1000 * 60 * 10
    });
}
export function useEmployeeDetailsReportOnload() {
    return useQuery({
        queryKey: ['employee-details-report-onload'],
        queryFn: () => getEmployeeDetailsReportOnload(),
        staleTime: 1000 * 60 * 10
    });
}
/**
 * Hook for Searching Employee Details Report
 */
export function useSearchEmployeeDetailsReport() {
    return useMutation({
        mutationFn: (data: EmployeeDetailsReportRequest) => searchEmployeeDetailsReport(data),
        onError: (error: Error) => {
            console.error('SEARCH MUTATION ERROR:', error);
            toast.error(error.message || 'Failed to fetch report');
        }
    });
}

/**
 * Hook for Filtering Employee Details
 */
export function useFilterEmployeeDetails() {
    return useMutation({
        mutationFn: (data: any) => filterEmployeeDetailsReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to filter data');
        }
    });
}

/**
 * Hook for fetching Employee and Employee Type
 */
export function useEmployeeAndEmployeeType() {
    return useMutation({
        mutationFn: (data: any) => getEmployeeAndEmployeeType(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch employee types');
        }
    });
}



/**
 * Hook for fetching Departments based on Group Type selection
 */
export function useLoginBasedDepartments(groupTypeIds: number[]) {
    return useQuery({
        queryKey: ['login-based-departments', groupTypeIds],
        queryFn: () => getLoginBasedDepartmentsByGroupType(groupTypeIds),
        enabled: !!groupTypeIds && groupTypeIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}
/**
 * Hook for fetching Departments by Group Type IDs
 * Cascades from Group Type selection
 */
export function useLeaveReportDepartments(groupTypeIds: number[]) {
    return useQuery({
        queryKey: ['leave-report-departments', groupTypeIds],
        queryFn: async () => {
            if (!groupTypeIds || groupTypeIds.length === 0) {
                return [];
            }
            const response = await getMasterDropdownDepartments(groupTypeIds);
            return response.data || [];
        },
        enabled: !!groupTypeIds && groupTypeIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * Hook for fetching Designations by Department IDs
 * Cascades from Department selection
 */
export function useLeaveReportDesignations(departmentIds: number[]) {
    return useQuery({
        queryKey: ['leave-report-designations', departmentIds],
        queryFn: async () => {
            if (!departmentIds || departmentIds.length === 0) {
                return [];
            }
            const response = await getMasterDropdownDesignations(departmentIds);
            return response.data || [];
        },
        enabled: !!departmentIds && departmentIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * Hook for fetching Employees using the MasterDropDown API
 * Recommended by user: GET /api/MasterDropDown/employees_drop_down_by_dept_and_designation/{hrmd_ids}/{hrmdes_ids}
 */
export function usePeriodLeaveReportEmployees(departmentIds: number[], designationIds: number[]) {
    return useQuery({
        queryKey: ['period-leave-report-employees', departmentIds, designationIds],
        queryFn: async () => {
            console.log('📡 [HOOK] Fetching employees with:', { departmentIds, designationIds });

            if (!departmentIds || departmentIds.length === 0 || !designationIds || designationIds.length === 0) {
                console.log('⚠️ [HOOK] Missing departments or designations, skipping fetch');
                return [];
            }

            try {
                // Directly call the MasterDropDown API server action
                const response = await getMasterDropdownEmployees(departmentIds, designationIds);
                console.log('✅ [HOOK] API Response:', response);
                return response.data || [];
            } catch (error) {
                console.error('❌ [HOOK] API Error:', error);
                throw error;
            }
        },
        enabled: !!departmentIds && departmentIds.length > 0 && !!designationIds && designationIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}

export function useLeaveStatusReport() {
    return useMutation({
        mutationFn: (data: LeaveStatusReportRequest) => getLeaveStatusReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Leave Status Report');
        }
    });
}

// Get employees based on the hrmE_IdList
export function useEmployeeProfileReport() {
    return useMutation({
        mutationFn: (data: EmployeeProfileReportSearchRequest) => searchEmployeeProfileDetails(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Employee Profile Report');
        }
    });
}

/**
 * Hook for Bank Cash Report
 */
export function useBankCashReport() {
    return useMutation({
        mutationFn: (data: BankCashReportRequest) => getEmployeesBankCashReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Bank Cash Report');
        }
    });
}
/**
 * Hook for Head wise Report
 */
export function useHeadWiseReport() {
    return useMutation({
        mutationFn: (data: HeadWiseReportRequest) => getHeadWiseEmployeeDetails(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Head wise Report');
        }
    });
}

/**
 * Hook for Month End Report
 */
export function useMonthEndReport() {
    return useMutation({
        mutationFn: (data: MonthEndReportRequest) => getMonthEndReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Month End Report');
        }
    });
}
