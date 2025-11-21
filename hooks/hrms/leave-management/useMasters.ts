'use client';

import { HRMS_MI_ID } from '@/constants/hrms-config';
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { createLocalCrud } from '@/lib/localdb';
import { getMasterLeave, getMasterLeaveDropdowns, getMasterLeaveForEdit, saveMasterLeave as saveMasterLeaveAPI, validateMasterLeaveOrderNumber, deleteMasterLeave as deleteMasterLeaveAPI } from '@/server/hrms/leave-management/masters/master-leave';
import { getLeaveAuthorization, getLeaveAuthorizationDropdowns, getLeaveAuthorizationForEdit, saveLeaveAuthorization as saveLeaveAuthorizationAPI, deleteLeaveAuthorization as deleteLeaveAuthorizationAPI } from '@/server/hrms/leave-management/masters/leave-authorization';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MasterLeave } from '@/app/(root)/hrms/leave-management/masters/master-leave/_components/columns';
import type { LeaveAuthorization } from '@/app/(root)/hrms/leave-management/masters/leave-authorization/_components/columns';
import type { MasterLeaveGetResponseData, MasterLeaveDTOO } from '@/types/hrms/leave-management/master-leave';
import type { LeaveAuthorizationGetResponseData } from '@/types/hrms/leave-management/leave-authorization';

// MasterLeaveYear type - placeholder until actual type is defined
interface MasterLeaveYear {
    id: number;
    createdAt: Date;
    leaveYear: string;
    fromDate: string;
    toDate: string;
    isActive: boolean;
}

/**
 * Map API response data to frontend MasterLeave format
 */
function mapApiDataToMasterLeave(apiData: MasterLeaveGetResponseData | null): MasterLeave | null {
    if (!apiData || !apiData.HRML_Id) {
        return null;
    }

    return {
        id: apiData.HRML_Id,
        createdAt: apiData.CreatedDate ? new Date(apiData.CreatedDate) : new Date(),
        leaveName: apiData.HRML_LeaveName || '',
        leaveCode: apiData.HRML_LeaveCode || '',
        leaveType: apiData.HRML_LeaveType || '',
        leaveApplyCriteria: '', // Not in API response
        daysForApplyCriteria: '', // Not in API response
        maxDaysForApply: '', // Not in API response
        leaveDetails: apiData.HRML_LeaveDetails || '',
        leaveCredit: apiData.HRML_LeaveCreditFlg || false,
        lateDeduct: apiData.HRML_LateDeductFlag || false,
        probationNotApplicable: false, // Not in API response
        leaveOrder: apiData.HRML_LateDeductOrder || 0,
        isActive: true // Default to true, may need to be determined from API
    };
}

/**
 * Map frontend MasterLeave format to API request format
 */
function mapMasterLeaveToApiData(data: MasterLeave | Omit<MasterLeave, 'id' | 'createdAt'>): {
    MI_Id: number;
    HRML_Id: number;
    HRML_LeaveName: string;
    HRML_LeaveCode: string;
    HRML_LeaveDetails: string;
    HRML_LeaveCreditFlg: boolean;
    HRML_LeaveType: string;
    HRML_LateDeductFlag: boolean;
    HRML_LateDeductOrder: number;
} {
    return {
        MI_Id: HRMS_MI_ID,
        HRML_Id: 'id' in data ? data.id : 0,
        HRML_LeaveName: data.leaveName,
        HRML_LeaveCode: data.leaveCode,
        HRML_LeaveDetails: data.leaveDetails || '',
        HRML_LeaveCreditFlg: data.leaveCredit || false,
        HRML_LeaveType: data.leaveType,
        HRML_LateDeductFlag: data.lateDeduct || false,
        HRML_LateDeductOrder: data.leaveOrder || 0
    };
}

/**
 * Hook to fetch master leave dropdown options (leave types, etc.)
 */
export function useMasterLeaveDropdowns() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE, 'dropdowns'],
            queryFn: async () => {
                try {
                    const dropdowns = await getMasterLeaveDropdowns({
                        MI_Id: HRMS_MI_ID
                    });
                    return {
                        success: true,
                        data: dropdowns,
                        message: 'Dropdown data fetched successfully'
                    };
                } catch (error: any) {
                    throw new Error(error?.message || 'Failed to fetch dropdown data');
                }
            },
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
            retry: 1
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE, 'dropdowns']
            });
        }
    };
}

