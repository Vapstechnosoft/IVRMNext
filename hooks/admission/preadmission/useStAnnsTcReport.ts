import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getStAnnsTcLoadData,
    changeStAnnsTcYear,
    changeStAnnsTcClass,
    changeStAnnsTcSection,
    getStAnnsTcDetails
} from '@/server/admission/preadmission/reports/st_anns_tc_custom_report';

export const useStAnnsTcLoadData = () => {
    return useQuery({
        queryKey: ['st-anns-tc-load-data'],
        queryFn: () => getStAnnsTcLoadData()
    });
};

export const useStAnnsTcYearChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; tctemporper: string; report_type: string }) =>
            changeStAnnsTcYear(data)
    });
};

export const useStAnnsTcClassChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; tctemporper: string; report_type: string; ASMCL_Id: number }) =>
            changeStAnnsTcClass(data)
    });
};

export const useStAnnsTcSectionChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number; tctemporper: string; report_type: string }) =>
            changeStAnnsTcSection(data)
    });
};

export const useStAnnsTcDetails = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number; AMST_Id: number; tctemporper: string }) =>
            getStAnnsTcDetails(data)
    });
};
