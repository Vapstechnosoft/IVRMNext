import { getMasterCompetitionCategories } from '@/server/sports/masters/competition-category';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterCompetitionCategories = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: ['master-competition-categories', searchParams ?? {}],
            queryFn: async () => getMasterCompetitionCategories(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['master-competition-categories']
            });
        }
    };
};
