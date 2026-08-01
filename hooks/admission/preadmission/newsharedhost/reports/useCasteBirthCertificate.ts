import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getCasteBirthCertificateInitialData,
    searchCasteBirthStudent,
    getCasteBirthStudentReport,
    generateCasteBirthQRCode
} from '@/server/admission/preadmission/newsharedhost/reports/caste-birth-certificate';

export function useCasteBirthCertificateInitialData() {
    return useQuery({
        queryKey: ['casteBirthCertificateInitialData'],
        queryFn: () => getCasteBirthCertificateInitialData(),
    });
}

export function useSearchCasteBirthStudentMutation() {
    return useMutation({
        mutationFn: (data: any) => searchCasteBirthStudent(data),
    });
}

export function useCasteBirthStudentReportMutation() {
    return useMutation({
        mutationFn: (data: any) => getCasteBirthStudentReport(data),
    });
}

export function useGenerateCasteBirthQRCodeMutation() {
    return useMutation({
        mutationFn: (data: any) => generateCasteBirthQRCode(data),
    });
}
