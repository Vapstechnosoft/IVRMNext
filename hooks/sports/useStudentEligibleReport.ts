import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getStudentEligibleReportLoadGrid,
    getStudentEligibleReportClasses,
    getStudentEligibleReportSections,
    getStudentEligibleReportStudents,
    getStudentEligibleReportDetails
} from '@/server/sports/reports/student-eligible-report';

export const useStudentEligibleReport = () => {
    const loadGrid = useQuery({
        queryKey: ['student-eligible-report-load'],
        queryFn: getStudentEligibleReportLoadGrid,
    });

    const getClasses = useMutation({
        mutationFn: (data: { ASMAY_Id: number }) => getStudentEligibleReportClasses(data),
    });

    const getSections = useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number }) => getStudentEligibleReportSections(data),
    });

    const getStudents = useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) => getStudentEligibleReportStudents(data),
    });

    const showDetails = useMutation({
        mutationFn: (data: any) => getStudentEligibleReportDetails(data),
    });

    return {
        ...loadGrid,
        getClasses,
        getSections,
        getStudents,
        showDetails
    };
};