// Master Leave hooks
export function useMasterLeave() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE],
            queryFn: async () => {
                try {
                    // Call API with HRML_Id=0 to get all leaves
                    // The list might be in GridviewDetails or leavelistedit
                    const response = await getMasterLeave({
                        MI_Id: HRMS_MI_ID,
                        HRML_Id: 0
                    });

                    if (!response.success) {
                        throw new Error(response.message || 'Failed to fetch master leave');
                    }

                    // Extract list from response
                    // The API might return list in GridviewDetails, leavelistedit, or as an array
                    let leaveList: MasterLeave[] = [];
                    
                    if (response.data) {
                        // Check if GridviewDetails contains the list
                        if (response.data.GridviewDetails && Array.isArray(response.data.GridviewDetails)) {
                            leaveList = response.data.GridviewDetails
                                .map((item: any) => mapApiDataToMasterLeave(item))
                                .filter((item: MasterLeave | null): item is MasterLeave => item !== null);
                        }
                        // Check if leavelistedit contains the list
                        else if (response.data.leavelistedit && Array.isArray(response.data.leavelistedit)) {
                            leaveList = response.data.leavelistedit
                                .map((item: any) => mapApiDataToMasterLeave(item))
                                .filter((item: MasterLeave | null): item is MasterLeave => item !== null);
                        }
                        // If single record, convert it
                        else if (response.data.HRML_Id > 0) {
                            const mapped = mapApiDataToMasterLeave(response.data);
                            if (mapped) {
                                leaveList = [mapped];
                            }
                        }
                    }

                    return {
                        success: true,
                        data: leaveList,
                        message: response.message || 'Master leave fetched successfully'
                    };
                } catch (error: any) {
                    // Error message from API is already in error.message
                    throw new Error(error?.message || 'Failed to fetch master leave');
                }
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
            });
        }
    };
}

export function useSaveMasterLeave() {
    const queryClient = useQueryClient();

    return useMutation<
        { success: boolean; data: MasterLeave; message: string },
        Error,
        Omit<MasterLeave, 'id' | 'createdAt'>
    >({
        mutationFn: async (data: Omit<MasterLeave, 'id' | 'createdAt'>) => {
            const apiData = mapMasterLeaveToApiData(data);
            const response = await saveMasterLeaveAPI(apiData);

            if (!response.success) {
                throw new Error(response.message || 'Failed to save master leave');
            }

            // Map response back to frontend format
            const mappedData = mapApiDataToMasterLeave(response.data);
            if (!mappedData) {
                throw new Error('Failed to parse saved leave data');
            }

            return {
                success: true,
                data: mappedData,
                message: response.message || 'Master leave saved successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to save master leave');
        }
    });
}

/**
 * Hook to fetch master leave data for editing
 * Uses the Edit endpoint to get fresh data for a specific leave
 */
export function useMasterLeaveForEdit(HRML_Id: number | null) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE, 'edit', HRML_Id],
            queryFn: async () => {
                if (!HRML_Id) {
                    throw new Error('HRML_Id is required');
                }

                try {
                    const response = await getMasterLeaveForEdit(HRML_Id);

                    if (!response.success) {
                        throw new Error(response.message || 'Failed to fetch leave data for editing');
                    }

                    // Map API response to frontend format
                    const mappedData = mapApiDataToMasterLeave(response.data);
                    if (!mappedData) {
                        throw new Error('Failed to parse leave data');
                    }

                    return {
                        success: true,
                        data: mappedData,
                        message: response.message || 'Leave data fetched successfully'
                    };
                } catch (error: any) {
                    throw new Error(error?.message || 'Failed to fetch leave data for editing');
                }
            },
            enabled: !!HRML_Id && HRML_Id > 0,
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE, 'edit']
            });
        }
    };
}

export function useUpdateMasterLeave() {
    const queryClient = useQueryClient();

    return useMutation<
        { success: boolean; data: MasterLeave; message: string },
        Error,
        MasterLeave
    >({
        mutationFn: async (data: MasterLeave) => {
            if (!data.id) {
                throw new Error('ID is required for update');
            }

            const apiData = mapMasterLeaveToApiData(data);
            const response = await saveMasterLeaveAPI(apiData);

            if (!response.success) {
                throw new Error(response.message || 'Failed to update master leave');
            }

            // Map response back to frontend format
            const mappedData = mapApiDataToMasterLeave(response.data);
            if (!mappedData) {
                throw new Error('Failed to parse updated leave data');
            }

            return {
                success: true,
                data: mappedData,
                message: response.message || 'Master leave updated successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to update master leave');
        }
    });
}

