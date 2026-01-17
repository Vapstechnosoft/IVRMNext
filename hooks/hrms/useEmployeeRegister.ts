'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    deleteEmployee,
    getBankDropdown,
    getBloodGroupDropdown,
    getCasteCategoryDropdown,
    getCasteDropdown,
    getContactTypeDropdown,
    getCountryDropdown,
    getCourseDropdown,
    getDepartmentDropdown,
    getDesignationDropdown,
    getEmployeeById,
    getEmployeeList,
    getEmployeeTypeDropdown,
    getGenderDropdown,
    getGradeDropdown,
    getGroupTypeDropdown,
    getInstitutionDropdown,
    getLeaveReasonDropdown,
    getMaritalStatusDropdown,
    getPaymentModeDropdown,
    getReligionDropdown,
    getSalaryTypeDropdown,
    getScoreTypeDropdown,
    getSpecializationDropdown,
    getStateDropdown,
    getTeachingTypeDropdown,
    saveEmployee,
    saveEmployeeExperience,
    saveEmployeeQualification,
    toggleEmployee
} from '@/server/hrms/hrmsConfig/employee/register';
import type { ApiSearchparams } from '@/types';
import type { IEmployeeSaveRequest } from '@/types/hrms/hrms-config/employee';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ==================== Dropdown Hooks ====================

export function useGradeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.GRADE_DROPDOWN],
            queryFn: async () => getGradeDropdown(),
            staleTime: 1000 * 60 * 5 // 5 minutes
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.GRADE_DROPDOWN]
            });
        }
    };
}

export function useEmployeeTypeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'employee-type'],
            queryFn: async () => getEmployeeTypeDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'employee-type']
            });
        }
    };
}

export function useGroupTypeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'group-type'],
            queryFn: async () => getGroupTypeDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'group-type']
            });
        }
    };
}

export function useDepartmentDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'department'],
            queryFn: async () => getDepartmentDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'department']
            });
        }
    };
}

export function useDesignationDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'designation'],
            queryFn: async () => getDesignationDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'designation']
            });
        }
    };
}

export function useGenderDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'gender'],
            queryFn: async () => getGenderDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'gender']
            });
        }
    };
}

export function useMaritalStatusDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'marital-status'],
            queryFn: async () => getMaritalStatusDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'marital-status']
            });
        }
    };
}

export function useReligionDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'religion'],
            queryFn: async () => getReligionDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'religion']
            });
        }
    };
}

export function useCasteCategoryDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'caste-category'],
            queryFn: async () => getCasteCategoryDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'caste-category']
            });
        }
    };
}

export function useCasteDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'caste'],
            queryFn: async () => getCasteDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'caste']
            });
        }
    };
}

export function useBankDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'bank'],
            queryFn: async () => getBankDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'bank']
            });
        }
    };
}

export function useCountryDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'country'],
            queryFn: async () => getCountryDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'country']
            });
        }
    };
}

export function useStateDropdown(country_id: number | null | undefined) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'state', country_id],
            queryFn: async () => {
                if (!country_id || country_id === 0) {
                    return Promise.resolve([]);
                }
                const response = await getStateDropdown(country_id);
                // Extract data from response (handle ApiResponse wrapper if needed)
                if (Array.isArray(response)) {
                    return response;
                }
                // Handle wrapped response
                return (response as any)?.data || (response as any)?.result || [];
            },
            enabled: !!country_id && country_id > 0,
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'state']
            });
        }
    };
}

export function useCourseDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'course'],
            queryFn: async () => getCourseDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'course']
            });
        }
    };
}

export function useSpecializationDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'specialization'],
            queryFn: async () => getSpecializationDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'specialization']
            });
        }
    };
}

export function useInstitutionDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'institution'],
            queryFn: async () => getInstitutionDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'institution']
            });
        }
    };
}

export function usePaymentModeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'payment-mode'],
            queryFn: async () => getPaymentModeDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'payment-mode']
            });
        }
    };
}

export function useLeaveReasonDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'leave-reason'],
            queryFn: async () => getLeaveReasonDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'leave-reason']
            });
        }
    };
}

export function useBloodGroupDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'blood-group'],
            queryFn: async () => getBloodGroupDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'blood-group']
            });
        }
    };
}

export function useSalaryTypeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'salary-type'],
            queryFn: async () => getSalaryTypeDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'salary-type']
            });
        }
    };
}

export function useTeachingTypeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'teaching-type'],
            queryFn: async () => getTeachingTypeDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'teaching-type']
            });
        }
    };
}

export function useScoreTypeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'score-type'],
            queryFn: async () => getScoreTypeDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'score-type']
            });
        }
    };
}

export function useContactTypeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'contact-type'],
            queryFn: async () => getContactTypeDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'dropdown', 'contact-type']
            });
        }
    };
}

// ==================== Employee CRUD Hooks ====================

/**
 * Hook to fetch employee list with search, sort, and pagination
 */
export function useEmployeeList(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, searchParams ?? {}],
            queryFn: async () => getEmployeeList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
            });
        }
    };
}

/**
 * Hook to fetch employee by ID
 */
export function useEmployeeById(id: number | null) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, id],
        queryFn: () => {
            if (!id || id === 0) {
                return Promise.resolve(null);
            }
            return getEmployeeById(id);
        },
        enabled: !!id && id > 0,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

/**
 * Hook to save employee
 */
export function useSaveEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IEmployeeSaveRequest) => saveEmployee(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Employee saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                toast.error(response.message || 'Failed to save employee');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving employee');
        }
    });
}

/**
 * Hook to save employee qualification details
 */
export function useSaveEmployeeQualification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any[]) => saveEmployeeQualification(data),
        onSuccess: (response) => {
            if (response?.success) {
                toast.success(response.message || 'Qualification details saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else if (response?.message) {
                toast.info(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving qualification details');
        }
    });
}

/**
 * Hook to save employee experience details
 */
export function useSaveEmployeeExperience() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any[]) => saveEmployeeExperience(data),
        onSuccess: (response) => {
            if (response?.success) {
                toast.success(response.message || 'Experience details saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else if (response?.message) {
                toast.info(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving experience details');
        }
    });
}

/**
 * Hook to toggle employee (activate/deactivate)
 */
export function useToggleEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => toggleEmployee(id),
        onSuccess: () => {
            toast.success('Employee status updated successfully');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while updating employee status');
        }
    });
}

/**
 * Hook to delete employee
 */
export function useDeleteEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteEmployee(id),
        onSuccess: () => {
            toast.success('Employee deleted successfully');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while deleting employee');
        }
    });
}
