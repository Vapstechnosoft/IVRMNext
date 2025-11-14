'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { addOrUpdateEmployeeMissingLog, deleteEmployeeMissingLog, getEmployeeMissingLogs } from '@/server/hrms/attendance-management/masters/employee-missing-logs';
import { addOrUpdateEmployeeShiftMapping, deleteEmployeeShiftMapping, getEmployeeShiftMapping } from '@/server/hrms/attendance-management/masters/employee-shift-mapping';
import { addOrUpdateMasterDriverShift, deleteMasterDriverShift, getMasterDriverShift } from '@/server/hrms/attendance-management/masters/master-driver-shift';
import { addOrUpdateMasterHoliday, deleteMasterHoliday, getMasterHoliday } from '@/server/hrms/attendance-management/masters/master-holiday';
import { addOrUpdateMasterShift, deleteMasterShift, getMasterShift } from '@/server/hrms/attendance-management/masters/master-shift';
import { addOrUpdateShiftSettingMaster, deleteShiftSettingMaster, getShiftSettingMaster } from '@/server/hrms/attendance-management/masters/shift-setting-master';
import type { ApiSearchparams } from '@/types';
import type { MasterHolidayGetDataResponseData } from '@/types/hrms/attendance-management/master-holiday';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useMasterShift = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_SHIFT],
            queryFn: async () => getMasterShift(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_SHIFT]
            });
        }
    };
};

export const useSaveMasterShift = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Parameters<typeof addOrUpdateMasterShift>[0]) => addOrUpdateMasterShift(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_SHIFT]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save master shift');
        }
    });
};

export const useDeleteMasterShift = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMasterShift(id),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_SHIFT]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete master shift');
        }
    });
};

export const useMasterHoliday = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const queryResult = useQuery({
        queryKey: [HRMS_QUERY_KEYS.MASTER_HOLIDAY, searchParams ?? {}],
        queryFn: async () => {
            console.log('🔄 [HOOK] useMasterHoliday queryFn called');
            console.log('📤 [HOOK] Fetching with searchParams:', searchParams);
            const result = await getMasterHoliday(searchParams);
            console.log('📥 [HOOK] Query result received:', {
                hasResult: !!result,
                hasData: !!result?.data,
                reportListLength: (result?.data as unknown as MasterHolidayGetDataResponseData)?.report_list?.length || 0,
                total: result?.total,
                success: result?.success
            });
            return result;
        },
        staleTime: 0
    });

    return {
        ...queryResult,
        refetchAll: () => {
            console.log('🔄 [HOOK] refetchAll called');
            console.log('🔑 [HOOK] Invalidating query key:', HRMS_QUERY_KEYS.MASTER_HOLIDAY);
            const result = queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_HOLIDAY]
            });
            console.log('✅ [HOOK] Query invalidation promise returned');
            result.then(() => {
                console.log('✅ [HOOK] Query invalidation completed, queries should refetch');
            }).catch((error) => {
                console.error('❌ [HOOK] Query invalidation error:', error);
            });
            return result;
        }
    };
};

export const useSaveMasterHoliday = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            data,
            dropdownData
        }: {
            data: Parameters<typeof addOrUpdateMasterHoliday>[0];
            dropdownData?: Parameters<typeof addOrUpdateMasterHoliday>[1];
        }) => {
            console.log('🔄 [CLIENT] Mutation function called');
            console.log('📤 [CLIENT] Mutation data:', {
                hasData: !!data,
                hasDropdownData: !!dropdownData,
                dataKeys: data ? Object.keys(data) : []
            });
            return addOrUpdateMasterHoliday(data, dropdownData);
        },
        onSuccess: (response) => {
            console.log('✅ [CLIENT] Mutation onSuccess called');
            console.log('📥 [CLIENT] Response received:', {
                hasResponse: !!response,
                hasSuccess: 'success' in response,
                success: response?.success,
                hasMessage: 'message' in response,
                message: response?.message,
                hasData: 'data' in response,
                dataType: typeof response?.data,
                fullResponse: response
            });
            
            if (response?.success) {
                console.log('✅ [CLIENT] Response indicates success');
                console.log('📢 [CLIENT] Showing success toast:', response.message);
                toast.success(response.message);
                
                console.log('🔄 [CLIENT] Invalidating queries with key:', HRMS_QUERY_KEYS.MASTER_HOLIDAY);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_HOLIDAY]
                });
                console.log('✅ [CLIENT] Query invalidation completed');
            } else {
                console.log('❌ [CLIENT] Response indicates failure');
                console.log('📢 [CLIENT] Showing error toast:', response?.message || 'Unknown error');
                toast.error(response?.message || 'Save operation failed');
            }
        },
        onError: (error: Error) => {
            console.error('❌ [CLIENT] Mutation onError called');
            console.error('💥 [CLIENT] Error details:', {
                message: error?.message,
                name: error?.name,
                stack: error?.stack
            });
            toast.error(error.message || 'Failed to save master holiday');
        }
    });
};

export const useDeleteMasterHoliday = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMasterHoliday(id),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_HOLIDAY]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete master holiday');
        }
    });
};

export const useShiftSettingMaster = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.SHIFT_SETTING_MASTER],
            queryFn: async () => getShiftSettingMaster(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SHIFT_SETTING_MASTER]
            });
        }
    };
};

export const useSaveShiftSettingMaster = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Parameters<typeof addOrUpdateShiftSettingMaster>[0]) => addOrUpdateShiftSettingMaster(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.SHIFT_SETTING_MASTER]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save shift setting');
        }
    });
};

export const useDeleteShiftSettingMaster = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteShiftSettingMaster(id),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.SHIFT_SETTING_MASTER]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete shift setting');
        }
    });
};

export const useEmployeeShiftMapping = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_SHIFT_MAPPING],
            queryFn: async () => getEmployeeShiftMapping(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_SHIFT_MAPPING]
            });
        }
    };
};

export const useSaveEmployeeShiftMapping = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Parameters<typeof addOrUpdateEmployeeShiftMapping>[0]) => addOrUpdateEmployeeShiftMapping(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_SHIFT_MAPPING]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save employee shift mapping');
        }
    });
};

export const useDeleteEmployeeShiftMapping = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteEmployeeShiftMapping(id),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_SHIFT_MAPPING]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete employee shift mapping');
        }
    });
};

export const useMasterDriverShift = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_DRIVER_SHIFT],
            queryFn: async () => getMasterDriverShift(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_DRIVER_SHIFT]
            });
        }
    };
};

export const useSaveMasterDriverShift = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Parameters<typeof addOrUpdateMasterDriverShift>[0]) => addOrUpdateMasterDriverShift(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_DRIVER_SHIFT]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save master driver shift');
        }
    });
};

export const useDeleteMasterDriverShift = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMasterDriverShift(id),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_DRIVER_SHIFT]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete master driver shift');
        }
    });
};

export const useEmployeeMissingLogs = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MISSING_LOGS],
            queryFn: async () => getEmployeeMissingLogs(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MISSING_LOGS]
            });
        }
    };
};

export const useSaveEmployeeMissingLog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Parameters<typeof addOrUpdateEmployeeMissingLog>[0]) => addOrUpdateEmployeeMissingLog(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MISSING_LOGS]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save employee missing log');
        }
    });
};

export const useDeleteEmployeeMissingLog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteEmployeeMissingLog(id),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MISSING_LOGS]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete employee missing log');
        }
    });
};

