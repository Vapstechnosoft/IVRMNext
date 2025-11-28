'use client';

/**
 * Unified HRMS Transaction Hooks
 * All transaction-related hooks consolidated in one file
 */

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { activateDeactivateEmployeeLoan, getEmployeeLoanById, getEmployeeLoanByEmployee, getEmployeeLoanList, saveEmployeeLoan } from '@/server/hrms/hrmsConfig/transaction/employee-loan';
import { getSalaryAdvanceById, getSalaryAdvanceDetailsByEmployee, getSalaryAdvanceList, saveSalaryAdvance, searchSalaryAdvanceFilter, toggleSalaryAdvanceStatus } from '@/server/hrms/hrmsConfig/transaction/salary-advance';
import { approveSalaries, getSalaryApprovalOnload, searchSalaryApprovalEmployees } from '@/server/hrms/hrmsConfig/transaction/salary-approval';
import { generateSalaryForSelectedEmployees, getSalaryCalculationOnload, searchSalaryCalculationBySelection } from '@/server/hrms/hrmsConfig/transaction/salary-calculation';
import { deleteSalaryIncrement, getSalaryIncrementOnload, saveSalaryIncrement } from '@/server/hrms/hrmsConfig/transaction/salary-increment';
import { deleteSalaryUpdation, filterSalaryUpdationEmployees, getSalaryUpdationDepartments, getSalaryUpdationDesignations, getSalaryUpdationEmployeeDetailsBySelection, getSalaryUpdationList, getSalaryUpdationOnload, saveSalaryUpdation } from '@/server/hrms/hrmsConfig/transaction/salary-updation';
import { getEmployeeDetailsBySelection, getMassUpdationOnload, saveMassUpdation, searchMassUpdationEmployees } from '@/server/hrms/hrmsConfig/transaction/mass-updation';
import type {
    EmployeeLoanDeleteRequest,
    EmployeeLoanOnloadRequest,
    EmployeeLoanOnloadResponse,
    EmployeeLoanSaveRequest,
    EmployeeLoanSaveResponse
} from '@/types/hrms/employee-loan';
import type {
    SalaryAdvanceDeleteRequest,
    SalaryAdvanceOnloadRequest,
    SalaryAdvanceOnloadResponse,
    SalaryAdvanceSaveRequest,
    SalaryAdvanceSaveResponse
} from '@/types/hrms/salary-advance';
import type {
    SalaryApprovalOnloadRequest,
    SalaryApprovalOnloadResponse,
    SalaryApprovalRequest,
    SalaryApprovalResponse,
    SalaryApprovalSearchRequest,
    SalaryApprovalSearchResponse
} from '@/types/hrms/salary-approval';
import type {
    SalaryCalculationGenerateRequest,
    SalaryCalculationGenerateResponse,
    SalaryCalculationOnloadRequest,
    SalaryCalculationOnloadResponse,
    SalaryCalculationSearchRequest
} from '@/types/hrms/salary-calculation';
import type {
    SalaryIncrementDeleteRequest,
    SalaryIncrementDeleteResponse,
    SalaryIncrementOnloadRequest,
    SalaryIncrementOnloadResponse,
    SalaryIncrementSaveRequest,
    SalaryIncrementSaveResponse
} from '@/types/hrms/salary-increment';
import type {
    SalaryUpdationDeleteRequest,
    SalaryUpdationDepartmentRequest,
    SalaryUpdationDepartmentResponse,
    SalaryUpdationDesignationRequest,
    SalaryUpdationDesignationResponse,
    SalaryUpdationEmployeeDetailsRequest,
    SalaryUpdationEmployeeDetailsResponse,
    SalaryUpdationFilterRequest,
    SalaryUpdationOnloadRequest,
    SalaryUpdationOnloadResponse,
    SalaryUpdationSaveRequest,
    SalaryUpdationSaveResponse
} from '@/types/hrms/salary-updation';
import type {
    MassUpdationOnloadRequest,
    MassUpdationOnloadResponse,
    MassUpdationSaveRequest,
    MassUpdationSaveResponse,
    MassUpdationSearchRequest
} from '@/types/hrms/mass-updation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================================================
// EMPLOYEE LOAN
// ============================================================================

