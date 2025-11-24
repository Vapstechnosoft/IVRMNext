'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { masterClassHeldSchema } from '@/schemas/admission/preadmission/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassHeldSchema.add>;

interface DropdownOption {
    value: string;
    label: string;
}

interface ClassHeldRow {
    month: string;
    classHeld: string;
    selected: boolean;
}

export default function MasterClassHeldPage() {
    const [academicYear, setAcademicYear] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<string>('');
    const [showTable, setShowTable] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [classHeldData, setClassHeldData] = useState<ClassHeldRow[]>([
        { month: 'May-2025', classHeld: '', selected: false },
        { month: 'June-2025', classHeld: '', selected: false },
        { month: 'July-2025', classHeld: '', selected: false },
        { month: 'August-2025', classHeld: '', selected: false },
        { month: 'September-2025', classHeld: '', selected: false },
        { month: 'October-2025', classHeld: '', selected: false },
        { month: 'November-2025', classHeld: '', selected: false },
        { month: 'December-2025', classHeld: '', selected: false },
        { month: 'January-2026', classHeld: '', selected: false },
        { month: 'February-2026', classHeld: '', selected: false },
        { month: 'March-2026', classHeld: '', selected: false },
        { month: 'April-2026', classHeld: '', selected: false }
    ]);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterClassHeldSchema.add),
        defaultValues: {
            asmaY_Id: 0,
            classCategory: '',
            section: '',
            classHeldData: []
        },
        mode: 'onChange'
    });

    // Mock data - replace with actual hooks
    const academicYearData = {
        data: [
            { asmaY_Id: 1, asmaY_Year: '2024-2025' },
            { asmaY_Id: 2, asmaY_Year: '2025-2026' }
        ]
    };

    const masterClass = {
        data: [
            { asmcL_ID: 1, asmcL_ClassName: 'Class 1' },
            { asmcL_ID: 2, asmcL_ClassName: 'Class 2' },
            { asmcL_ID: 3, asmcL_ClassName: 'Class 3' }
        ]
    };

    const sectionOptions: DropdownOption[] = [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
        { value: 'E', label: 'E' },
        { value: 'F', label: 'F' }
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
        if (academicYear && classId && sectionId) {
            setShowTable(true);
        } else {
            setShowTable(false);
        }
    }, [academicYear, classId, sectionId]);

    // Update form value when classHeldData changes
    useEffect(() => {
        const selectedRows = classHeldData
            .filter((row) => row.selected)
            .map((row) => ({
                month: row.month,
                classHeld: Number.parseInt(row.classHeld) || 0
            }));
        setValue('classHeldData', selectedRows as unknown as FormFields['classHeldData'], { shouldValidate: true });
    }, [classHeldData, setValue]);

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        setClassHeldData((prev) =>
            prev.map((row) => ({
                ...row,
                selected: checked,
                classHeld: checked ? '0' : ''
            }))
        );
    };

    const handleRowSelect = (index: number, checked: boolean) => {
        setClassHeldData((prev) => {
            const newData = [...prev];
            newData[index] = {
                ...newData[index],
                selected: checked,
                classHeld: checked ? '0' : ''
            };
            return newData;
        });

        // Update selectAll state
        const allSelected = classHeldData.every((row, i) => (i === index ? checked : row.selected));
        setSelectAll(allSelected);
    };

    const handleClassHeldChange = (index: number, value: string) => {
        setClassHeldData((prev) => {
            const newData = [...prev];
            newData[index] = { ...newData[index], classHeld: value };
            return newData;
        });
    };

    const onSubmit = async (data: FormFields) => {
        try {
            // Replace with actual API call
            const payload = {
                academicYear: data.asmaY_Id,
                classId: data.classCategory,
                section: data.section,
                classHeldData: data.classHeldData
            };

            console.log('Payload:', payload);

            // Simulate API call
            // const response = await addMasterClassHeld(payload);

            // if (response.success) {
            //   toast.success(response.message);
            //   handleReset();
            // } else {
            //   toast.error(response.message);
            // }

            toast.success('Class held data saved successfully!');
            handleReset();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save class held data');
        }
    };

    const handleReset = () => {
        reset({
            asmaY_Id: 0,
            classCategory: '',
            section: '',
            classHeldData: []
        });
        setAcademicYear(null);
        setClassId(null);
        setSectionId('');
        setShowTable(false);
        setSelectAll(false);
        setClassHeldData((prev) => prev.map((row) => ({ ...row, selected: false, classHeld: '' })));
    };

    const handleTableReset = () => {
        setSelectAll(false);
        setClassHeldData((prev) => prev.map((row) => ({ ...row, selected: false, classHeld: '' })));
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    {/* Master Class Held Section */}
                    <CollapsibleSection
                        title='Master Class Held'
                        description='Manage class held information for academic year'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                {/* Academic Year */}
                                <div className='group flex flex-col gap-1.5'>
                                    <Label aria-label='Academic Year' htmlFor='asmaY_Id'>
                                        Academic Year <span className='ml-1 text-red-500'>*</span>
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
                                                    setClassId(null);
                                                    setSectionId('');
                                                    setValue('classCategory', '');
                                                    setValue('section', '');
                                                }}
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

                                {/* Class */}
                                <div className='group flex flex-col gap-1.5'>
                                    <Label aria-label='Class' htmlFor='classCategory'>
                                        Class <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='classCategory'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setClassId(Number(value));
                                                    setSectionId('');
                                                    setValue('section', '');
                                                }}
                                                value={field.value}
                                                disabled={!academicYear}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classCategoryOptions.length === 0 ? (
                                                        <SelectItem value='no-data' disabled>
                                                            No classes available
                                                        </SelectItem>
                                                    ) : (
                                                        classCategoryOptions.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.classCategory && <FormError>{errors.classCategory.message}</FormError>}
                                </div>

                                {/* Section */}
                                <div className='group flex flex-col gap-1.5'>
                                    <Label aria-label='Section' htmlFor='section'>
                                        Section <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='section'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setSectionId(value);
                                                }}
                                                value={field.value}
                                                disabled={!classId}>
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
                        <CollapsibleSection
                            title='Class Held Details'
                            description='Select months and enter class held values'
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <div className='space-y-6'>
                                <div className='overflow-x-auto rounded-lg border'>
                                    <div className='grid grid-cols-3 gap-4 border-b p-3 font-medium'>
                                        <div className='flex items-center justify-center gap-2'>
                                            <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                                            <span>Select All</span>
                                        </div>
                                        <div className='flex items-center justify-center'>Month</div>
                                        <div className='flex items-center justify-center'>Class Held</div>
                                    </div>
                                    <div className='divide-y'>
                                        {classHeldData.map((row, index) => (
                                            <div key={index} className='grid grid-cols-3 gap-4 p-2 hover:bg-muted/50'>
                                                <div className='flex items-center justify-center'>
                                                    <Checkbox
                                                        checked={row.selected}
                                                        onCheckedChange={(checked) => handleRowSelect(index, checked as boolean)}
                                                    />
                                                </div>
                                                <div className='flex items-center justify-center font-medium'>{row.month}</div>
                                                <div className='flex items-center'>
                                                    <Input
                                                        type='number'
                                                        min='0'
                                                        placeholder='0'
                                                        value={row.classHeld}
                                                        onChange={(e) => handleClassHeldChange(index, e.target.value)}
                                                        disabled={!row.selected}
                                                        className='w-full'
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {errors.classHeldData && <FormError>{errors.classHeldData.message}</FormError>}

                                {errors.root && <FormError>{errors.root.message}</FormError>}

                                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={handleTableReset}
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
