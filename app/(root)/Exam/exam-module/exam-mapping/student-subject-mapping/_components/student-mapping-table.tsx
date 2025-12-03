// app/exam/student-subject-mapping/_components/StudentSubjectMappingTable.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

/* -------------------------
   Reusable Table Cells
   ------------------------- */
const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <td
            ref={ref}
            className={cn(
                'p-2 align-middle border-t border-b border-gray-300 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] whitespace-nowrap text-[#0C0A09] text-[14px]',
                className
            )}
            {...props}
        />
    )
);
TableCell.displayName = 'TableCell';

const TableHeaderCell = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <th
            ref={ref}
            className={cn(
                'p-2 align-middle text-center border border-gray-300 bg-[hsl(277_90%_52%)] text-white text-sm font-medium',
                '[&:has([role=checkbox])]:pr-0',
                className
            )}
            {...props}
        />
    )
);
TableHeaderCell.displayName = 'TableHeaderCell';

/* -------------------------
   Types
   ------------------------- */
interface Student {
    studentID: number;
    name: string;
    admNo: string;
    rollNo: number;
    [key: string]: any;
}

interface Subject {
    subjectId: number;
    subjectName: string;
}

interface Props {
    students: Student[];
    subjects: Subject[];
    isloading?: boolean;
    onUpdateMapping: (studentID: number, subjectName: string, checked: boolean) => void;
}

/* -------------------------
   Component
   ------------------------- */
export default function StudentSubjectMappingTable({
    students,
    subjects,
    onUpdateMapping,
    isloading = false,
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [headerCheckState, setHeaderCheckState] = useState<Record<string, boolean | 'indeterminate'>>({});

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        const lower = searchTerm.toLowerCase();
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(lower) ||
                s.admNo.toLowerCase().includes(lower) ||
                String(s.rollNo).includes(searchTerm)
        );
    }, [students, searchTerm]);

    // Update header checkbox states whenever data or filtered students change
    useEffect(() => {
        const newState: Record<string, boolean | 'indeterminate'> = {};
        subjects.forEach((sub) => {
            const values = filteredStudents.map((s) => !!s[sub.subjectName]);
            const allTrue = values.every((v) => v === true);
            const someTrue = values.some((v) => v === true);
            newState[sub.subjectName] = allTrue ? true : someTrue ? 'indeterminate' : false;
        });
        setHeaderCheckState(newState);
    }, [filteredStudents, subjects]);

    const toggleSubjectAll = (subjectName: string, checked: boolean) => {
        filteredStudents.forEach((student) => {
            onUpdateMapping(student.studentID, subjectName, checked);
        });
    };

    const handleIndividualChange = (studentID: number, subjectName: string, checked: boolean) => {
        onUpdateMapping(studentID, subjectName, checked);
        // No need to manually update header state — useEffect will handle it
    };

    if (isloading) {
        return <div className="p-8 text-center text-gray-600">Loading students...</div>;
    }

    return (
        <div className="overflow-x-auto bg-white border rounded shadow-sm">
            {/* Search Bar */}
            <div className="px-4 py-3 border-b bg-gray-50 flex justify-end">
                <Input
                    placeholder="search here..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <table className="min-w-full table-fixed border-collapse border border-gray-300 [&_th]:border [&_td]:border [&_td]:border-gray-300">
                <thead>
                    <tr>
                        <TableHeaderCell rowSpan={2}>Sl No.</TableHeaderCell>
                        <TableHeaderCell rowSpan={2}>
                            <Checkbox className="border-white data-[state=checked]:bg-white data-[state=checked]:text-purple-700" />
                        </TableHeaderCell>
                        <TableHeaderCell rowSpan={2} className="text-left">
                            Student List
                        </TableHeaderCell>
                        {subjects.map((sub) => (
                            <TableHeaderCell key={sub.subjectId} className="whitespace-nowrap">
                                <div className="flex flex-col items-center gap-1">
                                    <span>
                                        {sub.subjectName.charAt(0).toUpperCase() +
                                            sub.subjectName.slice(1).replace('-iit', ' IIT')}
                                    </span>
                                    <Checkbox
                                        checked={headerCheckState[sub.subjectName] === true}
                                        //indeterminate={headerCheckState[sub.subjectName] === 'indeterminate'}
                                        onCheckedChange={(checked) => toggleSubjectAll(sub.subjectName, !!checked)}
                                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-purple-700"
                                    />
                                </div>
                            </TableHeaderCell>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.length === 0 ? (
                        <tr>
                            <TableCell colSpan={subjects.length + 3} className="text-center py-12 text-gray-500">
                                No students found
                            </TableCell>
                        </tr>
                    ) : (
                        filteredStudents.map((student, idx) => (
                            <tr
                                key={student.studentID}
                                className={cn(
                                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                                    'hover:bg-blue-50 border-t border-b border-gray-300'
                                )}
                            >
                                <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                                <TableCell className="text-center">
                                    <Checkbox className="data-[state=checked]:bg-blue-600" />
                                </TableCell>
                                <TableCell className="text-left">
                                    <div className="font-medium text-[#0C0A09]">{student.name}</div>
                                    <div className="text-xs text-gray-500">
                                        Adm.No: {student.admNo} &nbsp;&nbsp; Roll.No: {student.rollNo}
                                    </div>
                                </TableCell>
                                {subjects.map((sub) => (
                                    <TableCell key={sub.subjectId} className="text-center">
                                        <Checkbox
                                            checked={!!student[sub.subjectName]}
                                            onCheckedChange={(checked) =>
                                                handleIndividualChange(student.studentID, sub.subjectName, !!checked)
                                            }
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </TableCell>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}