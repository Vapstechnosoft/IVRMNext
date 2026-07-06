import { useQuery, useMutation } from "@tanstack/react-query";
import {
    getReadmitStudentDetails,
    getStudentListByYearAndClass,
    getNewJoinList,
    saveReadmitStudent
} from "@/server/admission/oldsharehost/masters/readmitstudent";

export const useReadmitStudentDetails = (pageId: number) => {
    return useQuery({
        queryKey: ["readmitStudentDetails", pageId],
        queryFn: () => getReadmitStudentDetails(pageId),
    });
};

export const useStudentListByYearAndClass = () => {
    return useMutation({
        mutationFn: (data: any) => getStudentListByYearAndClass(data),
    });
};

export const useNewJoinList = () => {
    return useMutation({
        mutationFn: (data: any) => getNewJoinList(data),
    });
};

export const useSaveReadmitStudent = () => {
    return useMutation({
        mutationFn: (data: any) => saveReadmitStudent(data),
    });
};
