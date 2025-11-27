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
    saveBankDetails,
    saveEarningDetails,
    saveDeductionDetails,
    saveArrearDetails,
    activateDeactivateEmployee,
    getEmployeeSalaryDetails,
    getStatesByCountryId,
    calculateSalary
} from '@/server/hrms/hrmsConfig/employee/register';
import type {
    SavePersonalDetailsRequest,
    SaveQualificationRequest,
    SaveExperienceDetailsRequest,
    SaveDocumentDetailsRequest,
    SaveMedicalDetailsRequest,
    SaveOtherDetailsRequest,
    SaveBankDetailsRequest,
    SaveEarningDetailsRequest,
    SaveDeductionDetailsRequest,
    SaveArrearDetailsRequest,
    GetEmployeeSalaryDetailsRequest,
    SalaryCalculationRequest,
    SalaryCalculationResponse
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
            console.log('🟣 [HOOK] useSaveEmployeePersonalDetails mutationFn called');
            console.log('🟣 [HOOK] Payload HRME_Id:', data.HRME_Id);
            console.log('🟣 [HOOK] Payload MI_Id:', data.MI_Id);
            console.log('🟣 [HOOK] Payload Employee Name:', `${data.HRME_EmployeeFirstName} ${data.HRME_EmployeeLastName}`);
            console.log('🟣 [HOOK] Payload Employee Code:', data.HRME_EmployeeCode);
            console.log('🟣 [HOOK] Payload Keys:', Object.keys(data));
            
            // Create sanitized payload for logging (exclude large image data)
            const sanitizedData = { ...data };
            let photoSize = 0;
            let photoFormat = 'N/A';
            
            if (data.HRME_Photo) {
                photoSize = data.HRME_Photo.length;
                // Handle both base64 strings and data URLs (data:image/jpeg;base64,...)
                if (data.HRME_Photo.startsWith('data:')) {
                    const base64Part = data.HRME_Photo.split(',')[1] || '';
                    photoSize = base64Part.length;
                    const mimeMatch = data.HRME_Photo.match(/data:([^;]+)/);
                    photoFormat = mimeMatch ? mimeMatch[1] : 'image';
                    sanitizedData.HRME_Photo = `[DATA_URL_IMAGE - ${photoFormat} - ${(photoSize / 1024).toFixed(2)}KB - TRUNCATED FOR LOGGING]`;
                } else {
                    photoFormat = 'base64';
                    sanitizedData.HRME_Photo = `[BASE64_IMAGE_DATA - ${(photoSize / 1024).toFixed(2)}KB - TRUNCATED FOR LOGGING]`;
                }
            }
            console.log('🟣 [HOOK] Full Payload (Image Data Excluded):', JSON.stringify(sanitizedData, null, 2));
            console.log('🟣 [HOOK] Photo Info:', {
                present: !!data.HRME_Photo,
                format: photoFormat,
                size: photoSize > 0 ? `${(photoSize / 1024).toFixed(2)}KB` : 'N/A'
            });
            console.log('🟣 [HOOK] Calling savePersonalDetails server function...');
            
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
            console.log('🟣 [HOOK] useSaveEmployeePersonalDetails onSuccess called');
            console.log('🟣 [HOOK] Response Type:', typeof response);
            console.log('🟣 [HOOK] Response:', JSON.stringify(response, null, 2));
            console.log('🟣 [HOOK] Response.success:', (response as any)?.success);
            console.log('🟣 [HOOK] Response.message:', (response as any)?.message);
            console.log('🟣 [HOOK] Response.data:', (response as any)?.data);
            
            console.log('🔍 [OTHER DETAILS SAVE] Browser - Success:', {
                success: (response as any)?.success || typeof response === 'object',
                message: (response as any)?.message || 'No message',
                data: (response as any)?.data
            });
            
            const responseData = (response as any)?.data;
            const responseMessage = (response as any)?.message;
            
            console.log('🟣 [HOOK] Extracted responseData:', responseData);
            console.log('🟣 [HOOK] Extracted responseMessage:', responseMessage);
            
            // Check for duplicate
            if (responseData === 'Duplicate' || responseMessage === 'Duplicate') {
                console.log('🟣 [HOOK] Duplicate detected, not invalidating queries');
                return;
            }
            
            // Invalidate queries for Add/Update/Success
            if (responseData === 'Add' || responseMessage === 'Add' || 
                responseData === 'Update' || responseMessage === 'Update' || 
                (response as any)?.success) {
                console.log('🟣 [HOOK] Success detected, invalidating queries');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            }
        },
        onError: (error: any) => {
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('🔴 [HOOK] useSaveEmployeePersonalDetails onError called');
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('🔴 [HOOK] Error Type:', typeof error);
            console.log('🔴 [HOOK] Error Message:', error?.message);
            console.log('🔴 [HOOK] Error Stack:', error?.stack);
            console.log('🔴 [HOOK] Full Error:', error);
            console.log('🔴 [HOOK] Error Response Data:', error?.response?.data);
            
            // Extract error message from API response
            let errorMessage = 'An error occurred while saving personal details';
            
            // Check if error has response data with message
            if (error?.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object' && errorData !== null) {
                    // Check for message in error response
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            console.error('🔍 [OTHER DETAILS SAVE] Browser - Error:', {
                message: errorMessage,
                originalError: error
            });
            // Component will handle error display with proper message extraction
            // Update error message for better error handling in component
            if (error && typeof error === 'object') {
                error.message = errorMessage;
            }
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
 * Hook to save employee bank details
 */
export function useSaveEmployeeBankDetails() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SaveBankDetailsRequest) => {
            console.log('🔍 [BANK SAVE] Browser - Starting save:', {
                employeeId: data.HRME_Id || 'N/A',
                miId: data.MI_Id || 'N/A',
                bankCount: data.BankDetails?.length || 0,
                banks: data.BankDetails?.map((bank, index) => ({
                    index: index + 1,
                    bankId: bank.HRMBD_Id || 'N/A',
                    accountNo: bank.HRMEB_AccountNo || 'N/A',
                    activeFlag: bank.HRMEB_ActiveFlag || 'N/A'
                })) || []
            });
            return saveBankDetails(data);
        },
        onSuccess: (response) => {
            console.log('🔍 [BANK SAVE] Browser - Success:', {
                success: response.success,
                message: response.message,
                data: response.data
            });
            
            if (response.success) {
                toast.success(response.message || 'Bank details saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD]
                });
            } else {
                toast.error(response.message || 'Failed to save bank details');
            }
        },
        onError: (error: any) => {
            console.error('🔍 [BANK SAVE] Browser - Error:', error);
            const errorMsg = error?.response?.data?.message || error?.message || 'Failed to save bank details';
            toast.error(errorMsg);
        }
    });
}

