'use client';
 
import { useQuery } from '@tanstack/react-query';
import { fetchUserGroupGridData, fetchMainGroupDropdownData } from '@/server/inventory/masters/user-group'; // Create this file
import { INVENTORY_QUERY_KEYS } from '@/constants/query-keys';
import { ApiSearchparams } from '@/types';
 
export const useInvMasterUserGroup = (searchParams?: ApiSearchparams) => {
    const query = useQuery({
        queryKey: [INVENTORY_QUERY_KEYS.INV_MASTER_GROUP, 'user-group', searchParams],
        queryFn: () => fetchUserGroupGridData(searchParams),
        staleTime: 0
    });
 
    return {
        ...query,
        refetchAll: query.refetch
    };
};

export const useInvMainGroupDropdown = () => {
    const query = useQuery({
        queryKey: [INVENTORY_QUERY_KEYS.INV_MASTER_GROUP, 'main-group-dropdown'],
        queryFn: fetchMainGroupDropdownData,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    const mainGroupOptions: { label: string; value: string }[] = (query.data?.data || []).map((item: any) => ({
        label: item.invmG_GroupName,
        value: item.invmG_Id.toString()
    }));

    return {
        ...query,
        mainGroupOptions
    };
};
