'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import {
    getEmployeeRegisterOnload,
    getEmployeeById,
    savePersonalDetails,
    saveQualification,
    saveExperienceDetails,
    saveDocumentDetails,
    saveMedicalDetails,
    saveOtherDetails,
    saveEarningDetails,
    saveDeductionDetails,
    saveArrearDetails,
    activateDeactivateEmployee,
    getEmployeeSalaryDetails
} from '@/server/hrms/hrmsConfig/employee/register';
import type {
    SavePersonalDetailsRequest,
    SaveQualificationRequest,
    SaveExperienceDetailsRequest,
    SaveDocumentDetailsRequest,
    SaveMedicalDetailsRequest,
    SaveOtherDetailsRequest,
    SaveEarningDetailsRequest,
    SaveDeductionDetailsRequest,
    SaveArrearDetailsRequest,
    GetEmployeeSalaryDetailsRequest
} from '@/types/hrms/employee-register';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch employee register onload data (dropdowns)
 */
export function useEmployeeRegisterOnload() {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD],
        queryFn: () =>
            getEmployeeRegisterOnload({
                MI_Id: HRMS_MI_ID,
                LogInUserId: 2 // TODO: Get from auth context
            }).then((res) => {
                if (!res.success) {
                    throw new Error(res.message || 'Failed to load employee data');
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

/**
 * Hook to fetch employee list from onload
 */
export function useEmployeeRegisterList() {
    const { data, isLoading, error } = useEmployeeRegisterOnload();
    
    // Extract employee list from onload response
    const employeeList = data?.employeedetailList || [];
    
    return {
        data: employeeList,
        isLoading,
        error
    };
}

/**
 * Hook to fetch employee by ID
 */
export function useEmployeeRegisterById(id: number | null) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, id],
        queryFn: () => {
            console.log('🔍 [EDIT] Fetching employee ID:', id);
            return getEmployeeById(id!).then((res) => {
                if (!res.success) {
                    throw new Error(res.message || 'Failed to fetch employee details');
                }
                console.log('🔍 [EDIT] Employee loaded:', res.data?.HRME_EmployeeCode, res.data?.HRME_EmployeeFirstName);
                return res.data;
            });
        },
        enabled: !!id && id > 0,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

/**
 * Hook to save employee personal details
 */
export function useSaveEmployeePersonalDetails() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SavePersonalDetailsRequest) => {
            console.log('🔍 [OTHER DETAILS SAVE] Browser - Starting save:', {
                employeeId: data.HRME_Id || 'N/A',
                otherDetailsFields: {
                    biometricCode: data.HRME_BiometricCode || 'N/A',
                    rfCardId: data.HRME_RFCardId || 'N/A',
                    punchRelaxation: data.HRME_ExcPunch || false,
                    stopPension: data.HRME_RetiredFlg || false,
                    dateOfStopPension: data.HRME_PensionStoppedDate || 'N/A',
                    msTeamsUserName: data.HRME_MSTeamsUserId || 'N/A',
                    msTeamsPassword: data.HRME_MSTeamsPassword ? '***' : 'N/A',
                    employeeLeft: data.HRME_LeftFlag || false,
                    lastWorkingDay: data.HRME_DOL || 'N/A',
                    reasonForLeaving: data.HRME_LeavingReason || 'N/A'
                },
                payloadKeys: Object.keys(data)
            });
            return savePersonalDetails(data);
        },
        onSuccess: (response) => {
            console.log('🔍 [OTHER DETAILS SAVE] Browser - Success:', {
                success: (response as any)?.success || typeof response === 'object',
                message: (response as any)?.message || 'No message',
                data: (response as any)?.data
            });
            
            const responseData = (response as any)?.data;
            const responseMessage = (response as any)?.message;
            
            // Check for duplicate
            if (responseData === 'Duplicate' || responseMessage === 'Duplicate') {
                return;
            }
            
            // Invalidate queries for Add/Update/Success
            if (responseData === 'Add' || responseMessage === 'Add' || 
                responseData === 'Update' || responseMessage === 'Update' || 
                response.success) {
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            }
        },
        onError: (error: Error) => {
            console.error('🔍 [OTHER DETAILS SAVE] Browser - Error:', {
                message: error.message,
                stack: error.stack,
                error: error
            });
            toast.error(error.message || 'An error occurred while saving personal details');
        }
    });
}

// Note: Address details are saved together with Personal Details via savePersonalDetails

/**
 * Hook to save employee qualification details
 */
export function useSaveEmployeeQualification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SaveQualificationRequest[]) => saveQualification(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Qualification saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                toast.error(response.message || 'Failed to save qualification');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving qualification');
        }
    });
}

/**
 * Hook to save employee experience details
 */
export function useSaveEmployeeExperience() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SaveExperienceDetailsRequest[]) => saveExperienceDetails(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Experience saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                toast.error(response.message || 'Failed to save experience');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving experience');
        }
    });
}

/**
 * Hook to save employee document details
 */
export function useSaveEmployeeDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SaveDocumentDetailsRequest[]) => saveDocumentDetails(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Document saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                toast.error(response.message || 'Failed to save document');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving document');
        }
    });
}

/**
 * Hook to save employee medical details
 */
