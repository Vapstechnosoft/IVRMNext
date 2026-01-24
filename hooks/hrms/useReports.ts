'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getCumulativeSalaryReport,
    getDepartmentsByGroupType,
    getDesignationsByGroupAndDept,
    getGroupTypes,
    type CumulativeSalaryReportRequest
} from '@/server/hrms/reports/cumulative-salary-report';
import {
    getDepartmentSalaryReport,
    type DepartmentSalaryReportRequest
} from '@/server/hrms/reports/department-salary-report';
import {
    getEmployeeAdvanceReportOnload,
    searchEmployeeAdvanceReport
} from '@/server/hrms/hrmsConfig/reports/advance-report';
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
    getMasterYears
} from '@/server/hrms/master';
import { toast } from 'sonner';

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
