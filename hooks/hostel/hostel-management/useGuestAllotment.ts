import { HOSTEL_QUERY_KEYS } from '@/constants/query-keys';
import { useState, useEffect, useCallback } from 'react';
import { fetchMasterFacilityData } from '@/server/hostel/hostel-management/masters/facility';
import { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteBed, fetchBedData } from '@/server/hostel/hostel-management/masters/bed';
import { IBedDisplay, IHostel } from '@/types/hostel/hostel-management/masters';
import { getGuestAllotmentLoadData } from '@/server/hostel/hostel-management/transactions/guest-allotment';

export const useGuestAllotments = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HOSTEL_QUERY_KEYS.HOSTEL_GUEST_ALLOTMENT_LIST, searchParams ?? {}],
            queryFn: async () => getGuestAllotmentLoadData(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HOSTEL_QUERY_KEYS.HOSTEL_GUEST_ALLOTMENT_LIST]
            });
        }
    };
};