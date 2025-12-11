'use client';
/**
 * Unified HRMS Master Hooks
 * All master-related hooks consolidated in one file
 */
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    getMasterDepartment,
    getDepartmentSetOrder,
    updateDepartmentSetorder,
    addOrUpdateMasterDepartment,
    toggleMasterDepartment
} from '@/server/hrms/hrmsConfig/master/department';
import {
    getMasterDesignation,
    getDesignationSetOrder,
    updateDesignationSetorder,
    addOrUpdateMasterDesignation,
    toggleMasterDesignation
} from '@/server/hrms/hrmsConfig/master/designation';
import {
    getMasterGrade,
    addOrUpdateMasterGrade,
    toggleMasterGrade,
    getGradeSetOrder,
    updateGradeSetorder
} from '@/server/hrms/hrmsConfig/master/grade';
import {
    addOrUpdateMasterBank,
    getMasterBank,
    toggleMasterBank
} from '@/server/hrms/hrmsConfig/master/bank';
import {
    getMasterCourse,
    getMasterCourseDetails,
    getCourseSetOrder,
    updateCourseSetorder,
    addOrUpdateMasterCourse,
    toggleMasterCourse
} from '@/server/hrms/hrmsConfig/master/course';
import {
    getMasterEmployeeType,
    addOrUpdateMasterEmployeeType,
    toggleMasterEmployeeType
} from '@/server/hrms/hrmsConfig/master/employee-type';
import {
    getMasterGender,
    addOrUpdateMasterGender,
    toggleMasterGender
} from '@/server/hrms/hrmsConfig/master/gender';
import {
    getMasterLoan,
    addOrUpdateMasterLoan,
    toggleMasterLoan
} from '@/server/hrms/hrmsConfig/master/loan';
import {
    getMasterMaritalStatus,
    addOrUpdateMasterMaritalStatus,
    toggleMasterMaritalStatus
} from '@/server/hrms/hrmsConfig/master/marital-status';
import {
    getMasterSpecialization,
    addOrUpdateMasterSpecialization,
    toggleMasterSpecialization
} from '@/server/hrms/hrmsConfig/master/specialization';
import {
    getMasterGroupType,
    addOrUpdateMasterGroupType,
    toggleMasterGroupType,
    getGroupTypeSetOrder,
    updateGroupTypeSetorder
} from '@/server/hrms/hrmsConfig/master/group-type';
import {
    getMasterProfessionalTax,
    addOrUpdateMasterProfessionalTax,
    toggleMasterProfessionalTax
} from '@/server/hrms/hrmsConfig/master/professional-tax';
import {
    getMasterLeaveYear,
    addOrUpdateMasterLeaveYear,
    toggleMasterLeaveYear,
    getLeaveYearSetOrder,
    updateLeaveYearSetorder
} from '@/server/hrms/hrmsConfig/master/leave-year';
import {
    activateDeactivateMasterEarningsDeductions,
    getAmountOrPercentageDropdown,
    getEarningsDeductionsTypeDropdown,
    getMasterEarningsDeductionsList,
    getRoundingTypeDropdown,
    getSalaryComponentTypeDropdown,
    saveMasterEarningsDeductions
} from '@/server/hrms/hrmsConfig/master/earnings-deductions';
import { getMasterPayrollStandardList, getMonthDropdown, saveMasterPayrollStandard } from '@/server/hrms/hrmsConfig/master/payroll-standard';
import {
    getReligionCategoryMappingList,
    saveReligionCategoryMapping,
    toggleReligionCategoryMapping
} from '@/server/hrms/hrmsConfig/master/religion-category-mapping';
import {
    getGroupDeptDessgMappingList,
    saveGroupDeptDessgMapping,
    toggleGroupDeptDessgMapping
} from '@/server/hrms/hrmsConfig/master/group-dept-dessg-mapping';
import type { ApiSearchparams } from '@/types';
import type { DesignationDetail, MasterDesignationInput } from '@/types/hrms/master-designation';
import type { GradeDetail, MasterGradeInput } from '@/types/hrms/master-grade';
import type { IMasterBankList, IMasterCourseList, IMasterCourseSetOrderList, IMasterDesignationList, IMasterDesignationSetOrderList, IMasterGenderList, IMasterGradeList, IMasterGradeSetOrderList, IMasterGroupTypeList, IMasterGroupTypeSetOrderList, IMasterLeaveYearList, IMasterLeaveYearSetOrderList, IMasterMaritalStatusList } from '@/types/hrms/hrms-config/master';
import type { MasterGenderInput } from '@/types/hrms/master-gender';
import type { MasterMaritalStatusInput } from '@/types/hrms/master-marital-status';
import type { GroupTypeDetail, MasterGroupTypeInput } from '@/types/hrms/master-group-type';
import type { LeaveYearDetail, MasterLeaveYearInput } from '@/types/hrms/master-leave-year';
import type { EarningsDeductionDetail, MasterEarningsDeductionsInput } from '@/types/hrms/master-earnings-deductions';
import type { IEarningsDeductionsTypeDropdown, IMonthDropdown, IRoundingTypeDropdown } from '@/types/hrms/hrms-config/master';
import type { IMasterPayrollStandardList } from '@/types/hrms/hrms-config/master';
import type { IMasterReligionCategoryMappingList } from '@/types/hrms/hrms-config/master';
import type { IMasterGroupDeptDessgMappingList } from '@/types/hrms/hrms-config/master';
import type { ApiResponse } from '@/lib/apiService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
// ============================================================================
// DEPARTMENT
// ============================================================================
export function useMasterDepartment(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT, searchParams ?? {}],
            queryFn: async () => getMasterDepartment(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT]
            });
        }
    };
}

