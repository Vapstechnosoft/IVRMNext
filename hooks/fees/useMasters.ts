import { FEES_QUERY_KEYS } from '@/constants/query-keys';
import {
    getAcademicYearDropdown,
    getMasterCategoryDropdown,
    getMasterClassYearlyDataCategory
} from '@/server/fees/masters/class_yearly_category';
import { getpaymentgatewaydetails } from '@/server/fees/masters/fee_payment_gateway_details';
import { getfeehead } from '@/server/fees/masters/feehead';
import { getFineSlab } from '@/server/fees/masters/fineSlab';
import { getModeOfPayment } from '@/server/fees/masters/modeOfPayment';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterFeehead = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_HEADS, searchParams ?? {}],
            queryFn: async () => getfeehead(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_HEADS]
            });
        }
    };
};

export const useMasterModeOfPayment = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_MODEOFPAYMENT, searchParams ?? {}],
            queryFn: async () => getModeOfPayment(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_MODEOFPAYMENT]
            });
        }
    };
};

export const useAcademicYearDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.ACADEMIC_DROPDOWN],
            queryFn: async () => getAcademicYearDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.ACADEMIC_DROPDOWN]
            });
        }
    };
};

export const useMasterClassCategory = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.MASTER_CLASS_CATEGORY, searchParams ?? {}],
            queryFn: async () => getMasterCategoryDropdown(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.MASTER_CLASS_CATEGORY]
            });
        }
    };
};

export const useGetYearlyCatagory = (searchParams: { [key: string]: string | string[] | undefined }) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.ACADEMIC_DROPDOWN],
            queryFn: async () => getMasterClassYearlyDataCategory(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.ACADEMIC_DROPDOWN]
            });
        }
    };
};

export const useMasterPaymentgatewaydetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_PAYMENTGATEWAY_DETAILS, searchParams ?? {}],
            queryFn: async () => getpaymentgatewaydetails(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_PAYMENTGATEWAY_DETAILS]
            });
        }
    };
};

export const useMasterFineSlab = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_FINESLAB, searchParams ?? {}],
            queryFn: async () => getFineSlab(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_FINESLAB]
            });
        }
    };
};
