'use client';

/**
 * Unified HRMS Transaction Hooks
 * All transaction-related hooks consolidated in one file
 */

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { activateDeactivateEmployeeLoan, getEmployeeLoanList, saveEmployeeLoan } from '@/server/hrms/hrmsConfig/transaction/employee-loan';
import { getSalaryAdvanceList, saveSalaryAdvance, toggleSalaryAdvanceStatus } from '@/server/hrms/hrmsConfig/transaction/salary-advance';
import { approveSalaries, getSalaryApprovalOnload, searchSalaryApprovalEmployees } from '@/server/hrms/hrmsConfig/transaction/salary-approval';
import { generateSalaryForSelectedEmployees, getSalaryCalculationOnload, searchSalaryCalculationBySelection } from '@/server/hrms/hrmsConfig/transaction/salary-calculation';
import { deleteSalaryIncrement, getSalaryIncrementOnload, saveSalaryIncrement } from '@/server/hrms/hrmsConfig/transaction/salary-increment';
import { deleteSalaryUpdation, getSalaryUpdationList, saveSalaryUpdation } from '@/server/hrms/hrmsConfig/transaction/salary-updation';
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
            getEmployeeLoanList(payload.roleId ?? 30).then((res: any) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!payload.roleId
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

// ============================================================================
// SALARY APPROVAL
// ============================================================================

export function useSalaryApprovalOnload(payload: SalaryApprovalOnloadRequest) {
    return useQuery<SalaryApprovalOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_ONLOAD, payload],
        queryFn: () => {
            console.log('🟢 [SALARY APPROVAL - FRONTEND] useSalaryApprovalOnload - START');
            console.log('📥 [SALARY APPROVAL - FRONTEND] Request payload:', JSON.stringify(payload, null, 2));
            return getSalaryApprovalOnload(payload).then((res) => {
                console.log('✅ [SALARY APPROVAL - FRONTEND] API Response received');
                console.log('📤 [SALARY APPROVAL - FRONTEND] Response:', {
                    success: res.success,
                    message: res.message,
                    hasData: !!res.data
                });
                if (!res.success) {
                    console.error('❌ [SALARY APPROVAL - FRONTEND] API returned error:', res.message);
                    throw new Error(res.message);
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
            }).catch((error) => {
                console.error('❌ [SALARY APPROVAL - FRONTEND] useSalaryApprovalOnload - ERROR');
                console.error('💥 [SALARY APPROVAL - FRONTEND] Error:', error);
                throw error;
            });
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!payload.MI_Id
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
        queryFn: () =>
            getSalaryIncrementOnload(payload).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!payload.MI_Id && !!payload.roleId
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

    return useMutation<SalaryIncrementDeleteResponse, Error, SalaryIncrementDeleteRequest>({
        mutationFn: (data: SalaryIncrementDeleteRequest) =>
            deleteSalaryIncrement(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: () => {
            toast.success('Salary increment deleted successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete salary increment.');
        }
    });
}

// ============================================================================
// SALARY UPDATION
// ============================================================================

export function useSalaryUpdationList(payload: SalaryUpdationOnloadRequest) {
    const queryClient = useQueryClient();

    const listQuery = useQuery<SalaryUpdationOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD, payload],
        queryFn: () =>
            getSalaryUpdationList(payload.roleId).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5,
        enabled: !!payload.roleId
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
