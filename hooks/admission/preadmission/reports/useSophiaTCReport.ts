import { useMutation, useQuery } from "@tanstack/react-query";
import * as server from "@/server/admission/preadmission/reports/sophia_tc_report";

export const useTCInitialData = () => {
    return useQuery({
        queryKey: ["tc-report-initial-data"],
        queryFn: () => server.getTCInitialData(),
    });
};

export const useTCYearChange = () => {
    return useMutation({
        mutationFn: (asmayId: number) => server.onTCYearChange(asmayId),
    });
};

export const useTCClassChange = () => {
    return useMutation({
        mutationFn: (payload: { asmayId: number; asmclId: number }) => server.onTCClassChange(payload.asmayId, payload.asmclId),
    });
};

export const useTCSectionChange = () => {
    return useMutation({
        mutationFn: (payload: { asmayId: number; asmclId: number; asmsId: number }) => server.onTCSectionChange(payload.asmayId, payload.asmclId, payload.asmsId),
    });
};

export const useStudentNameRegNo = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getStudentNameRegNo(payload),
    });
};

export const useStudentNameChange = () => {
    return useMutation({
        mutationFn: (payload: { asmayId: number; amstId: number }) => server.onStudentNameChange(payload.asmayId, payload.amstId),
    });
};

export const useTCGetDetailsRecord = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getTCDetailsRecord(payload),
    });
};

export const useTCGetReport = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getTCReportDetails(payload),
    });
};
