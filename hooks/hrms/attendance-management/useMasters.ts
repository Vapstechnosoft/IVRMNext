'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { addOrUpdateEmployeeMissingLog, deleteEmployeeMissingLog, getEmployeeMissingLogs } from '@/server/hrms/attendance-management/masters/employee-missing-logs';
import { addOrUpdateEmployeeShiftMapping, deleteEmployeeShiftMapping, getEmployeeShiftMapping } from '@/server/hrms/attendance-management/masters/employee-shift-mapping';
import { addOrUpdateMasterDriverShift, deleteMasterDriverShift, getMasterDriverShift } from '@/server/hrms/attendance-management/masters/master-driver-shift';
import { addOrUpdateMasterHoliday, deleteMasterHoliday, getMasterHoliday } from '@/server/hrms/attendance-management/masters/master-holiday';
import { addOrUpdateMasterShift, deleteMasterShift, getMasterShift } from '@/server/hrms/attendance-management/masters/master-shift';
import { addOrUpdateShiftSettingMaster, deleteShiftSettingMaster, getShiftSettingMaster } from '@/server/hrms/attendance-management/masters/shift-setting-master';
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

export const useMasterHoliday = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_HOLIDAY],
            queryFn: async () => getMasterHoliday(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_HOLIDAY]
            });
        }
    };
};

export const useSaveMasterHoliday = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Parameters<typeof addOrUpdateMasterHoliday>[0]) => addOrUpdateMasterHoliday(data),
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