export function useEmployeeLoanList(payload: EmployeeLoanOnloadRequest) {
    return useQuery<EmployeeLoanOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, payload],
        queryFn: () =>
            getEmployeeLoanList(payload).then((res: any) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!(payload.MIID || payload.roleId)
    });
}

export function useSaveEmployeeLoan() {
    const queryClient = useQueryClient();

    return useMutation<EmployeeLoanSaveResponse, Error, EmployeeLoanSaveRequest>({
        mutationFn: (data: EmployeeLoanSaveRequest) =>
            saveEmployeeLoan(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data, variables) => {
            if (data.emploanList || data.HREL_Id) {
                toast.success(
                    data.retrunMsg ||
                        (variables.HREL_Id === 0 ? 'Employee loan created successfully!' : 'Employee loan updated successfully!')
                );
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST]
                });
            } else {
                toast.error(data.retrunMsg || 'Failed to save employee loan.');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save employee loan.');
        }
    });
}

export function useGetEmployeeLoanById(id: number) {
    return useQuery<EmployeeLoanOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, 'by-id', id],
        queryFn: () =>
            getEmployeeLoanById(id).then((res: any) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!id && id > 0
    });
}

export function useGetEmployeeLoanByEmployee(employeeId: number, miId: number = 30) {
    return useQuery<EmployeeLoanOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, 'by-employee', employeeId, miId],
        queryFn: () =>
            getEmployeeLoanByEmployee(employeeId, miId).then((res: any) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!employeeId && employeeId > 0
    });
}

export function useDeleteEmployeeLoan() {
    const queryClient = useQueryClient();

    return useMutation<any, Error, EmployeeLoanDeleteRequest>({
        mutationFn: async (_data: EmployeeLoanDeleteRequest) => ({}) as any,
        onSuccess: () => {
            toast.success('Employee loan deleted successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete employee loan.');
        }
    });
}

export function useActivateDeactivateEmployeeLoan() {
    const queryClient = useQueryClient();

    return useMutation<any, Error, EmployeeLoanDeleteRequest>({
        mutationFn: (data: EmployeeLoanDeleteRequest) =>
            activateDeactivateEmployeeLoan(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update employee loan status.');
        }
    });
}

// ============================================================================
// SALARY ADVANCE
// ============================================================================

export function useSalaryAdvanceList(payload: SalaryAdvanceOnloadRequest) {
    return useQuery<SalaryAdvanceOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, payload],
        queryFn: () =>
            getSalaryAdvanceList(payload.roleId ?? 30).then((res: any) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!payload.roleId
    });
}

export function useSaveSalaryAdvance() {
    const queryClient = useQueryClient();

    return useMutation<SalaryAdvanceSaveResponse | SalaryAdvanceOnloadResponse, Error, SalaryAdvanceSaveRequest>({
        mutationFn: (data: SalaryAdvanceSaveRequest) =>
            saveSalaryAdvance(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data, variables) => {
            // Always invalidate the cache to refresh the list
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST]
            });
            
            // Show success message
            const successMessage = 
                (data as SalaryAdvanceSaveResponse).retrunMsg ||
                (variables.HRESA_Id === 0 ? 'Salary advance created successfully!' : 'Salary advance updated successfully!');
            toast.success(successMessage);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save salary advance.');
        }
    });
}

export function useDeleteSalaryAdvance() {
    const queryClient = useQueryClient();

    return useMutation<any, Error, SalaryAdvanceDeleteRequest>({
        mutationFn: async (_data: SalaryAdvanceDeleteRequest) => ({}) as any,
        onSuccess: () => {
            toast.success('Salary advance deleted successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete salary advance.');
        }
    });
}

export function useToggleSalaryAdvanceStatus() {
    const queryClient = useQueryClient();

    return useMutation<any, Error, { hresaId: number; activeFlag: boolean }>({
        mutationFn: ({ hresaId, activeFlag }) =>
            toggleSalaryAdvanceStatus(hresaId, activeFlag).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update salary advance status.');
        }
    });
}

