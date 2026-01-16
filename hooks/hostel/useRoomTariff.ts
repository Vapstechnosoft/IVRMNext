'use client';

import { useQuery } from '@tanstack/react-query';
import { getRoomTariffData } from '@/server/hostel/room-tariff/server-action';

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
