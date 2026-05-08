import { useMutation, useQuery } from "@tanstack/react-query";
import * as server from "@/server/admission/preadmission/transactions/student_attendance_entry";

export const useStudentAttendanceInitialData = (yearId: number) => {
  return useQuery({
    queryKey: ["student-attendance-initial-data", yearId],
    queryFn: () => server.getInitialData(yearId),
    enabled: !!yearId || yearId === 0,
  });
};

export const useStudentAttendanceGetStudentData = () => {
  return useMutation({
    mutationFn: (payload: any) => server.getStudentData(payload),
  });
};

export const useStudentAttendanceGetMonthClassHeld = () => {
  return useMutation({
    mutationFn: (payload: any) => server.getMonthClassHeld(payload),
  });
};

export const useStudentAttendanceGetDateWiseAttendance = () => {
  return useMutation({
    mutationFn: (payload: any) => server.getDateWiseAttendance(payload),
  });
};

export const useStudentAttendanceGetBatchList = () => {
  return useMutation({
    mutationFn: (payload: any) => server.getBatchList(payload),
  });
};

export const useStudentAttendanceGetStdListPeriod = () => {
  return useMutation({
    mutationFn: (payload: any) => server.getStdListPeriod(payload),
  });
};

export const useStudentAttendanceSave = () => {
  return useMutation({
    mutationFn: (payload: any) => server.saveAttendance(payload),
  });
};

export const useStudentAttendanceViewDetails = () => {
  return useMutation({
    mutationFn: (payload: any) => server.viewAttendanceDetailsStaffWise(payload),
  });
};

export const useStudentAttendanceDelete = () => {
  return useMutation({
    mutationFn: (payload: any) => server.deleteAttendance(payload),
  });
};

export const useStudentAttendanceDeleteRecordWise = () => {
  return useMutation({
    mutationFn: (payload: any) => server.deleteAttendanceRecordWise(payload),
  });
};
