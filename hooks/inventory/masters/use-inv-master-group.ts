'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchInvMasterGroupData } from '@/server/inventory/masters/inv-master-group';

import { ApiSearchparams } from '@/types';

export const useInvMasterGroup = (searchParams?: ApiSearchparams) => {
    const query = useQuery({
        queryKey: ['INV_MasterGroup', searchParams],
        queryFn: () => fetchInvMasterGroupData(searchParams),
    });

    return {
        ...query,
        refetchAll: query.refetch
    };
};
