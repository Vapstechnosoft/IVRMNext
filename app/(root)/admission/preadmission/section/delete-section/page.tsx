'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { masterDeleteSectionSchema } from '@/schemas/admission/preadmission/section';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { masterDeleteSectionColumns } from './_components/columns';

type FormFields = z.infer<typeof masterDeleteSectionSchema>;

interface Student {
    studentId: number;
    siNo: number;
    studentName: string;
    className: string;
    section: string;
    admNo: string;
    addCode: string;
}

interface DropdownOption {
    value: string;
    label: string;
}

export default function MasterDeleteSectionPage() {
    const [academicYear, setAcademicYear] = useState<number | null>(null);
    const [classId, setClassId] = useState<string>('');
    const [sectionId, setSectionId] = useState<string>('');
    const [showTable, setShowTable] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterDeleteSectionSchema),
        defaultValues: {
            asmaY_Id: 0,
            classCategory: '',
            section: '',
            students: []
        },
        mode: 'onChange'
    });

    const academicYearData = {
        data: [
            { asmaY_Id: 1, asmaY_Year: '2024-2025' },
            { asmaY_Id: 2, asmaY_Year: '2025-2026' }
        ]
    };

    const masterClass = {
        data: [
            { asmcL_ID: 1, asmcL_ClassName: 'Class 1', addCode: 'C1' },
            { asmcL_ID: 2, asmcL_ClassName: 'Class 2', addCode: 'C2' },
            { asmcL_ID: 3, asmcL_ClassName: 'Class 3', addCode: 'C3' }
        ]
    };

    const sectionOptions: DropdownOption[] = [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' }
    ];

    const mockStudentData: Student[] = [
        {
            studentId: 1,
            siNo: 1,
            studentName: 'John Doe',
            className: 'Class 1',
            section: 'A',
            admNo: 'ADM001',
            addCode: 'C1'
        },
        {
            studentId: 2,
            siNo: 2,
            studentName: 'Jane Smith',
            className: 'Class 1',
            section: 'A',
            admNo: 'ADM002',
            addCode: 'C1'
        },
        {
            studentId: 3,
            siNo: 3,
            studentName: 'Mike Johnson',
            className: 'Class 1',
            section: 'A',
            admNo: 'ADM003',
            addCode: 'C1'
        },
        {
            studentId: 4,
            siNo: 4,
            studentName: 'Sarah Williams',
            className: 'Class 1',
            section: 'A',
            admNo: 'ADM004',
            addCode: 'C1'
        }
    ];

    const [classCategoryOptions, setClassCategoryOptions] = useState<DropdownOption[]>([]);

    useEffect(() => {
        if (masterClass?.data && Array.isArray(masterClass.data)) {
            const opts = masterClass.data.map((c: any) => ({
                value: c.asmcL_ID.toString(),
                label: c.asmcL_ClassName
            }));
            setClassCategoryOptions(opts);
        } else {
            setClassCategoryOptions([]);
        }
    }, []);

    useEffect(() => {
        const studentData = students.map((student) => ({
            studentId: student.studentId
        }));
        setValue('students', studentData, { shouldValidate: true });
    }, [students, setValue]);

    useEffect(() => {
        if (students.length > 0) {
            setSelectAll(selectedStudents.size === students.length);
        }
    }, [selectedStudents, students]);

    const handleAcademicYearChange = (value: string) => {
        const numValue = Number(value);
        setAcademicYear(numValue);
        setValue('asmaY_Id', numValue);

        setClassId('');
        setSectionId('');
        setShowTable(false);
        setValue('classCategory', '');
        setValue('section', '');
        setStudents([]);
        setSelectedStudents(new Set());
        setSelectAll(false);
    };

    const handleClassChange = (value: string) => {
        setClassId(value);
        setValue('classCategory', value);

        setSectionId('');
        setShowTable(false);
        setValue('section', '');
        setStudents([]);
        setSelectedStudents(new Set());
        setSelectAll(false);
    };

    const handleSectionChange = (value: string) => {
        setSectionId(value);
        setValue('section', value);

        const selectedClass = masterClass.data.find((c) => c.asmcL_ID.toString() === classId);

        const studentsWithClassData = mockStudentData.map((student) => ({
            ...student,
            className: selectedClass?.asmcL_ClassName || student.className,
            section: value,
            addCode: selectedClass?.addCode || student.addCode
        }));

        setStudents(studentsWithClassData);
        setShowTable(true);
        setSelectedStudents(new Set());
        setSelectAll(false);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            const allIds = new Set(students.map((s) => s.studentId));
            setSelectedStudents(allIds);
        } else {
            setSelectedStudents(new Set());
        }
    };

    const handleSelectStudent = (studentId: number, checked: boolean) => {
        const newSelected = new Set(selectedStudents);
        if (checked) {
            newSelected.add(studentId);
        } else {
            newSelected.delete(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const handleDelete = async () => {
        if (selectedStudents.size === 0) {
            toast.error('Please select at least one student to delete');
            return;
        }

        try {
            const selectedClass = masterClass.data.find((c) => c.asmcL_ID.toString() === classId);

            const studentsToDelete = Array.from(selectedStudents).map((id) => {
                const student = students.find((s) => s.studentId === id);
                return {
                    studentId: id,
                    studentName: student?.studentName,
                    admNo: student?.admNo
                };
            });

            const payload = {
                academicYear: academicYear,
                classId: classId,
                className: selectedClass?.asmcL_ClassName,
                addCode: selectedClass?.addCode,
                section: sectionId,
                studentsToDelete: studentsToDelete
            };

            console.log('Delete Payload:', payload);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast.success(`Successfully deleted ${selectedStudents.size} student(s) from section`);

            const remainingStudents = students.filter((s) => !selectedStudents.has(s.studentId));
            setStudents(remainingStudents);
            setSelectedStudents(new Set());
            setSelectAll(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete students');
        }
    };

    const handleReset = () => {
        reset({
            asmaY_Id: 0,
            classCategory: '',
            section: '',
            students: []
        });
        setAcademicYear(null);
        setClassId('');
        setSectionId('');
        setShowTable(false);
        setStudents([]);
        setSelectedStudents(new Set());
        setSelectAll(false);
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container space-y-4 p-4'>
                <div className='space-y-4'>
                    <CollapsibleSection
                        title='Delete Section'
                        description='Select academic year, class, and section to delete students'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                                <div className='group flex flex-col gap-1.5'>
                                    <Label htmlFor='asmaY_Id'>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmaY_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={handleAcademicYearChange}
                                                value={field.value > 0 ? field.value.toString() : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYearData?.data?.map((item: any) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                                </div>

                                <div className='group flex flex-col gap-1.5'>
                                    <Label htmlFor='classCategory'>
                                        Class <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='classCategory'
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={handleClassChange} value={field.value} disabled={!academicYear}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classCategoryOptions.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.classCategory && <FormError>{errors.classCategory.message}</FormError>}
                                </div>

                                <div className='group flex flex-col gap-1.5'>
                                    <Label htmlFor='section'>
                                        Section <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='section'
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={handleSectionChange} value={field.value} disabled={!classId}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sectionOptions.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.section && <FormError>{errors.section.message}</FormError>}
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {showTable && (
                        <>
                            <CollapsibleSection
                                title='Student List'
                                description='Select students and delete them from the section'
                                defaultOpen={true}
                                variant='default'
                                size='lg'
                                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                <div className='space-y-4'>
                                    <div className='overflow-x-auto rounded-lg border'>
                                        <table className='w-full'>
                                            <thead className='border-b'>
                                                <tr>
                                                    <th className='p-3 text-left font-semibold'>SI. No</th>
                                                    <th className='w-12 p-3 text-left font-semibold'>
                                                        <Checkbox
                                                            checked={selectAll}
                                                            onCheckedChange={handleSelectAll}
                                                            className='h-4 w-4 cursor-pointer rounded border-gray-300'
                                                        />
                                                    </th>
                                                    <th className='p-3 text-left font-semibold'>Student Name</th>
                                                    <th className='p-3 text-left font-semibold'>Class</th>
                                                    <th className='p-3 text-left font-semibold'>Section</th>
                                                    <th className='p-3 text-left font-semibold'>Adm. No</th>
                                                </tr>
                                            </thead>
                                            <tbody className='divide-y'>
                                                {students.map((student) => (
                                                    <tr key={student.studentId} className='hover:bg-gray-50'>
                                                        <td className='p-3'>{student.siNo}</td>
                                                        <td className='p-3'>
                                                            <Checkbox
                                                                checked={selectedStudents.has(student.studentId)}
                                                                onCheckedChange={(checked) =>
                                                                    handleSelectStudent(student.studentId, checked as boolean)
                                                                }
                                                                className='h-4 w-4 cursor-pointer rounded border-gray-300'
                                                            />
                                                        </td>
                                                        <td className='p-3 font-medium'>{student.studentName}</td>
                                                        <td className='p-3'>{student.className}</td>
                                                        <td className='p-3'>{student.section}</td>
                                                        <td className='p-3'>{student.admNo}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {errors.students && <FormError>{errors.students.message}</FormError>}

                                    <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={handleReset}
                                            disabled={isSubmitting}
                                            className='w-fit transition-all duration-200 hover:scale-105'>
                                            Reset
                                        </Button>
                                        <Button
                                            type='button'
                                            variant='destructive'
                                            onClick={handleDelete}
                                            disabled={selectedStudents.size === 0 || isSubmitting}
                                            className='w-fit transition-all duration-200 hover:scale-105'>
                                            <div className='flex items-center'>
                                                <Trash2 className='mr-2 h-4 w-4' />
                                                {isSubmitting ? 'Deleting...' : 'Delete'}
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            </CollapsibleSection>
                            <CollapsibleSection
                                title='Section Allotted Student List'
                                defaultOpen={true}
                                variant='default'
                                size='lg'
                                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                <div className='space-y-4'>
                                    <GenericDataTable<Student>
                                        data={students}
                                        columns={masterDeleteSectionColumns}
                                        isLoading={false}
                                        error={null}
                                        showViewOptions={false}
                                        columnPinning={{ left: ['siNo'], right: ['rollNo'] }}
                                        loadingMessage='Loading students...'
                                        noDataTitle='No Students Found'
                                        noDataDescription='No students found for the selected class and section'
                                        errorTitle='Error Loading Students'
                                    />
                                </div>
                            </CollapsibleSection>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
