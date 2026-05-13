import { getMasterHouseDesignations } from '@/server/sports/masters/house-designation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

export const useMasterHouseDesignation = () => {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();

    const params = {
        page: Number(searchParams.get('page') || 1),
        page_size: Number(searchParams.get('page_size') || 10),
        sort_column: searchParams.get('sort_column') || '',
        sort_direction: searchParams.get('sort_direction') || 'asc',
        search_query: searchParams.get('search_query') || '',
    };

    return {
        ...useQuery({
            queryKey: ['master-house-designation', params],
            queryFn: async () => getMasterHouseDesignations(params),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['master-house-designation']
            });
        }
    };
};
