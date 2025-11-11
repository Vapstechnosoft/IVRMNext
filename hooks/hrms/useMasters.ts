'use client';

/**
 * Unified HRMS Master Hooks
 * All master-related hooks consolidated in one file
 */

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateMasterDepartment,
    getDepartmentById,
    getMasterDepartmentList,
    getOnloadDepartmentDetails,
    saveMasterDepartment,
    saveMasterDepartmentOrder
} from '@/server/hrms/hrmsConfig/master/department';
import {
    activateDeactivateMasterDesignation,
    getDesignationById,
    getMasterDesignationList,
    getOnchangeDesignationDetails,
    getOnloadDesignationDetails,
    saveMasterDesignation,
    saveMasterDesignationOrder
} from '@/server/hrms/hrmsConfig/master/designation';
import {
    activateDeactivateMasterGrade,
    getMasterGradeList,
    saveMasterGrade,
    saveMasterGradeOrder
} from '@/server/hrms/hrmsConfig/master/grade';
import {
    activateDeactivateMasterBank,
    getMasterBankDetails,
    getMasterBankList,
    saveMasterBank
} from '@/server/hrms/hrmsConfig/master/bank';
import {
    activateDeactivateMasterCourse,
    getMasterCourseDetails,
    getMasterCourseList,
    saveMasterCourse,
    saveMasterCourseOrder
} from '@/server/hrms/hrmsConfig/master/course';
import {
    activateDeactivateMasterEmployeeType,
    getMasterEmployeeTypeList,
    saveMasterEmployeeType
} from '@/server/hrms/hrmsConfig/master/employee-type';
import { activateDeactivateMasterGender, getMasterGenderList, saveMasterGender } from '@/server/hrms/hrmsConfig/master/gender';
import { activateDeactivateMasterLoan, getMasterLoanDetails, getMasterLoanList, saveMasterLoan } from '@/server/hrms/hrmsConfig/master/loan';
import {
    activateDeactivateMasterMaritalStatus,
    getMasterMaritalStatusList,
    saveMasterMaritalStatus
} from '@/server/hrms/hrmsConfig/master/marital-status';
import {
    activateDeactivateMasterSpecialization,
    getMasterSpecializationDetails,
    getMasterSpecializationList,
    saveMasterSpecialization
} from '@/server/hrms/hrmsConfig/master/specialization';
import {
    activateDeactivateMasterGroupType,
    getMasterGroupTypeDetails,
    getMasterGroupTypeList,
    saveMasterGroupType,
    saveMasterGroupTypeOrder
} from '@/server/hrms/hrmsConfig/master/group-type';
import {
    activateDeactivateMasterProfessionalTax,
    getMasterProfessionalTaxDetails,
    getMasterProfessionalTaxList,
    saveMasterProfessionalTax
} from '@/server/hrms/hrmsConfig/master/professional-tax';
import {
    activateDeactivateMasterLeaveYear,
    getMasterLeaveYearDetails,
    getMasterLeaveYearList,
    saveMasterLeaveYear,
    saveMasterLeaveYearOrder
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
    activateDeactivateReligionCategoryMapping,
    getReligionCategoryMappingList,
    saveReligionCategoryMapping
} from '@/server/hrms/hrmsConfig/master/religion-category-mapping';
import {
    activateDeactivateGroupDeptDessgMapping,
    getGroupDeptDessgMappingList,
    saveGroupDeptDessgMapping
} from '@/server/hrms/hrmsConfig/master/group-dept-dessg-mapping';
import type { ApiSearchparams } from '@/types';
import type { DepartmentDetail, MasterDepartmentInput } from '@/types/hrms/master-department';
import type { DesignationDetail, MasterDesignationInput } from '@/types/hrms/master-designation';
import type { GradeDetail, MasterGradeInput } from '@/types/hrms/master-grade';
import type { MasterBankInput } from '@/types/hrms/master-bank';
import type { CourseDetail, MasterCourseInput } from '@/types/hrms/master-course';
import type { MasterEmployeeTypeInput } from '@/types/hrms/master-employee-type';
import type { MasterGenderInput } from '@/types/hrms/master-gender';
import type { MasterLoanInput } from '@/types/hrms/master-loan';
import type { MasterMaritalStatusInput } from '@/types/hrms/master-marital-status';
import type { MasterSpecializationInput } from '@/types/hrms/master-specialization';
import type { GroupTypeDetail, MasterGroupTypeInput } from '@/types/hrms/master-group-type';
import type { MasterProfessionalTaxInput } from '@/types/hrms/master-professional-tax';
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

