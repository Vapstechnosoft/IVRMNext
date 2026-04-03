import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getCbsStudyCertLoadData,
    getCbsStudyCertSearchFilter,
    getCbsStudyCertDetails,
    getCbsCharacterCertDetails,
    saveCbsStudyCertQRCode
} from '@/server/admission/preadmission/reports/cbs_study_certificate';

export const useCbsStudyCertLoadData = (pageId: number) => {
    return useQuery({
        queryKey: ['cbs-study-cert-load-data', pageId],
        queryFn: () => getCbsStudyCertLoadData(pageId),
    });
};

export const useCbsStudyCertSearchFilter = () => {
    return useMutation({
        mutationFn: getCbsStudyCertSearchFilter,
    });
};

export const useCbsStudyCertDetails = () => {
    return useMutation({
        mutationFn: getCbsStudyCertDetails,
    });
};

export const useCbsCharacterCertDetails = () => {
    return useMutation({
        mutationFn: getCbsCharacterCertDetails,
    });
};

export const useSaveCbsStudyCertQRCode = () => {
    return useMutation({
        mutationFn: saveCbsStudyCertQRCode,
    });
};
