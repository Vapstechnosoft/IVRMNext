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
    getGradeSetOrder,
    getMasterGradeList,
    saveMasterGrade,
    saveMasterGradeOrder,
    updateGradeSetorder
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
    getReligionCategoryMappingDetails,
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
export const useMasterDepartment = (roleId: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT, roleId, searchParams ?? {}],
        queryFn: async () => getMasterDepartmentList(roleId, searchParams),
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
            return saveMasterDepartment(payload);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] });
        },
        onError: (error: any) => {
        }
    });
    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMD_Id: number; HRMD_ActiveFlag: boolean; roleId?: number }) => {
            return activateDeactivateMasterDepartment(payload);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] });
        },
        onError: (error: any) => {
        }
    });
    const saveOrderMutation = useMutation({
        mutationFn: (departments: DepartmentDetail[]) => {
            return saveMasterDepartmentOrder(departments);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] });
        }
    });
    const refetchAll = () => {
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] });
    };
    return { listQuery, onloadQuery, getById, saveMutation, toggleMutation, saveOrderMutation, refetchAll };
};
// ============================================================================
// DESIGNATION
// ============================================================================
export const useMasterDesignation = (roleId: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION, roleId, searchParams ?? {}],
        queryFn: async () => getMasterDesignationList(roleId, searchParams),
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
            return saveMasterDesignation(payload);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] });
        },
        onError: (error: any) => {
        }
    });
    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMDES_Id: number; HRMDES_ActiveFlag: boolean; roleId?: number }) => {
            return activateDeactivateMasterDesignation(payload);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] });
        },
        onError: (error: any) => {
        }
    });
    const saveOrderMutation = useMutation({
        mutationFn: (designations: DesignationDetail[]) => {
            return saveMasterDesignationOrder(designations);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] });
        }
    });
    const refetchAll = () => {
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] });
    };
    return { listQuery, onloadQuery, getById, onchangeMutation, saveMutation, toggleMutation, saveOrderMutation, refetchAll };
};
// ============================================================================
// GRADE
// ============================================================================
export const useMasterGrade = (roleId: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE, roleId, searchParams ?? {}],
        queryFn: async () => getMasterGradeList(roleId, searchParams),
        staleTime: 0
    });
    const saveMutation = useMutation({
        mutationFn: (payload: MasterGradeInput) => {
            return saveMasterGrade(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Grade saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] });
        },
        onError: (error: any) => {
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
        }
    });
    const saveOrderMutation = useMutation({
        mutationFn: (grades: GradeDetail[]) => {
            return saveMasterGradeOrder(grades);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] });
        }
    });
    const refetchAll = () => {
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
    console.log('🟡 [DEBUG] searchParams:', JSON.stringify(searchParams, null, 2));
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
            } else {
            }
            return saveMasterBank(data, roleId);
        },
        onSuccess: (response, variables) => {
            const isEditMode = !!variables.HRMBD_Id;
            if (isEditMode) {
                if (response?.data) {
                    // For edit, check top-level first, then find by ID in list
                    const topLevelIFSC = response.data.HRMBD_IFSCCode;
                    const topLevelId = response.data.HRMBD_Id;
                    const updatedBankInList = response.data.bankdetailList?.find((bank: any) => bank.HRMBD_Id === variables.HRMBD_Id);
                    const responseBank = updatedBankInList || (topLevelId === variables.HRMBD_Id ? response.data : response.data.bankdetailList?.[0] || response.data);
                }
            } else {
            }
            if (response?.success) {
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_BANK]
                });
            }
        },
        onError: (error: any) => {
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
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_BANK]
            });
        },
        onError: (error: any) => {
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
export function useMasterCourse(roleId: number, searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE, roleId, searchParams ?? {}],
        queryFn: async () => getMasterCourseList(roleId, searchParams),
        staleTime: 0
    });
    const saveMutation = useMutation({
        mutationFn: (data: MasterCourseInput) => {
            console.log('🟣 [HOOK] Course saveMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return saveMasterCourse(data);
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
            return activateDeactivateMasterCourse(data);
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
    const saveOrderMutation = useMutation({
        mutationFn: (courses: CourseDetail[]) => saveMasterCourseOrder(courses),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
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
export const useMasterEmployeeType = (roleId: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE, roleId, searchParams ?? {}],
        queryFn: async () => getMasterEmployeeTypeList(roleId, searchParams),
        staleTime: 0
    });
    const saveMutation = useMutation({
        mutationFn: (payload: MasterEmployeeTypeInput) => {
            return saveMasterEmployeeType(payload);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] });
        },
        onError: (error: any) => {
        }
    });
    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMET_Id: number; HRMET_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterEmployeeType(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] })
    });
    const refetchAll = () => {
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] });
    };
    return { listQuery, saveMutation, toggleMutation, refetchAll };
};
// ============================================================================
// GENDER
// ============================================================================
export const useMasterGender = (roleId: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER, roleId, searchParams ?? {}],
        queryFn: async () => getMasterGenderList(roleId, searchParams),
        staleTime: 0
    });
    const saveMutation = useMutation({
        mutationFn: (payload: MasterGenderInput) => {
            console.log('🟣 [HOOK] Gender saveMutation.mutationFn called with data:', JSON.stringify(payload, null, 2));
            return saveMasterGender(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Gender saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER] });
        },
        onError: (error: any) => {
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
        }
    });
    const refetchAll = () => {
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER] });
    };
    return { listQuery, saveMutation, toggleMutation, refetchAll };
};
// ============================================================================
// LOAN
// ============================================================================
export function useMasterLoan(roleId: number, searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN, roleId, searchParams ?? {}],
        queryFn: async () => getMasterLoanList(roleId, searchParams),
        staleTime: 0
    });
    const saveMutation = useMutation({
        mutationFn: (data: MasterLoanInput) => {
            console.log('🟣 [HOOK] Payload:', JSON.stringify(data, null, 2));
            return saveMasterLoan(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Loan saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN]
            });
        },
        onError: (error: any) => {
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
        }
    });
    const refetchAll = () => {
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
export const useMasterMaritalStatus = (roleId: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS, roleId, searchParams ?? {}],
        queryFn: async () => getMasterMaritalStatusList(roleId, searchParams),
        staleTime: 0
    });
    const saveMutation = useMutation({
        mutationFn: (payload: MasterMaritalStatusInput) => {
            console.log('🟣 [HOOK] Marital Status saveMutation.mutationFn called with data:', JSON.stringify(payload, null, 2));
            return saveMasterMaritalStatus(payload);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Marital Status saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] });
        },
        onError: (error: any) => {
        }
    });
    const toggleMutation = useMutation({
        mutationFn: (payload: { IVRMMMS_Id: number; IVRMMMS_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterMaritalStatus(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] })
    });
    const refetchAll = () => {
        queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] });
    };
    return { listQuery, saveMutation, toggleMutation, refetchAll };
};
// ============================================================================
// SPECIALIZATION
// ============================================================================
export function useMasterSpecialization(roleId: number, searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION, roleId, searchParams ?? {}],
        queryFn: async () => getMasterSpecializationList(roleId, searchParams),
        staleTime: 0
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
    const refetchAll = () => {
        queryClient.invalidateQueries({
            queryKey: [HRMS_QUERY_KEYS.MASTER_SPECIALIZATION]
        });
    };
    return {
        listQuery,
        saveMutation,
        toggleMutation,
        refetchAll
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
export function useMasterGroupType(roleId: number, searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE, roleId, searchParams ?? {}],
        queryFn: async () => getMasterGroupTypeList(roleId, searchParams),
        staleTime: 0
    });
    const saveMutation = useMutation({
        mutationFn: (data: MasterGroupTypeInput) => {
            return saveMasterGroupType(data);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
            });
        },
        onError: (error: any) => {
        }
    });
    const toggleMutation = useMutation({
        mutationFn: (data: {
            HRMGT_Id: number;
            HRMGT_ActiveFlag: boolean;
            MI_Id?: number;
        }) => {
            return activateDeactivateMasterGroupType(data);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
            });
        },
        onError: (error: any) => {
        }
    });
    const saveOrderMutation = useMutation({
        mutationFn: (groupTypes: GroupTypeDetail[]) => {
            return saveMasterGroupTypeOrder(groupTypes);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
            });
        }
    });
    const refetchAll = () => {
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
export function useMasterProfessionalTax(roleId: number, searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX, roleId, searchParams ?? {}],
        queryFn: async () => getMasterProfessionalTaxList(roleId, searchParams),
        staleTime: 0
    });
    const saveMutation = useMutation({
        mutationFn: (data: MasterProfessionalTaxInput) => {
            console.log('🟣 [HOOK] Professional Tax saveMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return saveMasterProfessionalTax(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Professional Tax saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX]
            });
        },
        onError: (error: any) => {
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
export function useMasterLeaveYear(roleId: number, searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR, roleId, searchParams ?? {}],
        queryFn: async () => getMasterLeaveYearList(roleId, searchParams),
        staleTime: 0
    });
    const saveMutation = useMutation({
        mutationFn: (data: MasterLeaveYearInput) => {
            console.log('🟣 [HOOK] Leave Year saveMutation.mutationFn called with data:', JSON.stringify(data, null, 2));
            return saveMasterLeaveYear(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Leave Year saveMutation.onSuccess - Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        },
        onError: (error: any) => {
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
        }
    });
    const saveOrderMutation = useMutation({
        mutationFn: (leaveYears: LeaveYearDetail[]) => {
            console.log('🟣 [HOOK] Leave years data:', JSON.stringify(leaveYears, null, 2));
            leaveYears.forEach((ly, index) => {
            });
            return saveMasterLeaveYearOrder(leaveYears);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Response:', JSON.stringify(response, null, 2));
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        },
        onError: (error: any) => {
        }
    });
    const refetchAll = () => {
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
export function useReligionCategoryMappingCRUD(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING, searchParams ?? {}],
        queryFn: () => getReligionCategoryMappingList(searchParams),
        staleTime: 0
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
        mutationFn: (data: GroupDeptDessgMappingInput) => {
            console.log('🟣 [HOOK] Data:', JSON.stringify(data, null, 2));
            return saveGroupDeptDessgMapping(data);
        },
        onSuccess: (response) => {
            console.log('🟣 [HOOK] Response:', JSON.stringify(response, null, 2));
            // Always invalidate queries to refresh the table, regardless of success
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
            });
            // Don't show toast here - let the form handle it to avoid duplicates
            // The form has more context about the operation
        },
        onError: (error: Error) => {
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
