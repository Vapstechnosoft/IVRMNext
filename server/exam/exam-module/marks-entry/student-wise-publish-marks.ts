// hooks/exam/exammodule/useStudentMarks.ts
import { api } from '@/lib/apiService';
import { useQuery } from '@tanstack/react-query';

interface SearchParams {
  ASMAY_Id: number;
  ASMCL_Id: number;
  ASMS_Id: number;
  EME_Id: number;
  radiotype: 'EXAM' | 'PROMOTION';
  FMT_Id?: number;
  TempGroupList?: number[];
  feeinstallmentcheckbox?: boolean;
}

export const useSearchStudentMarks = (params: SearchParams) => {
  return useQuery({
    queryKey: ['student-marks', params],
    queryFn: async () => {
      const response = await api.post('exam', '/api/exam/search-students', params);
      return response.data;
    },
    enabled: !!params.ASMAY_Id && !!params.ASMCL_Id && !!params.ASMS_Id,
    refetchOnWindowFocus: false
  });
};

export const useCheckMarksCalculation = (params: {
  ASMS_Id: number;
  ASMCL_Id: number;
  ASMAY_Id: number;
  radiotype: 'EXAM' | 'PROMOTION';
}) => {
  return useQuery({
    queryKey: ['check-marks-calculation', params],
    queryFn: async () => {
      const response = await api.post('exam','/api/exam/check-marks-calculation', params);
      return response.data;
    },
    enabled: !!params.ASMS_Id && !!params.ASMCL_Id && !!params.ASMAY_Id,
  });
};