export const useMasterDepartment = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT, { roleId }],
        queryFn: async () => getMasterDepartmentList(roleId),
        staleTime: 0
    });

    const onloadQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT, 'onload', { roleId }],
        queryFn: async () => getOnloadDepartmentDetails(roleId),
        staleTime: 0
    });

    const getById = (id: number) =>
        useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT, 'byId', id],
            queryFn: async () => getDepartmentById(id),
            enabled: !!id,
            staleTime: 0
        });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterDepartmentInput) => {
            console.log('🟣 [HOOK] Department saveMutation.mutationFn called');
            return saveMasterDepartment(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Department saveMutation.onSuccess - Response:', response);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Department saveMutation.onError:', error);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMD_Id: number; HRMD_ActiveFlag: boolean; roleId?: number }) => {
            console.log('🟣 [HOOK] Department toggleMutation.mutationFn called with data:', payload);
            return activateDeactivateMasterDepartment(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Department toggleMutation.onSuccess - Response:', response);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Department toggleMutation.onError:', error);
        }
    });

    const saveOrderMutation = useMutation({
        mutationFn: (departments: DepartmentDetail[]) => {
            console.log('🟣 [HOOK] Department saveOrderMutation called');
            return saveMasterDepartmentOrder(departments);
        },
        onSuccess: () => {
            console.log('🟣 [HOOK] Department saveOrderMutation success');
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] });
        }
    });

    const refetchAll = () => {
        console.log('🔄 [HOOK] Department refetchAll called');
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] });
    };

    return { listQuery, onloadQuery, getById, saveMutation, toggleMutation, saveOrderMutation, refetchAll };
};

// ============================================================================
// DESIGNATION
// ============================================================================

export const useMasterDesignation = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION, { roleId }],
        queryFn: async () => getMasterDesignationList(roleId),
        staleTime: 0
    });

    const onloadQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION, 'onload', { roleId }],
        queryFn: async () => getOnloadDesignationDetails(roleId),
        staleTime: 0
    });

    const getById = (id: number) =>
        useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION, 'byId', id],
            queryFn: async () => getDesignationById(id),
            enabled: !!id,
            staleTime: 0
        });

    const onchangeMutation = useMutation({
        mutationFn: ({ designationId }: { designationId: number }) => getOnchangeDesignationDetails(designationId, roleId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] })
    });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterDesignationInput) => {
            console.log('🟣 [HOOK] Designation saveMutation.mutationFn called');
            return saveMasterDesignation(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Designation saveMutation.onSuccess - Response:', response);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Designation saveMutation.onError:', error);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMDES_Id: number; HRMDES_ActiveFlag: boolean; roleId?: number }) => {
            console.log('🟣 [HOOK] Designation toggleMutation.mutationFn called with data:', payload);
            return activateDeactivateMasterDesignation(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Designation toggleMutation.onSuccess - Response:', response);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Designation toggleMutation.onError:', error);
        }
    });

    const saveOrderMutation = useMutation({
        mutationFn: (designations: DesignationDetail[]) => {
            console.log('🟣 [HOOK] Designation saveOrderMutation called');
            return saveMasterDesignationOrder(designations);
        },
        onSuccess: () => {
            console.log('🟣 [HOOK] Designation saveOrderMutation success');
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] });
        }
    });

    const refetchAll = () => {
        console.log('🔄 [HOOK] Designation refetchAll called');
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] });
    };

    return { listQuery, onloadQuery, getById, onchangeMutation, saveMutation, toggleMutation, saveOrderMutation, refetchAll };
};

// ============================================================================
// GRADE
// ============================================================================