/**
 * Hook to validate master leave order number
 * Uses the ValidateOrderNumber endpoint
 */
export function useValidateMasterLeaveOrderNumber() {
    return useMutation<
        { success: boolean; message: string; data: any },
        Error,
        MasterLeaveDTOO[]
    >({
        mutationFn: async (masterLeaveDTOO: MasterLeaveDTOO[]) => {
            try {
                const response = await validateMasterLeaveOrderNumber({
                    MasterLeaveDTOO: masterLeaveDTOO
                });

                if (!response.success) {
                    throw new Error(response.message || 'Order number validation failed');
                }

                return {
                    success: true,
                    message: response.message || 'Order number validated successfully',
                    data: response.data
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to validate order number');
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to validate order number');
        }
    });
}

/**
 * Hook to delete master leave
 * Uses the DeletePages endpoint
 */
export function useDeleteMasterLeave() {
    const queryClient = useQueryClient();

    return useMutation<
        { success: boolean; message: string },
        Error,
        number
    >({
        mutationFn: async (HRML_Id: number) => {
            if (!HRML_Id || HRML_Id <= 0) {
                throw new Error('Valid HRML_Id is required for deletion');
            }

            try {
                const response = await deleteMasterLeaveAPI(HRML_Id);

                if (!response.success) {
                    throw new Error(response.message || 'Failed to delete master leave');
                }

                return {
                    success: true,
                    message: response.message || 'Master leave deleted successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to delete master leave');
            }
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to delete master leave');
        }
    });
}

// Master Leave Year hooks
export function useMasterLeaveYear() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeaveYear>('masterLeaveYear');

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR],
            queryFn: async () => {
                return {
                    success: true,
                    data: db.list(),
                    message: 'Master leave year fetched successfully'
                };
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        }
    };
}

export function useSaveMasterLeaveYear() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeaveYear>('masterLeaveYear');

    return useMutation<
        { success: boolean; data: MasterLeaveYear; message: string },
        Error,
        Omit<MasterLeaveYear, 'id' | 'createdAt'>
    >({
        mutationFn: async (data: Omit<MasterLeaveYear, 'id' | 'createdAt'>) => {
            const newLeaveYear = db.create(data);
            return {
                success: true,
                data: newLeaveYear,
                message: 'Master leave year saved successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save master leave year');
        }
    });
}

export function useUpdateMasterLeaveYear() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeaveYear>('masterLeaveYear');

    return useMutation<
        { success: boolean; data: MasterLeaveYear; message: string },
        Error,
        MasterLeaveYear
    >({
        mutationFn: async (data: MasterLeaveYear) => {
            if (data.id) {
                db.update(data.id, data);
                return {
                    success: true,
                    data,
                    message: 'Master leave year updated successfully'
                };
            }
            throw new Error('ID is required for update');
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update master leave year');
        }
    });
}

/**
 * Map API response data to frontend LeaveAuthorization format
 */
function mapApiDataToLeaveAuthorization(apiData: LeaveAuthorizationGetResponseData | null): LeaveAuthorization | null {
    if (!apiData) {
        return null;
    }

    // Map API fields to frontend format
    // This will be updated once we see the actual API response structure
    const mappedData: LeaveAuthorization & { _HRLA_Id?: number } = {
        id: (apiData as any).HRLAON_Id || (apiData as any).HRMLA_Id || (apiData as any).id || 0,
        createdAt: (apiData as any).CreatedDate ? new Date((apiData as any).CreatedDate) : new Date(),
        institution: (apiData as any).InstitutionName || (apiData as any).institution || '',
        gradeName: (apiData as any).HRMG_GradeName || (apiData as any).gradeName || '',
        groupTypeName: (apiData as any).HRMGT_GroupTypeName || (apiData as any).groupTypeName || '',
        departmentName: (apiData as any).HRMD_DepartmentName || (apiData as any).departmentName || '',
        designationName: (apiData as any).HRMDES_DesignationName || (apiData as any).designationName || '',
        leaveType: (apiData as any).HRML_LeaveName || (apiData as any).leaveType || '',
        orderOfApproval: String((apiData as any).HRMLA_OrderOfApproval || (apiData as any).orderOfApproval || ''),
        approvalPerson: (apiData as any).HRMLA_ApprovalPerson || (apiData as any).approvalPerson || '',
        finalFlag: (apiData as any).HRMLA_FinalFlag || (apiData as any).finalFlag || false
    };
    
    // Store HRLA_Id if available (needed for delete operation)
    if ((apiData as any).HRLA_Id !== undefined) {
        (mappedData as any)._HRLA_Id = (apiData as any).HRLA_Id;
    }
    
    return mappedData;
}

