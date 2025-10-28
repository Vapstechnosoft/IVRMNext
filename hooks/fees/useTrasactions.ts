import { FEES_QUERY_KEYS } from '@/constants/query-keys';
import { getModeOfPayment } from '@/server/fees/masters/modeOfPayment';

import { getAcademicYearDropdownData, getAmountEntry } from '@/server/fees/trasactions/feeAmountEntry';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useFeeAmountEntry = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_AMOUNT_ENTRY, searchParams ?? {}],
            queryFn: async () => getAmountEntry(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_AMOUNT_ENTRY]
            });
        }
    };
};

export const useacademicyerdropdowndatafee = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.ACADEMIC_DROPDOWN_FEES, searchParams ?? {}],
            queryFn: async () => getAcademicYearDropdownData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.ACADEMIC_DROPDOWN_FEES]
            });
        }
    };
};

export const useMasterFeeTransactionWaiveOff = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_WAVIED_OFF, searchParams ?? {}],
            queryFn: async () => getMasterFeeTransactionWaiveOff(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_WAVIED_OFF]
            });
        }
    };
};
export const useMasterFeeOpeningBalance = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_OPENING_BALANCE, searchParams ?? {}],
            queryFn: async () => getModeOfPayment(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_OPENING_BALANCE]
            });
        }
    };
};
