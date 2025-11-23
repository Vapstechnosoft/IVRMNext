'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { masterNewSectionSchema } from '@/schemas/admission/preadmission/section';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { masterNewSectionColumns } from './_components/columns';

type FormFields = z.infer<typeof masterNewSectionSchema>;

interface Student {
    studentId: number;
    siNo: number;
    studentName: string;
    admNo: string;
}

interface DropdownOption {
    value: string;
    label: string;
}

export default function MasterNewSectionPage() {
    const [leftStudents, setLeftStudents] = useState<Student[]>([]);
    const [rightStudents, setRightStudents] = useState<Student[]>([]);
    const [leftSelectedStudents, setLeftSelectedStudents] = useState<Set<number>>(new Set());
    const [rightSelectedStudents, setRightSelectedStudents] = useState<Set<number>>(new Set());
    const [leftSelectAll, setLeftSelectAll] = useState(false);
    const [rightSelectAll, setRightSelectAll] = useState(false);
    const [showTables, setShowTables] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterNewSectionSchema),
        defaultValues: {
            leftAcademicYear: 0,
            leftClassAdmitted: '',
            rightAcademicYear: 0,
            rightClass: '',
            rightSection: ''
        },
        mode: 'onChange'
    });

    const leftAcademicYear = watch('leftAcademicYear');
    const leftClassAdmitted = watch('leftClassAdmitted');
    const rightClass = watch('rightClass');
    const rightSection = watch('rightSection');

    const academicYearData = [
        { asmaY_Id: 1, asmaY_Year: '2024-2025' },
        { asmaY_Id: 2, asmaY_Year: '2025-2026' }
    ];

    const masterClass = [
        { asmcL_ID: 1, asmcL_ClassName: 'Class 1' },
        { asmcL_ID: 2, asmcL_ClassName: 'Class 2' },
        { asmcL_ID: 3, asmcL_ClassName: 'Class 3' }
    ];

    const sectionOptions: DropdownOption[] = [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' }
    ];

    const mockLeftStudentData: Student[] = [
        { studentId: 1, siNo: 1, studentName: 'John Doe', admNo: 'ADM001' },
        { studentId: 2, siNo: 2, studentName: 'Jane Smith', admNo: 'ADM002' },
        { studentId: 3, siNo: 3, studentName: 'Mike Johnson', admNo: 'ADM003' },
        { studentId: 4, siNo: 4, studentName: 'Sarah Williams', admNo: 'ADM004' },
        { studentId: 5, siNo: 5, studentName: 'David Brown', admNo: 'ADM005' },
        { studentId: 6, siNo: 6, studentName: 'Emily Davis', admNo: 'ADM006' }
    ];

    const mockRightStudentData: Record<string, Student[]> = {
        A: [
            { studentId: 101, siNo: 1, studentName: 'Alice Cooper', admNo: 'ADM101' },
            { studentId: 102, siNo: 2, studentName: 'Bob Martin', admNo: 'ADM102' }
        ],
        B: [
            {
                studentId: 103,
                siNo: 1,
                studentName: 'Charlie Wilson',
                admNo: 'ADM103'
            }
        ],
        C: [],
        D: [
            { studentId: 104, siNo: 1, studentName: 'Diana Ross', admNo: 'ADM104' },
            { studentId: 105, siNo: 2, studentName: 'Edward King', admNo: 'ADM105' },
            { studentId: 106, siNo: 3, studentName: 'Fiona Apple', admNo: 'ADM106' }
        ]
    };

    const recalculateSiNo = (students: Student[]): Student[] => {
        return students.map((student, index) => ({
            ...student,
            siNo: index + 1
        }));
    };

    useEffect(() => {
        if (leftAcademicYear > 0 && leftClassAdmitted) {
            setLeftStudents(recalculateSiNo(mockLeftStudentData));
        } else {
            setLeftStudents([]);
        }
        setLeftSelectedStudents(new Set());
        setLeftSelectAll(false);
    }, [leftAcademicYear, leftClassAdmitted]);

    useEffect(() => {
        const leftReady = leftAcademicYear > 0 && leftClassAdmitted;
        const rightReady = leftAcademicYear > 0 && rightClass && rightSection;

        if (leftReady || rightReady) {
            setShowTables(true);
        } else {
            setShowTables(false);
        }
    }, [leftAcademicYear, leftClassAdmitted, rightClass, rightSection]);

    useEffect(() => {
        if (rightSection && rightClass && leftAcademicYear > 0) {
            const sectionStudents = mockRightStudentData[rightSection] || [];
            setRightStudents(recalculateSiNo(sectionStudents));
        } else {
            setRightStudents([]);
        }
        setRightSelectedStudents(new Set());
        setRightSelectAll(false);
    }, [rightSection, rightClass, leftAcademicYear]);

    useEffect(() => {
        setLeftSelectAll(leftStudents.length > 0 && leftSelectedStudents.size === leftStudents.length);
    }, [leftSelectedStudents, leftStudents]);

    useEffect(() => {
        setRightSelectAll(rightStudents.length > 0 && rightSelectedStudents.size === rightStudents.length);
    }, [rightSelectedStudents, rightStudents]);

    const handleLeftAcademicYearChange = (value: string) => {
        const numValue = Number(value);
        setValue('leftAcademicYear', numValue);
        setValue('rightAcademicYear', numValue);
        setValue('leftClassAdmitted', '');
        setValue('rightClass', '');
        setValue('rightSection', '');
        setLeftStudents([]);
        setRightStudents([]);
        setShowTables(false);
    };

    const handleLeftClassChange = (value: string) => {
        setValue('leftClassAdmitted', value);
        setValue('rightClass', value);
        setValue('rightSection', '');
        setRightStudents([]);
        setRightSelectedStudents(new Set());
        setRightSelectAll(false);
    };

    const handleRightClassChange = (value: string) => {
        setValue('rightClass', value);
        setValue('rightSection', '');
        setRightStudents([]);
        setRightSelectedStudents(new Set());
        setRightSelectAll(false);
    };

    const handleRightSectionChange = (value: string) => {
        setValue('rightSection', value);
    };

    const handleLeftSelectAll = (checked: boolean) => {
        setLeftSelectAll(checked);
        if (checked) {
            setLeftSelectedStudents(new Set(leftStudents.map((s) => s.studentId)));
        } else {
            setLeftSelectedStudents(new Set());
        }
    };

    const handleRightSelectAll = (checked: boolean) => {
        setRightSelectAll(checked);
        if (checked) {
            setRightSelectedStudents(new Set(rightStudents.map((s) => s.studentId)));
        } else {
            setRightSelectedStudents(new Set());
        }
    };

    const handleLeftSelectStudent = (studentId: number, checked: boolean) => {
        const newSelected = new Set(leftSelectedStudents);
        if (checked) {
            newSelected.add(studentId);
        } else {
            newSelected.delete(studentId);
        }
        setLeftSelectedStudents(newSelected);
    };

    const handleRightSelectStudent = (studentId: number, checked: boolean) => {
        const newSelected = new Set(rightSelectedStudents);
        if (checked) {
            newSelected.add(studentId);
        } else {
            newSelected.delete(studentId);
        }
        setRightSelectedStudents(newSelected);
    };

    const moveToRight = () => {
        if (leftSelectedStudents.size === 0) {
            toast.error('Please select students to move');
            return;
        }

        const studentsToMove = leftStudents.filter((s) => leftSelectedStudents.has(s.studentId));
        const remainingLeft = leftStudents.filter((s) => !leftSelectedStudents.has(s.studentId));

        setLeftStudents(recalculateSiNo(remainingLeft));
        setRightStudents(recalculateSiNo([...rightStudents, ...studentsToMove]));
        setLeftSelectedStudents(new Set());

        toast.success(`Moved ${studentsToMove.length} student(s) to destination`);
    };

    const moveToLeft = () => {
        if (rightSelectedStudents.size === 0) {
            toast.error('Please select students to move');
            return;
        }

        const studentsToMove = rightStudents.filter((s) => rightSelectedStudents.has(s.studentId));
        const remainingRight = rightStudents.filter((s) => !rightSelectedStudents.has(s.studentId));

        setLeftStudents(recalculateSiNo([...leftStudents, ...studentsToMove]));
        setRightStudents(recalculateSiNo(remainingRight));
        setRightSelectedStudents(new Set());

        toast.success(`Moved ${studentsToMove.length} student(s) to source`);
    };

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                leftAcademicYear: data.leftAcademicYear,
                leftClassAdmitted: data.leftClassAdmitted,
                rightAcademicYear: data.rightAcademicYear,
                rightClass: data.rightClass,
                rightSection: data.rightSection,
                leftStudents: leftStudents,
                rightStudents: rightStudents
            };

            console.log('Payload:', payload);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Section transfer completed successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to transfer students');
        }
    };

    const handleReset = () => {
        reset({
            leftAcademicYear: 0,
            leftClassAdmitted: '',
            rightAcademicYear: 0,
            rightClass: '',
            rightSection: ''
        });
        setLeftStudents([]);
        setRightStudents([]);
        setLeftSelectedStudents(new Set());
        setRightSelectedStudents(new Set());
        setLeftSelectAll(false);
        setRightSelectAll(false);
        setShowTables(false);
    };

    const getAcademicYearDisplay = (id: number) => {
        const year = academicYearData.find((y) => y.asmaY_Id === id);
        return year?.asmaY_Year || '';
    };

    const getClassDisplay = (id: string) => {
        const cls = masterClass.find((c) => c.asmcL_ID.toString() === id);
        return cls?.asmcL_ClassName || '';
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container space-y-4 p-4'>
                <CollapsibleSection
                    title='New Section'
                    description='Select criteria and transfer students between sections'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                            <div className='space-y-4 rounded-lg border p-4'>
                                <div className='space-y-4'>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label htmlFor='leftAcademicYear'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='leftAcademicYear'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={handleLeftAcademicYearChange}
                                                    value={field.value > 0 ? field.value.toString() : ''}>
                                                    <SelectTrigger className='w-full bg-white'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYearData.map((item) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.leftAcademicYear && <FormError>{errors.leftAcademicYear.message}</FormError>}
                                    </div>

                                    <div className='flex flex-col gap-1.5'>
                                        <Label htmlFor='leftClassAdmitted'>
                                            Class Admitted <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='leftClassAdmitted'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={handleLeftClassChange}
                                                    value={field.value}
                                                    disabled={!leftAcademicYear || leftAcademicYear === 0}>
                                                    <SelectTrigger className='w-full bg-white'>
                                                        <SelectValue placeholder='Select Class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {masterClass.map((item) => (
                                                            <SelectItem key={item.asmcL_ID} value={item.asmcL_ID.toString()}>
                                                                {item.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.leftClassAdmitted && <FormError>{errors.leftClassAdmitted.message}</FormError>}
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-4 rounded-lg border p-4'>
                                <div className='space-y-4'>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label htmlFor='rightAcademicYear'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='rightAcademicYear'
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value > 0 ? field.value.toString() : ''} disabled>
                                                    <SelectTrigger className='w-full cursor-not-allowed bg-gray-100'>
                                                        <SelectValue placeholder='Select Academic Year first'>
                                                            {field.value > 0
                                                                ? getAcademicYearDisplay(field.value)
                                                                : 'Select Academic Year first'}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='flex flex-col gap-1.5'>
                                            <Label htmlFor='rightClass'>
                                                Class <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='rightClass'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value}
                                                        disabled={!!leftClassAdmitted}
                                                        onValueChange={handleRightClassChange}>
                                                        <SelectTrigger
                                                            className={`w-full ${
                                                                leftClassAdmitted ? 'cursor-not-allowed bg-gray-100' : 'bg-white'
                                                            }`}>
                                                            <SelectValue
                                                                placeholder={
                                                                    leftClassAdmitted ? 'Auto-filled from source' : 'Select Class'
                                                                }>
                                                                {field.value
                                                                    ? getClassDisplay(field.value)
                                                                    : leftClassAdmitted
                                                                      ? 'Auto-filled from source'
                                                                      : 'Select Class'}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        {!leftClassAdmitted && (
                                                            <SelectContent>
                                                                {masterClass.map((item) => (
                                                                    <SelectItem key={item.asmcL_ID} value={item.asmcL_ID.toString()}>
                                                                        {item.asmcL_ClassName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        )}
                                                    </Select>
                                                )}
                                            />
                                            {errors.rightClass && <FormError>{errors.rightClass.message}</FormError>}
                                        </div>

                                        <div className='flex flex-col gap-1.5'>
                                            <Label htmlFor='rightSection'>
                                                Section <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='rightSection'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={handleRightSectionChange}
                                                        value={field.value}
                                                        disabled={!rightClass}>
                                                        <SelectTrigger className='w-full bg-white'>
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
                                            {errors.rightSection && <FormError>{errors.rightSection.message}</FormError>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {showTables && (
                    <>
                        <CollapsibleSection
                            title='Allot Students To Section'
                            description='Select and transfer students between sections'
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <div className='space-y-4'>
                                <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_auto_1fr]'>
                                    <div className='space-y-2'>
                                        <div className='overflow-x-auto rounded-lg border bg-white'>
                                            <table className='w-full'>
                                                <thead className='border-b bg-gray-50'>
                                                    <tr>
                                                        <th className='p-3 text-left font-semibold text-sm'>SI. No</th>
                                                        <th className='w-12 p-3 text-left font-semibold text-sm'>
                                                            <Checkbox
                                                                checked={leftSelectAll}
                                                                onCheckedChange={handleLeftSelectAll}
                                                                disabled={leftStudents.length === 0}
                                                                className='h-4 w-4 cursor-pointer rounded border-gray-300'
                                                            />
                                                        </th>
                                                        <th className='p-3 text-left font-semibold text-sm'>Student Name</th>
                                                        <th className='p-3 text-left font-semibold text-sm'>Adm. No</th>
                                                    </tr>
                                                </thead>
                                                <tbody className='divide-y'>
                                                    {leftStudents.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className='p-8 text-center text-gray-500'>
                                                                No students available
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        leftStudents.map((student) => (
                                                            <tr key={student.studentId} className='hover:bg-gray-50'>
                                                                <td className='p-3 text-sm'>{student.siNo}</td>
                                                                <td className='p-3'>
                                                                    <Checkbox
                                                                        checked={leftSelectedStudents.has(student.studentId)}
                                                                        onCheckedChange={(checked) =>
                                                                            handleLeftSelectStudent(student.studentId, checked as boolean)
                                                                        }
                                                                        className='h-4 w-4 cursor-pointer rounded border-gray-300'
                                                                    />
                                                                </td>
                                                                <td className='p-3 font-medium text-sm'>{student.studentName}</td>
                                                                <td className='p-3 text-sm'>{student.admNo}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Transfer Buttons */}
                                    <div className='flex flex-col items-center justify-center gap-2 py-8'>
                                        <Button
                                            type='button'
                                            onClick={moveToRight}
                                            disabled={leftSelectedStudents.size === 0}
                                            className='w-full lg:w-auto'
                                            variant='outline'>
                                            <ArrowRight className='h-4 w-4' />
                                        </Button>
                                        <Button
                                            type='button'
                                            onClick={moveToLeft}
                                            disabled={rightSelectedStudents.size === 0}
                                            className='w-full lg:w-auto'
                                            variant='outline'>
                                            <ArrowLeft className='h-4 w-4' />
                                        </Button>
                                    </div>

                                    <div className='space-y-2'>
                                        <div className='overflow-x-auto rounded-lg border bg-white'>
                                            <table className='w-full'>
                                                <thead className='border-b bg-gray-50'>
                                                    <tr>
                                                        <th className='p-3 text-left font-semibold text-sm'>SI. No</th>
                                                        <th className='w-12 p-3 text-left font-semibold text-sm'>
                                                            <Checkbox
                                                                checked={rightSelectAll}
                                                                onCheckedChange={handleRightSelectAll}
                                                                disabled={rightStudents.length === 0}
                                                                className='h-4 w-4 cursor-pointer rounded border-gray-300'
                                                            />
                                                        </th>
                                                        <th className='p-3 text-left font-semibold text-sm'>Student Name</th>
                                                        <th className='p-3 text-left font-semibold text-sm'>Adm. No</th>
                                                    </tr>
                                                </thead>
                                                <tbody className='divide-y'>
                                                    {rightStudents.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className='p-8 text-center text-gray-500'>
                                                                No students in this section
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        rightStudents.map((student) => (
                                                            <tr key={student.studentId} className='hover:bg-gray-50'>
                                                                <td className='p-3 text-sm'>{student.siNo}</td>
                                                                <td className='p-3'>
                                                                    <Checkbox
                                                                        checked={rightSelectedStudents.has(student.studentId)}
                                                                        onCheckedChange={(checked) =>
                                                                            handleRightSelectStudent(student.studentId, checked as boolean)
                                                                        }
                                                                        className='h-4 w-4 cursor-pointer rounded border-gray-300'
                                                                    />
                                                                </td>
                                                                <td className='p-3 font-medium text-sm'>{student.studentName}</td>
                                                                <td className='p-3 text-sm'>{student.admNo}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

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
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={isSubmitting}
                                        className='w-fit transition-all duration-200 hover:scale-105'>
                                        <div className='flex items-center'>
                                            <Save className='mr-2 h-4 w-4' />
                                            {isSubmitting ? 'Saving...' : 'Save'}
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
                                    data={rightStudents}
                                    columns={masterNewSectionColumns}
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
    );
}