export const useMasterGrade = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE, { roleId }],
        queryFn: async () => getMasterGradeList(roleId),
        staleTime: 0
    });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterGradeInput) => {
            console.log('🟣 [HOOK] Grade saveMutation.mutationFn called');
            console.log('🟣 [HOOK] Payload:', JSON.stringify(payload, null, 2));
            return saveMasterGrade(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Grade saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            console.log('🟣 [HOOK] Invalidating grade queries...');
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] });
            console.log('🟣 [HOOK] Grade queries invalidated - table should refresh');
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Grade saveMutation.onError:', error);
            console.log('🔴 [HOOK] Error message:', error?.message);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMG_Id: number; HRMG_ActiveFlag: boolean; roleId?: number }) => {
            console.log('🟣 [HOOK] Grade toggleMutation called:', JSON.stringify(payload, null, 2));
            return activateDeactivateMasterGrade(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Grade toggleMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Grade toggleMutation.onError - Error:', error);
        }
    });

    const saveOrderMutation = useMutation({
        mutationFn: (grades: GradeDetail[]) => {
            console.log('🟣 [HOOK] Grade saveOrderMutation called');
            return saveMasterGradeOrder(grades);
        },
        onSuccess: () => {
            console.log('🟣 [HOOK] Grade saveOrderMutation success');
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] });
        }
    });

    const refetchAll = () => {
        console.log('🔄 [HOOK] Grade refetchAll called');
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] });
    };

    return { listQuery, saveMutation, toggleMutation, saveOrderMutation, refetchAll };
};

// ============================================================================
// BANK
// ============================================================================

export function useMasterBank(roleId: number, searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    // Debug logging
    console.log('🟡 [DEBUG] useMasterBank - Hook called with:');
    console.log('🟡 [DEBUG] roleId:', roleId);
    console.log('🟡 [DEBUG] searchParams:', JSON.stringify(searchParams, null, 2));
    console.log('🟡 [DEBUG] searchParams type:', typeof searchParams);

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_BANK, roleId, searchParams ?? {}],
        queryFn: async () => {
            console.log('🟡 [DEBUG] useMasterBank - queryFn executing with searchParams:', JSON.stringify(searchParams, null, 2));
            return getMasterBankList(roleId, searchParams);
        },
        staleTime: 0
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterBankInput) => {
            const isEditMode = !!data.HRMBD_Id;
            if (isEditMode) {
                console.log('🟣 [HOOK] Bank edit - ID:', data.HRMBD_Id, 'IFSC:', data.HRMBD_IFSCCode);
            } else {
                console.log('🟣 [HOOK] Bank save - Mode: ADD, IFSC:', data.HRMBD_IFSCCode);
            }
            return saveMasterBank(data, roleId);
        },
        onSuccess: (response, variables) => {
            const isEditMode = !!variables.HRMBD_Id;
            if (isEditMode) {
                console.log('🟣 [HOOK] Edit response - success:', response?.success, 'message:', response?.message);
                if (response?.data) {
                    // For edit, check top-level first, then find by ID in list
                    const topLevelIFSC = response.data.HRMBD_IFSCCode;
                    const topLevelId = response.data.HRMBD_Id;
                    const updatedBankInList = response.data.bankdetailList?.find((bank: any) => bank.HRMBD_Id === variables.HRMBD_Id);
                    const responseBank = updatedBankInList || (topLevelId === variables.HRMBD_Id ? response.data : response.data.bankdetailList?.[0] || response.data);
                    
                    console.log('🟣 [HOOK] Top-level IFSC:', topLevelIFSC, 'ID:', topLevelId);
                    console.log('🟣 [HOOK] Response Bank IFSC:', responseBank.HRMBD_IFSCCode, 'ID:', responseBank.HRMBD_Id);
                    console.log('🟣 [HOOK] Submitted IFSC:', variables.HRMBD_IFSCCode, 'ID:', variables.HRMBD_Id);
                    console.log('🟣 [HOOK] IFSC Updated:', responseBank.HRMBD_IFSCCode === variables.HRMBD_IFSCCode);
                }
            } else {
                console.log('🟣 [HOOK] Bank save success:', response?.success, response?.message);
            }
            if (response?.success) {
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_BANK]
                });
            }
        },
        onError: (error: any) => {
            console.error('🔴 [HOOK] Bank save error:', error?.message || error);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (data: {
            HRMBD_Id: number;
            HRMBD_ActiveFlag: boolean;
            MI_Id?: number;
        }) => {
            console.log('🟣 [HOOK] Bank toggleMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return activateDeactivateMasterBank(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Bank toggleMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            console.log('🟣 [HOOK] Invalidating bank queries...');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_BANK]
            });
            console.log('🟣 [HOOK] Bank queries invalidated');
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Bank toggleMutation.onError - Error:', error);
            console.log('🔴 [HOOK] Error message:', error?.message);
            console.log('🔴 [HOOK] Error response:', error?.response);
        }
    });

    const refetchAll = () => {
        queryClient.invalidateQueries({
            queryKey: [HRMS_QUERY_KEYS.MASTER_BANK]
        });
        queryClient.refetchQueries({
            queryKey: [HRMS_QUERY_KEYS.MASTER_BANK, roleId, searchParams ?? {}]
        });
    };

    return {
        listQuery,
        saveMutation,
        toggleMutation,
        refetchAll
    };
}