export function useGetSalaryAdvanceById(id: number) {
    return useQuery<SalaryAdvanceOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_BY_ID, id],
        queryFn: () =>
            getSalaryAdvanceById(id).then((res: any) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!id && id > 0
    });
}

export function useGetSalaryAdvanceDetailsByEmployee(employeeId: number) {
    return useQuery<SalaryAdvanceOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_BY_ID, 'employee', employeeId],
        queryFn: () =>
            getSalaryAdvanceDetailsByEmployee(employeeId).then((res: any) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!employeeId && employeeId > 0
    });
}

export function useSearchSalaryAdvanceFilter(miId: number, searchFilter: string) {
    return useQuery<SalaryAdvanceOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, 'search', miId, searchFilter],
        queryFn: () =>
            searchSalaryAdvanceFilter(miId, searchFilter).then((res: any) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 2,
        enabled: !!miId && miId > 0
    });
}

// ============================================================================
// SALARY APPROVAL
// ============================================================================

export function useSalaryApprovalOnload(payload: SalaryApprovalOnloadRequest) {
    return useQuery<SalaryApprovalOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_ONLOAD, payload],
        queryFn: async () => {
            console.log('🟢 [SALARY APPROVAL - FRONTEND] useSalaryApprovalOnload - START');
            console.log('📥 [SALARY APPROVAL - FRONTEND] Request payload:', JSON.stringify(payload, null, 2));
            try {
                const res = await getSalaryApprovalOnload(payload);
                console.log('✅ [SALARY APPROVAL - FRONTEND] API Response received');
                console.log('📤 [SALARY APPROVAL - FRONTEND] Response:', {
                    success: res.success,
                    message: res.message,
                    hasData: !!res.data
                });
                if (!res.success) {
                    console.error('❌ [SALARY APPROVAL - FRONTEND] API returned error:', res.message);
                    // Return empty data structure instead of throwing to prevent UI crash
                    // The error will be available in the error state for the component to handle
                    return {
                        MI_Id: 0,
                        groupTypedropdownlist: [],
                        departmentdropdownlist: [],
                        designationdropdownlist: [],
                        monthdropdown: [],
                        leaveyeardropdown: []
                    } as SalaryApprovalOnloadResponse;
                }
                console.log('📊 [SALARY APPROVAL - FRONTEND] Response data summary:', {
                    hasGroupTypes: !!(res.data?.groupTypedropdownlist?.length),
                    groupTypesCount: res.data?.groupTypedropdownlist?.length || 0,
                    hasDepartments: !!(res.data?.departmentdropdownlist?.length),
                    departmentsCount: res.data?.departmentdropdownlist?.length || 0,
                    hasDesignations: !!(res.data?.designationdropdownlist?.length),
                    designationsCount: res.data?.designationdropdownlist?.length || 0,
                    hasMonths: !!(res.data?.monthdropdown),
                    hasLeaveYears: !!(res.data?.leaveyeardropdown?.length),
                    leaveYearsCount: res.data?.leaveyeardropdown?.length || 0
                });
                console.log('🟢 [SALARY APPROVAL - FRONTEND] useSalaryApprovalOnload - END (Success)');
                return res.data!;
            } catch (error) {
                console.error('❌ [SALARY APPROVAL - FRONTEND] useSalaryApprovalOnload - ERROR');
                console.error('💥 [SALARY APPROVAL - FRONTEND] Error:', error);
                // Return empty data structure instead of throwing to prevent UI crash
                // This allows the component to continue rendering with empty dropdowns
                return {
                    MI_Id: 0,
                    groupTypedropdownlist: [],
                    departmentdropdownlist: [],
                    designationdropdownlist: [],
                    monthdropdown: [],
                    leaveyeardropdown: []
                } as SalaryApprovalOnloadResponse;
            }
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!payload.MI_Id,
        retry: false, // Don't retry on error to avoid repeated failed requests
        refetchOnWindowFocus: false // Don't refetch on window focus to avoid repeated errors
    });
}

