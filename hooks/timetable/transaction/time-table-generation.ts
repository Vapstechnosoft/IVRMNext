import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import { getAcademicYear, getCategory, getTimeTableGenerationGridData } from '@/server/timetable/transactions/time-table-generation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useGenerationMasters = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.TT_GENERATION_MASTERS],
            queryFn: async () => {
                const [yearsResponse, categoriesResponse] = await Promise.all([
                    getAcademicYear({}),
                    getCategory({})
                ]);
                return {
                    years: yearsResponse.data ?? [],
                    categories: categoriesResponse.data ?? []
                };
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.TT_GENERATION_MASTERS]
            });
        }
    };
};

export const useTimeTableGenerationGridData = (searchParams: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.TT_GENERATION_MASTERS, 'grid', searchParams],
            queryFn: async () => getTimeTableGenerationGridData(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.TT_GENERATION_MASTERS]
            });
        }
    };
};
