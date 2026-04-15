'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getDanvantariTCLoadData,
    changeYearDanvantariTC,
    stdNameChangeDanvantariTC,
    getDanvantariTCDetails
} from '@/server/admission/preadmission/reports/danvantari_transfer_certificate';

export const useDanvantariTCLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'danvantari_tc', 'load_data'],
        queryFn: () => getDanvantariTCLoadData()
    });
};

export const useChangeYearDanvantariTC = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; tctemporper: string }) => changeYearDanvantariTC(data)
    });
};

export const useStdNameChangeDanvantariTC = () => {
    return useMutation({
        mutationFn: (data: { AMCST_Id: number; ASMAY_Id: number; tctemporper: string }) => stdNameChangeDanvantariTC(data)
    });
};

export const useDanvantariTCDetails = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCST_Id: number; tctemporper: string }) => getDanvantariTCDetails(data)
    });
};