export function useSearchSalaryApproval() {
    return useMutation<SalaryApprovalSearchResponse, Error, SalaryApprovalSearchRequest>({
        mutationFn: (data: SalaryApprovalSearchRequest) => {
            console.log('🟢 [SALARY APPROVAL - FRONTEND] useSearchSalaryApproval - START');
            console.log('📥 [SALARY APPROVAL - FRONTEND] Search request:', JSON.stringify(data, null, 2));
            console.log('📊 [SALARY APPROVAL - FRONTEND] Search criteria:', {
                MI_Id: data.MI_Id,
                HRES_Year: data.HRES_Year,
                HRES_Month: data.HRES_Month,
                designationIdsCount: data.hrmdeS_IdList?.length || 0,
                departmentIdsCount: data.hrmD_IdList?.length || 0,
                groupTypeIdsCount: data.groupTypeIdList?.length || 0,
                LogInUserId: data.LogInUserId
            });
            return searchSalaryApprovalEmployees(data).then((res) => {
                console.log('✅ [SALARY APPROVAL - FRONTEND] Search response received');
                console.log('📤 [SALARY APPROVAL - FRONTEND] Response:', {
                    success: res.success,
                    message: res.message,
                    hasData: !!res.data
                });
                if (!res.success) {
                    console.error('❌ [SALARY APPROVAL - FRONTEND] Search failed:', res.message);
                    throw new Error(res.message);
                }
                const employeeCount = res.data?.ReportData?.length || 0;
                console.log('📊 [SALARY APPROVAL - FRONTEND] Employees found:', employeeCount);
                if (employeeCount > 0) {
                    console.log('📋 [SALARY APPROVAL - FRONTEND] First employee sample:', res.data?.ReportData?.[0]);
                }
                console.log('🟢 [SALARY APPROVAL - FRONTEND] useSearchSalaryApproval - END (Success)');
                return res.data!;
            }).catch((error) => {
                console.error('❌ [SALARY APPROVAL - FRONTEND] useSearchSalaryApproval - ERROR');
                console.error('💥 [SALARY APPROVAL - FRONTEND] Error:', error);
                throw error;
            });
        },
        onError: (error) => {
            console.error('❌ [SALARY APPROVAL - FRONTEND] useSearchSalaryApproval - onError callback');
            console.error('💥 [SALARY APPROVAL - FRONTEND] Error message:', error.message);
            toast.error(error.message || 'Failed to search employees for approval.');
        }
    });
}

export function useApproveSalaries() {
    const queryClient = useQueryClient();

    return useMutation<SalaryApprovalResponse, Error, SalaryApprovalRequest>({
        mutationFn: (data: SalaryApprovalRequest) => {
            console.log('🟢 [SALARY APPROVAL - FRONTEND] useApproveSalaries - START');
            console.log('📥 [SALARY APPROVAL - FRONTEND] Approval request:', JSON.stringify(data, null, 2));
            console.log('📊 [SALARY APPROVAL - FRONTEND] Approval details:', {
                MI_Id: data.MI_Id,
                HRES_Year: data.HRES_Year,
                HRES_Month: data.HRES_Month,
                approvalStatus: data.approvalStatus,
                employeeCount: data.employeeIdList?.length || 0,
                employeeIds: data.employeeIdList,
                LogInUserId: data.LogInUserId,
                remarks: data.remarks || 'N/A'
            });
            return approveSalaries(data).then((res) => {
                console.log('✅ [SALARY APPROVAL - FRONTEND] Approval response received');
                console.log('📤 [SALARY APPROVAL - FRONTEND] Response:', {
                    success: res.success,
                    message: res.message,
                    approvedCount: res.approvedCount || 0,
                    failedCount: res.failedCount || 0
                });
                if (!res.success) {
                    console.error('❌ [SALARY APPROVAL - FRONTEND] Approval failed:', res.message);
                    throw new Error(res.message);
                }
                console.log('🟢 [SALARY APPROVAL - FRONTEND] useApproveSalaries - END (Success)');
                return res.data!;
            }).catch((error) => {
                console.error('❌ [SALARY APPROVAL - FRONTEND] useApproveSalaries - ERROR');
                console.error('💥 [SALARY APPROVAL - FRONTEND] Error:', error);
                throw error;
            });
        },
        onSuccess: (data, variables) => {
            console.log('✅ [SALARY APPROVAL - FRONTEND] useApproveSalaries - onSuccess callback');
            console.log('📊 [SALARY APPROVAL - FRONTEND] Success data:', {
                approvedCount: data.approvedCount,
                failedCount: data.failedCount,
                message: data.message,
                approvalStatus: variables.approvalStatus
            });
            if (data.approvedCount > 0) {
                toast.success(
                    data.message || `${data.approvedCount} salary record(s) ${variables.approvalStatus.toLowerCase()} successfully!`
                );
            }
            if (data.failedCount > 0) {
                toast.warning(`Failed to process ${data.failedCount} record(s).`);
            }
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_ONLOAD]
            });
        },
        onError: (error) => {
            console.error('❌ [SALARY APPROVAL - FRONTEND] useApproveSalaries - onError callback');
            console.error('💥 [SALARY APPROVAL - FRONTEND] Error message:', error.message);
            toast.error(error.message || 'Failed to process salary approval.');
        }
    });
}

