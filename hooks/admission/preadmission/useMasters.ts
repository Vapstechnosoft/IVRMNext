import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterClass, getMasterClassDetails } from '@/server/admission/preadmission/masters/class';
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

export const useMasterClassDetails = (id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS_DETAILS, id],
            queryFn: async () => getMasterClassDetails(id),
            staleTime: 0,
            enabled: !!id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MASTER_CLASS_DETAILS]
            });
        }
    };
};
