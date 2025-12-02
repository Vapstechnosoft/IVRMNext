'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Trash2 } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    useAcademicYearDropdown,
    useMasterClass,
    useMasterSectionDropdown,
    useMasterStudentList
} from '@/hooks/admission/preadmission/useMasters';
import { masterActiveDeactiveStudentSchema } from '@/schemas/admission/preadmission/masters';
import { ActiveDeactive } from '@/server/admission/preadmission/masters/active_deactive_student';

type FormFields = z.infer<typeof masterActiveDeactiveStudentSchema>;

interface Student {
    amst_sol: string;
    amsT_SOL: number;
    student_id: number;
    student_name: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    amsT_AdmNo: string;
    amaY_RollNo: number;
    registration_no: string;
    admission_no: string;
}

interface StudentData {
    student_id: number;
    reason: string;
    remark: string;
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const REASON_OPTIONS = [
    { value: 'Fee Due', label: 'Fee Due' },
    { value: 'Long Absent', label: 'Long Absent' },
    { value: 'Medical', label: 'Medical' }
];

export default function MasterActiveDeactiveStudentPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);

    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [amst_sol, setAmst_sol] = useState<string>('S');
    const [classId, setClassId] = useState<number>(0);
    const [sectionId, setSectionId] = useState<number>(0);
    const [showTable, setShowTable] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [studentData, setStudentData] = useState<Map<number, StudentData>>(new Map());

    const { data: academicYear, isLoading: ayLoading } = useAcademicYearDropdown();

    const { data: masterClass, isLoading: preadmissionClassLoading, isError: preadmissionClassError } = useMasterClass();

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterActiveDeactiveStudentSchema),
        defaultValues: {
            amsT_SOL: 'S' as any,
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            students: []
        },
        mode: 'onChange'
    });

    const { data: SectionData, isLoading: SectionLoading, isError: SectionError } = useMasterSectionDropdown();

    const {
        data: StudentListData,
        isLoading: StudentListLoading,
        isError: StudentListError
    } = useMasterStudentList(amst_sol, academicYearId, classId, sectionId);

    const students = StudentListData?.data || [];

    useEffect(() => {
        if (students.length > 0) {
            setSelectAll(selectedStudents.size === students.length);
        }
    }, [selectedStudents, students]);

    const handleAcademicYearChange = (value: string) => {
        const numValue = Number(value);
        setAcademicYearId(numValue);
        setValue('asmaY_Id', numValue);

        setClassId(0);
        setSectionId(0);
        setShowTable(false);
        setValue('asmcL_Id', 0);
        setValue('asmS_Id', 0);
        setSelectedStudents(new Set());
        setSelectAll(false);
        setStudentData(new Map());
    };

    const handleClassChange = (value: string) => {
        const numValue = Number(value);
        setClassId(numValue);
        setValue('asmcL_Id', numValue);

        setSectionId(0);
        setShowTable(false);
        setValue('asmS_Id', 0);
        setSelectedStudents(new Set());
        setSelectAll(false);
        setStudentData(new Map());
    };

    const handleSectionChange = (value: string) => {
        const numValue = Number(value);
        setSectionId(numValue);
        setValue('asmS_Id', numValue);
        setShowTable(true);
        setSelectedStudents(new Set());
        setSelectAll(false);
        setStudentData(new Map());
    };

    const handleStatus = (value: string) => {
        setAmst_sol(value);
        // keep form field in sync so validation and payload use the selected status
        setValue('amsT_SOL', value as any);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            const allIds = new Set(students.map((s: Student) => s.student_id));
            setSelectedStudents(allIds as any);
            // populate form students array for submission
            const ids = Array.from(allIds) as number[];
            const studentsArray = ids.map((id) => {
                const sd = studentData.get(id) || {
                    student_id: id,
                    reason: '',
                    remark: ''
                };
                return {
                    amsT_Id: id,
                    reason: sd.reason || '',
                    remarks: sd.remark || ''
                };
            });
            setValue('students', studentsArray as any);
        } else {
            setSelectedStudents(new Set());
            setStudentData(new Map());
            setValue('students', [] as any);
        }
    };

    const handleSelectStudent = (student_id: number, checked: boolean) => {
        setSelectedStudents((prev) => {
            const newSelected = new Set(prev);
            if (checked) {
                newSelected.add(student_id);
            } else {
                newSelected.delete(student_id);
                // Remove student data when unchecked
                setStudentData((prevData) => {
                    const newStudentData = new Map(prevData);
                    newStudentData.delete(student_id);
                    return newStudentData;
                });
            }

            // immediately populate form students array to keep resolver and payload in-sync
            const ids = Array.from(newSelected) as number[];
            const studentsArray = ids.map((id) => {
                const sd = studentData.get(id) || {
                    student_id: id,
                    reason: '',
                    remark: ''
                };
                return {
                    amsT_Id: id,
                    reason: sd.reason || '',
                    remarks: sd.remark || ''
                };
            });
            setValue('students', studentsArray as any);

            if (process.env.NODE_ENV === 'development') {
                console.debug('[ActiveDeactive] selectedStudents size:', newSelected.size);
            }

            return newSelected;
        });
    };

    const handleReasonChange = (student_id: number, reason: string) => {
        setStudentData((prev) => {
            const newStudentData = new Map(prev);
            const existing = newStudentData.get(student_id) || {
                student_id,
                reason: '',
                remark: ''
            };
            newStudentData.set(student_id, { ...existing, reason });
            return newStudentData;
        });
    };

    const handleRemarkChange = (student_id: number, remark: string) => {
        setStudentData((prev) => {
            const newStudentData = new Map(prev);
            const existing = newStudentData.get(student_id) || {
                student_id,
                reason: '',
                remark: ''
            };
            newStudentData.set(student_id, { ...existing, remark });
            return newStudentData;
        });
    };

    const onSubmit = async (data: FormFields) => {
        if (selectedStudents.size === 0) {
            toast.error('Please select at least one student ');
            return;
        }
        const invalidStudents = Array.from(selectedStudents).filter((student_id) => {
            const data = studentData.get(student_id);
            return !data?.reason || !data?.remark?.trim();
        });

        if (invalidStudents.length > 0) {
            toast.error('Please provide reason and remark for all selected students');
            return;
        }

        try {
            const ActiveDeactivestudents = Array.from(selectedStudents).map((student_id) => {
                const student = students.find((s: Student) => s.student_id === student_id);
                const data = studentData.get(student_id);
                return {
                    amsT_Id: student?.student_id || 0,
                    reason: data?.reason || '',
                    remarks: data?.remark || ''
                };
            });

            const payload = {
                amsT_SOL: data.amsT_SOL,
                asmaY_Id: data.asmaY_Id,
                asmcL_Id: classId,
                asmS_Id: sectionId,
                students: ActiveDeactivestudents
            };

            const response = await ActiveDeactive(payload);
            if (response.success) {
                toast.success(response.message || 'Save Student successfully!');
                handleReset();
            } else {
                toast.error(response.message);
            }
        } catch (_error: any) {
            toast.error('Failed to Save students');
        }
    };

    const handleReset = () => {
        reset({
            amsT_SOL: 'S' as any,
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            students: []
        });
        setAcademicYearId(0);
        setClassId(0);
        setSectionId(0);
        setShowTable(false);
        setSelectedStudents(new Set());
        setSelectAll(false);
        setStudentData(new Map());
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='container space-y-4 p-4'>
                <div className='space-y-4'>
                    <CollapsibleSection
                        title='Active Deactive Students'
                        description='Select academic year, class, and section students'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                                <div className='group flex flex-col gap-1.5'>
                                    <Label>
                                        Student Status <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    <RadioGroup onValueChange={handleStatus} value={amst_sol} className='flex items-center gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='S' id='active_students' />
                                            <Label htmlFor='active_students' className='cursor-pointer font-normal'>
                                                Active Students
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='D' id='deactive_students' />
                                            <Label htmlFor='deactive_students' className='cursor-pointer font-normal'>
                                                Deactive Students
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
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
                                                    {ayLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : (
                                                        academicYear?.data?.map((item) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                                </div>

                                <div className='group flex flex-col gap-1.5'>
                                    <Label htmlFor='asmcL_Id'>
                                        Class <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmcL_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={handleClassChange}
                                                value={field.value > 0 ? field.value.toString() : ''}
                                                disabled={academicYearId === 0}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {preadmissionClassLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : preadmissionClassError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading
                                                        </SelectItem>
                                                    ) : (
                                                        masterClass?.data?.map((item) => (
                                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                {item.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                                </div>

                                <div className='group flex flex-col gap-1.5'>
                                    <Label htmlFor='asmS_Id'>
                                        Section <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmS_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={handleSectionChange}
                                                value={field.value > 0 ? field.value.toString() : ''}
                                                disabled={classId === 0}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SectionLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : SectionError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading
                                                        </SelectItem>
                                                    ) : (
                                                        SectionData?.data?.map((opt: any) => (
                                                            <SelectItem key={opt.asmS_Id} value={opt.asmS_Id.toString()}>
                                                                {opt.asmC_SectionName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.asmS_Id && <FormError>{errors.asmS_Id.message}</FormError>}
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title='Student List'
                        description='Select students and provide reason and remark for deletion'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-4'>
                            <div className='overflow-x-auto rounded-lg border'>
                                <table className='w-full'>
                                    <thead className='border-b bg-gray-50'>
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
                                            <th className='p-3 text-left font-semibold'>Registration No</th>
                                            <th className='p-3 text-left font-semibold'>Admission No</th>
                                            <th className='p-3 text-left font-semibold'>
                                                Reason <span className='text-red-500'>*</span>
                                            </th>
                                            <th className='p-3 text-left font-semibold'>
                                                Remark <span className='text-red-500'>*</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y'>
                                        {students.map((student: Student, index: number) => (
                                            <tr key={student.student_id} className='hover:bg-gray-50'>
                                                <td className='p-3'>{index + 1}</td>
                                                <td className='p-3'>
                                                    <Checkbox
                                                        checked={selectedStudents.has(student.student_id)}
                                                        onCheckedChange={(checked) =>
                                                            handleSelectStudent(student.student_id, checked as boolean)
                                                        }
                                                        className='h-4 w-4 cursor-pointer rounded border-gray-300'
                                                    />
                                                </td>
                                                <td className='p-3 font-medium'>{student.student_name}</td>
                                                <td className='p-3'>{student.registration_no}</td>
                                                <td className='p-3'>{student.admission_no}</td>
                                                <td className='p-3'>
                                                    <Select
                                                        value={studentData.get(student.student_id)?.reason || ''}
                                                        onValueChange={(value) => handleReasonChange(student.student_id, value)}
                                                        disabled={!selectedStudents.has(student.student_id)}>
                                                        <SelectTrigger className='w-[180px]'>
                                                            <SelectValue placeholder='Select Reason' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {REASON_OPTIONS.map((option) => (
                                                                <SelectItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className='p-3'>
                                                    <Input
                                                        type='text'
                                                        placeholder='Enter remark'
                                                        value={studentData.get(student.student_id)?.remark || ''}
                                                        onChange={(e) => handleRemarkChange(student.student_id, e.target.value)}
                                                        disabled={!selectedStudents.has(student.student_id)}
                                                        className='w-[200px]'
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {StudentListLoading && (
                                    <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                                        <RefreshCw className='h-8 w-8 animate-spin text-secondary' />
                                        <p className='text-muted-foreground text-sm'>Loading students...</p>
                                    </div>
                                )}
                                {!StudentListLoading && students.length === 0 && showTable && (
                                    <div className='flex flex-col items-center justify-center py-12'>
                                        <p className='text-muted-foreground text-sm'>No students found</p>
                                    </div>
                                )}
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
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={selectedStudents.size === 0 || isSubmitting}
                                    className='w-fit transition-all duration-200 hover:scale-105'>
                                    <div className='flex items-center'>
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        {isSubmitting ? 'Save' : 'Save Students'}
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            </div>
        </div>
    );
}
