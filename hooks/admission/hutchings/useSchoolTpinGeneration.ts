import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getSchoolTpinGenerationInitialDetails,
    searchSchoolTpinGeneration,
    generateSchoolTpin
} from '@/server/admission/hutchings/master/schooltpingeneration';

export const useSchoolTpinGenerationInitialDetails = () => {
    return useQuery({
        queryKey: ['schoolTpinGenerationInitialDetails'],
        queryFn: getSchoolTpinGenerationInitialDetails,
    });
};

export const useSearchSchoolTpinGenerationMutation = () => {
    return useMutation({
        mutationFn: searchSchoolTpinGeneration,
    });
};

export const useGenerateSchoolTpinMutation = () => {
    return useMutation({
        mutationFn: generateSchoolTpin,
    });
};
