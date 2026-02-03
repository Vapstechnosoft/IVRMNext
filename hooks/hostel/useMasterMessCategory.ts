'use client';

import { useQuery } from '@tanstack/react-query';
import { getMessCategoryList } from '@/server/hostel/hostel-management/masters/mess-category';
import { ApiSearchparams } from '@/types';

export const useMasterMessCategory = (searchParams?: ApiSearchparams) => {
    return useQuery({
        queryKey: ['master-mess-category', searchParams],
        queryFn: () => getMessCategoryList(searchParams),
        staleTime: 5 * 60 * 1000, 
    });
};
