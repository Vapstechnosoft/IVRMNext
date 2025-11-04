import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { getPreAdmissionSetOrder, getPreAdmissionYear } from '@/server/admission/preadmission/configuration/academic_year_master';
import { checkPreadmissionLive } from '@/server/admission/preadmission/configuration/configuration';
import { getMasterConfiguration } from '@/server/admission/preadmission/configuration/master_configuration';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useCheckPreadmissionLive = (subDomain: string) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.CHECK_PREADMISSION_LIVE, subDomain],
            queryFn: async () => checkPreadmissionLive(subDomain),
            staleTime: 50000, // 5 seconds
            enabled: !!subDomain
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.CHECK_PREADMISSION_LIVE]
            });
        }
    };
};

export const useMasterConfiguration = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.MASTER_CONFIGURATION, searchParams ?? {}],
            queryFn: async () => getMasterConfiguration(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.MASTER_CONFIGURATION]
            });
        }
    };
};

export const usePreAdmissionAcademicYear = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.ACADEMIC_YEAR_MASTER, searchParams ?? {}],
            queryFn: async () => getPreAdmissionYear(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.ACADEMIC_YEAR_MASTER]
            });
        }
    };
};

export const usePreAdmissionAcademicYearSetOrder = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.SET_ORDER],
            queryFn: async () => getPreAdmissionSetOrder(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.SET_ORDER]
            });
        }
    };
};
