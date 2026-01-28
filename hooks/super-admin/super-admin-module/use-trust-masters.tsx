'use client';

import { getTrustMasterData } from '@/server/super-admin/super-admin-module/masters/trust-master';
import { useQuery } from '@tanstack/react-query';

export const useTrustMasterData = (mo_id: number, roleId: number) => {
    return useQuery({
        queryKey: ['trust_master_data', mo_id, roleId],
        queryFn: async () => {
            const response = await getTrustMasterData(mo_id, roleId);
            return response;
        }
    });
};
