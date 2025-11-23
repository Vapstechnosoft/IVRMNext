'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { masterUpdateRollNumberSchema } from '@/schemas/admission/preadmission/section';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { masterUpdateRollNumberColumns } from './_components/columns';

type FormFields = z.infer<typeof masterUpdateRollNumberSchema>;

interface Student {
    studentId: number;
    siNo: number;
    studentName: string;
    className: string;
    section: string;
    admNo: string;
    presentRollNo: string;
    rollNo: string;
    gender: string;
    addCode: string;
}

interface DropdownOption {
    value: string;
    label: string;
}

export default function MasterUpdateRollNumberPage() {
    const [academicYear, setAcademicYear] = useState<number | null>(null);
    const [classId, setClassId] = useState<string>('');
    const [sectionId, setSectionId] = useState<string>('');
    const [showTable, setShowTable] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterUpdateRollNumberSchema),
        defaultValues: {
            asmaY_Id: 0,
            classCategory: '',
            section: '',
            students: []
        },
        mode: 'onChange'
    });

    // Mock data
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
            presentRollNo: '001',
            rollNo: '001',
            gender: 'Male',
            addCode: 'C1'
        },
        {
            studentId: 2,
            siNo: 2,
            studentName: 'Jane Smith',
            className: 'Class 1',
            section: 'A',
            admNo: 'ADM002',
            presentRollNo: '002',
            rollNo: '002',
            gender: 'Female',
            addCode: 'C1'
        },
        {
            studentId: 3,
            siNo: 3,
            studentName: 'Mike Johnson',
            className: 'Class 1',
            section: 'A',
            admNo: 'ADM003',
            presentRollNo: '003',
            rollNo: '003',
            gender: 'Male',
            addCode: 'C1'
        },
        {
            studentId: 4,
            siNo: 4,
            studentName: 'Sarah Williams',
            className: 'Class 1',
            section: 'A',
            admNo: 'ADM004',
            presentRollNo: '004',
            rollNo: '004',
            gender: 'Female',
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
            studentId: student.studentId,
            rollNo: student.rollNo
        }));
        setValue('students', studentData, { shouldValidate: true });
    }, [students, setValue]);

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
    };

    const handleClassChange = (value: string) => {
        setClassId(value);
        setValue('classCategory', value);

        setSectionId('');
        setShowTable(false);
        setValue('section', '');
        setStudents([]);
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
    };

    const handleRollNumberChange = (index: number, value: string) => {
        setStudents((prev) => {
            const newData = [...prev];
            newData[index] = { ...newData[index], rollNo: value };
            return newData;
        });
    };

    const onSubmit = async (data: FormFields) => {
        try {
            const selectedClass = masterClass.data.find((c) => c.asmcL_ID.toString() === classId);

            const payload = {
                academicYear: data.asmaY_Id,
                classId: data.classCategory,
                className: selectedClass?.asmcL_ClassName,
                addCode: selectedClass?.addCode,
                section: data.section,
                students: data.students.map((student) => {
                    const studentDetail = students.find((s) => s.studentId === student.studentId);
                    return {
                        studentId: student.studentId,
                        studentName: studentDetail?.studentName,
                        admNo: studentDetail?.admNo,
                        presentRollNo: studentDetail?.presentRollNo,
                        newRollNo: student.rollNo,
                        gender: studentDetail?.gender
                    };
                })
            };

            console.log('Payload:', payload);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast.success('Roll numbers updated successfully!');
            handleReset();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update roll numbers');
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
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(onSubmit)();
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container space-y-4 p-4'>
                <div className='space-y-4'>
                    <CollapsibleSection
                        title='Update Roll Number'
                        description='Select academic year, class, and section to update roll numbers'
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
                                description='Update roll numbers for selected students'
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
                                                    <th className='p-3 text-left font-semibold'>Student Name</th>
                                                    <th className='p-3 text-left font-semibold'>Class</th>
                                                    <th className='p-3 text-left font-semibold'>Section</th>
                                                    <th className='p-3 text-left font-semibold'>Adm. No</th>
                                                    <th className='p-3 text-left font-semibold'>Present Roll No</th>
                                                    <th className='p-3 text-left font-semibold'>
                                                        Roll No <span className='text-red-500'>*</span>
                                                    </th>
                                                    <th className='p-3 text-left font-semibold'>Gender</th>
                                                </tr>
                                            </thead>
                                            <tbody className='divide-y'>
                                                {students.map((student, index) => (
                                                    <tr key={student.studentId} className='hover:bg-gray-50'>
                                                        <td className='p-3'>{student.siNo}</td>
                                                        <td className='p-3 font-medium'>{student.studentName}</td>
                                                        <td className='p-3'>{student.className}</td>
                                                        <td className='p-3'>{student.section}</td>
                                                        <td className='p-3'>{student.admNo}</td>
                                                        <td className='p-3'>{student.presentRollNo}</td>
                                                        <td className='p-3'>
                                                            <Input
                                                                type='text'
                                                                value={student.rollNo}
                                                                onChange={(e) => handleRollNumberChange(index, e.target.value)}
                                                                className='w-24'
                                                                placeholder='Roll No'
                                                            />
                                                        </td>
                                                        <td className='p-3'>{student.gender}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {errors.students && <FormError>{errors.students.message}</FormError>}

                                    {/* Action Buttons */}
                                    <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={handleReset}
                                            disabled={isSubmitting}
                                            className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                            Reset
                                        </Button>
                                        <Button
                                            onClick={handleFormSubmit}
                                            disabled={isSubmitting}
                                            className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                            <div className='flex items-center'>
                                                <Save className='mr-2 h-4 w-4' />
                                                {isSubmitting ? 'Saving...' : 'Save'}
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            </CollapsibleSection>
                            <CollapsibleSection
                                title='Student List'
                                description='Update roll numbers for selected students'
                                defaultOpen={true}
                                variant='default'
                                size='lg'
                                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                <div className='space-y-4'>
                                    <GenericDataTable<Student>
                                        data={students}
                                        columns={masterUpdateRollNumberColumns}
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
