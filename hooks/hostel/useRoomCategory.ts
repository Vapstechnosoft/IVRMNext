'use client';

import { useQuery } from '@tanstack/react-query';
import { getRoomCategoryData } from '@/server/hostel/room-category/server-action';

const ROOM_CATEGORY_QUERY_KEY = ['ROOM_CATEGORY_LIST'];

export const useRoomCategory = (searchParams?: { [key: string]: string | string[] | undefined }) => {
    return {
        ...useQuery({
            queryKey: [ROOM_CATEGORY_QUERY_KEY, searchParams ?? {}],
            queryFn: async () => getRoomCategoryData(),
            staleTime: 0
        }),
        refetchAll: async () => {
             // InvalidateQueries or manual refetch handled by react-query if usage component calls refetch
        }, 
        // Just standard useQuery return is mostly sufficient, but matching pattern
        queryKey: ROOM_CATEGORY_QUERY_KEY
    };
};
