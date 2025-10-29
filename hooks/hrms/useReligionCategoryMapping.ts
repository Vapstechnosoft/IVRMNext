'use client';

import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    activateDeactivateReligionCategoryMapping,
    getReligionCategoryMappingList,
    saveReligionCategoryMapping
} from '@/server/hrms/hrmsConfig/master/religion-category-mapping';
import type { ReligionCategoryMappingInput } from '@/types/hrms/religion-category-mapping';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch religion category mapping list with dropdowns
 */
export function useReligionCategoryMapping() {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING],
        queryFn: () => getReligionCategoryMappingList(0, 2),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

/**
 * Hook to create or update religion category mapping
 */
export function useSaveReligionCategoryMapping() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ReligionCategoryMappingInput) => saveReligionCategoryMapping(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Mapping saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
                });
            } else {
                toast.error(response.message || 'Failed to save mapping');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while saving mapping');
        }
    });
}

/**
 * Hook to activate/deactivate religion category mapping
 */
export function useActivateDeactivateReligionCategoryMapping() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { IRCC_Id: number; IRCC_ActiveFlg: boolean }) => activateDeactivateReligionCategoryMapping(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Mapping status updated successfully');
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.RELIGION_CATEGORY_MAPPING]
                });
            } else {
                toast.error(response.message || 'Failed to update mapping status');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while updating mapping status');
        }
    });
}
