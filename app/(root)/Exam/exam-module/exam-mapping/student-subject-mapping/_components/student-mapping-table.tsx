// app/exam/student-subject-mapping/_components/student-mapping-table.tsx
'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

interface StudentSubjectMapping {
    id: number;
    estsU_ElecetiveFlag?: boolean;
    estsU_ActiveFlg?: boolean;
    estsU_CreatedBy?: number;
    estsU_UpdatedBy?: number;
    createdDate?: string;
    updatedDate?: string;
    name?: string;
    abc?: boolean;
}

interface Student {
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_AdmNo: string;
    amaY_RollNo: number;
    sub_list: StudentSubjectMapping[];
    sub_list_view: StudentSubjectMapping[];
}

interface Payload {
    estsU_Id: number;
    mI_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    emG_Id: number;
    emE_Id: number;
    userId: number;
    left_Flag: boolean;
    deactive_Flag: boolean;
    get_list: Array<{
        amsT_Id: number;
        sub_list: StudentSubjectMapping[];
    }>;
    get_Removed_list: Array<{
        amsT_Id: number;
        sub_list: StudentSubjectMapping[];
    }>;
}

interface Props {
    students: Student[];
    subjects: Subject[];
    isloading?: boolean;
    onUpdateMapping: (payload: Payload) => Promise<void>;
    // Additional props for payload
    estsU_Id: number;
    mI_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    emG_Id: number;
    emE_Id: number;
    userId: number;
    left_Flag: boolean;
    deactive_Flag: boolean;
}

