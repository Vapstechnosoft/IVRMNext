'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchInvMasterUOMData } from '@/server/inventory/masters/inv-master-uom';
import { ApiSearchparams } from '@/types';

export const useInvMasterUom = (searchParams?: ApiSearchparams) => {
    const query = useQuery({
        queryKey: ['INV_MasterUOM', searchParams],
        queryFn: () => fetchInvMasterUOMData(searchParams),
    });

    return {
        ...query,
        refetchAll: query.refetch
    };
};
