'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getMessAttendanceLoadData,
    getStudentData,
    getStudents,
    getMonthClassHeld,
    getDatewiseAttMDM,
    getBatchList,
    getStdListPeriod,
    viewAttendanceDetailsStaffWise,
    saveMessStudentAttendance,
    deleteAttendance,
    attendanceDeleteRecordWise
} from '@/server/admission/preadmission/transactions/mess_attendance_entry';

export const useMessAttendanceLoadData = (yearId: number) => {
    return useQuery({
        queryKey: ['mess-attendance-load-data', yearId],
        queryFn: () => getMessAttendanceLoadData(yearId),
    });
};

export const useGetStudentData = () => {
    return useMutation({
        mutationFn: (data: any) => getStudentData(data),
    });
};

export const useGetStudents = () => {
    return useMutation({
        mutationFn: (data: any) => getStudents(data),
    });
};

export const useGetMonthClassHeld = () => {
    return useMutation({
        mutationFn: (data: any) => getMonthClassHeld(data),
    });
};

export const useGetDatewiseAttMDM = () => {
    return useMutation({
        mutationFn: (data: any) => getDatewiseAttMDM(data),
    });
};

export const useGetBatchList = () => {
    return useMutation({
        mutationFn: (data: any) => getBatchList(data),
    });
};

export const useGetStdListPeriod = () => {
    return useMutation({
        mutationFn: (data: any) => getStdListPeriod(data),
    });
};

export const useViewAttendanceDetailsStaffWise = () => {
    return useMutation({
        mutationFn: (data: any) => viewAttendanceDetailsStaffWise(data),
    });
};

export const useSaveMessStudentAttendance = () => {
    return useMutation({
        mutationFn: (data: any) => saveMessStudentAttendance(data),
    });
};

export const useDeleteAttendance = () => {
    return useMutation({
        mutationFn: (data: any) => deleteAttendance(data),
    });
};

export const useAttendanceDeleteRecordWise = () => {
    return useMutation({
        mutationFn: (data: any) => attendanceDeleteRecordWise(data),
    });
};
