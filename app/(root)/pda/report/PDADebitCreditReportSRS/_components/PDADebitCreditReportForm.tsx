'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    usePDAReportLoadData,
    usePDASectionsSRS,
    usePDAStudentsSRS,
    useGeneratePDAReportSRS
} from '@/hooks/pda/report/useDebitCreditReport';
import { pdaDebitCreditReportSchema, type PDADebitCreditReportFormValues } from '@/schemas/pda/report/debit-credit-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileDown, Printer, RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PDADebitCreditReportFormProps {
    onReportGenerated: (data: any, fromDate: Date, toDate: Date) => void;
    onCancel: () => void;
    onPrint: () => void;
    onExport: () => void;
    showReportButtons: boolean;
}

const getArray = <T,>(data: any): T[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.$values && Array.isArray(data.$values)) return data.$values;
    return [];
};

export default function PDADebitCreditReportForm({
    onReportGenerated,
    onCancel,
    onPrint,
    onExport,
    showReportButtons
}: PDADebitCreditReportFormProps) {
    const { data: initialData, isLoading: isInitialLoading } = usePDAReportLoadData();
    const sectionsMutation = usePDASectionsSRS();
    const studentsMutation = usePDAStudentsSRS();
    const reportMutation = useGeneratePDAReportSRS();

    const [sections, setSections] = useState<{ value: string; label: string }[]>([]);
    const [students, setStudents] = useState<{ value: string; label: string }[]>([]);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<PDADebitCreditReportFormValues>({
        resolver: zodResolver(pdaDebitCreditReportSchema),
        defaultValues: {
            reportCategory: 'Individual',
            type: 'All',
            asmaY_Id: 0,
            classIds: [],
            sectionIds: [],
            amst_Id: 0
        }
    });

    const watchedYear = watch('asmaY_Id');
    const watchedClasses = watch('classIds');
    const watchedSections = watch('sectionIds');

    // Handle Class Change -> Fetch Sections
    useEffect(() => {
        if (watchedYear && watchedClasses && watchedClasses.length > 0) {
            sectionsMutation.mutate(
                {
                    ASMAY_Id: watchedYear,
                    classlsttwo: watchedClasses.map((id) => ({ ASMCL_Id: id }))
                },
                {
                    onSuccess: (res) => {
                        const data = res?.data;
                        const raw = getArray(data?.fillsection);
                        setSections(raw.map((s: any) => ({ value: s.AMSC_Id.toString(), label: s.asmc_sectionname })));
                        setValue('sectionIds', []);
                        setValue('amst_Id', 0);
                        setStudents([]);
                    }
                }
            );
        } else {
            setSections([]);
            setValue('sectionIds', []);
            setValue('amst_Id', 0);
            setStudents([]);
        }
    }, [watchedYear, watchedClasses]);

    // Handle Section Change -> Fetch Students
    useEffect(() => {
        if (watchedYear && watchedClasses && watchedClasses.length > 0 && watchedSections && watchedSections.length > 0) {
            studentsMutation.mutate(
                {
                    ASMAY_Id: watchedYear,
                    classlsttwo: watchedClasses.map((id) => ({ ASMCL_Id: id })),
                    sectionlistarray: watchedSections.map((id) => ({ AMSC_Id: id }))
                },
                {
                    onSuccess: (res) => {
                        const data = res?.data;
                        const raw = getArray(data?.fillstudent);
                        setStudents(raw.map((s: any) => ({
                            value: s.Amst_Id.toString(),
                            label: `${s.amsT_AdmNo} :: ${s.amsT_FirstName}`
                        })));
                        setValue('amst_Id', 0);
                    }
                }
            );
        } else {
            setStudents([]);
            setValue('amst_Id', 0);
        }
    }, [watchedSections]);

    const onSubmit = (values: PDADebitCreditReportFormValues) => {
        const payload = {
            ASMAY_Id: values.asmaY_Id,
            classlsttwo: values.classIds.map((id) => ({ ASMCL_Id: id })),
            sectionlistarray: values.sectionIds.map((id) => ({ AMSC_Id: id })),
            Amst_Id: values.reportCategory === 'Individual' ? (values.amst_Id || 0) : 0,
            From_Date: format(values.fromDate, 'yyyy-MM-dd'),
            To_Date: format(values.toDate, 'yyyy-MM-dd'),
            type: values.type
        };

        reportMutation.mutate(payload, {
            onSuccess: (res) => {
                const data = res?.data;
                if (!data) {
                    toast.error('No response from server');
                    return;
                }

                const allReport = getArray(data.get_allreport);
                const creditReport = getArray(data.get_creditreport);
                const debitReport = getArray(data.get_debitreport);
                const fillStudent = getArray(data.fillstudent);

                const hasAllData = data.type === 'All' && allReport.length > 0;
                const hasCRData = data.type === 'CR' && creditReport.length > 0;
                const hasDRData = data.type === 'DR' && debitReport.length > 0;

                if (hasAllData || hasCRData || hasDRData) {
                    const normalizedData = {
                        ...data,
                        get_allreport: allReport,
                        get_creditreport: creditReport,
                        get_debitreport: debitReport,
                        fillstudent: fillStudent
                    };
                    onReportGenerated(normalizedData, values.fromDate, values.toDate);
                    toast.success('Report generated successfully');
                } else {
                    toast.error('No Records Found');
                    onCancel();
                }
            },
            onError: (error: any) => {
                toast.error(error.message || 'Failed to generate report');
            }
        });
    };

    const handleReset = () => {
        reset();
        setSections([]);
        setStudents([]);
        onCancel();
    };

    const initialApiData = initialData?.data;
    const years = getArray(initialApiData?.fillyear);
    const classes = getArray(initialApiData?.classlist).map((c: any) => ({
        value: c.asmcL_Id.toString(),
        label: c.asmcL_ClassName
    }));

    return (
        <CollapsibleSection title='PDA Report SRS' defaultOpen className='shadow-lg'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8 p-6'>
                <div className='flex flex-col items-center gap-6'>
                    <Controller
                        name='reportCategory'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className='flex items-center gap-8 bg-purple-50 p-4 rounded-full px-8 border border-purple-100'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='All' id='cat-all' />
                                    <Label htmlFor='cat-all' className='cursor-pointer font-bold text-purple-900'>All</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Individual' id='cat-indi' />
                                    <Label htmlFor='cat-indi' className='cursor-pointer font-bold text-purple-900'>Individual (ClassSectionStudent)</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />

                    <Controller
                        name='type'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className='flex items-center gap-8 bg-muted/50 p-4 rounded-full px-8'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='All' id='type-all' />
                                    <Label htmlFor='type-all' className='cursor-pointer'>All</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='CR' id='type-cr' />
                                    <Label htmlFor='type-cr' className='cursor-pointer'>Credit</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='DR' id='type-dr' />
                                    <Label htmlFor='type-dr' className='cursor-pointer'>Debit</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {/* Academic Year */}
                    <div className='space-y-2'>
                        <Label>Academic Year <span className='text-red-500'>*</span></Label>
                        <Controller
                            name='asmaY_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmaY_Id && <p className='text-xs text-red-500'>{errors.asmaY_Id.message}</p>}
                    </div>

                    {/* Classes (MultiSelect) */}
                    <div className='space-y-2'>
                        <Label>Class Name <span className='text-red-500'>*</span></Label>
                        <Controller
                            name='classIds'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={classes}
                                    onValueChange={(vals) => field.onChange(vals.map(Number))}
                                    defaultValue={field.value.map(String)}
                                    placeholder='Select Classes'
                                    maxCount={2}
                                />
                            )}
                        />
                        {errors.classIds && <p className='text-xs text-red-500'>{errors.classIds.message}</p>}
                    </div>

                    {/* Sections (MultiSelect) */}
                    <div className='space-y-2'>
                        <Label>Section Name <span className='text-red-500'>*</span></Label>
                        <Controller
                            name='sectionIds'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={sections}
                                    onValueChange={(vals) => field.onChange(vals.map(Number))}
                                    defaultValue={field.value.map(String)}
                                    placeholder='Select Sections'
                                    maxCount={2}
                                    disabled={sections.length === 0}
                                />
                            )}
                        />
                        {errors.sectionIds && <p className='text-xs text-red-500'>{errors.sectionIds.message}</p>}
                    </div>

                    {/* Student Select */}
                    <div className='space-y-2'>
                        <Label>Student Name <span className='text-red-500'>*</span></Label>
                        <Controller
                            name='amst_Id'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : ''}
                                    disabled={students.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Student' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.amst_Id && <p className='text-xs text-red-500'>{errors.amst_Id.message}</p>}
                    </div>

                    {/* From Date */}
                    <div className='space-y-2'>
                        <Label>From Date <span className='text-red-500'>*</span></Label>
                        <Controller
                            name='fromDate'
                            control={control}
                            render={({ field }) => (
                                <DatePicker date={field.value} setDate={field.onChange} placeholder='Select From Date' />
                            )}
                        />
                        {errors.fromDate && <p className='text-xs text-red-500'>{errors.fromDate.message}</p>}
                    </div>

                    {/* To Date */}
                    <div className='space-y-2'>
                        <Label>To Date <span className='text-red-500'>*</span></Label>
                        <Controller
                            name='toDate'
                            control={control}
                            render={({ field }) => (
                                <DatePicker date={field.value} setDate={field.onChange} placeholder='Select To Date' />
                            )}
                        />
                        {errors.toDate && <p className='text-xs text-red-500'>{errors.toDate.message}</p>}
                    </div>
                </div>

                <div className='flex flex-wrap items-center justify-center gap-4 border-t pt-6'>
                    <Button
                        type='submit'
                        disabled={reportMutation.isPending}
                        className='bg-primary text-white px-8 shadow-md hover:scale-105 transition-transform'>
                        <Search className='mr-2 h-4 w-4' />
                        {reportMutation.isPending ? 'Generating...' : 'Report'}
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='px-8 hover:bg-destructive/10 hover:text-destructive'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>
                    {showReportButtons && (
                        <>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={onPrint}
                                className='px-8 border-blue-200 text-blue-700 hover:bg-blue-50'>
                                <Printer className='mr-2 h-4 w-4' />
                                Print
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={onExport}
                                className='px-8 border-green-200 text-green-700 hover:bg-green-50'>
                                <FileDown className='mr-2 h-4 w-4' />
                                Export Excel
                            </Button>
                        </>
                    )}
                </div>
            </form>
        </CollapsibleSection>
    );
}
