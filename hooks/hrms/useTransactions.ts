'use client';
/**
 * Unified HRMS Transaction Hooks
 * All transaction-related hooks consolidated in one file
 */
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { activateDeactivateEmployeeLoan, getEmployeeDropdown as getEmployeeDropdownLoan, getEmployeeLoanById, getEmployeeLoanByEmployee, getEmployeeLoanList, getLoanTypeDropdown, getModeOfPaymentDropdown as getModeOfPaymentDropdownLoan, saveEmployeeLoan } from '@/server/hrms/hrmsConfig/transaction/employee-loan';
import { getEmployeeDropdown as getEmployeeDropdownAdvance, getModeOfPaymentDropdown as getModeOfPaymentDropdownAdvance, getMonthDropdown as getMonthDropdownAdvance, getSalaryAdvanceById, getSalaryAdvanceDetailsByEmployee, getSalaryAdvanceList, getYearDropdown as getYearDropdownAdvance, saveSalaryAdvance, searchSalaryAdvanceFilter, toggleSalaryAdvanceStatus } from '@/server/hrms/hrmsConfig/transaction/salary-advance';
import {
    getDepartmentDropdown as getDepartmentDropdownApproval,
    getDesignationDropdown as getDesignationDropdownApproval,
    getGroupTypeDropdown as getGroupTypeDropdownApproval,
    getMonthDropdown as getMonthDropdownApproval,
    getYearDropdown,
    getSalaryApprovalList
} from '@/server/hrms/hrmsConfig/transaction/salary-approval';
import {
    generateSalaryForSelectedEmployees,
    getSalaryCalculationList,
    getGroupTypeDropdown,
    getDepartmentDropdown,
    getDesignationDropdown,
    getMonthDropdown
} from '@/server/hrms/hrmsConfig/transaction/salary-calculation';
import { deleteSalaryIncrement, getEmployeeDropdown, getEarningsDeductionsTypeDropdown, getSalaryIncrementList, saveSalaryIncrement } from '@/server/hrms/hrmsConfig/transaction/salary-increment';
import { deleteSalaryUpdation, filterSalaryUpdationEmployees, getDepartmentDropdown as getDepartmentDropdownUpdation, getDesignationDropdown as getDesignationDropdownUpdation, getGroupTypeDropdown as getGroupTypeDropdownUpdation, getSalaryUpdationDepartments, getSalaryUpdationDesignations, getSalaryUpdationEmployeeDetailsBySelection, getSalaryUpdationList, saveSalaryUpdation } from '@/server/hrms/hrmsConfig/transaction/salary-updation';
import { getDepartmentDropdown as getDepartmentDropdownMass, getDesignationDropdown as getDesignationDropdownMass, getEmployeeDetailsBySelection, getGroupTypeDropdown as getGroupTypeDropdownMass, getMassUpdationOnload, saveMassUpdation, searchMassUpdationEmployees } from '@/server/hrms/hrmsConfig/transaction/mass-updation';
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
import type { EmployeeDetail } from '@/types/hrms/hrms-config/transaction';
import type { ApiSearchparams } from '@/types';
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
export function useEmployeeDropdownForLoan() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, 'employee'],
            queryFn: async () => getEmployeeDropdownLoan(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, 'employee']
            });
        }
    };
}

export function useModeOfPaymentDropdownForLoan() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, 'modeOfPayment'],
            queryFn: async () => getModeOfPaymentDropdownLoan(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, 'modeOfPayment']
            });
        }
    };
}

export function useLoanTypeDropdownForLoan() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, 'loanType'],
            queryFn: async () => getLoanTypeDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, 'loanType']
            });
        }
    };
}

export function useEmployeeLoanList(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, searchParams ?? {}],
            queryFn: async () => getEmployeeLoanList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST]
            });
        }
    };
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
export function useGetEmployeeLoanByEmployee(employeeId: number) {
    return useQuery<EmployeeLoanOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOAN_LIST, 'by-employee', employeeId],
        queryFn: () =>
            getEmployeeLoanByEmployee(employeeId).then((res: any) => {
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
export function useEmployeeDropdownForAdvance() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, 'employee'],
            queryFn: async () => getEmployeeDropdownAdvance(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, 'employee']
            });
        }
    };
}