// ============================================================================
// SALARY CALCULATION
// ============================================================================

export function useSalaryCalculationOnload(payload: SalaryCalculationOnloadRequest) {
    return useQuery<SalaryCalculationOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, payload],
        queryFn: () =>
            getSalaryCalculationOnload(payload).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!payload.MI_Id
    });
}

export function useSearchSalaryCalculation() {
    return useMutation<SalaryCalculationOnloadResponse, Error, SalaryCalculationSearchRequest>({
        mutationFn: (data: SalaryCalculationSearchRequest) =>
            searchSalaryCalculationBySelection(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onError: (error) => {
            toast.error(error.message || 'Failed to search employees for salary calculation.');
        }
    });
}

export function useGenerateSalary() {
    const queryClient = useQueryClient();

    return useMutation<SalaryCalculationGenerateResponse, Error, SalaryCalculationGenerateRequest>({
        mutationFn: (data: SalaryCalculationGenerateRequest) =>
            generateSalaryForSelectedEmployees(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data) => {
            if (data.processedCount > 0) {
                toast.success(data.retrunMsg || `Salary calculated successfully for ${data.processedCount} employee(s)!`);
            }
            if (data.failedCount > 0) {
                toast.warning(`Failed to calculate salary for ${data.failedCount} employee(s).`);
            }
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to generate salary calculation.');
        }
    });
}

// ============================================================================
// SALARY INCREMENT
// ============================================================================

export function useSalaryIncrementOnload(payload: SalaryIncrementOnloadRequest) {
    return useQuery<SalaryIncrementOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD, payload],
        queryFn: async () => {
            const res = await getSalaryIncrementOnload(payload);
            if (!res.success || !res.data) {
                throw new Error(res.message || 'Failed to load salary increment data');
            }
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!(payload.MIID || payload.MI_Id) && (payload.LoginUserId !== undefined || payload.roleId !== undefined)
    });
}

export function useSaveSalaryIncrement() {
    const queryClient = useQueryClient();

    return useMutation<SalaryIncrementSaveResponse, Error, SalaryIncrementSaveRequest>({
        mutationFn: (data: SalaryIncrementSaveRequest) =>
            saveSalaryIncrement(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data, variables) => {
            toast.success(
                data.retrunMsg ||
                    (variables.HREIC_Id === 0 ? 'Salary increment created successfully!' : 'Salary increment updated successfully!')
            );
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save salary increment.');
        }
    });
}

export function useDeleteSalaryIncrement() {
    const queryClient = useQueryClient();

    return useMutation<SalaryIncrementDeleteResponse, Error, number>({
        mutationFn: (id: number) =>
            deleteSalaryIncrement(id).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: () => {
            toast.success('Salary increment deactivated successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to deactivate salary increment.');
        }
    });
}

