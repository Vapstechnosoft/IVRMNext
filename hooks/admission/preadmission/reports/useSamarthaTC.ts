'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getSamarthaTCLoadData,
    changeYearSamarthaTC,
    changeClassSamarthaTC,
    changeSectionSamarthaTC,
    getSamarthaTCDetails
} from '@/server/admission/preadmission/reports/samartha_tc';

export const useSamarthaTCLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'samartha_tc', 'load_data'],
        queryFn: () => getSamarthaTCLoadData()
    });
};

export const useChangeYearSamarthaTC = () => {
    return useMutation({
        mutationFn: (data: any) => changeYearSamarthaTC(data)
    });
};

export const useChangeClassSamarthaTC = () => {
    return useMutation({
        mutationFn: (data: any) => changeClassSamarthaTC(data)
    });
};

export const useChangeSectionSamarthaTC = () => {
    return useMutation({
        mutationFn: (data: any) => changeSectionSamarthaTC(data)
    });
};

export const useSamarthaTCDetails = () => {
    return useMutation({
        mutationFn: (data: any) => getSamarthaTCDetails(data)
    });
};