/**
 * Hook to calculate salary
 */
export function useCalculateSalary() {
    return useMutation({
        mutationFn: (data: SalaryCalculationRequest) => {
            console.log('🔍 [SALARY CALC] Browser - Starting calculation:', {
                miId: data.MI_Id || 'N/A',
                amount: data.HRMEID_Amount || 0
            });
            return calculateSalary(data);
        },
        onSuccess: (response) => {
            console.log('🔍 [SALARY CALC] Browser - Success:', {
                success: response.success,
                message: response.message,
                data: response.data
            });
        },
        onError: (error: Error) => {
            // Don't show toast for 404 errors - we'll use fallback calculation
            const errorMessage = error.message || 'An error occurred while calculating salary';
            if (!errorMessage.includes('404')) {
                console.warn('🔍 [SALARY CALC] Browser - Error (non-critical):', {
                    message: errorMessage,
                    error: error
                });
            }
            // Don't show toast - let the component handle fallback silently
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
        mutationFn: (data: SaveEarningDetailsRequest) => {
            console.log('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeEarning called', {
                employeeId: data.Employee.HRME_Id,
                miId: data.Employee.MI_Id,
                earningsCount: data.EmployeeEarningDeductionArrear.length,
                data: data.EmployeeEarningDeductionArrear.map((item) => ({
                    HREED_Id: item.HREED_Id,
                    HRMED_Id: item.HRMED_Id,
                    HREED_Amount: item.HREED_Amount,
                    HREED_Percentage: item.HREED_Percentage,
                    HREED_ActiveFlag: item.HREED_ActiveFlag
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
        mutationFn: (data: SaveDeductionDetailsRequest) => {
            console.log('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeDeduction called', {
                employeeId: data.Employee.HRME_Id,
                miId: data.Employee.MI_Id,
                deductionsCount: data.EmployeeEarningDeductionArrear.length,
                data: data.EmployeeEarningDeductionArrear.map((item) => ({
                    HREED_Id: item.HREED_Id,
                    HRMED_Id: item.HRMED_Id,
                    HREED_Amount: item.HREED_Amount,
                    HREED_Percentage: item.HREED_Percentage,
                    HREED_ActiveFlag: item.HREED_ActiveFlag
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
        mutationFn: (data: SaveArrearDetailsRequest) => {
            console.log('🔍 [PAYROLL SAVE] Browser - useSaveEmployeeArrear called', {
                employeeId: data.Employee.HRME_Id,
                miId: data.Employee.MI_Id,
                arrearsCount: data.EmployeeEarningDeductionArrear.length,
                data: data.EmployeeEarningDeductionArrear.map((item) => ({
                    HREED_Id: item.HREED_Id,
                    HRMED_Id: item.HRMED_Id,
                    HREED_Amount: item.HREED_Amount,
                    HREED_Percentage: item.HREED_Percentage,
                    HREED_ActiveFlag: item.HREED_ActiveFlag
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

/**
 * Hook to fetch states by country ID
 */
export function useStatesByCountryId(countryId: number | null | undefined) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'states', countryId],
        queryFn: () => {
            if (!countryId || countryId === 0) {
                return Promise.resolve([]);
            }
            return getStatesByCountryId(countryId).then((res) => {
                if (!res.success) {
                    throw new Error(res.message || 'Failed to load states');
                }
                return Array.isArray(res.data?.AllState) ? res.data.AllState : [];
            });
        },
        enabled: !!countryId && countryId > 0,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

