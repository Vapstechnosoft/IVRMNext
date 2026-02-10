import {
    deleteLeaveById,
    getEmployeeOnDutyDetails,
    getEmployeeOnDutyLeaveApply,
    getLeaveDetailsById,
    saveOnDutyLeaveRequest,
    viewOnDutyLeaveDetailsById
} from '@/server/hrms/leave-management/transaction/admin-on-duty-apply';
import type { ApiSearchparams } from '@/types';
import type {
    AdminOnDutyApply,
    AdminOnDutyApplyApiData,
    EmployeeDetails,
    EmployeeOnDutyDetailsResponse,
    OnDutyLeaveSaveRequest
} from '@/types/hrms/leave-management/admin-on-duty-apply';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const ADMIN_ON_DUTY_APPLY_KEYS = {
    LIST: 'admin-on-duty-apply-list',
    EMPLOYEE_DETAILS: 'admin-on-duty-employee-details',
    LEAVE_DETAILS: 'admin-on-duty-leave-details',
    VIEW_DETAILS: 'admin-on-duty-view-details'
};

function mapApiDataToAdminOnDutyApply(
    apiData: AdminOnDutyApplyApiData
): AdminOnDutyApply {
    return {
        id: apiData.hrelaP_Id,
        employeeName: apiData.hrmE_EmployeeFirstName,
        leaveName: apiData.hrmL_LeaveName,
        leaveCode: apiData.hrmL_LeaveCode,
        fromDate: new Date(apiData.hrelaP_FromDate),
        toDate: new Date(apiData.hrelaP_ToDate),
        totalDays: apiData.hreltD_TotDays,
        status: apiData.hrelaP_ApplicationStatus,
        leaveReason: apiData.hrelaP_LeaveReason,
        inTime: apiData.hrelapD_InTime,
        outTime: apiData.hrelapD_OutTime,
        leaveId: apiData.hrmL_Id,
        employeeId: apiData.hrmE_Id
    };
}

function mapApiEmployeeToEmployeeDetails(
    apiData: EmployeeOnDutyDetailsResponse['employeeDetails']
): EmployeeDetails {
    return {
        id: apiData.hrmE_Id,
        name: apiData.employeeName,
        designation: apiData.hrmdeS_DesignationName,
        doj: new Date(apiData.hrmE_DOJ),
        photo: apiData.hrmE_Photo,
        email: apiData.emailId || apiData.hrmeM_EmailId,
        mobile: String(apiData.mobileNo || apiData.hrmemnO_MobileNo),
        loginTime: apiData.foesT_IHalfLoginTime,
        logoutTime: apiData.foesT_IIHalfLogoutTime
    };
}

export interface AdminOnDutyApplyListParams {
    page?: number;
    pageSize?: number;
    searchQuery?: string;
    searchColumn?: string;
    sortColumn?: string;
    sortDirection?: string;
    isExport?: boolean;
}

export function useAdminOnDutyApplyList(params: AdminOnDutyApplyListParams | ApiSearchparams = {}) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMIN_ON_DUTY_APPLY_KEYS.LIST, params],
            queryFn: async () => {
                const response = await getEmployeeOnDutyLeaveApply({
                    page: (params as any).page,
                    page_size: (params as any).pageSize ?? (params as any).page_size,
                    search_query: (params as any).searchQuery ?? (params as any).search_query,
                    search_column: (params as any).searchColumn ?? (params as any).search_column,
                    sort_column: (params as any).sortColumn ?? (params as any).sort_column,
                    sort_direction: (params as any).sortDirection ?? (params as any).sort_direction
                });
                if (!response.success) {
                    throw new Error(response.message);
                }
                const data = (response.data || []).map(mapApiDataToAdminOnDutyApply);
                return {
                    success: true,
                    data,
                    message: response.message,
                    total: response.total || data.length,
                    page: response.page || 1,
                    page_size: response.page_size || 10
                };
            },
            placeholderData: (previousData) => previousData
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [ADMIN_ON_DUTY_APPLY_KEYS.LIST]
            })
    };
}

export function useEmployeeOnDutyDetails(employeeId: number | null) {
    return useQuery({
        queryKey: [ADMIN_ON_DUTY_APPLY_KEYS.EMPLOYEE_DETAILS, employeeId],
        queryFn: async () => {
            if (!employeeId) return null;
            const response = await getEmployeeOnDutyDetails(employeeId);
            if (!response.success) {
                throw new Error(response.message);
            }
            const data = response.data;
            if (!data) return null;

            return {
                leaveDetails: (data.leaveDetails || []).map(mapApiDataToAdminOnDutyApply),
                employeeDetails: mapApiEmployeeToEmployeeDetails(data.employeeDetails)
            };
        },
        enabled: !!employeeId
    });
}

export function useSaveOnDutyLeaveRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: OnDutyLeaveSaveRequest) => {
            const response = await saveOnDutyLeaveRequest(data);
            if (!response.success) {
                throw new Error(response.message);
            }
            return response;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: [ADMIN_ON_DUTY_APPLY_KEYS.LIST] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });
}

export function useLeaveDetailsById(leaveId: number | null) {
    return useQuery({
        queryKey: [ADMIN_ON_DUTY_APPLY_KEYS.LEAVE_DETAILS, leaveId],
        queryFn: async () => {
            if (!leaveId) return null;
            const response = await getLeaveDetailsById(leaveId);
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        },
        enabled: !!leaveId
    });
}

export function useDeleteLeaveById() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (leaveId: number) => {
            const response = await deleteLeaveById(leaveId);
            if (!response.success) {
                throw new Error(response.message);
            }
            return response;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: [ADMIN_ON_DUTY_APPLY_KEYS.LIST] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });
}

export function useViewOnDutyLeaveDetailsById(leaveId: number | null) {
    return useQuery({
        queryKey: [ADMIN_ON_DUTY_APPLY_KEYS.VIEW_DETAILS, leaveId],
        queryFn: async () => {
            if (!leaveId) return null;
            const response = await viewOnDutyLeaveDetailsById(leaveId);
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        },
        enabled: !!leaveId
    });
}
