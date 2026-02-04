
/**
 * Hook to save employee medical details
 */
export function useSaveEmployeeMedical() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveMedicalDetails(data),
        onSuccess: (response) => {
            if (response?.success) {
                toast.success(response.message || 'Medical details saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else if (response?.message) {
                toast.info(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving medical details');
        }
    });
}

/**
 * Hook to save employee document details
 */
export function useSaveEmployeeDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveDocumentDetails(data),
        onSuccess: (response) => {
            if (response?.success) {
                toast.success(response.message || 'Document details saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
            } else if (response?.message) {
                toast.info(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving document details');
        }
    });
}

/**
 * Hook to fetch employee salary details (Payroll)
 */
export function useEmployeeSalaryDetails(id: number | null, _employeeCode?: string) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'salary-details', id],
        queryFn: () => {
            if (!id || id === 0) {
                return Promise.resolve([]);
            }
            return getEmployeeSalaryDetails(id);
        },
        enabled: !!id && id > 0,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

/**
 * Hook to save employee earning details
 */
export function useSaveEmployeeEarning() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveEmployeeEarning(data),
        onSuccess: (response) => {
            // Success handling managed by component usually for payroll (batch save)
            // But we can add default toast here if component doesn't handle it
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'salary-details']
            });
        },
        onError: (_error: Error) => {
            // Error handled by component
        }
    });
}

/**
 * Hook to save employee deduction details
 */
export function useSaveEmployeeDeduction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveEmployeeDeduction(data),
        onSuccess: (_response) => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'salary-details']
            });
        },
        onError: (_error: Error) => {
        }
    });
}

/**
 * Hook to save employee arrear details
 */
export function useSaveEmployeeArrear() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveEmployeeArrear(data),
        onSuccess: (_response) => {
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE, 'salary-details']
            });
        },
        onError: (_error: Error) => {
        }
    });
}