export function useMonthDropdownForAdvance() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, 'month'],
            queryFn: async () => getMonthDropdownAdvance(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, 'month']
            });
        }
    };
}

export function useYearDropdownForAdvance() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, 'year'],
            queryFn: async () => getYearDropdownAdvance(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, 'year']
            });
        }
    };
}

export function useModeOfPaymentDropdownForAdvance() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, 'modeOfPayment'],
            queryFn: async () => getModeOfPaymentDropdownAdvance(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, 'modeOfPayment']
            });
        }
    };
}

export function useSalaryAdvanceList(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, searchParams ?? {}],
            queryFn: async () => {
                return getSalaryAdvanceList(searchParams);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST]
            });
        }
    };
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
export function useSearchSalaryAdvanceFilter(searchFilter: string) {
    return useQuery<SalaryAdvanceOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_ADVANCE_LIST, 'search', searchFilter],
        queryFn: () =>
            searchSalaryAdvanceFilter(searchFilter).then((res: any) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 2,
        enabled: !!searchFilter && searchFilter.length > 0
    });
}
// ============================================================================
// SALARY APPROVAL
// ============================================================================
export function useGroupTypeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES, 'groupType'],
            queryFn: async () => getGroupTypeDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES, 'groupType']
            });
        }
    };
}

export function useDepartmentDropdown(groupTypeIds?: number[]) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES, 'department', groupTypeIds],
            queryFn: async () => getDepartmentDropdown(groupTypeIds),
            staleTime: 0,
            enabled: groupTypeIds === undefined || groupTypeIds.length > 0 // Enable if no filter or has group type IDs
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES, 'department']
            });
        }
    };
}

export function useDesignationDropdown(departmentIds?: number[]) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES, 'designation', departmentIds],
            queryFn: async () => getDesignationDropdown(departmentIds),
            staleTime: 0,
            enabled: departmentIds === undefined || departmentIds.length > 0 // Enable if no filter or has department IDs
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES, 'designation']
            });
        }
    };
}

export function useMonthDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES, 'month'],
            queryFn: async () => getMonthDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES, 'month']
            });
        }
    };
}

export function useYearDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES, 'year'],
            queryFn: async () => getYearDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES, 'year']
            });
        }
    };
}

// Legacy export for backward compatibility
export function useLeaveYearDropdown() {
    return useYearDropdown();
}

export function useSalaryApprovalList(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES, searchParams ?? {}],
            queryFn: async () => {
                return getSalaryApprovalList(searchParams);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_APPROVAL_EMPLOYEES]
            });
        }
    };
}
// ============================================================================
// SALARY CALCULATION
// ============================================================================
export function useGroupTypeDropdownForCalculation() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, 'groupType'],
            queryFn: async () => getGroupTypeDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, 'groupType']
            });
        }
    };
}

export function useDepartmentDropdownForCalculation(groupTypeIds?: number[]) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, 'department', groupTypeIds],
            queryFn: async () => getDepartmentDropdown(groupTypeIds),
            staleTime: 0,
            enabled: groupTypeIds === undefined || groupTypeIds.length > 0 // Enable if no filter or has group type IDs
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, 'department']
            });
        }
    };
}

export function useDesignationDropdownForCalculation(departmentIds?: number[]) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, 'designation', departmentIds],
            queryFn: async () => getDesignationDropdown(departmentIds),
            staleTime: 0,
            enabled: departmentIds === undefined || departmentIds.length > 0 // Enable if no filter or has department IDs
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, 'designation']
            });
        }
    };
}

export function useMonthDropdownForCalculation() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, 'month'],
            queryFn: async () => getMonthDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, 'month']
            });
        }
    };
}

export function useLeaveYearDropdownForCalculation() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, 'leaveYear'],
            queryFn: async () => {
                const { getLeaveYearDropdown } = await import('@/server/hrms/hrmsConfig/transaction/salary-calculation');
                return getLeaveYearDropdown();
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, 'leaveYear']
            });
        }
    };
}

export function useSalaryCalculationList(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, searchParams ?? {}],
            queryFn: async () => {
                return getSalaryCalculationList(searchParams);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD]
            });
        }
    };
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
export function useEmployeeDropdownForIncrement() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD, 'employee'],
            queryFn: async () => getEmployeeDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD, 'employee']
            });
        }
    };
}

