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
import type { ReligionCategoryMappingInput } from '@/types/hrms/religion-category-mapping';
import type { GroupDeptDessgMappingInput } from '@/types/hrms/group-dept-dessg-mapping';
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
        mutationFn: (payload: MasterDepartmentInput) => saveMasterDepartment(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] })
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMD_Id: number; HRMD_ActiveFlag: boolean; roleId?: number }) =>
            activateDeactivateMasterDepartment(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] })
    });

    const saveOrderMutation = useMutation({
        mutationFn: (departments: DepartmentDetail[]) => saveMasterDepartmentOrder(departments),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DEPARTMENT] });

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
        mutationFn: (payload: MasterDesignationInput) => saveMasterDesignation(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] })
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMDES_Id: number; HRMDES_ActiveFlag: boolean; roleId?: number }) =>
            activateDeactivateMasterDesignation(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] })
    });

    const saveOrderMutation = useMutation({
        mutationFn: (designations: DesignationDetail[]) => saveMasterDesignationOrder(designations),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_DESIGNATION] });

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
        mutationFn: (payload: MasterGradeInput) => saveMasterGrade(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] })
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMG_Id: number; HRMG_ActiveFlag: boolean; roleId?: number }) => activateDeactivateMasterGrade(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] })
    });

    const saveOrderMutation = useMutation({
        mutationFn: (grades: GradeDetail[]) => saveMasterGradeOrder(grades),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GRADE] });

    return { listQuery, saveMutation, toggleMutation, saveOrderMutation, refetchAll };
};

// ============================================================================
// BANK
// ============================================================================

export function useMasterBank(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_BANK, roleId],
        queryFn: async () => getMasterBankList(roleId),
        staleTime: 0
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterBankInput) => saveMasterBank(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_BANK]
            });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (data: {
            HRMBD_Id: number;
            HRMBD_ActiveFlag: boolean;
            MI_Id?: number;
        }) => activateDeactivateMasterBank(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_BANK]
            });
        }
    });

    return {
        listQuery,
        saveMutation,
        toggleMutation
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
        mutationFn: (data: MasterCourseInput) => saveMasterCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (data: { HRMC_Id: number; HRMC_ActiveFlag: boolean; MI_Id?: number }) => activateDeactivateMasterCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_COURSE]
            });
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

    return {
        listQuery,
        saveMutation,
        toggleMutation,
        saveOrderMutation
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
        mutationFn: (payload: MasterEmployeeTypeInput) => saveMasterEmployeeType(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] })
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMET_Id: number; HRMET_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterEmployeeType(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_EMPLOYEE_TYPE] });

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
        mutationFn: (payload: MasterGenderInput) => saveMasterGender(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER] })
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { IVRMMG_Id: number; IVRMMG_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterGender(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_GENDER] });

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
        mutationFn: (data: MasterLoanInput) => saveMasterLoan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN]
            });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { HRMLN_Id: number; HRMLN_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterLoan(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LOAN]
            });
        }
    });

    return {
        listQuery,
        saveMutation,
        toggleMutation
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
        mutationFn: (payload: MasterMaritalStatusInput) => saveMasterMaritalStatus(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] })
    });

    const toggleMutation = useMutation({
        mutationFn: (payload: { IVRMMMS_Id: number; IVRMMMS_ActiveFlag: boolean; MI_Id?: number }) =>
            activateDeactivateMasterMaritalStatus(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] })
    });

    const refetchAll = () => queryClient.invalidateQueries({ queryKey: [HRMS_QUERY_KEYS.MASTER_MARITAL_STATUS] });

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
        mutationFn: (data: MasterGroupTypeInput) => saveMasterGroupType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
            });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (data: {
            HRMGT_Id: number;
            HRMGT_ActiveFlag: boolean;
            MI_Id?: number;
        }) => activateDeactivateMasterGroupType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_GROUP_TYPE]
            });
        }
    });

    const saveOrderMutation = useMutation({
        mutationFn: (groupTypes: GroupTypeDetail[]) => saveMasterGroupTypeOrder(groupTypes),
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

export function useMasterProfessionalTax(roleId: number) {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX, roleId],
        queryFn: async () => getMasterProfessionalTaxList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterProfessionalTaxInput) => saveMasterProfessionalTax(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PROFESSIONAL_TAX]
            });
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

    return {
        listQuery,
        saveMutation,
        toggleMutation
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
        mutationFn: (data: MasterLeaveYearInput) => saveMasterLeaveYear(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (data: {
            HRMLY_Id: number;
            HRMLY_ActiveFlag: boolean;
            MI_Id?: number;
        }) => activateDeactivateMasterLeaveYear(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        }
    });

    const saveOrderMutation = useMutation({
        mutationFn: (leaveYears: LeaveYearDetail[]) => saveMasterLeaveYearOrder(leaveYears),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        }
    });

    return {
        listQuery,
        saveMutation,
        toggleMutation,
        saveOrderMutation
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
        mutationFn: (data: MasterEarningsDeductionsInput) => saveMasterEarningsDeductions(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
            });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (data: {
            HRMED_Id: number;
            HRMED_ActiveFlag: boolean;
            MI_Id?: number;
        }) => activateDeactivateMasterEarningsDeductions(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_EARNINGS_DEDUCTIONS]
            });
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

    return {
        listQuery,
        saveMutation,
        toggleMutation,
        saveOrderMutation
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
        queryFn: async () => getMasterPayrollStandardList(roleId),
        staleTime: 5 * 60 * 1000
    });

    const saveMutation = useMutation({
        mutationFn: (data: MasterPayrollStandardInput) => saveMasterPayrollStandard(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_PAYROLL_STANDARD]
            });
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
        queryFn: () => getReligionCategoryMappingList(0, 2),
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
        queryFn: () => getReligionCategoryMappingList(0, 2),
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
        mutationFn: (data: { IRCC_Id: number; IRCC_ActiveFlg: boolean }) => activateDeactivateReligionCategoryMapping(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Mapping status updated successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
                });
            } else {
                toast.error(response.message || 'Failed to update mapping status');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while updating mapping status');
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
        queryFn: () => getGroupDeptDessgMappingList(0),
        staleTime: 1000 * 60 * 5
    });
}

export function useSaveGroupDeptDessgMapping() {
    const queryClient = useQueryClient();

    return useMutation({
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
}

export function useGroupDeptDessgMappingCRUD() {
    const queryClient = useQueryClient();

    const listQuery = useQuery({
        queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING],
        queryFn: () => getGroupDeptDessgMappingList(0),
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
        mutationFn: (data: { HRGTDDS_Id: number; HRGTDDS_ActiveFlg: boolean }) => activateDeactivateGroupDeptDessgMapping(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Mapping status updated successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.GROUP_DEPT_DESSG_MAPPING]
                });
            } else {
                toast.error(response.message || 'Failed to update mapping status');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while updating mapping status');
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
