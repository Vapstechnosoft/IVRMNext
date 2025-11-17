import { FEES_QUERY_KEYS } from '@/constants/query-keys';
import { getModeOfPayment } from '@/server/fees/masters/modeOfPayment';
// import { getFeeStudentTransactionDetails } from '@/server/fees/trasactions/fee_student_transaction';

import { getAcademicYearDropdownData, getAmountEntry } from '@/server/fees/trasactions/feeAmountEntry';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getFeeStudentTransactionDetails } from '@/server/fees/trasactions/fee_student_transaction';
import { getFeePreadmissionTransactionList, getPreadmissionStudentDropdownData } from '@/server/fees/trasactions/feepreadmissiontrasaction';
import {
    getThirdPartyTrasaction,
    getThirdPartyTrasactionBankDropDown,
    getThirdPartyTrasactionGroupDropDown,
    getThirdPartyTrasactionHeadDropDown
} from '@/server/fees/trasactions/thirdPartyTrasaction';
import type { ApiSearchparams } from '@/types';

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

export const useFeePreadmissionTransactionList = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_PREADMISSION_TRANSACTION_DETAILS, searchParams ?? {}],
            queryFn: async () => getFeePreadmissionTransactionList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_PREADMISSION_TRANSACTION_DETAILS]
            });
        }
    };
};

export const usePreadmissionStudentDropdownData = (searchText: string, radiovalue: string) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_PREADMISSION_STUDENT_DROPDOWN, {}],
            queryFn: async () => getPreadmissionStudentDropdownData(searchText, radiovalue),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_PREADMISSION_STUDENT_DROPDOWN]
            });
        }
    };
};

//hooks/fees/useTrasactions.ts

export const useFeeTransactionList = (asmaY_Id: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_STUDENT_TRANSACTION, asmaY_Id, searchParams ?? {}],
            queryFn: async () => getFeeStudentTransactionDetails(asmaY_Id, searchParams)
        }),

        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_STUDENT_TRANSACTION]
            })
    };
};