export function useEarningsDeductionsTypeDropdownForIncrement() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD, 'earningsDeductionsType'],
            queryFn: async () => getEarningsDeductionsTypeDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD, 'earningsDeductionsType']
            });
        }
    };
}

export function useSalaryIncrementList(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD, searchParams ?? {}],
            queryFn: async () => {
                return getSalaryIncrementList(searchParams);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_INCREMENT_ONLOAD]
            });
        }
    };
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
export function useSalaryUpdationList(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD, searchParams ?? {}],
            queryFn: async () => {
                return getSalaryUpdationList(searchParams);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD]
            });
        }
    };
}

export function useGroupTypeDropdownForUpdation() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD, 'groupType'],
            queryFn: async () => getGroupTypeDropdownUpdation(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD, 'groupType']
            });
        }
    };
}

export function useDepartmentDropdownForUpdation(groupTypeIds?: number[]) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD, 'department', groupTypeIds ?? []],
            queryFn: async () => getDepartmentDropdownUpdation(groupTypeIds),
            enabled: groupTypeIds !== undefined && groupTypeIds.length > 0,
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD, 'department']
            });
        }
    };
}

export function useDesignationDropdownForUpdation(departmentIds?: number[]) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD, 'designation', departmentIds ?? []],
            queryFn: async () => getDesignationDropdownUpdation(departmentIds),
            enabled: departmentIds !== undefined && departmentIds.length > 0,
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_UPDATION_ONLOAD, 'designation']
            });
        }
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
    return useMutation<any, Error, number>({
        mutationFn: (id: number) =>
            deleteSalaryUpdation(id).then((res) => {
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
            return filterSalaryUpdationEmployees(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                const employeeCount = res.data?.employeedropdown?.length || 0;
                if (employeeCount > 0) {
                }
                return res.data!;
            }).catch((error) => {
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
            return getSalaryUpdationEmployeeDetailsBySelection(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                const employeeCount = res.data?.employeedropdown?.length || 0;
                if (employeeCount > 0) {
                }
                return res.data!;
            }).catch((error) => {
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
            return getSalaryUpdationDepartments(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                const departmentCount = res.data?.departmentdropdown?.length || 0;
                return res.data!;
            }).catch((error) => {
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
            return getSalaryUpdationDesignations(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                const designationCount = res.data?.designationdropdown?.length || 0;
                return res.data!;
            }).catch((error) => {
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
export function useGroupTypeDropdownForMassUpdation() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASS_UPDATION_ONLOAD, 'groupType'],
            queryFn: async () => getGroupTypeDropdownMass(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASS_UPDATION_ONLOAD, 'groupType']
            });
        }
    };
}

export function useDepartmentDropdownForMassUpdation(groupTypeIds?: number[]) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASS_UPDATION_ONLOAD, 'department', groupTypeIds ?? []],
            queryFn: async () => getDepartmentDropdownMass(groupTypeIds),
            enabled: groupTypeIds !== undefined && groupTypeIds.length > 0,
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASS_UPDATION_ONLOAD, 'department']
            });
        }
    };
}

export function useDesignationDropdownForMassUpdation(departmentIds?: number[]) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASS_UPDATION_ONLOAD, 'designation', departmentIds ?? []],
            queryFn: async () => getDesignationDropdownMass(departmentIds),
            enabled: departmentIds !== undefined && departmentIds.length > 0,
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASS_UPDATION_ONLOAD, 'designation']
            });
        }
    };
}

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
        enabled: true
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

// ============================================================================
// TRANSACTION DROPDOWNS - Add dropdown hooks here as APIs are provided
// ============================================================================
// Following the pattern from employee module (useEmployeeRegister.ts)
// Each dropdown will have its own hook that can be used in transaction forms

// TODO: Add dropdown hooks here as APIs are provided
// Example structure (uncomment and update when API is provided):
/*
export function useEmployeeDropdownForTransactions() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.TRANSACTION_DROPDOWNS, 'employee'],
            queryFn: async () => {
                // TODO: Replace with actual server function when API is provided
                // return await getEmployeeDropdownForTransactions();
                return [];
            },
            staleTime: 1000 * 60 * 5 // 5 minutes
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.TRANSACTION_DROPDOWNS, 'employee']
            });
        }
    };
}
*/
