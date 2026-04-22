'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getDanvantariTCLoadData,
    changeYearDanvantariTC,
    changeCourseDanvantariTC,
    changeSemesterDanvantariTC,
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

export const useChangeCourseDanvantariTC = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number; tctemporper: string }) => changeCourseDanvantariTC(data)
    });
};

export const useChangeSemesterDanvantariTC = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; AMSE_Id: number; tctemporper: string }) => changeSemesterDanvantariTC(data)
    });
};

export const useDanvantariTCDetails = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCST_Id: number; tctemporper: string }) => getDanvantariTCDetails(data)
    });
};
