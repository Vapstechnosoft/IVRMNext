import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getStudentAddressBook2InitialData,
    studentAddressBook2YearChange,
    studentAddressBook2SectionChange,
    getStudentAddressBook2Report
} from '@/server/admission/oldsharehost/reports/student_address_book_2';

export function useStudentAddressBook2InitialData() {
    return useQuery({
        queryKey: ['studentAddressBook2InitialData'],
        queryFn: () => getStudentAddressBook2InitialData(),
    });
}

export function useStudentAddressBook2YearChange() {
    return useMutation({
        mutationFn: (data: any) => studentAddressBook2YearChange(data),
    });
}

export function useStudentAddressBook2SectionChange() {
    return useMutation({
        mutationFn: (data: any) => studentAddressBook2SectionChange(data),
    });
}

export function useStudentAddressBook2Report() {
    return useMutation({
        mutationFn: (data: any) => getStudentAddressBook2Report(data),
    });
}
