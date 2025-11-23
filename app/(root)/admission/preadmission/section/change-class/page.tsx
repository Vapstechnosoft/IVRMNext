'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { masterChangeClassSchema } from '@/schemas/admission/preadmission/section';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterChangeClassSchema.add>;

interface DropdownOption {
    value: string;
    label: string;
}

interface FeeStructureRow {
    id: number;
    className: string;
    feeCategory: string;
}

interface StudentDetails {
    name: string;
    admissionNo: string;
    currentClass: string;
    currentSection: string;
    rollNo: string;
}

const feeStructureData: Record<string, FeeStructureRow[]> = {
    '1-2': [
        { id: 1, className: 'Class 1 to Class 2', feeCategory: 'Tuition Fee' },
        { id: 2, className: 'Class 1 to Class 2', feeCategory: 'Library Fee' },
        { id: 3, className: 'Class 1 to Class 2', feeCategory: 'Lab Fee' }
    ],
    '1-3': [
        { id: 1, className: 'Class 1 to Class 3', feeCategory: 'Tuition Fee' },
        { id: 2, className: 'Class 1 to Class 3', feeCategory: 'Library Fee' },
        { id: 3, className: 'Class 1 to Class 3', feeCategory: 'Sports Fee' },
        { id: 4, className: 'Class 1 to Class 3', feeCategory: 'Lab Fee' }
    ],
    '2-3': [
        { id: 1, className: 'Class 2 to Class 3', feeCategory: 'Tuition Fee' },
        { id: 2, className: 'Class 2 to Class 3', feeCategory: 'Library Fee' }
    ],
    '2-4': [
        { id: 1, className: 'Class 2 to Class 4', feeCategory: 'Tuition Fee' },
        { id: 2, className: 'Class 2 to Class 4', feeCategory: 'Lab Fee' },
        { id: 3, className: 'Class 2 to Class 4', feeCategory: 'Transport Fee' }
    ],
    '3-4': [
        { id: 1, className: 'Class 3 to Class 4', feeCategory: 'Tuition Fee' },
        { id: 2, className: 'Class 3 to Class 4', feeCategory: 'Sports Fee' }
    ],
    '3-5': [
        { id: 1, className: 'Class 3 to Class 5', feeCategory: 'Tuition Fee' },
        { id: 2, className: 'Class 3 to Class 5', feeCategory: 'Library Fee' },
        { id: 3, className: 'Class 3 to Class 5', feeCategory: 'Lab Fee' },
        { id: 4, className: 'Class 3 to Class 5', feeCategory: 'Sports Fee' }
    ],
    '4-5': [
        { id: 1, className: 'Class 4 to Class 5', feeCategory: 'Tuition Fee' },
        { id: 2, className: 'Class 4 to Class 5', feeCategory: 'Library Fee' },
        { id: 3, className: 'Class 4 to Class 5', feeCategory: 'Transport Fee' }
    ]
};

