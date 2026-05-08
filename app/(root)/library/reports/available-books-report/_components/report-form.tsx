'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAvailableBooksReportInitialData } from '@/hooks/library/reports/useAvailableBooksReport';
//import { IAvailableBooksReportRequest } from '@/types/library/reports/available-books-report';
import type { IAvailableBooksReportRequest } from '@/types/library/reports/available-books-report';
import { DatePicker } from '@/components/ui/date-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const reportFormSchema = z
    .object({
        LMAL_Id: z.coerce.number().min(1, 'Library is required'),
        Type: z.string().min(1, 'Book Type is required'),
        Type2: z.string().min(1, 'Source Type is required'),
        LMD_Id: z.coerce.number().optional(), // 0 = ALL
        statuscount: z.boolean().default(false),
        IssueFromDate: z.date().optional(),
        IssueToDate: z.date().optional()
    })
    .refine(
        (data) => {
            if (data.statuscount) {
                return !!data.IssueFromDate && !!data.IssueToDate;
            }
            return true;
        },
        {
            message: 'Both dates are required when date filter is enabled',
            path: ['IssueFromDate'] // Focus error on From Date
        }
    );

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IAvailableBooksReportRequest) => void;
    isLoading: boolean;
}

export const ReportForm = ({ onSearch, isLoading }: ReportFormProps) => {
    const { data: initialData } = useAvailableBooksReportInitialData();

    const libraries = initialData?.data?.libraryList ?? [];
    const departments = initialData?.data?.departmentList ?? [];

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
            Type: 'all',
            Type2: 'all',
            statuscount: true,
            LMD_Id: 0
        }
    });

    const watchStatusCount = watch('statuscount');

    const onSubmit = (data: ReportFormValues) => {
        const payload: IAvailableBooksReportRequest = {
            lmaL_Id: data.LMAL_Id,
            type: data.Type,
            type2: data.Type2,
            lmD_Id: data.LMD_Id || 0,
            statuscount: data.statuscount,
            fromdate: data.statuscount ? data.IssueFromDate?.toISOString() : undefined,
            toDate: data.statuscount ? data.IssueToDate?.toISOString() : undefined,
            subjectsthomos: false
        };
        onSearch(payload);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-6xl space-y-8 p-8 bg-white rounded-lg shadow-sm border'>
            {/* Library Name Row */}
            <div className='flex justify-center pb-4'>
                <div className='flex items-center gap-8 w-full max-w-3xl'>
                    <Label className='min-w-[180px] text-right font-medium text-sm'>
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
                                        {Array.isArray(libraries) &&
                                            libraries.map((lib) => (
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

            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6'>
                {/* Left Column */}
                <div className='space-y-6'>
                    {/* Book Type Section */}
                    <div className='space-y-2'>
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
                                        className='grid grid-cols-3 gap-y-4 gap-x-2'
                                    >
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='all' id='bt_all' />
                                            <Label htmlFor='bt_all' className='text-[10px] font-normal cursor-pointer'>ALL</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Issue' id='bt_issue' />
                                            <Label htmlFor='bt_issue' className='text-[10px] font-normal cursor-pointer'>Issue</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Issuable' id='bt_issuable' />
                                            <Label htmlFor='bt_issuable' className='text-[10px] font-normal cursor-pointer'>Issuable</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Reference' id='bt_ref' />
                                            <Label htmlFor='bt_ref' className='text-[10px] font-normal cursor-pointer'>Not Issuable</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='ReferenceonlyIssuable' id='bt_r_iss' />
                                            <Label htmlFor='bt_r_iss' className='text-[10px] font-normal cursor-pointer'>Reference only Issuable</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='ReferenceonlyNon-Issuable' id='bt_r_niss' />
                                            <Label htmlFor='bt_r_niss' className='text-[10px] font-normal cursor-pointer'>Reference only Non-Issuable</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>
                    </div>

                    {/* Source Type Section */}
                    <div className='space-y-2'>
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
                                        className='flex justify-around'
                                    >
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='all' id='st_all' />
                                            <Label htmlFor='st_all' className='text-[10px] font-normal cursor-pointer'>ALL</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Purchased' id='st_pur' />
                                            <Label htmlFor='st_pur' className='text-[10px] font-normal cursor-pointer'>Purchased</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Donated' id='st_don' />
                                            <Label htmlFor='st_don' className='text-[10px] font-normal cursor-pointer'>Donated</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-8 flex flex-col justify-start'>
                    {/* Department */}
                    <div className='flex items-center gap-4 mt-6'>
                        <Label className='min-w-[100px] font-medium text-right text-sm'>
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
                                            {Array.isArray(departments) &&
                                                departments.map((dept) => (
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

                    {/* Date Section */}
                    <div className='space-y-4 pt-4'>
                        <div className='flex items-center gap-2 pl-[116px]'>
                            <Controller
                                control={control}
                                name='statuscount'
                                render={({ field }) => (
                                    <Checkbox
                                        id='statuscount'
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor='statuscount' className='cursor-pointer font-medium text-xs'>Entry Date</Label>
                        </div>

                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[100px] font-medium text-right text-xs'>Entry Date</Label>
                            <div className='flex-1 flex items-center gap-2'>
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='IssueFromDate'
                                        render={({ field }) => (
                                            <DatePicker
                                                date={field.value}
                                                setDate={field.onChange}
                                                placeholder='Enter From date'
                                                className='w-full'
                                            />
                                        )}
                                    />
                                </div>
                                <span className='text-[10px] font-bold'>AND</span>
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='IssueToDate'
                                        render={({ field }) => (
                                            <DatePicker
                                                date={field.value}
                                                setDate={field.onChange}
                                                placeholder='Enter To date'
                                                className='w-full'
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        {errors.IssueFromDate && <p className='text-xs text-destructive text-center'>{errors.IssueFromDate.message}</p>}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center justify-center gap-4 pt-8'>
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
