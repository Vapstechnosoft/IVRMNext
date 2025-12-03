import { FEES_QUERY_KEYS } from '@/constants/query-keys';
import { getClassDropDown } from '@/server/fees/reports/daily_fee_collection_report';
import {
    getAcademicYeardropdown,
    getFeesBusRoutesDropDown,
    getFeesCustomGroupDropDown,
    getFeesDefaulterReportClassList,
    getFeesDefaulterReportSectionList,
    getFeesGroupDropDown,
    getFeesTermDropDown
} from '@/server/fees/reports/fee_DefaulterReport';
import { getFeesInstallmentDropDown } from '@/server/fees/reports/fee_yearlyCollectionReport';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useFeeDefaulterReport = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_DEFAULTER_REPORT],
            queryFn: async () => getAcademicYeardropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_DEFAULTER_REPORT]
            });
        }
    };
};

export const useFeeGroupDefaulterreport = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_GROUP_DEFAULTER],
            queryFn: async () => getFeesGroupDropDown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_GROUP_DEFAULTER]
            });
        }
    };
};

export const useFeeTermDefaulterreport = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_TERM_DEFAULTER],
            queryFn: async () => getFeesTermDropDown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_TERM_DEFAULTER]
            });
        }
    };
};

export const useFeeBusRouteDefaulterreport = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_BUS_ROUTES_DEFAULTER],
            queryFn: async () => getFeesBusRoutesDropDown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_BUS_ROUTES_DEFAULTER]
            });
        }
    };
};

export const useFeeCustomGroupDefaulterreport = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_CUSTOM_GROUP_DEFAULTER],
            queryFn: async () => getFeesCustomGroupDropDown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_CUSTOM_GROUP_DEFAULTER]
            });
        }
    };
};

export const useFeeClassListDefaulterreport = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_CLASS_LIST_DEFAULTER],
            queryFn: async () => getFeesDefaulterReportClassList(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_CLASS_LIST_DEFAULTER]
            });
        }
    };
};

export const useFeeSectionListDefaulterreport = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_SECTION_LIST_DEFAULTER],
            queryFn: async () => getFeesDefaulterReportSectionList(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_SECTION_LIST_DEFAULTER]
            });
        }
    };
};

export const useClassDropdownDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEE_REPORT_HEAD_DROPDOWN],
            queryFn: async () => getClassDropDown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEE_REPORT_HEAD_DROPDOWN]
            });
        }
    };
};

export const useFeeInstallmentYearlyfeecollectionreport = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [FEES_QUERY_KEYS.FEES_REPORT_INSTLLMENT_DROPDOWN_YEARLYREPORT],
            queryFn: async () => getFeesInstallmentDropDown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [FEES_QUERY_KEYS.FEES_REPORT_INSTLLMENT_DROPDOWN_YEARLYREPORT]
            });
        }
    };
};