/* ================== MAIN COMPONENT ================== */
export default function StudentSubjectMappingTable({
    students,
    subjects,
    onUpdateMapping,
    isloading = false,
    estsU_Id,
    mI_Id,
    asmaY_Id,
    asmcL_Id,
    asmS_Id,
    emG_Id,
    emE_Id,
    userId,
    left_Flag,
    deactive_Flag
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [localStudents, setLocalStudents] = useState<Student[]>([]);
    const [getList, setGetList] = useState<Map<number, Set<number>>>(new Map());
    const [getRemovedList, setGetRemovedList] = useState<Map<number, Set<number>>>(new Map());

    // Use refs to track changes without re-rendering
    const getListRef = useRef<Map<number, Set<number>>>(new Map());
    const getRemovedListRef = useRef<Map<number, Set<number>>>(new Map());

    // Initialize local state from props
    useEffect(() => {
        if (students && students.length > 0) {
            setLocalStudents(students);

            // Initialize get_list from existing mappings where abc is true
            const initialGetList = new Map<number, Set<number>>();

            students.forEach((student) => {
                const activeSubjects = student.sub_list.filter((sub) => sub.abc).map((sub) => sub.id);

                if (activeSubjects.length > 0) {
                    initialGetList.set(student.amsT_Id, new Set(activeSubjects));
                }
            });

            setGetList(initialGetList);
            getListRef.current = new Map(initialGetList);

            // Initialize get_Removed_list as empty
            setGetRemovedList(new Map());
            getRemovedListRef.current = new Map();
        }
    }, [students]);

    /** 🔍 SEARCH FILTER */
    const filteredStudents = useMemo(() => {
        if (!searchTerm.trim()) return localStudents;

        const q = searchTerm.toLowerCase();
        return localStudents.filter(
            (s) => s.amsT_FirstName.toLowerCase().includes(q) || s.amsT_AdmNo.toLowerCase().includes(q) || String(s.amaY_RollNo).includes(q)
        );
    }, [localStudents, searchTerm]);

    /** Get current checked state for a student-subject */
    const getCurrentCheckedState = useCallback(
        (studentId: number, subjectId: number): boolean => {
            // First check get_Removed_list - if subject is in removed list, it's unchecked
            const inRemovedList = getRemovedListRef.current.get(studentId)?.has(subjectId) || false;
            if (inRemovedList) return false;

            // Then check get_list - if subject is in get list, it's checked
            const inGetList = getListRef.current.get(studentId)?.has(subjectId) || false;
            if (inGetList) return true;

            // Otherwise, check original state from student data
            const student = localStudents.find((s) => s.amsT_Id === studentId);
            if (!student) return false;

            const subject = student.sub_list.find((s) => s.id === subjectId);
            return subject?.abc || false;
        },
        [localStudents]
    );

    /** Handle individual checkbox change */
    const handleIndividualChange = useCallback(
        async (studentId: number, subjectId: number, checked: boolean) => {
            // Get original state from localStudents
            const student = localStudents.find((s) => s.amsT_Id === studentId);
            if (!student) return;

            const originalSubject = student.sub_list.find((s) => s.id === subjectId);
            const wasOriginallyChecked = originalSubject?.abc || false;

            if (checked) {
                // If we're checking the box
                if (!wasOriginallyChecked) {
                    // Add to get_list (new addition)
                    setGetList((prev) => {
                        const newMap = new Map(prev);
                        const studentSubjects = newMap.get(studentId) || new Set<number>();
                        studentSubjects.add(subjectId);
                        newMap.set(studentId, studentSubjects);
                        getListRef.current = newMap;
                        return newMap;
                    });

                    // Remove from get_Removed_list if it was there (undoing a removal)
                    setGetRemovedList((prev) => {
                        const newMap = new Map(prev);
                        const studentSubjects = newMap.get(studentId);
                        if (studentSubjects) {
                            studentSubjects.delete(subjectId);
                            if (studentSubjects.size === 0) {
                                newMap.delete(studentId);
                            } else {
                                newMap.set(studentId, studentSubjects);
                            }
                        }
                        getRemovedListRef.current = newMap;
                        return newMap;
                    });
                } else {
                    // If it was originally checked, we're just removing it from get_Removed_list (undoing removal)
                    setGetRemovedList((prev) => {
                        const newMap = new Map(prev);
                        const studentSubjects = newMap.get(studentId);
                        if (studentSubjects) {
                            studentSubjects.delete(subjectId);
                            if (studentSubjects.size === 0) {
                                newMap.delete(studentId);
                            } else {
                                newMap.set(studentId, studentSubjects);
                            }
                        }
                        getRemovedListRef.current = newMap;
                        return newMap;
                    });
                }
                sendUpdatePayload();
            } else {
                // If we're unchecking the box
                if (wasOriginallyChecked) {
                    // Add to get_Removed_list (removing an existing mapping)
                    setGetRemovedList((prev) => {
                        const newMap = new Map(prev);
                        const studentSubjects = newMap.get(studentId) || new Set<number>();
                        studentSubjects.add(subjectId);
                        newMap.set(studentId, studentSubjects);
                        getRemovedListRef.current = newMap;
                        return newMap;
                    });

                    // Remove from get_list if it was there (undoing an addition)
                    setGetList((prev) => {
                        const newMap = new Map(prev);
                        const studentSubjects = newMap.get(studentId);
                        if (studentSubjects) {
                            studentSubjects.delete(subjectId);
                            if (studentSubjects.size === 0) {
                                newMap.delete(studentId);
                            } else {
                                newMap.set(studentId, studentSubjects);
                            }
                        }
                        getListRef.current = newMap;
                        return newMap;
                    });
                } else {
                    // If it was originally unchecked, remove from get_list (undoing addition)
                    setGetList((prev) => {
                        const newMap = new Map(prev);
                        const studentSubjects = newMap.get(studentId);
                        if (studentSubjects) {
                            studentSubjects.delete(subjectId);
                            if (studentSubjects.size === 0) {
                                newMap.delete(studentId);
                            } else {
                                newMap.set(studentId, studentSubjects);
                            }
                        }
                        getListRef.current = newMap;
                        return newMap;
                    });
                }
            }
        },
        [localStudents]
    );

    /** Toggle all subjects for all filtered students */
    const toggleSubjectAll = useCallback(
        async (subjectId: number, checked: boolean) => {
            // Update each student in filteredStudents
            filteredStudents.forEach((student) => {
                handleIndividualChange(student.amsT_Id, subjectId, checked);
            });

            // Wait a bit for state updates to complete, then send payload
            setTimeout(() => {
                sendUpdatePayload();
            }, 100);
        },
        [filteredStudents, handleIndividualChange]
    );

    /** Create a subject mapping object */
    const createSubjectMapping = useCallback(
        (subjectId: number, isActive: boolean): StudentSubjectMapping => {
            const now = new Date().toISOString();
            const subject = subjects.find((s) => s.id === subjectId);

            return {
                id: subjectId,
                name: subject?.name || `Subject ${subjectId}`,
                estsU_ElecetiveFlag: true,
                estsU_ActiveFlg: isActive,
                estsU_CreatedBy: userId,
                estsU_UpdatedBy: userId,
                createdDate: now,
                updatedDate: now
            };
        },
        [subjects, userId]
    );

    /** Send update payload to API */
    const sendUpdatePayload = useCallback(async () => {
        try {
            // Convert Maps to arrays for payload using refs to ensure we have latest data
            const getListArray: Array<{ amsT_Id: number; sub_list: StudentSubjectMapping[] }> = [];
            const getRemovedListArray: Array<{ amsT_Id: number; sub_list: StudentSubjectMapping[] }> = [];
            for (const [studentId, subjectIds] of getListRef.current.entries()) {
                if (subjectIds && subjectIds.size > 0) {
                    const subList = Array.from(subjectIds).map((subjectId) => createSubjectMapping(subjectId, true));
                    getListArray.push({
                        amsT_Id: studentId,
                        sub_list: subList
                    });
                }
            }
            for (const [studentId, subjectIds] of getRemovedListRef.current.entries()) {
                if (subjectIds && subjectIds.size > 0) {
                    const subList = Array.from(subjectIds).map((subjectId) => createSubjectMapping(subjectId, false));
                    getRemovedListArray.push({
                        amsT_Id: studentId,
                        sub_list: subList
                    });
                }
            }
            const payload: Payload = {
                estsU_Id,
                mI_Id,
                asmaY_Id,
                asmcL_Id,
                asmS_Id,
                emG_Id,
                emE_Id,
                userId,
                left_Flag,
                deactive_Flag,
                get_list: getListArray,
                get_Removed_list: getRemovedListArray
            };

            // Send to parent
            if (onUpdateMapping) {
                await onUpdateMapping(payload);
            }
        } catch (error) {
            console.error('Error sending update payload:', error);
        }
    }, [
        createSubjectMapping,
        estsU_Id,
        mI_Id,
        asmaY_Id,
        asmcL_Id,
        asmS_Id,
        emG_Id,
        emE_Id,
        userId,
        left_Flag,
        deactive_Flag,
        onUpdateMapping
    ]);

    /** Check if all students have this subject checked */
    const isSubjectAllChecked = useCallback(
        (subjectId: number): boolean => {
            if (filteredStudents.length === 0) return false;

            return filteredStudents.every((student) => getCurrentCheckedState(student.amsT_Id, subjectId));
        },
        [filteredStudents, getCurrentCheckedState]
    );

    /** Save all changes */
    const handleSaveAll = useCallback(async () => {
        await sendUpdatePayload();
    }, [sendUpdatePayload]);

    /** Update UI state for immediate feedback */
    useEffect(() => {
        // This effect ensures the UI updates when getList or getRemovedList change
        // The actual state is tracked in the refs for payload
    }, [getList, getRemovedList]);

    if (isloading) {
        return (
            <div className='flex items-center justify-center p-8'>
                <div className='text-center'>
                    <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-[hsl(277_90%_52%)] border-b-2'>
                        Loading student-subject mappings...
                    </div>
                </div>
            </div>
        );
    }

    if (!subjects || subjects.length === 0) {
        return <div className='p-8 text-center text-gray-500'>No subjects available</div>;
    }

    if (!localStudents || localStudents.length === 0) {
        return <div className='p-8 text-center text-gray-500'>No students available</div>;
    }

    return (
        <div className='space-y-4'>
            {/* 🔎 SEARCH AND ACTIONS */}
            <div className='flex items-center justify-between border-b bg-gray-50 p-3'>
                <div>
                    <span className='font-medium text-gray-700'>
                        Total Students: {localStudents.length} | Filtered: {filteredStudents.length}
                    </span>
                </div>

                <div className='flex items-center gap-3'>
                    <Input
                        placeholder='Search student by name, admission no, or roll no...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-80'
                    />
                </div>
            </div>

            <div className='overflow-x-auto rounded border bg-white shadow-sm'>
                <table className='min-w-full border-collapse border border-gray-300'>
                    <thead>
                        <tr>
                            <TableHeaderCell rowSpan={2}>Sl No</TableHeaderCell>
                            <TableHeaderCell rowSpan={2}>Student Details</TableHeaderCell>

                            {subjects.map((sub) => (
                                <TableHeaderCell key={`subject-header-${sub.id}`}>
                                    <div className='flex flex-col items-center px-2'>
                                        <span className='mb-2 font-semibold text-sm'>{sub.name}</span>
                                        {/* TOGGLE ALL Column for this Subject */}
                                        <Checkbox
                                            checked={isSubjectAllChecked(sub.id)}
                                            onCheckedChange={(c) => toggleSubjectAll(sub.id, !!c)}
                                            className='h-5 w-5'
                                        />
                                    </div>
                                </TableHeaderCell>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <TableCell colSpan={subjects.length + 2} className='py-8 text-center text-gray-500'>
                                    No students found matching your search criteria
                                </TableCell>
                            </tr>
                        ) : (
                            filteredStudents.map((student, index) => (
                                <tr
                                    key={`student-${student.amsT_Id}`}
                                    className={'bg-white transition-colors duration-200 hover:bg-gray-50'}>
                                    <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                    <TableCell>
                                        <div className='font-semibold text-gray-800'>{student.amsT_FirstName}</div>
                                        <div className='space-y-0.5 text-gray-600 text-xs'>
                                            <div>Admission No: {student.amsT_AdmNo}</div>
                                            <div>Roll No: {student.amaY_RollNo}</div>
                                            <div className='text-[10px] text-gray-400'>ID: {student.amsT_Id}</div>
                                        </div>
                                    </TableCell>

                                    {subjects.map((subject) => (
                                        <TableCell key={`student-${student.amsT_Id}-subject-${subject.id}`} className='text-center'>
                                            <div className='flex justify-center'>
                                                <Checkbox
                                                    checked={getCurrentCheckedState(student.amsT_Id, subject.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleIndividualChange(student.amsT_Id, subject.id, !!checked)
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
