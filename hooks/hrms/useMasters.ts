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
    getMasterEarningsDeductionsDetails,
    getMasterEarningsDeductionsList,
    saveMasterEarningsDeductions,
    saveMasterEarningsDeductionsOrder
} from '@/server/hrms/hrmsConfig/master/earnings-deductions';
import {
    getMasterPayrollStandardDetails,
    getMasterPayrollStandardList,
    saveMasterPayrollStandard
} from '@/server/hrms/hrmsConfig/master/payroll-standard';
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
import type { MasterPayrollStandardInput } from '@/types/hrms/master-payroll-standard';
import type { ReligionCategoryMappingInput, ReligionCategoryMappingDetail, ReligionCategoryMappingResponse } from '@/types/hrms/religion-category-mapping';
import type { GroupDeptDessgMappingDetail, GroupDeptDessgMappingInput, GroupDeptDessgMappingResponse } from '@/types/hrms/group-dept-dessg-mapping';
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
export function useMasterEarningsDeductions(roleId: number) {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, roleId],
        queryFn: async () => getMasterEarningsDeductionsList(roleId),
        staleTime: 5 * 60 * 1000
    });
    const saveMutation = useMutation({
        mutationFn: (data: MasterEarningsDeductionsInput) => {
            const timestamp = new Date().toISOString();
            console.log('🟣 [BROWSER-HOOK] Data:', JSON.stringify(data, null, 2));
            return saveMasterEarningsDeductions(data);
        },
        onSuccess: (response) => {
            console.log('🟢 [BROWSER-HOOK] Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
            });
        },
        onError: (error: any) => {
            if (error?.response) {
                console.error('🔴 [BROWSER-HOOK] Error response data:', JSON.stringify(error.response?.data, null, 2));
            }
        }
    });
    const toggleMutation = useMutation({
        mutationFn: (data: {
            HRMED_Id: number;
            HRMED_ActiveFlag: boolean;
            MI_Id?: number;
        }) => {
            const timestamp = new Date().toISOString();
            const targetState = data.HRMED_ActiveFlag ? 'ACTIVE' : 'INACTIVE';
            console.log('🟣 [BROWSER-HOOK] Data:', JSON.stringify(data, null, 2));
            return activateDeactivateMasterEarningsDeductions(data);
        },
        onSuccess: (response) => {
            console.log('🟢 [BROWSER-HOOK] Response:', JSON.stringify(response, null, 2));
            // Use the complete data from toggle response to update the cache
            if (response?.success && response?.data) {
                const toggleResponseData = response.data;
                console.log('🟢 [BROWSER-HOOK] Toggle response data keys:', Object.keys(toggleResponseData || {}));
                // Get current cached data for pagination/metadata
                const queryKey = [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, roleId];
                const currentData = queryClient.getQueryData(queryKey) as any;
                // Transform toggle response data to match the list query response format
                // Use the complete data from toggle response as-is (backend handles filtering)
                const updatedData = {
                    success: true,
                    message: response.message || 'Data updated successfully',
                    data: {
                        HRMED_Id: toggleResponseData.HRMED_Id || 0,
                        MI_Id: toggleResponseData.MI_Id || roleId,
                        HRMED_Name: toggleResponseData.HRMED_Name || null,
                        HRMED_EDTypeFlag: toggleResponseData.HRMED_EDTypeFlag || null,
                        HRMED_EarnDedFlag: toggleResponseData.HRMED_EarnDedFlag || null,
                        HRMED_AmountPercentFlag: toggleResponseData.HRMED_AmountPercentFlag || null,
                        HRMED_AmountPercent: toggleResponseData.HRMED_AmountPercent || null,
                        HRMED_ActiveFlag: toggleResponseData.HRMED_ActiveFlag ?? false,
                        HRMED_RoundOffFlag: toggleResponseData.HRMED_RoundOffFlag || null,
                        earningdetectionList: toggleResponseData.earningdetectionList || null,
                        retrunMsg: toggleResponseData.retrunMsg || '',
                        roleId: toggleResponseData.roleId || 0,
                        HRMED_ReviseFlg: toggleResponseData.HRMED_ReviseFlg ?? false,
                        earningList: toggleResponseData.earningList || null,
                        detectionList: toggleResponseData.detectionList || null,
                        eardettypelist: toggleResponseData.eardettypelist || null,
                        eardettypeDropdown: toggleResponseData.eardettypeDropdown || null,
                        perc_OfDTO: toggleResponseData.perc_OfDTO || null,
                        selectedearningdetectionList: toggleResponseData.selectedearningdetectionList || null,
                        percentOff: toggleResponseData.percentOff || null,
                        HREED_Amount: toggleResponseData.HREED_Amount || null,
                        arrearlist: toggleResponseData.arrearlist || [],
                        grosslist: toggleResponseData.grosslist || [],
                        EarningsDeductionsDTO: toggleResponseData.EarningsDeductionsDTO || null,
                        HRMED_Order: toggleResponseData.HRMED_Order || null
                    },
                    total: currentData?.total || null,
                    page: currentData?.page || 1,
                    page_size: currentData?.page_size || 10
                };
                // Update the cache with the complete data from toggle response
                queryClient.setQueryData(queryKey, updatedData);
            } else {
                // Fallback: invalidate queries if response doesn't have complete data
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
                });
            }
        },
        onError: (error: any) => {
            if (error?.response) {
                console.error('🔴 [BROWSER-HOOK] Error response data:', JSON.stringify(error.response?.data, null, 2));
            }
        }
    });
    const saveOrderMutation = useMutation({
        mutationFn: (earningsDeductions: EarningsDeductionDetail[]) => saveMasterEarningsDeductionsOrder(earningsDeductions),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
            });
        }
    });
    const refetchAll = () => {
        queryClient.invalidateQueries({
            queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
        });
    };
    return {
        listQuery,
        saveMutation,
        toggleMutation,
        saveOrderMutation,
        refetchAll
    };
}
export function useMasterEarningsDeductionsDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS, 'details', id],
        queryFn: async () => getMasterEarningsDeductionsDetails(id),
        enabled: id > 0
    });
}
// ============================================================================
// PAYROLL STANDARD
// ============================================================================
export function useMasterPayrollStandard(roleId: number) {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD, roleId],
        queryFn: async () => {
            const result = await getMasterPayrollStandardList(roleId);
            const hrStandardList = (result?.hrStandardList || []) as any[];
            return result;
        },
        staleTime: 5 * 60 * 1000
    });
    const saveMutation = useMutation({
        mutationFn: (data: MasterPayrollStandardInput) => {
            console.log('🟣 [HOOK] Payload:', JSON.stringify(data, null, 2));
            return saveMasterPayrollStandard(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Payroll Standard saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD]
            });
        },
        onError: (error: any) => {
        }
    });
    return {
        listQuery,
        saveMutation
    };
}
export function useMasterPayrollStandardDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD, 'details', id],
        queryFn: async () => getMasterPayrollStandardDetails(id),
        enabled: id > 0
    });
}
// ============================================================================
// RELIGION CATEGORY MAPPING
// ============================================================================
export function useReligionCategoryMapping(searchParams?: ApiSearchparams) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING, searchParams ?? {}],
        queryFn: async () => {
            const result = await getReligionCategoryMappingList(searchParams);
            return result;
        },
        staleTime: 0
    });
}
export function useSaveReligionCategoryMapping() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveReligionCategoryMapping(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
            });
        }
    });
}
export function useReligionCategoryMappingCRUD(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING, searchParams ?? {}],
        queryFn: () => getReligionCategoryMappingList(searchParams),
        staleTime: 0
    });
    const saveMutation = useMutation({
        mutationFn: (data: any) => saveReligionCategoryMapping(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
            });
        }
    });
    const toggleMutation = useMutation({
        mutationFn: (id: number) => toggleReligionCategoryMapping(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
            });
        }
    });
    const refetchAll = () => {
        queryClient.invalidateQueries({
            queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
        });
    };
    return { listQuery, saveMutation, toggleMutation, refetchAll };
}
export function useActivateDeactivateReligionCategoryMapping() {
    const { toggleMutation } = useReligionCategoryMappingCRUD();
    return toggleMutation;
}
// ============================================================================
// GROUP DEPT DESSG MAPPING
// ============================================================================
export function useGroupDeptDessgMapping(searchParams?: ApiSearchparams) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING, searchParams ?? {}],
        queryFn: () => getGroupDeptDessgMappingList(searchParams),
        staleTime: 0
    });
}
export function useSaveGroupDeptDessgMapping() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: GroupDeptDessgMappingInput) => saveGroupDeptDessgMapping(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
            });
        }
    });
}
export function useGroupDeptDessgMappingCRUD() {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING],
        queryFn: () => getGroupDeptDessgMappingList(),
        staleTime: 1000 * 60 * 5
    });
    const saveMutation = useMutation({
        mutationFn: (data: GroupDeptDessgMappingInput) => saveGroupDeptDessgMapping(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Mapping saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
                });
            } else {
                toast.error(response.message || 'Failed to save mapping');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving mapping');
        }
    });
    const toggleMutation = useMutation({
        mutationFn: (id: number) => toggleGroupDeptDessgMapping(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
            });
        }
    });
    const refetchAll = () => {
        queryClient.invalidateQueries({
            queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
        });
    };
    return { listQuery, saveMutation, toggleMutation, refetchAll };
}
export function useActivateDeactivateGroupDeptDessgMapping() {
    const { toggleMutation } = useGroupDeptDessgMappingCRUD();
    return toggleMutation;
}
