'use client';
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import type { ApiResponse } from '@/lib/apiService';
import { deleteEmployee, getEmployeeById, saveEmployee } from '@/server/hrms/hrmsConfig/employee/register';
import type { EmployeeSaveRequest } from '@/types/hrms/employee';
import type { IEmployeeSaveResponse } from '@/types/hrms/hrms-config/employee';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
// TODO: Implement useEmployeeOnload hook when the onload API endpoint is available
// export function useEmployeeOnload() {
//     return useQuery({
//         queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ONLOAD],
//         queryFn: async () => {
//             const res: ApiResponse<EmployeeOnloadResponse> = await getEmployeeOnload();
//             if (!res.success) {
//                 throw new Error(res.message);
//             }
//             return res.data!;
//         },
//         staleTime: 1000 * 60 * 5 // 5 minutes
//     });
// }
/**
 * Hook to fetch employee by ID
 */
export function useEmployeeById(id: number | null) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, id],
        queryFn: () => getEmployeeById(id!),
        enabled: !!id && id > 0,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}
/**
 * Hook to create or update employee
 */
export function useSaveEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: EmployeeSaveRequest) => saveEmployee(data),
        onSuccess: (response: ApiResponse<IEmployeeSaveResponse>) => {
            if (response.success) {
                toast.success(response.message || 'Employee saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                toast.error(response.message || 'Failed to save employee');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving employee');
        }
    });
}
/**
 * Hook to delete employee
 */
export function useDeleteEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteEmployee(id),
        onSuccess: (response: ApiResponse<any>) => {
            if (response.success) {
                toast.success(response.message || 'Employee deleted successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else {
                toast.error(response.message || 'Failed to delete employee');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while deleting employee');
        }
    });
}
