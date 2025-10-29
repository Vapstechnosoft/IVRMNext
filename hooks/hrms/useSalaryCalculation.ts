'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { generateSalaryForSelectedEmployees, getSalaryCalculationOnload } from '@/server/hrms/salary-calculation';
import type {
    SalaryCalculationGenerateRequest,
    SalaryCalculationGenerateResponse,
    SalaryCalculationOnloadRequest,
    SalaryCalculationOnloadResponse
} from '@/types/hrms/salary-calculation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch salary calculation onload data (dropdowns)
 */
export function useSalaryCalculationOnload(payload: SalaryCalculationOnloadRequest) {
    return useQuery<SalaryCalculationOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD, payload],
        queryFn: () =>
            getSalaryCalculationOnload(payload).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!payload.MI_Id && !!payload.LogInUserId
    });
}

/**
 * Hook to generate salary for selected employees
 */
export function useGenerateSalary() {
    const queryClient = useQueryClient();

    return useMutation<SalaryCalculationGenerateResponse, Error, SalaryCalculationGenerateRequest>({
        mutationFn: (data: SalaryCalculationGenerateRequest) =>
            generateSalaryForSelectedEmployees(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data) => {
            if (data.processedCount > 0) {
                toast.success(data.retrunMsg || `Salary calculated successfully for ${data.processedCount} employee(s)!`);
            }
            if (data.failedCount > 0) {
                toast.warning(`Failed to calculate salary for ${data.failedCount} employee(s).`);
            }
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.SALARY_CALCULATION_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to generate salary calculation.');
        }
    });
}