// Leave Authorization hooks
export function useLeaveAuthorization() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION],
            queryFn: async () => {
                try {
                    // Call API with onchangeoronload="" to get all authorizations
                    const response = await getLeaveAuthorization({
                        UserId: 0,
                        MI_Id: HRMS_MI_ID,
                        onchangeoronload: ''
                    });

                    if (!response.success) {
                        throw new Error(response.message || 'Failed to fetch leave authorization');
                    }

                    // Extract list from response
                    // The API might return list in GridviewDetails, leavelistauth, or as an array
                    let authList: LeaveAuthorization[] = [];
                    
                    if (response.data) {
                        // Check if GridviewDetails contains the list
                        if ((response.data as any).GridviewDetails && Array.isArray((response.data as any).GridviewDetails)) {
                            authList = (response.data as any).GridviewDetails
                                .map((item: any) => mapApiDataToLeaveAuthorization(item))
                                .filter((item: LeaveAuthorization | null): item is LeaveAuthorization => item !== null);
                        }
                        // Check if leavelistauth contains the list
                        else if ((response.data as any).leavelistauth && Array.isArray((response.data as any).leavelistauth)) {
                            authList = (response.data as any).leavelistauth
                                .map((item: any) => mapApiDataToLeaveAuthorization(item))
                                .filter((item: LeaveAuthorization | null): item is LeaveAuthorization => item !== null);
                        }
                        // If single record, convert it
                        else if ((response.data as any).HRMLA_Id > 0) {
                            const mapped = mapApiDataToLeaveAuthorization(response.data);
                            if (mapped) {
                                authList = [mapped];
                            }
                        }
                        // Check if data is directly an array
                        else if (Array.isArray(response.data)) {
                            authList = response.data
                                .map((item: any) => mapApiDataToLeaveAuthorization(item))
                                .filter((item: LeaveAuthorization | null): item is LeaveAuthorization => item !== null);
                        }
                    }

                    return {
                        success: true,
                        data: authList,
                        message: response.message || 'Leave authorization fetched successfully'
                    };
                } catch (error: any) {
                    throw new Error(error?.message || 'Failed to fetch leave authorization');
                }
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION]
            });
        }
    };
}

/**
 * Hook to fetch leave authorization dropdown options
 */
export function useLeaveAuthorizationDropdowns() {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION, 'dropdowns'],
            queryFn: async () => {
                try {
                    const dropdowns = await getLeaveAuthorizationDropdowns({
                        MI_Id: HRMS_MI_ID,
                        UserId: 0
                    });
                    return {
                        success: true,
                        data: dropdowns,
                        message: 'Dropdown data fetched successfully'
                    };
                } catch (error: any) {
                    throw new Error(error?.message || 'Failed to fetch dropdown data');
                }
            },
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
            retry: 1
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION, 'dropdowns']
            });
        }
    };
}

/**
 * Hook to fetch a single leave authorization record for editing
 * @param HRLAON_Id - Leave authorization ID
 */
export function useLeaveAuthorizationForEdit(HRLAON_Id: number | null) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION, 'edit', HRLAON_Id],
        queryFn: async () => {
            if (!HRLAON_Id) {
                throw new Error('HRLAON_Id is required');
            }

            try {
                const response = await getLeaveAuthorizationForEdit(HRLAON_Id);
                
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch leave authorization data');
                }

                // Map API response to frontend format
                const mappedData = mapApiDataToLeaveAuthorization(response.data);
                if (!mappedData) {
                    throw new Error('Failed to parse leave authorization data');
                }

                return {
                    success: true,
                    data: mappedData,
                    message: response.message || 'Leave authorization fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch leave authorization data');
            }
        },
        enabled: !!HRLAON_Id && HRLAON_Id > 0,
        retry: 1
    });
}

/**
 * Map frontend LeaveAuthorization format to API request format
 */