export function useMasterBankDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_BANK, 'details', id],
        queryFn: async () => getMasterBankDetails(id),
        enabled: id > 0,
        staleTime: 0
    });
}

// ============================================================================
// COURSE
// ============================================================================

export function useMasterCourse(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE, roleId],
        queryFn: async () => getMasterCourseList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterCourseInput) => {
            console.log('🟣 [HOOK] Course saveMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return saveMasterCourse(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Course saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            console.log('🟣 [HOOK] Invalidating course queries...');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
            console.log('🟣 [HOOK] Course queries invalidated - table should refresh');
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Course saveMutation.onError - Error:', error);
            console.log('🔴 [HOOK] Error message:', error?.message);
            console.log('🔴 [HOOK] Error response:', error?.response);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (data: { HRMC_Id: number; HRMC_ActiveFlag: boolean; MI_Id?: number }) => {
            console.log('🟣 [HOOK] Course toggleMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return activateDeactivateMasterCourse(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Course toggleMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Course toggleMutation.onError - Error:', error);
        }
    });

    const saveOrderMutation = useMutation({
        mutationFn: (courses: CourseDetail[]) => saveMasterCourseOrder(courses),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
        }
    });

    const refetchAll = () => {
        console.log('🔄 [HOOK] Course refetchAll called - Invalidating queries');
        queryClient.invalidateQueries({
            queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
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

export function useMasterCourseDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE, 'details', id],
        queryFn: async () => getMasterCourseDetails(id),
        enabled: id > 0
    });
}

// ============================================================================
// EMPLOYEE TYPE
// ============================================================================

export const useMasterEmployeeType = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE, { roleId }],
        queryFn: async () => getMasterEmployeeTypeList(roleId),
        staleTime: 0
    });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterEmployeeTypeInput) => {
            console.log('🟣 [HOOK] Employee Type saveMutation.mutationFn called');
            return saveMasterEmployeeType(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Employee Type saveMutation.onSuccess - Response:', response);
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Employee Type saveMutation.onError:', error);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMET_Id: number; HRMET_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterEmployeeType(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] })
    });

    const refetchAll = () => {
        console.log('🔄 [HOOK] Employee Type refetchAll called');
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] });
    };

    return { listQuery, saveMutation, toggleMutation, refetchAll };
};

// ============================================================================
// GENDER
// ============================================================================

export const useMasterGender = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER, { roleId }],
        queryFn: async () => getMasterGenderList(roleId),
        staleTime: 0
    });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterGenderInput) => {
            console.log('🟣 [HOOK] Gender saveMutation.mutationFn called with data:', JSON.stringify(payload, null, 2));
            return saveMasterGender(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Gender saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            console.log('🟣 [HOOK] Invalidating gender queries...');
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER] });
            console.log('🟣 [HOOK] Gender queries invalidated - table should refresh');
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Gender saveMutation.onError - Error:', error);
            console.log('🔴 [HOOK] Error message:', error?.message);
            console.log('🔴 [HOOK] Error response:', error?.response);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { IVRMMG_Id: number; IVRMMG_ActiveFlag: boolean; MI_Id?: number }) => {
            console.log('🟣 [HOOK] Gender toggleMutation.mutationFn called with data:', JSON.stringify(payload, null, 2));
            return activateDeactivateMasterGender(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Gender toggleMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER] });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Gender toggleMutation.onError - Error:', error);
        }
    });

    const refetchAll = () => {
        console.log('🔄 [HOOK] Gender refetchAll called - Invalidating queries');
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER] });
    };

    return { listQuery, saveMutation, toggleMutation, refetchAll };
};

