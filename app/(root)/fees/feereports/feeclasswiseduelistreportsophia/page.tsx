'use client';

import { useAcademicYearDropdown, useMasterTermsDropdowndataOnlinegroupheadmapping } from '@/hooks/fees/useMasters';
import { useFeeClassListDefaulterreport, useFeeSectionListDefaulterreport } from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { feeClassWiseDueListReportSophia } from '@/schemas/fees/reports';
import { feeClassWiseDueListreportSophia } from '@/server/fees/reports/sophia_reports';
import type { IFeeClassDropdownList, IFeeSectionDropdownList } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeClassWiseDueListReportSophia>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export default function FeeClassWiseDueListReportofSophia() {
    const {
        handleSubmit,
        setValue,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeClassWiseDueListReportSophia),
        defaultValues: {
            academicYearId: undefined,
            classId: undefined,
            sectionId: undefined,
            termId: undefined,
            classwise: false,
            dateWise: false,
            termWise: false,
            active: false,
            deactive: false,
            left: false,
            fromDate: format(new Date(), 'yyyy-MM-dd'),
            toDate: format(new Date(), 'yyyy-MM-dd')
        }
    });

    const classWiseChecked = watch('classwise');
    const dateWiseChecked = watch('dateWise');
    const termWiseChecked = watch('termWise');
    // const selectedClassId = watch("classId");

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [showReport, setShowReport] = useState(false);

    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();

    const { data: sectionListResponse, isLoading: loadingSections, error: sectionListError } = useFeeSectionListDefaulterreport();

    const { data: masterTerms, isLoading: masterTermsLoading } = useMasterTermsDropdowndataOnlinegroupheadmapping();

    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
            setAcademicYears([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const formatted: IAcademicYear[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id ?? '',
                asmaY_Year: item.asmaY_Year ?? 'Unknown Year',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (classListError) {
            toast.error(classListError?.message || 'Failed to load classes');
            setClasses([]);
            return;
        }
        if (classListResponse?.data && Array.isArray(classListResponse.data)) {
            setClasses(classListResponse.data);
        }
    }, [classListResponse, classListError]);

    useEffect(() => {
        if (sectionListError) {
            toast.error(sectionListError?.message || 'Failed to load Sections');
            setClasses([]);
            return;
        }
        if (sectionListResponse?.data && Array.isArray(sectionListResponse.data)) {
            setSections(sectionListResponse.data);
        }
    }, [sectionListResponse, sectionListError]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (data.active === false && data.deactive === false && data.left === false) {
            toast.error('Please Select Any One CheckBox Active or Deactive or Left ..');
            return;
        }
        setShowReport(false);
        try {
            const payload = {
                classlist: data.classwise === true ? [data.classId] : [],
                sectionlist: data.classwise === true ? [data.sectionId] : [],
                fromdate: data.dateWise === true ? data.fromDate : '',
                todate: data.dateWise === true ? data.toDate : '',
                fmT_Ids: data.termWise === true ? [data.termId] : [],
                customflag: 'DUELIST',
                asmaY_Id: data.academicYearId,
                radioval: '',
                active: data.active === true ? 1 : 0,
                deactive: data.deactive === true ? 1 : 0,
                left: data.left === true ? 1 : 0
            };

            const apiData = await feeClassWiseDueListreportSophia(payload);
            // biome-ignore lint/suspicious/noConsoleLog: <explanation>
            console.log('apiData', apiData);
            const responseJson = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
            if (responseJson?.data) {
                setReportData(responseJson.data);
                setShowReport(true);
                toast.success('Report Generated Successfully');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
            setShowReport(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='place-items-center p-8'>
                            <div className='space-y-8'>
                                <div className='flex items-center gap-12'>
                                    {/* Academic Year */}
                                    <div className='flex w-[420px] items-center gap-4'>
                                        <Label className='w-36 text-right'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>

                                        <div className='flex-1'>
                                            <Controller
                                                name='academicYearId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(v) => field.onChange(Number(v))}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='--Select Academic Year--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingAcademic ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                academicYears?.map((item: any) => (
                                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                        {item.asmaY_Year}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-3'>
                                        <Controller
                                            name='classwise'
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type='checkbox'
                                                    checked={field.value ?? false} // ✅ Fixed: handle undefined
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    className='h-4 w-4'
                                                />
                                            )}
                                        />
                                        <Label className='font-medium'>Class Wise</Label>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <Controller
                                            name='dateWise'
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type='checkbox'
                                                    checked={field.value ?? false} // ✅ Fixed: handle undefined
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    className='h-4 w-4'
                                                />
                                            )}
                                        />
                                        <Label className='font-medium'>Date Wise</Label>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <Controller
                                            name='termWise'
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type='checkbox'
                                                    checked={field.value ?? false} // ✅ Fixed: handle undefined
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    className='h-4 w-4'
                                                />
                                            )}
                                        />
                                        <Label className='font-medium'>Term Wise</Label>
                                    </div>
                                </div>

                                {/* Dates - Now controlled by react-hook-form */}
                                {dateWiseChecked && (
                                    <div className='flex items-center gap-12'>
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label htmlFor='fromDate'>
                                                From Date: <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='fromDate'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex-1'>
                                                        <Input
                                                            id='fromDate'
                                                            type='date'
                                                            {...field}
                                                            className='w-full rounded border px-3 py-1'
                                                        />
                                                        {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label htmlFor='toDate'>
                                                To Date: <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='toDate'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex-1'>
                                                        <Input
                                                            id='toDate'
                                                            type='date'
                                                            {...field}
                                                            className='w-full rounded border px-3 py-1'
                                                        />
                                                        {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                                {classWiseChecked && (
                                    <div className='mt-4 flex items-center gap-12'>
                                        {/* Class */}
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Class <span className='text-red-500'>*</span>
                                            </Label>

                                            <div className='flex-1'>
                                                <Controller
                                                    name='classId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value && field.value !== 0 ? field.value.toString() : ''}
                                                            onValueChange={(v) => {
                                                                field.onChange(Number(v));
                                                                setValue('sectionId', 0);
                                                            }}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--Select Class--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {loadingClasses ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : (
                                                                    classes.map((cls) => (
                                                                        <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                                            {cls.asmcL_ClassName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.classId && <FormError>{errors.classId.message}</FormError>}
                                            </div>
                                        </div>

                                        {/* Section */}
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Section <span className='text-red-500'>*</span>
                                            </Label>

                                            <div className='flex-1'>
                                                <Controller
                                                    name='sectionId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value && field.value !== 0 ? field.value.toString() : ''}
                                                            onValueChange={(v) => field.onChange(Number(v))}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--All--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {loadingSections ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : (
                                                                    sections.map((sec) => (
                                                                        <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                                            {sec.asmC_SectionName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.sectionId && <FormError>{errors.sectionId.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {termWiseChecked && (
                                    <div className='mt-4 flex items-center gap-12'>
                                        {/* Class */}
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Term <span className='text-red-500'>*</span>
                                            </Label>

                                            <div className='flex-1'>
                                                <Controller
                                                    name='termId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value && field.value !== 0 ? field.value.toString() : ''}
                                                            onValueChange={(v) => {
                                                                field.onChange(Number(v));
                                                            }}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--Select term--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {masterTermsLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : (
                                                                    masterTerms?.data?.map((cls) => (
                                                                        <SelectItem key={cls.fmT_Id} value={cls.fmT_Id.toString()}>
                                                                            {cls.fmT_Name}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.termId && <FormError>{errors.termId.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <Card>
                                    <div className='flex items-center justify-center gap-12 p-5'>
                                        <div className=' flex items-center gap-12'>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='active'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false} // ✅ Fixed: handle undefined
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Active</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='deactive'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false} // ✅ Fixed: handle undefined
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Deactive</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='left'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false} // ✅ Fixed: handle undefined
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Left</Label>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <div>
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button
                                            size='lg'
                                            variant='outline'
                                            className='px-8'
                                            onClick={() => window.location.reload()}
                                            type='button'>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={isSubmitting} className='px-12'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>

            {showReport && reportData.length > 0 && (
                <div className='mx-auto mt-8 max-w-7xl'>
                    <Card className='border-0 p-6 shadow-xl'>
                        <h2 className='mb-4 font-bold text-xl'>Report Results</h2>
                        <pre>{JSON.stringify(reportData, null, 2)}</pre>
                    </Card>
                </div>
            )}
        </div>
    );
}
