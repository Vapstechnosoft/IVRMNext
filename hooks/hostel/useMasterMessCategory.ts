import { fetchMessCategoryMappingData } from '@/server/hostel/master-mess-category/server-action';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const MASTER_MESS_CATEGORY_QUERY_KEY = 'MASTER_MESS_CATEGORY_DATA';

export const useMasterMessCategory = (searchParams?: { [key: string]: string | string[] | undefined }) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [MASTER_MESS_CATEGORY_QUERY_KEY, searchParams ?? {}],
            queryFn: async () => fetchMessCategoryMappingData(searchParams || {}),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [MASTER_MESS_CATEGORY_QUERY_KEY]
            });
        }
    };
};