// ============================================================================
// LOAN
// ============================================================================

export function useMasterLoan(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN, roleId],
        queryFn: async () => getMasterLoanList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterLoanInput) => {
            console.log('🟣 [HOOK] Loan saveMutation.mutationFn called');
            console.log('🟣 [HOOK] Payload:', JSON.stringify(data, null, 2));
            return saveMasterLoan(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Loan saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            console.log('🟣 [HOOK] Invalidating loan queries...');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN]
            });
            console.log('🟣 [HOOK] Loan queries invalidated - table should refresh');
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Loan saveMutation.onError:', error);
            console.log('🔴 [HOOK] Error message:', error?.message);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMLN_Id: number; HRMLN_ActiveFlag: boolean; MI_Id?: number }) => {
            console.log('🟣 [HOOK] Loan toggleMutation called:', JSON.stringify(payload, null, 2));
            return activateDeactivateMasterLoan(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Loan toggleMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN]
            });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Loan toggleMutation.onError - Error:', error);
        }
    });

    const refetchAll = () => {
        console.log('🔄 [HOOK] Loan refetchAll called - Invalidating queries');
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN] });
    };

    return {
        listQuery,
        saveMutation,
        toggleMutation,
        refetchAll
    };
}

export function useMasterLoanDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN, 'details', id],
        queryFn: async () => getMasterLoanDetails(id),
        enabled: id > 0
    });
}

// ============================================================================
// MARITAL STATUS
// ============================================================================

export const useMasterMaritalStatus = (roleId: number, _searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS, { roleId }],
        queryFn: async () => getMasterMaritalStatusList(roleId),
        staleTime: 0
    });

    const saveMutation = useMutation({
        mutationFn: (payload: MasterMaritalStatusInput) => {
            console.log('🟣 [HOOK] Marital Status saveMutation.mutationFn called with data:', JSON.stringify(payload, null, 2));
            return saveMasterMaritalStatus(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Marital Status saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            console.log('🟣 [HOOK] Invalidating marital status queries...');
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] });
            console.log('🟣 [HOOK] Marital status queries invalidated - table should refresh');
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Marital Status saveMutation.onError - Error:', error);
            console.log('🔴 [HOOK] Error message:', error?.message);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { IVRMMMS_Id: number; IVRMMMS_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterMaritalStatus(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] })
    });

    const refetchAll = () => {
        console.log('🔄 [HOOK] Marital Status refetchAll called - Invalidating queries');
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] });
    };

    return { listQuery, saveMutation, toggleMutation, refetchAll };
};

// ============================================================================
// SPECIALIZATION
// ============================================================================

export function useMasterSpecialization(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION, roleId],
        queryFn: async () => getMasterSpecializationList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterSpecializationInput) => saveMasterSpecialization(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION]
            });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMSPL_Id: number; HRMSPL_ActiveFlg: boolean; MI_Id?: number }) =>
            activateDeactivateMasterSpecialization(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION]
            });
        }
    });

    return {
        listQuery,
        saveMutation,
        toggleMutation
    };
}

export function useMasterSpecializationDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION, 'details', id],
        queryFn: async () => getMasterSpecializationDetails(id),
        enabled: id > 0
    });
}

// ============================================================================
// GROUP TYPE
// ============================================================================