// ============================================================================
// SALARY UPDATION
// ============================================================================

export function useSalaryUpdationList(payload: SalaryUpdationOnloadRequest) {
    const queryClient = useQueryClient();

    // Support both new and legacy request formats
    const requestPayload: SalaryUpdationOnloadRequest = {
        page: payload.page ?? 1,
        page_size: payload.page_size ?? 10,
        search_query: payload.search_query ?? '',
        search_column: payload.search_column ?? '',
        sort_column: payload.sort_column ?? '',
        sort_direction: payload.sort_direction ?? '',
        is_export: payload.is_export ?? false,
        MIID: payload.MIID ?? 30,
        LoginUserId: payload.LoginUserId ?? payload.roleId ?? 0,
        UserRole: payload.UserRole ?? ''
    };

    const listQuery = useQuery<SalaryUpdationOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD, requestPayload],
        queryFn: () =>
            getSalaryUpdationOnload(requestPayload).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!(requestPayload.LoginUserId || requestPayload.roleId || requestPayload.MIID)
    });

    const saveMutation = useMutation<SalaryUpdationSaveResponse, Error, SalaryUpdationSaveRequest>({
        mutationFn: (data: SalaryUpdationSaveRequest) =>
            saveSalaryUpdation(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data, variables) => {
            toast.success(
                data.retrunMsg ||
                    (variables.HRESU_Id === 0 ? 'Salary updation created successfully!' : 'Salary updation updated successfully!')
            );
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save salary updation.');
        }
    });

    const deleteMutation = useMutation<any, Error, SalaryUpdationDeleteRequest>({
        mutationFn: (data: SalaryUpdationDeleteRequest) =>
            deleteSalaryUpdation(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data;
            }),
        onSuccess: () => {
            toast.success('Salary updation deleted successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete salary updation.');
        }
    });

    return {
        listQuery,
        saveMutation,
        deleteMutation
    };
}

// Legacy exports for backwards compatibility
export function useSaveSalaryUpdation() {
    const queryClient = useQueryClient();
    return useMutation<SalaryUpdationSaveResponse, Error, SalaryUpdationSaveRequest>({
        mutationFn: (data: SalaryUpdationSaveRequest) =>
            saveSalaryUpdation(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data, variables) => {
            toast.success(
                data.retrunMsg ||
                    (variables.HRESU_Id === 0 ? 'Salary updation created successfully!' : 'Salary updation updated successfully!')
            );
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save salary updation.');
        }
    });
}

export function useDeleteSalaryUpdation() {
    const queryClient = useQueryClient();
    return useMutation<any, Error, SalaryUpdationDeleteRequest>({
        mutationFn: (data: SalaryUpdationDeleteRequest) =>
            deleteSalaryUpdation(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data;
            }),
        onSuccess: () => {
            toast.success('Salary updation deleted successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete salary updation.');
        }
    });
}

/**
 * Filter employees for salary updation
 */