function mapLeaveAuthorizationToApiData(
    data: LeaveAuthorization | Omit<LeaveAuthorization, 'id' | 'createdAt'>,
    dropdownData: any
): {
    MI_Id: number;
    HRMG_Id: number;
    HRMGT_Id: number;
    HRMD_Id: number;
    HRMDES_Id: number;
    HRML_Id: number;
    UserId: number;
    approvaluser_array: Array<{
        Approval_HRME_Id: number;
        ApprovalLevelNo: number;
        ApprovalFinalFlag: boolean;
    }>;
} {
    // Find IDs from dropdown options based on names
    const gradeId = dropdownData?.grades?.find((g: any) => g.label === data.gradeName || g.value === data.gradeName)?.value || 0;
    const groupTypeId = dropdownData?.groupTypes?.find((g: any) => g.label === data.groupTypeName || g.value === data.groupTypeName)?.value || 0;
    const departmentId = dropdownData?.departments?.find((d: any) => d.label === data.departmentName || d.value === data.departmentName)?.value || 0;
    const designationId = dropdownData?.designations?.find((d: any) => d.label === data.designationName || d.value === data.designationName)?.value || 0;
    const leaveTypeId = dropdownData?.leaveTypes?.find((l: any) => l.label === data.leaveType || l.value === data.leaveType)?.value || 0;
    const approvalPersonId = dropdownData?.approvalPersons?.find((a: any) => a.label === data.approvalPerson || a.value === data.approvalPerson)?.value || 0;

    return {
        MI_Id: HRMS_MI_ID,
        HRMG_Id: Number(gradeId),
        HRMGT_Id: Number(groupTypeId),
        HRMD_Id: Number(departmentId),
        HRMDES_Id: Number(designationId),
        HRML_Id: Number(leaveTypeId),
        UserId: 0,
        approvaluser_array: [
            {
                Approval_HRME_Id: Number(approvalPersonId),
                ApprovalLevelNo: Number(data.orderOfApproval) || 0,
                ApprovalFinalFlag: data.finalFlag || false
            }
        ]
    };
}

export function useSaveLeaveAuthorization() {
    const queryClient = useQueryClient();
    const { data: dropdownData } = useLeaveAuthorizationDropdowns();

    return useMutation<
        { success: boolean; data: LeaveAuthorization; message: string },
        Error,
        Omit<LeaveAuthorization, 'id' | 'createdAt'>
    >({
        mutationFn: async (data: Omit<LeaveAuthorization, 'id' | 'createdAt'>) => {
            if (!dropdownData?.data) {
                throw new Error('Dropdown data not loaded. Please wait...');
            }

            const apiData = mapLeaveAuthorizationToApiData(data, dropdownData.data);
            const response = await saveLeaveAuthorizationAPI(apiData);

            if (!response.success) {
                throw new Error(response.message || 'Failed to save leave authorization');
            }

            // Map response back to frontend format
            const mappedData = mapApiDataToLeaveAuthorization(response.data);
            if (!mappedData) {
                throw new Error('Failed to parse saved authorization data');
            }

            return {
                success: true,
                data: mappedData,
                message: response.message || 'Leave authorization saved successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to save leave authorization');
        }
    });
}

export function useUpdateLeaveAuthorization() {
    const queryClient = useQueryClient();
    const { data: dropdownData } = useLeaveAuthorizationDropdowns();

    return useMutation<
        { success: boolean; data: LeaveAuthorization; message: string },
        Error,
        LeaveAuthorization
    >({
        mutationFn: async (data: LeaveAuthorization) => {
            if (!data.id) {
                throw new Error('ID is required for update');
            }

            if (!dropdownData?.data) {
                throw new Error('Dropdown data not loaded. Please wait...');
            }

            const apiData = mapLeaveAuthorizationToApiData(data, dropdownData.data);
            const response = await saveLeaveAuthorizationAPI(apiData);

            if (!response.success) {
                throw new Error(response.message || 'Failed to update leave authorization');
            }

            // Map response back to frontend format
            const mappedData = mapApiDataToLeaveAuthorization(response.data);
            if (!mappedData) {
                throw new Error('Failed to parse updated authorization data');
            }

            return {
                success: true,
                data: mappedData,
                message: response.message || 'Leave authorization updated successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to update leave authorization');
        }
    });
}

/**
 * Hook to delete a leave authorization
 */
export function useDeleteLeaveAuthorization() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: { HRLA_Id: number; HRLAON_Id: number }) => {
            try {
                const response = await deleteLeaveAuthorizationAPI(request);
                
                if (!response.success) {
                    throw new Error(response.message || 'Failed to delete leave authorization');
                }

                return {
                    success: true,
                    message: response.message || 'Leave authorization deleted successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to delete leave authorization');
            }
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATION]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to delete leave authorization');
        }
    });
}