export function useMasterGroupType(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE, roleId],
        queryFn: async () => getMasterGroupTypeList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterGroupTypeInput) => {
            console.log('🟣 [HOOK] Group Type saveMutation.mutationFn called');
            return saveMasterGroupType(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Group Type saveMutation.onSuccess - Response:', response);
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
            });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Group Type saveMutation.onError:', error);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (data: {
            HRMGT_Id: number;
            HRMGT_ActiveFlag: boolean;
            MI_Id?: number;
        }) => {
            console.log('🟣 [HOOK] Group Type toggleMutation.mutationFn called with data:', data);
            return activateDeactivateMasterGroupType(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Group Type toggleMutation.onSuccess - Response:', response);
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
            });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Group Type toggleMutation.onError:', error);
        }
    });

    const saveOrderMutation = useMutation({
        mutationFn: (groupTypes: GroupTypeDetail[]) => {
            console.log('🟣 [HOOK] Group Type saveOrderMutation called');
            return saveMasterGroupTypeOrder(groupTypes);
        },
        onSuccess: () => {
            console.log('🟣 [HOOK] Group Type saveOrderMutation success');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
            });
        }
    });

    const refetchAll = () => {
        console.log('🔄 [HOOK] Group Type refetchAll called');
        queryClient.invalidateQueries({
            queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
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

export function useMasterGroupTypeDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE, 'details', id],
        queryFn: async () => getMasterGroupTypeDetails(id),
        enabled: id > 0
    });
}

// ============================================================================
// PROFESSIONAL TAX
// ============================================================================

export function useMasterProfessionalTax(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX, roleId],
        queryFn: async () => getMasterProfessionalTaxList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterProfessionalTaxInput) => {
            console.log('🟣 [HOOK] Professional Tax saveMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return saveMasterProfessionalTax(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Professional Tax saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            console.log('🟣 [HOOK] Invalidating professional tax queries...');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX]
            });
            console.log('🟣 [HOOK] Professional tax queries invalidated - table should refresh');
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Professional Tax saveMutation.onError - Error:', error);
            console.log('🔴 [HOOK] Error message:', error?.message);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMPT_Id: number; HRMPT_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterProfessionalTax(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX]
            });
        }
    });

    const refetchAll = () => {
        console.log('🔄 [HOOK] Professional Tax refetchAll called - Invalidating queries');
        queryClient.invalidateQueries({
            queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX]
        });
    };

    return {
        listQuery,
        saveMutation,
        toggleMutation,
        refetchAll
    };
}

export function useMasterProfessionalTaxDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX, 'details', id],
        queryFn: async () => getMasterProfessionalTaxDetails(id),
        enabled: id > 0
    });
}

// ============================================================================
// LEAVE YEAR
// ============================================================================

