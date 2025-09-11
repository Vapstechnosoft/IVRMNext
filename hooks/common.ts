import { COMMON_QUERY_KEYS } from '@/constants/query-keys';
import { getUserAccessiblePages } from '@/server/common';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

export const useUserAccessiblePages = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COMMON_QUERY_KEYS.USER_ACCESSIBLE_PAGES],
            queryFn: async () => getUserAccessiblePages(),
            staleTime: 0,
            refetchInterval: 10000 // Refetch every 10 seconds
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COMMON_QUERY_KEYS.USER_ACCESSIBLE_PAGES]
            });
        }
    };
};
