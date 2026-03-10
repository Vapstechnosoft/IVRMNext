'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
//import { Combobox } from '@/components/ui/combobox';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { consolidatedReportSchema } from '@/schemas/timetable/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { useEffect } from 'react';

import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof consolidatedReportSchema.search>;

interface ConsolidatedFormProps {
    initialData: any;
    onSubmit: (data: any) => void;
}

export default function ConsolidatedForm({ initialData, onSubmit }: ConsolidatedFormProps) {


    // We use the data directly from initialData as per user request to integrate the facade API lists
    const academicList = initialData?.acayear || initialData?.academiclist || [];
    const categoryList = initialData?.catelist || initialData?.categorylist || initialData?.cateoglst || []; // Added catelist/categorylist fallback
    const staffList = initialData?.stafflst || initialData?.stafflist || [];
    const periodList = initialData?.periodslst || initialData?.periodlist || [];
    const daysList = initialData?.dayslst_fix || initialData?.daylist || [];
    const sectionList = initialData?.sectionlists || initialData?.sectionlist || []; // Handles plural and singular
    const classList = initialData?.classlists || initialData?.classlist || []; // Handles plural and singular

    // Mapping for better readability based on user request
    const mockReportTypes = [
        { id: 'ST', label: 'STAFF WISE DETAILS' },
        { id: 'STD', label: 'STAFF DAY WISE' },
        { id: 'CSUB', label: 'CLASS SUBJECT' },
        { id: 'STSUB', label: 'STAFF SUBJECT' },
        { id: 'SPW', label: 'STAFF PERIOD WISE WORKLOAD' },
        { id: 'STFP', label: 'STAFF FREE PERIOD' },
        { id: 'PSTF', label: 'PERIOD WISE STAFF FREE' },
        { id: 'SPC', label: 'STAFF-PERIOD CONSOLIDATED' },
        { id: 'CSPC', label: 'CLASS-SECTION PERIOD CONSOLIDATED' },
        { id: 'RMR', label: 'ROOM-WISE REPORT' },
        { id: 'ATG', label: 'STAFF WORKLOAD AFTER TIMETABLE GENERATION' },
    ];

    // Initial lists from props
    // List variables already defined above from initialData

    const form = useForm<FormFields>({
        resolver: zodResolver(consolidatedReportSchema.search),
        defaultValues: {
            type: 'ST',
            rpttyp: 'SAWC',
            rpttypai: false,
            asmaY_Id: undefined
        }
    });

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = form;

    const watchedType = watch('type');
    const watchedAcademicYear = watch('asmaY_Id');
    const watchedCategory = watch('ttmC_Id');

    // useEffect(() => {
    //     if (academicList?.length > 0 && !watchedAcademicYear) {
    //         setValue('asmaY_Id', academicList[0].asmaY_Id);
    //     }
    // }, [academicList, watchedAcademicYear, setValue]);

    const onFormSubmit = (data: FormFields) => {
        const payload = {
            ASMAY_Id: data.asmaY_Id,
            TYPE: data.type,
            TTMC_Id: data.ttmC_Id,
            rpttyp: data.rpttyp,
            rpttypairods: data.rpttypai,
            // Map IDs to expected backend format (e.g. array of objects)
            classdss: data.classId?.map((id) => ({ asmcL_Id: id, claslis: true })) || [],
            sectiondss: data.sectionId?.map((id) => ({ asmS_Id: id, secs: true })) || [],
            stfidss: data.staffId?.map((id) => ({ hrmE_Id: id, stf: true })) || [],
            dayidss: data.dayId?.map((id) => ({ ttmD_Id: id, sayy: true })) || [],
            periodidss: data.periodId?.map((id) => ({ ttmP_Id: id, ppr: true })) || [],
            TTMD_Id: data.singleDayId,
            TTMP_Id: data.singlePeriodId
        };
        onSubmit(payload);
    };

    const handleClear = () => {
        reset();
    };
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
            {/* Report Type Selection */}
            <div className='space-y-4'>
                <Label className='font-bold text-gray-700'>Report Type</Label>
                <Controller
                    control={control}
                    name='type'
                    render={({ field }) => (
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                            {mockReportTypes.map((type) => (
                                <div key={type.id} className='flex items-center space-x-2'>
                                    <RadioGroupItem value={type.id} id={type.id} />
                                    <Label htmlFor={type.id} className='cursor-pointer text-sm font-medium'>{type.label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                />
            </div>

            <div className='grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2 lg:grid-cols-3'>
                {/* Common Field: Academic Year */}
                <div className='space-y-2'>
                    <Label className='font-semibold'>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmaY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(value) => field.onChange(value ? Number(value) : '')}
                                value={field.value ? field.value.toString() : ''}
                            >
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>

                                <SelectContent>
                                    {academicList?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <span className='text-red-500 text-sm font-medium'>{errors.asmaY_Id.message}</span>}
                </div>

                {/* Specific for ST */}
                {watchedType === 'ST' && (
                    <>
                        <div className='space-y-2'>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    control={control}
                                    name='rpttypai'
                                    render={({ field }) => (
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id='rpttypai' />
                                    )}
                                />
                                <Label htmlFor='rpttypai' className='font-semibold'>Teacher Master</Label>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label className='font-semibold'>
                                Category <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ttmC_Id'
                                render={({ field }) => (
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryList.map((item: any) => (
                                                <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                    {item.ttmC_CategoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.ttmC_Id && <span className='text-red-500 text-sm font-medium'>{errors.ttmC_Id.message}</span>}
                        </div>

                        <div className='space-y-2'>
                            <Label className='font-semibold'>
                                Class <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='classId'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={classList.map((c: any) => ({ label: c.asmcL_ClassName, value: c.asmcL_Id.toString() }))}
                                        defaultValue={(field.value || []).map(String)}
                                        onValueChange={(val) => field.onChange(val.map(Number))}
                                        placeholder='Select Classes'
                                    />
                                )}
                            />
                            {errors.classId && <span className='text-red-500 text-sm font-medium'>{errors.classId.message}</span>}
                        </div>

                        <div className='space-y-2'>
                            <Label className='font-semibold'>
                                Section <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='sectionId'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={sectionList.map((s: any) => ({ label: s.asmC_SectionName, value: s.asmS_Id.toString() }))}
                                        defaultValue={(field.value || []).map(String)}
                                        onValueChange={(val) => field.onChange(val.map(Number))}
                                        placeholder='Select Sections'
                                    />
                                )}
                            />
                            {errors.sectionId && <span className='text-red-500 text-sm font-medium'>{errors.sectionId.message}</span>}
                        </div>
                    </>
                )}

                {/* Specific for CSUB, STSUB, SPW */}
                {['CSUB', 'STSUB', 'SPW'].includes(watchedType) && (
                    <>
                        <div className='space-y-2'>
                            <Label className='font-semibold'>
                                Staff Name <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='staffId'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={staffList.map((s: any) => ({ label: s.empName, value: s.hrmE_Id.toString() }))}
                                        defaultValue={(field.value || []).map(String)}
                                        onValueChange={(val) => field.onChange(val.map(Number))}
                                        placeholder='Select Staff'
                                        className='border-purple-200'
                                    />
                                )}
                            />
                            {errors.staffId && <span className='text-red-500 text-sm font-medium'>{errors.staffId.message}</span>}
                        </div>
                        <div className='space-y-2'>
                            <Label className='font-semibold'>
                                Day <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='dayId'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={daysList.map((d: any) => ({ label: d.ttmD_DayName, value: d.ttmD_Id.toString() }))}
                                        defaultValue={(field.value || []).map(String)}
                                        onValueChange={(val) => field.onChange(val.map(Number))}
                                        placeholder='Select Days'
                                        className='border-purple-200'
                                    />
                                )}
                            />
                            {errors.dayId && <span className='text-red-500 text-sm font-medium'>{errors.dayId.message}</span>}
                        </div>
                        <div className='space-y-2'>
                            <Label className='font-semibold'>
                                Period <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='periodId'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={periodList.map((p: any) => ({ label: p.ttmP_PeriodName, value: p.ttmP_Id.toString() }))}
                                        defaultValue={(field.value || []).map(String)}
                                        onValueChange={(val) => field.onChange(val.map(Number))}
                                        placeholder='Select Periods'
                                        className='border-purple-200'
                                    />
                                )}
                            />
                            {errors.periodId && <span className='text-red-500 text-sm font-medium'>{errors.periodId.message}</span>}
                        </div>
                    </>
                )}

                {/* Specific for STFP, PSTF */}
                {['STFP', 'PSTF'].includes(watchedType) && (
                    <div className='space-y-2'>
                        <Label className='font-semibold'>
                            Day <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='singleDayId'
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger className='border-purple-200'>
                                        <SelectValue placeholder='--Select Day--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {daysList.map((item: any) => (
                                            <SelectItem key={item.ttmD_Id} value={item.ttmD_Id.toString()}>
                                                {item.ttmD_DayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.singleDayId && <span className='text-red-500 text-sm font-medium'>{errors.singleDayId.message}</span>}
                    </div>
                )}

                {/* Specific for PSTF */}
                {watchedType === 'PSTF' && (
                    <div className='space-y-2'>
                        <Label className='font-semibold'>
                            Period <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='singlePeriodId'
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger className='border-purple-200'>
                                        <SelectValue placeholder='--Select Period--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periodList.map((item: any) => (
                                            <SelectItem key={item.ttmP_Id} value={item.ttmP_Id.toString()}>
                                                {item.ttmP_PeriodName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.singlePeriodId && <span className='text-red-500 text-sm font-medium'>{errors.singlePeriodId.message}</span>}
                    </div>
                )}

                {watchedType === 'RMR' && (
                    <div className='col-span-1 space-y-3 md:col-span-2'>
                        <Label className='font-semibold'>Report Option</Label>
                        <Controller
                            control={control}
                            name='rpttyp'
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex flex-wrap gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='SAWC' id='SAWC' className='border-purple-600 text-purple-600' />
                                        <Label htmlFor='SAWC' className='cursor-pointer'>Subject Along With Class Details</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='SNWC' id='SNWC' className='border-purple-600 text-purple-600' />
                                        <Label htmlFor='SNWC' className='cursor-pointer'>Subject Without Class Details</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                        {errors.rpttyp && <span className='text-red-500 text-sm font-medium'>{errors.rpttyp.message}</span>}
                    </div>
                )}
            </div>

            <div className='flex justify-center gap-4 pt-4'>
                <Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
                    {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                    Report
                </Button>
                <Button type='button' variant='outline' onClick={handleClear} className='min-w-[120px]'>
                    <X className='mr-2 h-4 w-4' /> Cancel
                </Button>
            </div>
        </form>
    );
}
