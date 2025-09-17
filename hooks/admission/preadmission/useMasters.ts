import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterClass, getTestDropdown } from '@/server/admission/preadmission/masters/class';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterClass = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS, searchParams ?? {}],
            queryFn: async () => getMasterClass(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS]
            });
        }
    };
};

export const useTestDropdown = (asmay_id: number, mi_id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.TEST_DROPDOWN],
            queryFn: async () => getTestDropdown(asmay_id, mi_id),
            staleTime: 0,
            enabled: !asmay_id && !mi_id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.TEST_DROPDOWN]
            });
        }
    };
};