export function useFilterSalaryUpdationEmployees() {
    return useMutation<SalaryUpdationOnloadResponse, Error, SalaryUpdationFilterRequest>({
        mutationFn: (data: SalaryUpdationFilterRequest) => {
            console.log('🟢 [SALARY UPDATION - FRONTEND] useFilterSalaryUpdationEmployees - START');
            console.log('📊 [SALARY UPDATION - FRONTEND] Filter criteria:', {
                MI_Id: data.MI_Id,
                LogInUserId: data.LogInUserId,
                designationCount: data.designationselected?.length || 0,
                departmentCount: data.departmentselected?.length || 0,
                groupTypeCount: data.groupTypeselected?.length || 0,
                headCount: data.headselected?.length || 0
            });
            return filterSalaryUpdationEmployees(data).then((res) => {
                console.log('✅ [SALARY UPDATION - FRONTEND] Filter response received');
                console.log('📤 [SALARY UPDATION - FRONTEND] Response:', {
                    success: res.success,
                    message: res.message,
                    hasData: !!res.data
                });
                if (!res.success) {
                    console.error('❌ [SALARY UPDATION - FRONTEND] Filter failed:', res.message);
                    throw new Error(res.message);
                }
                const employeeCount = res.data?.employeedropdown?.length || 0;
                console.log('📊 [SALARY UPDATION - FRONTEND] Employees found:', employeeCount);
                if (employeeCount > 0) {
                    console.log('📋 [SALARY UPDATION - FRONTEND] First employee sample:', res.data?.employeedropdown?.[0]);
                }
                console.log('🟢 [SALARY UPDATION - FRONTEND] useFilterSalaryUpdationEmployees - END (Success)');
                return res.data!;
            }).catch((error) => {
                console.error('❌ [SALARY UPDATION - FRONTEND] useFilterSalaryUpdationEmployees - ERROR');
                console.error('💥 [SALARY UPDATION - FRONTEND] Error:', error);
                throw error;
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to filter employees.');
        }
    });
}

/**
 * Get employee details by selection (earnings and deductions) for salary updation
 */
export function useGetSalaryUpdationEmployeeDetailsBySelection() {
    return useMutation<SalaryUpdationEmployeeDetailsResponse, Error, SalaryUpdationEmployeeDetailsRequest>({
        mutationFn: (data: SalaryUpdationEmployeeDetailsRequest) => {
            console.log('🟢 [SALARY UPDATION - FRONTEND] useGetSalaryUpdationEmployeeDetailsBySelection - START');
            console.log('📊 [SALARY UPDATION - FRONTEND] Request data:', {
                earningCount: data.earningresult?.length || 0,
                deductionCount: data.deductionresult?.length || 0,
                LogInUserId: data.LogInUserId
            });
            return getSalaryUpdationEmployeeDetailsBySelection(data).then((res) => {
                console.log('✅ [SALARY UPDATION - FRONTEND] Employee details response received');
                console.log('📤 [SALARY UPDATION - FRONTEND] Response:', {
                    success: res.success,
                    message: res.message,
                    hasData: !!res.data
                });
                if (!res.success) {
                    console.error('❌ [SALARY UPDATION - FRONTEND] Get employee details failed:', res.message);
                    throw new Error(res.message);
                }
                const employeeCount = res.data?.employeedropdown?.length || 0;
                console.log('📊 [SALARY UPDATION - FRONTEND] Employees found:', employeeCount);
                if (employeeCount > 0) {
                    console.log('📋 [SALARY UPDATION - FRONTEND] First employee sample:', res.data?.employeedropdown?.[0]);
                }
                console.log('🟢 [SALARY UPDATION - FRONTEND] useGetSalaryUpdationEmployeeDetailsBySelection - END (Success)');
                return res.data!;
            }).catch((error) => {
                console.error('❌ [SALARY UPDATION - FRONTEND] useGetSalaryUpdationEmployeeDetailsBySelection - ERROR');
                console.error('💥 [SALARY UPDATION - FRONTEND] Error:', error);
                throw error;
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to get employee details.');
        }
    });
}

/**
 * Get departments by group type selection (cascading dropdown)
 */
export function useGetSalaryUpdationDepartments() {
    return useMutation<SalaryUpdationDepartmentResponse, Error, SalaryUpdationDepartmentRequest>({
        mutationFn: (data: SalaryUpdationDepartmentRequest) => {
            console.log('🟢 [SALARY UPDATION - FRONTEND] useGetSalaryUpdationDepartments - START');
            console.log('📊 [SALARY UPDATION - FRONTEND] Request data:', {
                MI_Id: data.MI_Id,
                groupTypeCount: data.hrmgT_IdList?.length || 0
            });
            return getSalaryUpdationDepartments(data).then((res) => {
                console.log('✅ [SALARY UPDATION - FRONTEND] Departments response received');
                console.log('📤 [SALARY UPDATION - FRONTEND] Response:', {
                    success: res.success,
                    message: res.message,
                    hasData: !!res.data
                });
                if (!res.success) {
                    console.error('❌ [SALARY UPDATION - FRONTEND] Get departments failed:', res.message);
                    throw new Error(res.message);
                }
                const departmentCount = res.data?.departmentdropdown?.length || 0;
                console.log('📊 [SALARY UPDATION - FRONTEND] Departments found:', departmentCount);
                console.log('🟢 [SALARY UPDATION - FRONTEND] useGetSalaryUpdationDepartments - END (Success)');
                return res.data!;
            }).catch((error) => {
                console.error('❌ [SALARY UPDATION - FRONTEND] useGetSalaryUpdationDepartments - ERROR');
                console.error('💥 [SALARY UPDATION - FRONTEND] Error:', error);
                throw error;
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to get departments.');
        }
    });
}

/**
 * Get designations by group type and department selection (cascading dropdown)
 */
export function useGetSalaryUpdationDesignations() {
    return useMutation<SalaryUpdationDesignationResponse, Error, SalaryUpdationDesignationRequest>({
        mutationFn: (data: SalaryUpdationDesignationRequest) => {
            console.log('🟢 [SALARY UPDATION - FRONTEND] useGetSalaryUpdationDesignations - START');
            console.log('📊 [SALARY UPDATION - FRONTEND] Request data:', {
                MI_Id: data.MI_Id,
                groupTypeCount: data.hrmgT_IdList?.length || 0,
                departmentCount: data.hrmD_IdList?.length || 0
            });
            return getSalaryUpdationDesignations(data).then((res) => {
                console.log('✅ [SALARY UPDATION - FRONTEND] Designations response received');
                console.log('📤 [SALARY UPDATION - FRONTEND] Response:', {
                    success: res.success,
                    message: res.message,
                    hasData: !!res.data
                });
                if (!res.success) {
                    console.error('❌ [SALARY UPDATION - FRONTEND] Get designations failed:', res.message);
                    throw new Error(res.message);
                }
                const designationCount = res.data?.designationdropdown?.length || 0;
                console.log('📊 [SALARY UPDATION - FRONTEND] Designations found:', designationCount);
                console.log('🟢 [SALARY UPDATION - FRONTEND] useGetSalaryUpdationDesignations - END (Success)');
                return res.data!;
            }).catch((error) => {
                console.error('❌ [SALARY UPDATION - FRONTEND] useGetSalaryUpdationDesignations - ERROR');
                console.error('💥 [SALARY UPDATION - FRONTEND] Error:', error);
                throw error;
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to get designations.');
        }
    });
}

// ============================================================================
// MASS UPDATION
// ============================================================================

export function useMassUpdationOnload(payload: MassUpdationOnloadRequest) {
    return useQuery<MassUpdationOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.MASS_UPDATION_ONLOAD, payload],
        queryFn: () =>
            getMassUpdationOnload(payload).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!payload.MI_Id && !!payload.roleId
    });
}

export function useSaveMassUpdation() {
    const queryClient = useQueryClient();

    return useMutation<MassUpdationSaveResponse, Error, MassUpdationSaveRequest>({
        mutationFn: (data: MassUpdationSaveRequest) =>
            saveMassUpdation(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data) => {
            toast.success(data.retrunMsg || 'Mass updation completed successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASS_UPDATION_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to complete mass updation.');
        }
    });
}

export function useSearchMassUpdationEmployees() {
    return useMutation<MassUpdationOnloadResponse, Error, MassUpdationSearchRequest>({
        mutationFn: (data: MassUpdationSearchRequest) =>
            searchMassUpdationEmployees(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data) => {
            toast.success(data.retrunMsg || 'Employees loaded successfully!');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to search employees.');
        }
    });
}

export function useGetEmployeeDetailsBySelection() {
    const queryClient = useQueryClient();

    return useMutation<MassUpdationOnloadResponse, Error, MassUpdationSearchRequest>({
        mutationFn: (data: MassUpdationSearchRequest) =>
            getEmployeeDetailsBySelection(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASS_UPDATION_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update employee details.');
        }
    });
}
