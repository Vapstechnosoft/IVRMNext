import { useQuery, useMutation } from '@tanstack/react-query';
import { 
    getBbhsStudentTcInitialData, 
    getBbhsStudentTcStudentList, 
    getBbhsStudentTcDetails,
    getBbhsStudentTcACS
} from '@/server/admission/preadmission/reports/bbhs_student_tc_report_custom';

export const useBbhsStudentTcInitialData = () => {
    return useQuery({
        queryKey: ['bbhsStudentTcInitialData'],
        queryFn: async () => {
            return await getBbhsStudentTcInitialData();
        }
    });
};

export const useBbhsStudentTcStudentList = () => {
    return useMutation({
        mutationFn: async (data: {
            regornamedetails: string;
            ASMAY_Id: number;
            ASMCL_Id?: number;
            ASMC_Id?: number;
        }) => {
            return await getBbhsStudentTcStudentList(data);
        }
    });
};

export const useBbhsStudentTcDetails = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            AMST_Id: number;
        }) => {
            return await getBbhsStudentTcDetails(data);
        }
    });
};

export const useBbhsStudentTcACS = () => {
    return useMutation({
        mutationFn: async (yearId: number) => {
            return await getBbhsStudentTcACS(yearId);
        }
    });
};
