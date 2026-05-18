import { useMutation, useQuery } from '@tanstack/react-query';
import { performAlumniSearch, getAlumniSearchDropdownData } from '@/server/alumni/alumni-search';
import type { IAlumniSearchDetailsResponse, IAlumniSearchResponse } from '@/types/alumni/alumni-search';
import type { ApiResponse } from '@/lib/apiService';

export const useAlumniSearchDropdownData = () => {
    return useQuery<ApiResponse<IAlumniSearchDetailsResponse>>({
        queryKey: ['alumni-search-dropdown-data'],
        queryFn: () => getAlumniSearchDropdownData({})
    });
};

export const usePerformAlumniSearch = () => {
    return useMutation<ApiResponse<IAlumniSearchResponse>, Error, any>({
        mutationFn: (data: any) => performAlumniSearch(data)
    });
};