export function useSaveEmployeeMedical() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SaveMedicalDetailsRequest) => {
            console.log('🔍 [MEDICAL SAVE] Browser - Starting save:', {
                employeeId: data.HRME_Id || 'N/A',
                medicalFields: {
                    height: data.HRME_Height || 'N/A',
                    heightUnit: data.HRME_HeightUOM || 'N/A',
                    weight: data.HRME_Weight || 'N/A',
                    weightUnit: data.HRME_WeightUOM || 'N/A',
                    eyeSightIssue: data.HRME_EyeSightIssue || 'N/A',
                    anyHealthIssue: data.HRME_AnyHealthIssue || 'N/A',
                    identificationMark: data.HRME_IdentificationMark || 'N/A'
                },
                payloadKeys: Object.keys(data)
            });
            return saveMedicalDetails(data);
        },
        onSuccess: (response) => {
            console.log('🔍 [MEDICAL SAVE] Browser - Success:', {
                success: response.success,
                message: response.message,
                data: response.data
            });
            
            if (response.success) {
                toast.success(response.message || 'Medical details saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                console.error('🔍 [MEDICAL SAVE] Browser - Failed:', response.message);
                toast.error(response.message || 'Failed to save medical details');
            }
        },
        onError: (error: Error) => {
            console.error('🔍 [MEDICAL SAVE] Browser - Error:', {
                message: error.message,
                stack: error.stack,
                error: error
            });
            toast.error(error.message || 'An error occurred while saving medical details');
        }
    });
}

/**
 * Hook to save employee other details
 */
export function useSaveEmployeeOther() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SaveOtherDetailsRequest) => saveOtherDetails(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Other details saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                toast.error(response.message || 'Failed to save other details');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving other details');
        }
    });
}

/**
 * Hook to save employee earning details
 */
export function useSaveEmployeeEarning() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SaveEarningDetailsRequest[]) => {
            console.log('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeEarning called', {
                dataCount: data.length,
                data: data.map((item) => ({
                    HREED_Id: item.HREED_Id,
                    HRME_Id: item.HRME_Id,
                    HRMED_Name: item.HRMED_Name,
                    HREED_Amount: item.HREED_Amount,
                    HREED_Percentage: item.HREED_Percentage
                }))
            });
            return saveEarningDetails(data);
        },
        onSuccess: (response) => {
            console.log('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeEarning success', {
                success: response.success,
                message: response.message,
                data: response.data
            });
            if (response.success) {
                toast.success(response.message || 'Earning details saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                toast.error(response.message || 'Failed to save earning details');
            }
        },
        onError: (error: Error) => {
            console.error('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeEarning error', {
                message: error.message,
                error
            });
            toast.error(error.message || 'An error occurred while saving earning details');
        }
    });
}

/**
 * Hook to save employee deduction details
 */
export function useSaveEmployeeDeduction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SaveDeductionDetailsRequest[]) => {
            console.log('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeDeduction called', {
                dataCount: data.length,
                data: data.map((item) => ({
                    HREED_Id: item.HREED_Id,
                    HRME_Id: item.HRME_Id,
                    HRMED_Name: item.HRMED_Name,
                    HREED_Amount: item.HREED_Amount,
                    HREED_Percentage: item.HREED_Percentage
                }))
            });
            return saveDeductionDetails(data);
        },
        onSuccess: (response) => {
            console.log('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeDeduction success', {
                success: response.success,
                message: response.message,
                data: response.data
            });
            if (response.success) {
                toast.success(response.message || 'Deduction details saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                toast.error(response.message || 'Failed to save deduction details');
            }
        },
        onError: (error: Error) => {
            console.error('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeDeduction error', {
                message: error.message,
                error
            });
            toast.error(error.message || 'An error occurred while saving deduction details');
        }
    });
}

/**
 * Hook to save employee arrear details
 */
export function useSaveEmployeeArrear() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SaveArrearDetailsRequest[]) => {
            console.log('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeArrear called', {
                dataCount: data.length,
                data: data.map((item) => ({
                    HREED_Id: item.HREED_Id,
                    HRME_Id: item.HRME_Id,
                    HRMED_Name: item.HRMED_Name,
                    HREED_Amount: item.HREED_Amount,
                    HREED_Percentage: item.HREED_Percentage
                }))
            });
            return saveArrearDetails(data);
        },
        onSuccess: (response) => {
            console.log('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeArrear success', {
                success: response.success,
                message: response.message,
                data: response.data
            });
            if (response.success) {
                toast.success(response.message || 'Arrear details saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                toast.error(response.message || 'Failed to save arrear details');
            }
        },
        onError: (error: Error) => {
            console.error('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeArrear error', {
                message: error.message,
                error
            });
            toast.error(error.message || 'An error occurred while saving arrear details');
        }
    });
}

/**
 * Hook to activate/deactivate employee
 */
export function useToggleEmployeeRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ employeeId, activeFlag }: { employeeId: number; activeFlag: boolean }) =>
            activateDeactivateEmployee({
                HRME_Id: employeeId,
                HRME_ActiveFlag: activeFlag,
                MI_Id: HRMS_MI_ID
            }),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Employee status updated successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                toast.error(response.message || 'Failed to update employee status');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while updating employee status');
        }
    });
}

/**
 * Hook to fetch employee salary/payroll details
 */
export function useEmployeeSalaryDetails(employeeId: number | null, employeeCode: string, hrmdId: number = 0) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'salary', employeeId],
        queryFn: () => {
            if (!employeeId || !employeeCode) {
                return Promise.resolve([]);
            }
            return getEmployeeSalaryDetails({
                MI_Id: HRMS_MI_ID,
                HRME_Id: employeeId,
                HRMED_Id: hrmdId,
                HRME_EmployeeCode: employeeCode
            }).then((res) => {
                if (!res.success) {
                    throw new Error(res.message || 'Failed to load payroll details');
                }
                return res.data || [];
            });
        },
        enabled: !!employeeId && !!employeeCode && employeeId > 0,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

