import { useQuery, useMutation } from '@tanstack/react-query';
import { 
    getStudyCertificateLoadData, 
    getStudyCertificateSearchFilter, 
    getBcehStudyCertDetails 
} from '@/server/admission/preadmission/reports/study_certificate';

export const useBcehStudyCertLoadData = () => {
    return useQuery({
        queryKey: ['bcehStudyCertLoadData'],
        queryFn: async () => {
            return await getStudyCertificateLoadData();
        }
    });
};

export const useBcehStudyCertSearchStudent = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            AMST_SOL: string;
            ASMCL_Id: number;
            ASMC_Id: number;
            searchfilter: string;
            allorindid: string;
        }) => {
            return await getStudyCertificateSearchFilter(data);
        }
    });
};

export const useBcehStudyCertDetails = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            ASMCL_Id: number;
            ASMC_Id: number;
            AMST_Id: number;
        }) => {
            return await getBcehStudyCertDetails(data);
        }
    });
};