export function useDepartmentSetOrder() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT_SET_ORDER],
            queryFn: async () => getDepartmentSetOrder(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT_SET_ORDER]
            });
        }
    };
}
// ============================================================================
// DESIGNATION
// ============================================================================
export function useMasterDesignation(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION, searchParams ?? {}],
            queryFn: async () => getMasterDesignation(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION]
            });
        }
    };
}

export function useDesignationSetOrder() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION_SET_ORDER],
            queryFn: async () => getDesignationSetOrder(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION_SET_ORDER]
            });
        }
    };
}
// ============================================================================
// GRADE
// ============================================================================
export function useMasterGrade(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE, searchParams ?? {}],
            queryFn: async () => getMasterGrade(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE]
            });
        }
    };
}

export function useGradeSetOrder() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE_SET_ORDER],
            queryFn: async () => getGradeSetOrder(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE_SET_ORDER]
            });
        }
    };
}
// ============================================================================
// BANK
// ============================================================================
export function useMasterBank(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_BANK, searchParams ?? {}],
            queryFn: async () => getMasterBank(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_BANK]
            });
        }
    };
}
// ============================================================================
// COURSE
// ============================================================================
export function useMasterCourse(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE, searchParams ?? {}],
            queryFn: async () => getMasterCourse(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
        }
    };
}

// Legacy hook - keeping for backward compatibility (if needed)
// Note: getMasterCourseList has been replaced with getMasterCourse
export function useMasterCourseLegacy(roleId: number, searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE, roleId, searchParams ?? {}],
        queryFn: async () => getMasterCourse(searchParams),
        staleTime: 0
    });
    const saveMutation = useMutation({
        mutationFn: (data: any) => {
            console.log('🟣 [HOOK] Course saveMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return addOrUpdateMasterCourse(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Course saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
        },
        onError: (error: any) => {
        }
    });
    const toggleMutation = useMutation({
        mutationFn: (data: { HRMC_Id: number; HRMC_ActiveFlag: boolean; MI_Id?: number }) => {
            console.log('🟣 [HOOK] Course toggleMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            // New toggleMasterCourse only takes id, not the full object
            return toggleMasterCourse(data.HRMC_Id);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Course toggleMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
        },
        onError: (error: any) => {
        }
    });
    const refetchAll = () => {
        queryClient.invalidateQueries({
            queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
        });
    };
    return {
        listQuery,
        saveMutation,
        toggleMutation,
        refetchAll
    };
}
export function useMasterCourseDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE, 'details', id],
        queryFn: async () => getMasterCourseDetails(id),
        enabled: id > 0
    });
}

export function useCourseSetOrder() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE_SET_ORDER],
            queryFn: async () => getCourseSetOrder(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE_SET_ORDER]
            });
        }
    };
}
// ============================================================================
// EMPLOYEE TYPE
// ============================================================================
export function useMasterEmployeeType(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE, searchParams ?? {}],
            queryFn: async () => getMasterEmployeeType(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE]
            });
        }
    };
}
// ============================================================================
// GENDER
// ============================================================================
export function useMasterGender(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER, searchParams ?? {}],
            queryFn: async () => getMasterGender(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER]
            });
        }
    };
}
// ============================================================================
// LOAN
// ============================================================================
export function useMasterLoan(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN, searchParams ?? {}],
            queryFn: async () => getMasterLoan(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN]
            });
        }
    };
}
// ============================================================================
// MARITAL STATUS
// ============================================================================
export function useMasterMaritalStatus(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS, searchParams ?? {}],
            queryFn: async () => getMasterMaritalStatus(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS]
            });
        }
    };
}
// ============================================================================
// SPECIALIZATION
// ============================================================================
export function useMasterSpecialization(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION, searchParams ?? {}],
            queryFn: async () => getMasterSpecialization(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION]
            });
        }
    };
}
// ============================================================================
// GROUP TYPE
// ============================================================================
export function useMasterGroupType(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE, searchParams ?? {}],
            queryFn: async () => getMasterGroupType(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
            });
        }
    };
}