export function useMasterLeaveYear(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR, roleId],
        queryFn: async () => getMasterLeaveYearList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterLeaveYearInput) => {
            console.log('🟣 [HOOK] Leave Year saveMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return saveMasterLeaveYear(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Leave Year saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            console.log('🟣 [HOOK] Invalidating leave year queries...');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
            console.log('🟣 [HOOK] Leave year queries invalidated - table should refresh');
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Leave Year saveMutation.onError - Error:', error);
            console.log('🔴 [HOOK] Error message:', error?.message);
            console.log('🔴 [HOOK] Error response:', error?.response);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (data: {
            HRMLY_Id: number;
            HRMLY_ActiveFlag: boolean;
            MI_Id?: number;
        }) => {
            console.log('🟣 [HOOK] Leave Year toggleMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return activateDeactivateMasterLeaveYear(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Leave Year toggleMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Leave Year toggleMutation.onError - Error:', error);
        }
    });

    const saveOrderMutation = useMutation({
        mutationFn: (leaveYears: LeaveYearDetail[]) => {
            console.log('🟣 [HOOK] Leave Year saveOrderMutation.mutationFn called');
            console.log('🟣 [HOOK] Number of leave years to update:', leaveYears.length);
            console.log('🟣 [HOOK] Leave years data:', JSON.stringify(leaveYears, null, 2));
            leaveYears.forEach((ly, index) => {
                console.log(`🟣 [HOOK] Leave Year ${index + 1}: ID=${ly.HRMLY_Id}, Order=${ly.HRMLY_LeaveYearOrder}, Year=${ly.HRMLY_LeaveYear}`);
            });
            return saveMasterLeaveYearOrder(leaveYears);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Leave Year saveOrderMutation.onSuccess');
            console.log('🟣 [HOOK] Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
            console.log('🟣 [HOOK] Leave year queries invalidated after order save');
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Leave Year saveOrderMutation.onError');
            console.log('🔴 [HOOK] Error:', error);
        }
    });

    const refetchAll = () => {
        console.log('🔄 [HOOK] Leave Year refetchAll called - Invalidating queries');
        queryClient.invalidateQueries({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
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

export function useMasterLeaveYearDetails(id: number) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR, 'details', id],
        queryFn: async () => getMasterLeaveYearDetails(id),
        enabled: id > 0
    });
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
            console.log('🟣 [HOOK] saveMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return saveMasterEarningsDeductions(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            console.log('🟣 [HOOK] Invalidating earnings/deductions queries...');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
            });
            console.log('🟣 [HOOK] Earnings/deductions queries invalidated - table should refresh');
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] saveMutation.onError - Error:', error);
            console.log('🔴 [HOOK] Error message:', error?.message);
            console.log('🔴 [HOOK] Error response:', error?.response);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (data: {
            HRMED_Id: number;
            HRMED_ActiveFlag: boolean;
            MI_Id?: number;
        }) => {
            console.log('🟣 [HOOK] toggleMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return activateDeactivateMasterEarningsDeductions(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] toggleMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
            });
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] toggleMutation.onError - Error:', error);
            console.log('🔴 [HOOK] Error message:', error?.message);
            console.log('🔴 [HOOK] Error response:', error?.response);
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
            console.log('🟣 [HOOK] useMasterPayrollStandard queryFn called');
            console.log('🟣 [HOOK] roleId:', roleId);
            const result = await getMasterPayrollStandardList(roleId);
            console.log('🟣 [HOOK] getMasterPayrollStandardList result:', result);
            console.log('🟣 [HOOK] result.hrStandardList:', result?.hrStandardList);
            const hrStandardList = (result?.hrStandardList || []) as any[];
            console.log('🟣 [HOOK] result.hrStandardList length:', hrStandardList.length || 0);
            console.log('🟣 [HOOK] First record:', hrStandardList[0]);
            return result;
        },
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterPayrollStandardInput) => {
            console.log('🟣 [HOOK] Payroll Standard saveMutation.mutationFn called');
            console.log('🟣 [HOOK] Payload:', JSON.stringify(data, null, 2));
            return saveMasterPayrollStandard(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Payroll Standard saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            console.log('🟣 [HOOK] Invalidating payroll standard queries...');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD]
            });
            console.log('🟣 [HOOK] Payroll standard queries invalidated');
        },
        onError: (error: any) => {
            console.log('🔴 [HOOK] Payroll Standard saveMutation.onError:', error);
            console.log('🔴 [HOOK] Error message:', error?.message);
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

export function useReligionCategoryMapping() {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING],
        queryFn: async () => {
            console.log('🟣 [HOOK] useReligionCategoryMapping queryFn called');
            const result = await getReligionCategoryMappingList();
            console.log('🟣 [HOOK] getReligionCategoryMappingList result:', result);
            console.log('🟣 [HOOK] result.data:', result?.data);
            console.log('🟣 [HOOK] result.data.get_masterlist:', result?.data?.get_masterlist);
            console.log('🟣 [HOOK] result.data.get_masterlist length:', result?.data?.get_masterlist?.length || 0);
            return result;
        },
        staleTime: 1000 * 60 * 5
    });
}

export function useSaveReligionCategoryMapping() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ReligionCategoryMappingInput) => saveReligionCategoryMapping(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Mapping saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
                });
            } else {
                toast.error(response.message || 'Failed to save mapping');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving mapping');
        }
    });
}

