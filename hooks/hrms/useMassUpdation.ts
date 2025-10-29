'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { getMassUpdationOnload, saveMassUpdation, searchMassUpdationEmployees } from '@/server/hrms/mass-updation';
import type {
    MassUpdationOnloadRequest,
    MassUpdationOnloadResponse,
    MassUpdationSaveRequest,
    MassUpdationSaveResponse,
    MassUpdationSearchRequest
} from '@/types/hrms/mass-updation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch mass updation onload data
 */
export function useMassUpdationOnload(payload: MassUpdationOnloadRequest) {
    return useQuery<MassUpdationOnloadResponse, Error>({
        queryKey: [HRMS_QUERY_KEYS.MASS_UPDATION_ONLOAD, payload],
        queryFn: () =>
            getMassUpdationOnload(payload).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!payload.MI_Id && !!payload.roleId
    });
}

/**
 * Hook to save mass updation
 */
export function useSaveMassUpdation() {
    const queryClient = useQueryClient();

    return useMutation<MassUpdationSaveResponse, Error, MassUpdationSaveRequest>({
        mutationFn: (data: MassUpdationSaveRequest) =>
            saveMassUpdation(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data) => {
            toast.success(data.retrunMsg || 'Mass updation completed successfully!');
            queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASS_UPDATION_ONLOAD]
            });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to complete mass updation.');
        }
    });
}

/**
 * Hook to search employees for mass updation
 */
export function useSearchMassUpdationEmployees() {
    return useMutation<MassUpdationOnloadResponse, Error, MassUpdationSearchRequest>({
        mutationFn: (data: MassUpdationSearchRequest) =>
            searchMassUpdationEmployees(data).then((res) => {
                if (!res.success) {
                    throw new Error(res.message);
                }
                return res.data!;
            }),
        onSuccess: (data) => {
            toast.success(data.retrunMsg || 'Employees loaded successfully!');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to search employees.');
        }
    });
}