export function useGroupTypeSetOrder() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE_SET_ORDER],
            queryFn: async () => getGroupTypeSetOrder(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE_SET_ORDER]
            });
        }
    };
}
// ============================================================================
// PROFESSIONAL TAX
// ============================================================================
export function useMasterProfessionalTax(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX, searchParams ?? {}],
            queryFn: async () => getMasterProfessionalTax(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX]
            });
        }
    };
}
// ============================================================================
// LEAVE YEAR
// ============================================================================
export function useMasterLeaveYear(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR, searchParams ?? {}],
            queryFn: async () => getMasterLeaveYear(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        }
    };
}

export function useLeaveYearSetOrder() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR_SET_ORDER],
            queryFn: async () => getLeaveYearSetOrder(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR_SET_ORDER]
            });
        }
    };
}
// ============================================================================
// EARNINGS DEDUCTIONS
// ============================================================================
export function useMasterEarningsDeductions(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, searchParams ?? {}],
            queryFn: async () => getMasterEarningsDeductionsList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
            });
        },
        saveMutation: useMutation({
            mutationFn: (data: MasterEarningsDeductionsInput) => {
                return saveMasterEarningsDeductions(data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
                });
            }
        }),
        toggleMutation: useMutation({
            mutationFn: (id: number) => {
                return activateDeactivateMasterEarningsDeductions(id);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
                });
            }
        })
    };
}

export function useEarningsDeductionsTypeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, 'dropdown', 'earnings-deductions-type'],
            queryFn: async () => getEarningsDeductionsTypeDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, 'dropdown', 'earnings-deductions-type']
            });
        }
    };
}

export function useRoundingTypeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, 'dropdown', 'rounding-type'],
            queryFn: async () => getRoundingTypeDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, 'dropdown', 'rounding-type']
            });
        }
    };
}

export function useAmountOrPercentageDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, 'dropdown', 'amount-or-percentage'],
            queryFn: async () => getAmountOrPercentageDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, 'dropdown', 'amount-or-percentage']
            });
        }
    };
}

export function useSalaryComponentTypeDropdown() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, 'dropdown', 'salary-component-type'],
            queryFn: async () => getSalaryComponentTypeDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, 'dropdown', 'salary-component-type']
            });
        }
    };
}

/**
 * Get Month List for dropdowns
 * GET /api/MasterDropDown/GetMonths
 */
export function useMonthDropdown() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD, 'dropdown', 'months'],
            queryFn: async () => getMonthDropdown(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD, 'dropdown', 'months']
            });
        }
    };
}
// ============================================================================
// PAYROLL STANDARD
// ============================================================================
export function useMasterPayrollStandard() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD],
            queryFn: async () => getMasterPayrollStandardList(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD]
            });
        },
        saveMutation: useMutation({
            mutationFn: (data: any) => saveMasterPayrollStandard(data),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD]
                });
            }
        })
    };
}
// ============================================================================
// RELIGION CATEGORY MAPPING
// ============================================================================
export function useReligionCategoryMapping(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING, searchParams ?? {}],
            queryFn: async () => getReligionCategoryMappingList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
            });
        },
        saveMutation: useMutation({
            mutationFn: (data: any) => saveReligionCategoryMapping(data),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
                });
            }
        }),
        toggleMutation: useMutation({
            mutationFn: (id: number) => toggleReligionCategoryMapping(id),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
                });
            }
        })
    };
}
// ============================================================================
// GROUP DEPT DESSG MAPPING
// ============================================================================
export function useGroupDeptDessgMapping(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING, searchParams ?? {}],
            queryFn: async () => getGroupDeptDessgMappingList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
            });
        },
        saveMutation: useMutation({
            mutationFn: (data: any) => saveGroupDeptDessgMapping(data),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
                });
            }
        }),
        toggleMutation: useMutation({
            mutationFn: (id: number) => toggleGroupDeptDessgMapping(id),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
                });
            }
        })
    };
}