export function useReligionCategoryMappingCRUD() {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING],
        queryFn: () => getReligionCategoryMappingList(),
        staleTime: 1000 * 60 * 5
    });

    const saveMutation = useMutation({
        mutationFn: (data: ReligionCategoryMappingInput) => saveReligionCategoryMapping(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Mapping saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
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
        mutationFn: (data: ReligionCategoryMappingDetail & { IRCC_ActiveFlg: boolean }) => activateDeactivateReligionCategoryMapping(data),
        // Optimistic update: immediately update the UI before server response
        onMutate: async (newData) => {
            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({
                queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
            });

            // Snapshot the previous value
            const previousData = queryClient.getQueryData<ApiResponse<ReligionCategoryMappingResponse>>([
                HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING
            ]);

            // Optimistically update the cache
            if (previousData?.data?.get_masterlist) {
                const updatedMasterList = previousData.data.get_masterlist.map((item) =>
                    item.IRCC_Id === newData.IRCC_Id
                        ? { ...item, IRCC_ActiveFlg: newData.IRCC_ActiveFlg }
                        : item
                );

                queryClient.setQueryData<ApiResponse<ReligionCategoryMappingResponse>>(
                    [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING],
                    {
                        ...previousData,
                        data: {
                            ...previousData.data,
                            get_masterlist: updatedMasterList
                        }
                    }
                );
            }

            // Return context with the snapshotted value
            return { previousData };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Mapping status updated successfully');
                // Refetch to ensure data is fresh and consistent with server
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING],
                    refetchType: 'active'
                });
            } else {
                toast.error(response.message || 'Failed to update mapping status');
                // Refetch to get the actual state if update failed
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
                });
            }
        },
        onError: (error: Error, _newData, context) => {
            toast.error(error.message || 'An error occurred while updating mapping status');
            // Rollback to previous value on error
            if (context?.previousData) {
                queryClient.setQueryData(
                    [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING],
                    context.previousData
                );
            }
            // Refetch to get the actual state
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

export function useGroupDeptDessgMapping() {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING],
        queryFn: () => getGroupDeptDessgMappingList(),
        staleTime: 1000 * 60 * 5
    });
}

export function useSaveGroupDeptDessgMapping() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: GroupDeptDessgMappingInput) => {
            console.log('🟣 [HOOK] useSaveGroupDeptDessgMapping mutationFn called');
            console.log('🟣 [HOOK] Data:', JSON.stringify(data, null, 2));
            return saveGroupDeptDessgMapping(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] useSaveGroupDeptDessgMapping onSuccess called');
            console.log('🟣 [HOOK] Response:', JSON.stringify(response, null, 2));
            
            // Always invalidate queries to refresh the table, regardless of success
            console.log('🟣 [HOOK] Invalidating queries...');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
            });
            console.log('🟣 [HOOK] Queries invalidated - table should refresh');
            
            // Don't show toast here - let the form handle it to avoid duplicates
            // The form has more context about the operation
        },
        onError: (error: Error) => {
            console.log('🔴 [HOOK] useSaveGroupDeptDessgMapping onError called');
            console.log('🔴 [HOOK] Error:', error);
            // Don't show toast here - let the form handle it
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
        mutationFn: (data: GroupDeptDessgMappingDetail & { HRGTDDS_ActiveFlg: boolean }) => activateDeactivateGroupDeptDessgMapping(data),
        // Optimistic update: immediately update the UI before server response
        onMutate: async (newData) => {
            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({
                queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
            });

            // Snapshot the previous value
            const previousData = queryClient.getQueryData<ApiResponse<GroupDeptDessgMappingResponse>>([
                HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING
            ]);

            // Optimistically update the cache
            if (previousData?.data?.gridviewdata) {
                const updatedGridData = previousData.data.gridviewdata.map((item) =>
                    item.HRGTDDS_Id === newData.HRGTDDS_Id
                        ? { ...item, HRGTDDS_ActiveFlg: newData.HRGTDDS_ActiveFlg }
                        : item
                );

                queryClient.setQueryData<ApiResponse<GroupDeptDessgMappingResponse>>(
                    [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING],
                    {
                        ...previousData,
                        data: {
                            ...previousData.data,
                            gridviewdata: updatedGridData
                        }
                    }
                );
            }

            // Return context with the snapshotted value
            return { previousData };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Mapping status updated successfully');
                // Refetch to ensure data is fresh and consistent with server
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING],
                    refetchType: 'active'
                });
            } else {
                toast.error(response.message || 'Failed to update mapping status');
                // Refetch to get the actual state if update failed
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
                });
            }
        },
        onError: (error: Error, _newData, context) => {
            toast.error(error.message || 'An error occurred while updating mapping status');
            // Rollback to previous value on error
            if (context?.previousData) {
                queryClient.setQueryData(
                    [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING],
                    context.previousData
                );
            }
            // Refetch to get the actual state
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
