import { useQuery } from '@tanstack/react-query';
import type { ApiSearchparams } from '@/types';
import { getEventsSponsorMapping } from '@/server/sports/transactions/events-sponsor';

export function useEventsSponsor(searchParams?: ApiSearchparams) {
    return useQuery({
        queryKey: ['events-sponsor-mapping', searchParams],
        queryFn: () => getEventsSponsorMapping(searchParams),
    });
}
