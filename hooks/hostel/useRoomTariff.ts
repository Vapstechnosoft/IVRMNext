'use client';

import { getRoomTariffData } from '@/server/hostel/hostel-management/masters/room-tariff';
import { useQuery } from '@tanstack/react-query';

const ROOM_TARIFF_QUERY_KEY = ['ROOM_TARIFF_LIST'];

export const useRoomTariff = (searchParams?: { [key: string]: string | string[] | undefined }) => {
    return {
        ...useQuery({
            queryKey: [ROOM_TARIFF_QUERY_KEY, searchParams ?? {}],
            queryFn: async () => getRoomTariffData(),
            staleTime: 0
        }),
        refetchAll: async () => {
             // Handled by key invalidation usually
        },
        queryKey: ROOM_TARIFF_QUERY_KEY
    };
};