export default function MasterChangeClassPage() {
    const [academicYear, setAcademicYear] = useState<number | null>(null);
    const [oldClassId, setOldClassId] = useState<string>('');
    const [sectionId, setSectionId] = useState<string>('');
    const [newClassId, setNewClassId] = useState<string>('');
    const [studentId, setStudentId] = useState<string>('');
    const [showDetails, setShowDetails] = useState(false);
    const [feeStructure, setFeeStructure] = useState<FeeStructureRow[]>([]);
    const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterChangeClassSchema.add),
        defaultValues: {
            asmaY_Id: 0,
            oldClass: '',
            section: '',
            newClass: '',
            studentId: '',
            remarks: '',
            feeStructure: []
        },
        mode: 'onChange'
    });

    const academicYearData = {
        data: [
            { asmaY_Id: 1, asmaY_Year: '2024-2025' },
            { asmaY_Id: 2, asmaY_Year: '2025-2026' }
        ]
    };

    const classOptions: DropdownOption[] = [
        { value: '1', label: 'Class 1' },
        { value: '2', label: 'Class 2' },
        { value: '3', label: 'Class 3' },
        { value: '4', label: 'Class 4' },
        { value: '5', label: 'Class 5' }
    ];

    const sectionOptions: DropdownOption[] = [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' }
    ];

    const studentOptions: DropdownOption[] = [
        { value: 'STU001', label: 'John Doe - STU001' },
        { value: 'STU002', label: 'Jane Smith - STU002' },
        { value: 'STU003', label: 'Mike Johnson - STU003' },
        { value: 'STU004', label: 'Sarah Williams - STU004' }
    ];

    useEffect(() => {
        if (oldClassId && newClassId) {
            const key = `${oldClassId}-${newClassId}`;
            const data = feeStructureData[key] || [];
            setFeeStructure(data);
        } else {
            setFeeStructure([]);
        }
    }, [oldClassId, newClassId]);

    useEffect(() => {
        if (academicYear && oldClassId && sectionId && newClassId && studentId) {
            setShowDetails(true);
            const selectedStudent = studentOptions.find((s) => s.value === studentId);
            const selectedClass = classOptions.find((c) => c.value === oldClassId);
            setStudentDetails({
                name: selectedStudent?.label.split(' - ')[0] || '',
                admissionNo: studentId,
                currentClass: selectedClass?.label || '',
                currentSection: sectionId,
                rollNo: `R${Math.floor(Math.random() * 100)}`
            });
        } else {
            setShowDetails(false);
            setStudentDetails(null);
        }
    }, [academicYear, oldClassId, sectionId, newClassId, studentId]);

    useEffect(() => {
        setValue('feeStructure', feeStructure, { shouldValidate: true });
    }, [feeStructure, setValue]);

    const handleDeleteFeeRow = (id: number) => {
        setFeeStructure((prev) => prev.filter((row) => row.id !== id));
    };

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                academicYear: data.asmaY_Id,
                oldClass: data.oldClass,
                section: data.section,
                newClass: data.newClass,
                studentId: data.studentId,
                remarks: data.remarks,
                feeStructure: data.feeStructure
            };

            console.log('Payload:', payload);
            toast.success('Class change saved successfully!');
            handleReset();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save class change');
        }
    };

    const handleReset = () => {
        reset({
            asmaY_Id: 0,
            oldClass: '',
            section: '',
            newClass: '',
            studentId: '',
            remarks: '',
            feeStructure: []
        });
        setAcademicYear(null);
        setOldClassId('');
        setSectionId('');
        setNewClassId('');
        setStudentId('');
        setShowDetails(false);
        setFeeStructure([]);
        setStudentDetails(null);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <CollapsibleSection
                        title='Change Class'
                        description='Change student class information'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                <div className='space-y-4'>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label htmlFor='asmaY_Id'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='asmaY_Id'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(value) => {
                                                        const numValue = Number(value);
                                                        field.onChange(numValue);
                                                        setAcademicYear(numValue);
                                                        setOldClassId('');
                                                        setSectionId('');
                                                        setNewClassId('');
                                                        setStudentId('');
                                                        setValue('oldClass', '');
                                                        setValue('section', '');
                                                        setValue('newClass', '');
                                                        setValue('studentId', '');
                                                    }}
                                                    value={field.value > 0 ? field.value.toString() : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYearData?.data?.map((item) => (
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

                                    <div className='flex flex-col gap-1.5'>
                                        <Label htmlFor='oldClass'>
                                            Old Class <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='oldClass'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setOldClassId(value);
                                                        setSectionId('');
                                                        setStudentId('');
                                                        setValue('section', '');
                                                        setValue('studentId', '');
                                                    }}
                                                    value={field.value}
                                                    disabled={!academicYear}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Old Class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {classOptions.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.oldClass && <FormError>{errors.oldClass.message}</FormError>}
                                    </div>

                                    <div className='flex flex-col gap-1.5'>
                                        <Label htmlFor='section'>
                                            Section <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='section'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setSectionId(value);
                                                        setStudentId('');
                                                        setValue('studentId', '');
                                                    }}
                                                    value={field.value}
                                                    disabled={!oldClassId}>
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

                                <div className='space-y-4'>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label htmlFor='newClass'>
                                            New Class <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='newClass'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setNewClassId(value);
                                                    }}
                                                    value={field.value}
                                                    disabled={!sectionId}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select New Class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {classOptions.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.newClass && <FormError>{errors.newClass.message}</FormError>}
                                    </div>

                                    <div className='flex flex-col gap-1.5'>
                                        <Label htmlFor='studentId'>
                                            Student <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='studentId'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setStudentId(value);
                                                    }}
                                                    value={field.value}
                                                    disabled={!newClassId}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Student' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {studentOptions.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.studentId && <FormError>{errors.studentId.message}</FormError>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {showDetails && studentDetails && (
                        <CollapsibleSection
                            title='Student Details'
                            description='View student information and fee structure'
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <div className='space-y-6'>
                                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                    {/* Left Side - Student Details */}
                                    <div className='space-y-4'>
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>Student Name:</Label>
                                            <Input value={studentDetails.name} disabled className='bg-muted' />
                                        </div>
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>Admission No.:</Label>
                                            <Input value={studentDetails.admissionNo} disabled className='bg-muted' />
                                        </div>
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>Current Class:</Label>
                                            <Input value={studentDetails.currentClass} disabled className='bg-muted' />
                                        </div>
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>Current Section:</Label>
                                            <Input value={studentDetails.currentSection} disabled className='bg-muted' />
                                        </div>
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>Roll No.:</Label>
                                            <Input value={studentDetails.rollNo} disabled className='bg-muted' />
                                        </div>
                                    </div>

                                    <div className='space-y-4'>
                                        <div>
                                            <Label className='font-semibold text-base'>Fee Structure:</Label>
                                        </div>
                                        <div className='overflow-x-auto rounded-lg border'>
                                            <table className='w-full'>
                                                <thead>
                                                    <tr className='border-b bg-muted/50'>
                                                        <th className='p-2 text-left font-medium text-sm'>SI.No</th>
                                                        <th className='p-2 text-left font-medium text-sm'>Class Name</th>
                                                        <th className='p-2 text-left font-medium text-sm'>Fee Category</th>
                                                        <th className='p-2 text-center font-medium text-sm'>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {feeStructure.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className='p-4 text-center text-muted-foreground'>
                                                                No fee structure available for selected class combination.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        feeStructure.map((row, index) => (
                                                            <tr key={row.id} className='border-b hover:bg-muted/30'>
                                                                <td className='p-2 text-sm'>{index + 1}</td>
                                                                <td className='p-2 text-sm'>{row.className}</td>
                                                                <td className='p-2 text-sm'>{row.feeCategory}</td>
                                                                <td className='p-2 text-center'>
                                                                    <Button
                                                                        type='button'
                                                                        variant='ghost'
                                                                        size='sm'
                                                                        onClick={() => handleDeleteFeeRow(row.id)}
                                                                        className='text-red-500 hover:bg-red-50 hover:text-red-700'>
                                                                        <Trash2 className='h-4 w-4' />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className='flex flex-col gap-1.5'>
                                            <Label htmlFor='remarks'>
                                                Remarks <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='remarks'
                                                control={control}
                                                render={({ field }) => (
                                                    <Textarea {...field} placeholder='Enter remarks...' className='min-h-[80px]' />
                                                )}
                                            />
                                            {errors.remarks && <FormError>{errors.remarks.message}</FormError>}
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
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
                                        type='submit'
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
                    )}
                </form>
            </div>
        </div>
    );
}
