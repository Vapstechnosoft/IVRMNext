import { FEES_QUERY_KEYS } from '@/constants/query-keys';
import { getModeOfPayment } from '@/server/fees/masters/modeOfPayment';

import { getAcademicYearDropdownData, getAmountEntry } from '@/server/fees/trasactions/feeAmountEntry';
import {
    getThirdPartyTrasaction,
    getThirdPartyTrasactionBankDropDown,
    getThirdPartyTrasactionGroupDropDown,
    getThirdPartyTrasactionHeadDropDown
} from '@/server/fees/trasactions/thirdPartyTrasaction';
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

export const useFeeThirdParty = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_THIRDPARTY_TRASACTION, searchParams ?? {}],
            queryFn: async () => getThirdPartyTrasaction(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_THIRDPARTY_TRASACTION]
            });
        }
    };
};

export const useGroupdropdowndatathirdpartytransaction = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_THIRDPARTY_GROUPDROPDOWN, searchParams ?? {}],
            queryFn: async () => getThirdPartyTrasactionGroupDropDown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_THIRDPARTY_GROUPDROPDOWN]
            });
        }
    };
};

export const useHeaddropdowndatathirdpartytransaction = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_THIRDPARTY_HEADDROPDOWN, searchParams ?? {}],
            queryFn: async () => getThirdPartyTrasactionHeadDropDown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_THIRDPARTY_HEADDROPDOWN]
            });
        }
    };
};

export const useBankdropdowndatathirdpartytransaction = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_THIRDPARTY_BANKDROPDOWN, searchParams ?? {}],
            queryFn: async () => getThirdPartyTrasactionBankDropDown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_THIRDPARTY_BANKDROPDOWN]
            });
        }
    };
};
