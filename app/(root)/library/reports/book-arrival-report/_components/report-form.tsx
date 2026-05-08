'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBookArrivalReportInitialData } from '@/hooks/library/reports/useBookArrivalReport';
import type { IBookArrivalReportRequest } from '@/types/library/reports/book-arrival-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import { z } from 'zod';

const reportFormSchema = z
    .object({
        LMAL_Id: z.coerce.number().min(1, 'Library is required'),
        Type: z.string().min(1, 'Book Type is required'),
        Type2: z.string().min(1, 'Source Type is required'),
        LMD_Id: z.coerce.number().optional(), // 0 = ALL
        datewised: z.boolean().default(false),
        Fromdate: z.date().optional(),
        ToDate: z.date().optional()
    })
    .refine(
        (data) => {
            if (data.datewised) {
                return !!data.Fromdate && !!data.ToDate;
            }
            return true;
        },
        {
            message: 'Both dates are required when date filter is enabled',
            path: ['Fromdate']
        }
    );

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IBookArrivalReportRequest) => void;
    isLoading: boolean;
}

export const ReportForm = ({ onSearch, isLoading }: ReportFormProps) => {
    const { data: initialDataWrapper } = useBookArrivalReportInitialData();
    // Assuming ApiResponse wrapper structure: data?.data?.lib_list
    const initialData = (initialDataWrapper as any)?.data || initialDataWrapper;

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            Type: 'ALL',
            Type2: 'ALL',
            datewised: false,
            LMD_Id: 0
        }
    });

    const watchDatewised = watch('datewised');

    const onSubmit = (data: ReportFormValues) => {
        const payload: IBookArrivalReportRequest = {
            LMAL_Id: data.LMAL_Id,
            Type: data.Type,
            Type2: data.Type2,
            LMD_Id: data.LMD_Id || 0,
            Fromdate: data.datewised ? data.Fromdate?.toISOString() : undefined,
            ToDate: data.datewised ? data.ToDate?.toISOString() : undefined
        };
        onSearch(payload);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-5xl space-y-6 p-8 bg-white rounded-lg shadow-sm border'>
            {/* Library Name Row */}
            <div className='flex justify-center'>
                <div className='flex items-center gap-4 w-full max-w-2xl'>
                    <Label className='min-w-[150px] text-right font-medium text-sm'>
                        Library Name:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Controller
                            control={control}
                            name='LMAL_Id'
                            render={({ field }) => (
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <SelectTrigger className='w-full border-muted-foreground/30'>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(initialData?.lib_list) &&
                                            initialData?.lib_list?.map((lib: any) => (
                                                <SelectItem key={lib.lmaL_Id} value={lib.lmaL_Id.toString()}>
                                                    {lib.lmaL_LibraryName}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.LMAL_Id && <p className='text-xs text-destructive mt-1'>{errors.LMAL_Id.message}</p>}
                    </div>
                </div>
            </div>

            {/* Book Type Section */}
            <div className='space-y-2 mx-auto max-w-4xl'>
                <div className='flex justify-center'>
                    <Label className='font-bold text-[#3b82f6] text-sm'>BOOK TYPE :-</Label>
                </div>
                <div className='border rounded-md p-4 bg-gray-50/30'>
                    <Controller
                        control={control}
                        name='Type'
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className='flex flex-wrap justify-center gap-x-6 gap-y-4'
                            >
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='ALL' id='bt_all' />
                                    <Label htmlFor='bt_all' className='text-xs font-normal cursor-pointer'>ALL</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Issue' id='bt_issue' />
                                    <Label htmlFor='bt_issue' className='text-xs font-normal cursor-pointer'>Issue</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Reference' id='bt_ref' />
                                    <Label htmlFor='bt_ref' className='text-xs font-normal cursor-pointer'>Reference</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Issuable' id='bt_issuable' />
                                    <Label htmlFor='bt_issuable' className='text-xs font-normal cursor-pointer'>Issuable</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Not Issuable' id='bt_notiss' />
                                    <Label htmlFor='bt_notiss' className='text-xs font-normal cursor-pointer'>Not Issuable</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='ReferenceonlyIssuable' id='bt_r_iss' />
                                    <Label htmlFor='bt_r_iss' className='text-xs font-normal cursor-pointer'>Reference only Issuable</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='ReferenceonlyNon-Issuable' id='bt_r_niss' />
                                    <Label htmlFor='bt_r_niss' className='text-xs font-normal cursor-pointer'>Reference only Non-Issuable</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>
            </div>

            {/* Source Type Section */}
            <div className='space-y-2 mx-auto max-w-4xl'>
                <div className='flex justify-center'>
                    <Label className='font-bold text-[#3b82f6] text-sm'>SOURCE TYPE :-</Label>
                </div>
                <div className='border rounded-md p-4 bg-gray-50/30'>
                    <Controller
                        control={control}
                        name='Type2'
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className='flex justify-center gap-12'
                            >
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='ALL' id='st_all' />
                                    <Label htmlFor='st_all' className='text-xs font-normal cursor-pointer'>ALL</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Purchased' id='st_pur' />
                                    <Label htmlFor='st_pur' className='text-xs font-normal cursor-pointer'>Purchased</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Donated' id='st_don' />
                                    <Label htmlFor='st_don' className='text-xs font-normal cursor-pointer'>Donated</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>
            </div>

            {/* Department Row */}
            <div className='flex justify-center'>
                <div className='flex items-center gap-4 w-full max-w-2xl'>
                    <Label className='min-w-[150px] text-right font-medium text-sm'>
                        Department:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Controller
                            control={control}
                            name='LMD_Id'
                            render={({ field }) => (
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <SelectTrigger className='w-full border-muted-foreground/30'>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>Select</SelectItem>
                                        {Array.isArray(initialData?.deptlist) &&
                                            initialData?.deptlist?.map((dept: any) => (
                                                <SelectItem key={dept.lmD_Id} value={dept.lmD_Id.toString()}>
                                                    {dept.lmD_DepartmentName}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.LMD_Id && <p className='text-xs text-destructive mt-1'>{errors.LMD_Id.message}</p>}
                    </div>
                </div>
            </div>

            {/* Date Range Section */}
            <div className='flex justify-center'>
                <div className='flex items-center gap-4 w-full max-w-2xl'>
                    <Label className='min-w-[150px] text-right font-medium text-sm'>
                        Between Entry Date :
                    </Label>
                    <div className='flex-1 border rounded-md p-3 bg-gray-50/30 flex items-center'>
                        <Controller
                            control={control}
                            name='datewised'
                            render={({ field }) => (
                                <div className='flex items-center space-x-2 pl-4'>
                                    <Checkbox id='datewised' checked={field.value} onCheckedChange={field.onChange} />
                                    <Label htmlFor='datewised' className='text-xs font-normal cursor-pointer'>Entry Date</Label>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className='flex justify-center'>
                <div className='flex items-center gap-4 w-full max-w-2xl'>
                    <Label className='min-w-[150px] text-right font-medium text-sm'>
                        From Date :
                    </Label>
                    <div className='flex-1 flex items-center gap-4'>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='Fromdate'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='enter date'
                                        disabled={!watchDatewised}
                                        className='w-full'
                                    />
                                )}
                            />
                        </div>
                        <Label className='text-sm font-medium'>To Date :</Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='ToDate'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='enter date'
                                        disabled={!watchDatewised}
                                        className='w-full'
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {errors.Fromdate && (
                <div className='flex justify-center'>
                    <p className='text-xs text-destructive'>{errors.Fromdate.message}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className='flex items-center justify-center gap-4 pt-4'>
                <Button
                    type='submit'
                    className='h-8 px-4 py-1 text-xs min-w-[100px] bg-[#4251b1] hover:bg-[#35418e] shadow-sm rounded-sm'
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : <Search className='mr-1.5 h-3.5 w-3.5' />}
                    REPORT
                </Button>
                <Button
                    type='button'
                    className='h-8 px-4 py-1 text-xs min-w-[100px] bg-[#ff5a30] hover:bg-[#e64d26] text-white shadow-sm rounded-sm'
                    onClick={() => reset()}
                    disabled={isLoading}
                >
                    <X className='mr-1.5 h-3.5 w-3.5' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
};
