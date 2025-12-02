'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useStudentCountReport } from '@/hooks/admission/preadmission/useReports';
import { cn } from '@/lib/utils';
import { TotalStrengthSchema } from '@/schemas/admission/preadmission/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, FileSpreadsheet, FileText, Printer, RotateCcw, Square } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof TotalStrengthSchema>;

const CLASS_OPTIONS = [
    'Nursery',
    'LKG',
    'UKG',
    'I Std',
    'II Std',
    'III Std',
    'IV Std',
    'V Std',
    'VI Std',
    'VII Std',
    'VIII Std',
    'IX Std',
    'X Std'
];

const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

interface ClassSectionData {
    class: string;
    section: string;
    total: number;
    newAdmission: number;
}

export default function TotalStrengthPage() {
    const { data: academicYear, isLoading: ayLoading } = useAcademicYearDropdown();
    const [showReport, setShowReport] = useState(false);
    const [searchParams, setSearchParams] = useState<any>(null);
    const [selectAll, setSelectAll] = useState(false);

    const { data: response, isLoading, error } = useStudentCountReport(searchParams);

    const {
        control,
        watch,
        setValue,
        reset,
        trigger,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(TotalStrengthSchema),
        defaultValues: {
            reportType: 'All',
            status: 'Present',
            withTc: false,
            withDeactive: false,
            academicYear: 0,
            class: '',
            section: ''
        }
    });

    const reportType = watch('reportType');
    const status = watch('status');

    const showCheckboxes = status === 'Present';

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
    };

    const handleReport = async () => {
        const isValid = await trigger();
        if (isValid) {
            const formData = watch();
            setSearchParams({
                reportType: formData.reportType,
                asmaY_Id: formData.academicYear,
                status: formData.status,
                withTc: formData.withTc,
                withDeactive: formData.withDeactive,
                class: formData.class,
                section: formData.section
            });
            setShowReport(true);
        }
    };

    const handleReset = () => {
        reset({
            reportType: 'All',
            status: 'Present',
            withTc: false,
            withDeactive: false,
            academicYear: 0,
            class: '',
            section: ''
        });
        setSelectAll(false);
        setShowReport(false);
        setSearchParams(null);
    };

    // Generate mock data grouped by class
    const generateClassData = (): Record<string, ClassSectionData[]> => {
        const classData: Record<string, ClassSectionData[]> = {};

        CLASS_OPTIONS.forEach((className) => {
            classData[className] = SECTION_OPTIONS.map((section) => ({
                class: className,
                section,
                total: Math.floor(Math.random() * 40) + 20,
                newAdmission: Math.floor(Math.random() * 10) + 1
            }));
        });

        return classData;
    };

    const classData = generateClassData();

    const calculateClassTotal = (className: string) => {
        return classData[className].reduce((sum, item) => sum + item.total, 0);
    };

    const calculateClassNewAdmissions = (className: string) => {
        return classData[className].reduce((sum, item) => sum + item.newAdmission, 0);
    };

    const calculateGrandTotal = () => {
        return Object.values(classData)
            .flat()
            .reduce((sum, item) => sum + item.total, 0);
    };

    const calculateGrandNewAdmissions = () => {
        return Object.values(classData)
            .flat()
            .reduce((sum, item) => sum + item.newAdmission, 0);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='space-y-4'>
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        title='Total Strength'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-6 p-4'>
                            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                <div className='space-y-4 rounded-lg border border-gray-200 p-4'>
                                    <div className='space-y-2'>
                                        <Controller
                                            name='reportType'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    className='flex items-center justify-center space-x-6'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='All' id='all-type' />
                                                        <label htmlFor='all-type' className='cursor-pointer text-sm'>
                                                            All
                                                        </label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Individual' id='individual-type' />
                                                        <label htmlFor='individual-type' className='cursor-pointer text-sm'>
                                                            Individual
                                                        </label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <Controller
                                            name='status'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    className='flex items-center justify-center space-x-6'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Present' id='present' />
                                                        <label htmlFor='present' className='cursor-pointer text-sm'>
                                                            Present
                                                        </label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Left' id='left' />
                                                        <label htmlFor='left' className='cursor-pointer text-sm'>
                                                            Left
                                                        </label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Deactive' id='deactive' />
                                                        <label htmlFor='deactive' className='cursor-pointer text-sm'>
                                                            Deactive
                                                        </label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                        {errors.status && <FormError>{errors.status.message}</FormError>}
                                    </div>

                                    {/* Row 3: Checkboxes */}
                                    {showCheckboxes && (
                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-center space-x-6'>
                                                <Controller
                                                    name='withTc'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className='flex items-center space-x-2'>
                                                            <Checkbox id='withTc' checked={field.value} onCheckedChange={field.onChange} />
                                                            <label htmlFor='withTc' className='cursor-pointer text-sm'>
                                                                With TC
                                                            </label>
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name='withDeactive'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className='flex items-center space-x-2'>
                                                            <Checkbox
                                                                id='withDeactive'
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                            <label htmlFor='withDeactive' className='cursor-pointer text-sm'>
                                                                With Deactive
                                                            </label>
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className='space-y-4 rounded-lg border border-gray-200 p-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='academicYear' className='font-medium'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='academicYear'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value > 0 ? field.value.toString() : ''}
                                                    onValueChange={(value) => field.onChange(Number(value))}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent className='max-h-60'>
                                                        {ayLoading ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : (
                                                            academicYear?.data?.map((y) => (
                                                                <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                                    {y.asmaY_Year}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label className='font-medium'>
                                            Elective <span className='text-red-500'>*</span>
                                        </Label>
                                        <div
                                            onClick={handleSelectAll}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 font-medium text-sm transition-all',
                                                selectAll
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-gray-300 hover:border-primary/40'
                                            )}>
                                            {selectAll ? (
                                                <CheckSquare className='h-4 w-4 text-primary' />
                                            ) : (
                                                <Square className='h-4 w-4 text-gray-400' />
                                            )}
                                            <span>Select All</span>
                                        </div>
                                    </div>

                                    {/* Class and Section (only show when Individual is selected) */}
                                    {reportType === 'Individual' && (
                                        <>
                                            <div className='space-y-2'>
                                                <Label htmlFor='class' className='font-medium'>
                                                    Class <span className='text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='class'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select Class' />
                                                            </SelectTrigger>
                                                            <SelectContent className='max-h-60'>
                                                                {CLASS_OPTIONS.map((cls) => (
                                                                    <SelectItem key={cls} value={cls}>
                                                                        {cls}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.class && <FormError>{errors.class.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <Label htmlFor='section' className='font-medium'>
                                                    Section <span className='text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='section'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select Section' />
                                                            </SelectTrigger>
                                                            <SelectContent className='max-h-60'>
                                                                {SECTION_OPTIONS.map((sec) => (
                                                                    <SelectItem key={sec} value={sec}>
                                                                        {sec}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.section && <FormError>{errors.section.message}</FormError>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleReset}
                                    className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                                    <RotateCcw className='mr-2 h-4 w-4' />
                                    Reset
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handleReport}
                                    className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                                    <FileText className='mr-2 h-4 w-4' />
                                    Report
                                </Button>
                                <div className='flex gap-3'>
                                    <Button variant='outline' className='w-fit'>
                                        <FileSpreadsheet className='mr-2 h-4 w-4' />
                                        Export to Excel
                                    </Button>
                                    <Button variant='outline' className='w-fit'>
                                        <Printer className='mr-2 h-4 w-4' />
                                        Print
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {showReport && (
                        <CollapsibleSection
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            title='Student Count Report'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <div className='space-y-4 p-4'>
                                <div className='overflow-x-auto'>
                                    <table className='w-full border-collapse border border-gray-300'>
                                        <thead>
                                            <tr className='bg-gray-100'>
                                                <th className='border border-gray-300 px-4 py-2 text-left font-semibold'>Sl.No</th>
                                                <th className='border border-gray-300 px-4 py-2 text-left font-semibold'>Class</th>
                                                <th className='border border-gray-300 px-4 py-2 text-left font-semibold'>Section</th>
                                                <th className='border border-gray-300 px-4 py-2 text-right font-semibold'>Total</th>
                                                <th className='border border-gray-300 px-4 py-2 text-right font-semibold'>New Admission</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {CLASS_OPTIONS.map((className, classIndex) => (
                                                <>
                                                    {classData[className].map((item, sectionIndex) => (
                                                        <tr key={`${className}-${item.section}`} className='hover:bg-gray-50'>
                                                            <td className='border border-gray-300 px-4 py-2'>
                                                                {sectionIndex === 0 ? classIndex + 1 : ''}
                                                            </td>
                                                            <td className='border border-gray-300 px-4 py-2'>
                                                                {sectionIndex === 0 ? className : ''}
                                                            </td>
                                                            <td className='border border-gray-300 px-4 py-2'>{item.section}</td>
                                                            <td className='border border-gray-300 px-4 py-2 text-right'>{item.total}</td>
                                                            <td className='border border-gray-300 px-4 py-2 text-right'>
                                                                {item.newAdmission}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {/* biome-ignore lint/correctness/useJsxKeyInIterable: <explanation> */}
                                                    <tr className='bg-blue-50 font-semibold'>
                                                        <td colSpan={3} className='border border-gray-300 px-4 py-2 text-right'>
                                                            Total {className}
                                                        </td>
                                                        <td className='border border-gray-300 px-4 py-2 text-right'>
                                                            {calculateClassTotal(className)}
                                                        </td>
                                                        <td className='border border-gray-300 px-4 py-2 text-right'>
                                                            {calculateClassNewAdmissions(className)}
                                                        </td>
                                                    </tr>
                                                </>
                                            ))}
                                            <tr className='bg-green-100 font-bold'>
                                                <td colSpan={3} className='border border-gray-300 px-4 py-2 text-right'>
                                                    Grand Total
                                                </td>
                                                <td className='border border-gray-300 px-4 py-2 text-right'>{calculateGrandTotal()}</td>
                                                <td className='border border-gray-300 px-4 py-2 text-right'>
                                                    {calculateGrandNewAdmissions()}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}
                </div>
            </div>
        </div>
    );
}
