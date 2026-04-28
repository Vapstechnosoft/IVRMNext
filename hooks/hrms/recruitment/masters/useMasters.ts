'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RECRUITMENT_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterJobByIdData, getMasterGridData as getMasterJobGridData, saveOrUpdateJob, type saveOrUpdateJobPayload, toggleJobStatusData } from '@/server/hrms/recruitment/masters/masterJob';

import { getMasterLocation, getMasterLocationGridData, saveOrUpdateLocation, type saveOrUpdateLocationPayload, toggleLocationStatusData } from '@/server/hrms/recruitment/masters/masterLocation';

// -------------------------- Master Job HOOKS --------------------------
export function useGetMasterJobGrid() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_JOB_GRID],
            queryFn: async () => getMasterJobGridData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_JOB_GRID]
            });
        }
    };
}

export function useSaveOrUpdateJob() {

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: saveOrUpdateJobPayload) => saveOrUpdateJob(payload),
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_JOB_GRID]
            });
        }
    });
}

export function useGetMasterLocationDropDown() {
    return useQuery({
        queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_LOCATION_GRID],
        queryFn: async () => getMasterLocation(),
        staleTime: 0
    });
}

export function useGetMasterJobByJobId(jobId: number) {
    return useQuery({
        queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_JOB_BY_JOBID, jobId],
        queryFn: async () => getMasterJobByIdData(jobId),
        staleTime: 0
    });
}

export function useToggleJobStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (jobId: number) => toggleJobStatusData(jobId),
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_JOB_GRID]
            });
        }
    });
}


// -------------------------- Master Location HOOKS --------------------------

export function useGetMasterLocationGrid() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_LOCATION_GRID],
            queryFn: async () => getMasterLocationGridData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_LOCATION_GRID]
            });
        }
    };
}

export function useSaveOrUpdateLocation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: saveOrUpdateLocationPayload) => saveOrUpdateLocation(payload),
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_LOCATION_GRID]
            });
        }
    });
}

export function useToggleLocationStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hrmlO_Id: number) => toggleLocationStatusData(hrmlO_Id),
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_LOCATION_GRID]
            });
        }
    });
}