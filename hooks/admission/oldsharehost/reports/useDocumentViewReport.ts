import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getDocumentViewReportDetails,
    getDocumentViewReportStudent,
    getDocumentViewReportData
} from '@/server/admission/oldsharehost/reports/document_view_adm';

export const useDocumentViewReportInitialDetails = () => {
    return useQuery({
        queryKey: ['documentViewReportInitialDetails'],
        queryFn: () => getDocumentViewReportDetails(),
    });
};

export const useDocumentViewReportStudent = () => {
    return useMutation({
        mutationFn: getDocumentViewReportStudent,
    });
};

export const useDocumentViewReportData = () => {
    return useMutation({
        mutationFn: getDocumentViewReportData,
    });
};
