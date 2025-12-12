// app/exam/student-subject-mapping/_components/student-mapping-table.tsx
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type React from 'react';
import { useMemo, useState } from 'react';
import { forwardRef } from 'react';

/* Reusable Cells */
const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            'whitespace-nowrap border-gray-300 border-t border-r border-b p-2 align-middle text-[#0C0A09] text-[14px]',
            className
        )}
        {...props}
    />
));
TableCell.displayName = 'TableCell';

const TableHeaderCell = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            'border border-black-300 bg-[hsl(277_90%_52%)] p-2 text-center align-middle font-medium text-sm text-white',
            className
        )}
        {...props}
    />
));
TableHeaderCell.displayName = 'TableHeaderCell';

/* ================== TYPES ================== */
interface Subject {
    id: number;
    name: string;
}

interface Student {
    amsT_Id?: number;
    studentId?: number;
    amsT_FirstName?: string;
    name?: string;
    amsT_AdmNo?: string;
    admNo?: string;
    amaY_RollNo?: number;
    rollNo?: number;
    sub_list?: { id: number; name: string; abc: boolean }[];
    subjects?: { id: number; name: string; abc: boolean }[];
}

interface Props {
    students: Student[];
    subjects: Subject[];
    isloading?: boolean;
    onUpdateMapping: (studentId: number, subjectId: number, checked: boolean) => void;
}

/* ================== MAIN COMPONENT ================== */
export default function StudentSubjectMappingTable({ students, subjects, onUpdateMapping, isloading = false }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    // Normalize student data to handle both old and new structures
    const normalizedStudents = useMemo(() => {
        return students.map((s) => ({
            id: s.amsT_Id ?? s.studentId ?? 0,
            name: s.amsT_FirstName ?? s.name ?? '',
            admNo: s.amsT_AdmNo ?? s.admNo ?? '',
            rollNo: s.amaY_RollNo ?? s.rollNo ?? 0,
            subList: s.sub_list ?? s.subjects ?? []
        }));
    }, [students]);

    /** 🔍 SEARCH FILTER */
    const filteredStudents = useMemo(() => {
        if (!searchTerm) return normalizedStudents;
        const q = searchTerm.toLowerCase();
        return normalizedStudents.filter(
            (s) => s.name.toLowerCase().includes(q) || s.admNo.toLowerCase().includes(q) || String(s.rollNo).includes(q)
        );
    }, [normalizedStudents, searchTerm]);

    /**  Toggle All for one subject */
    const toggleSubjectAll = (subjectId: number, checked: boolean) => {
        filteredStudents.forEach((student) => {
            onUpdateMapping(student.id, subjectId, checked);
        });
    };

    /**  Single Student → Single Subject update */
    const handleIndividualChange = (studentId: number, subjectId: number, checked: boolean) => {
        onUpdateMapping(studentId, subjectId, checked);
    };

    /**  Check if all students have this subject checked */
    const isSubjectAllChecked = (subjectId: number): boolean => {
        if (filteredStudents.length === 0) return false;
        return filteredStudents.every((student) => {
            const matched = student.subList.find((x) => x.id === subjectId);
            return matched?.abc ?? false;
        });
    };

    if (isloading) return <div className='p-8 text-center'>Loading...</div>;

    if (!subjects || subjects.length === 0) {
        return <div className='p-8 text-center text-gray-500'>No subjects available</div>;
    }

    return (
        <div className='overflow-x-auto rounded border bg-white shadow-sm'>
            {/* 🔎 SEARCH */}
            <div className='flex justify-end border-b bg-gray-50 p-3'>
                <Input
                    placeholder='Search student...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-60'
                />
            </div>

            <table className='min-w-full border-collapse border border-gray-300'>
                <thead>
                    <tr>
                        <TableHeaderCell rowSpan={2}>Sl No</TableHeaderCell>
                        <TableHeaderCell rowSpan={2}>Student</TableHeaderCell>

                        {subjects.map((sub) => (
                            <TableHeaderCell key={`subject-header-${sub.id}`}>
                                <div className='flex flex-col items-center'>
                                    <span className='mb-2'>{sub.name}</span>

                                    {/* TOGGLE ALL Column for this Subject */}
                                    <Checkbox
                                        checked={isSubjectAllChecked(sub.id)}
                                        onCheckedChange={(c) => toggleSubjectAll(sub.id, !!c)}
                                    />
                                </div>
                            </TableHeaderCell>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {filteredStudents.length === 0 ? (
                        <tr>
                            <TableCell colSpan={subjects.length + 2} className='py-6 text-center text-gray-500'>
                                No Records Found
                            </TableCell>
                        </tr>
                    ) : (
                        filteredStudents.map((s, i) => (
                            <tr key={`student-${s.id}`} className={'bg-white transition-colors duration-200 hover:bg-accent/90'}>
                                <TableCell className='text-center'>{i + 1}</TableCell>
                                <TableCell>
                                    <div className='font-semibold'>{s.name}</div>
                                    <div className='text-gray-600 text-xs'>
                                        Adm: {s.admNo} | Roll: {s.rollNo}
                                    </div>
                                </TableCell>

                                {subjects.map((sub) => {
                                    const matched = s.subList.find((x) => x.id === sub.id);
                                    return (
                                        <TableCell key={`student-${s.id}-subject-${sub.id}`} className='text-center'>
                                            <Checkbox
                                                checked={matched?.abc ?? false}
                                                onCheckedChange={(c) => handleIndividualChange(s.id, sub.id, !!c)}
                                            />
                                        </TableCell>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
