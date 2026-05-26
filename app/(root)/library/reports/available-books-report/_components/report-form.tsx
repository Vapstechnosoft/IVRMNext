'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAvailableBooksReportInitialData } from '@/hooks/library/reports/useAvailableBooksReport';
//import { IAvailableBooksReportRequest } from '@/types/library/reports/available-books-report';
import type { IAvailableBooksReportRequest } from '@/types/library/reports/available-books-report';
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
            Type: 'ALL',
            Type2: 'ALL',
            statuscount: true,
            LMD_Id: 0
        }
    });

    const _watchStatusCount = watch('statuscount');

    const onSubmit = (data: ReportFormValues) => {
        const payload: IAvailableBooksReportRequest = {
            LMAL_Id: data.LMAL_Id,
            Type: data.Type,
            Type2: data.Type2,
            LMD_Id: data.LMD_Id || 0,
            statuscount: data.statuscount,
            Fromdate: data.statuscount && data.IssueFromDate ? data.IssueFromDate.toISOString().split('T')[0] : '2024-01-01',
            ToDate: data.statuscount && data.IssueToDate ? data.IssueToDate.toISOString().split('T')[0] : '2025-12-31',
            subjectsthomos: false,
            stthomosSubject: []
        };
        onSearch(payload);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-6xl space-y-8 rounded-lg border bg-white p-8 shadow-sm'>
            {/* Library Name Row */}
            <div className='flex justify-center pb-4'>
                <div className='flex w-full max-w-3xl items-center gap-8'>
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
                        {errors.LMAL_Id && <p className='mt-1 text-destructive text-xs'>{errors.LMAL_Id.message}</p>}
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-6'>
                    {/* Book Type Section */}
                    <div className='space-y-2'>
                        <div className='flex justify-center'>
                            <Label className='font-bold text-[#3b82f6] text-sm'>BOOK TYPE :-</Label>
                        </div>
                        <div className='rounded-md border bg-gray-50/30 p-4'>
                            <Controller
                                control={control}
                                name='Type'
                                render={({ field }) => (
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className='grid grid-cols-3 gap-x-2 gap-y-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='ALL' id='bt_all' />
                                            <Label htmlFor='bt_all' className='cursor-pointer font-normal text-[10px]'>
                                                ALL
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Issue' id='bt_issue' />
                                            <Label htmlFor='bt_issue' className='cursor-pointer font-normal text-[10px]'>
                                                Issue
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Issuable' id='bt_issuable' />
                                            <Label htmlFor='bt_issuable' className='cursor-pointer font-normal text-[10px]'>
                                                Issuable
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Reference' id='bt_ref' />
                                            <Label htmlFor='bt_ref' className='cursor-pointer font-normal text-[10px]'>
                                                Not Issuable
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='ReferenceonlyIssuable' id='bt_r_iss' />
                                            <Label htmlFor='bt_r_iss' className='cursor-pointer font-normal text-[10px]'>
                                                Reference only Issuable
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='ReferenceonlyNon-Issuable' id='bt_r_niss' />
                                            <Label htmlFor='bt_r_niss' className='cursor-pointer font-normal text-[10px]'>
                                                Reference only Non-Issuable
                                            </Label>
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
                        <div className='rounded-md border bg-gray-50/30 p-4'>
                            <Controller
                                control={control}
                                name='Type2'
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex justify-around'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='ALL' id='st_all' />
                                            <Label htmlFor='st_all' className='cursor-pointer font-normal text-[10px]'>
                                                ALL
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Purchased' id='st_pur' />
                                            <Label htmlFor='st_pur' className='cursor-pointer font-normal text-[10px]'>
                                                Purchased
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Donated' id='st_don' />
                                            <Label htmlFor='st_don' className='cursor-pointer font-normal text-[10px]'>
                                                Donated
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className='flex flex-col justify-start space-y-8'>
                    {/* Department */}
                    <div className='mt-6 flex items-center gap-4'>
                        <Label className='min-w-[100px] text-right font-medium text-sm'>
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
                            {errors.LMD_Id && <p className='mt-1 text-destructive text-xs'>{errors.LMD_Id.message}</p>}
                        </div>
                    </div>

                    {/* Date Section */}
                    <div className='space-y-4 pt-4'>
                        <div className='flex items-center gap-2 pl-[116px]'>
                            <Controller
                                control={control}
                                name='statuscount'
                                render={({ field }) => <Checkbox id='statuscount' checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <Label htmlFor='statuscount' className='cursor-pointer font-medium text-xs'>
                                Entry Date
                            </Label>
                        </div>

                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[100px] text-right font-medium text-xs'>Entry Date</Label>
                            <div className='flex flex-1 items-center gap-2'>
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
                                <span className='font-bold text-[10px]'>AND</span>
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
                        {errors.IssueFromDate && <p className='text-center text-destructive text-xs'>{errors.IssueFromDate.message}</p>}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center justify-center gap-4 pt-8'>
                <Button
                    type='submit'
                    className='h-8 min-w-[100px] rounded-sm bg-[#4251b1] px-4 py-1 text-xs shadow-sm hover:bg-[#35418e]'
                    disabled={isLoading}>
                    {isLoading ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : <Search className='mr-1.5 h-3.5 w-3.5' />}
                    REPORT
                </Button>
                <Button
                    type='button'
                    className='h-8 min-w-[100px] rounded-sm bg-[#ff5a30] px-4 py-1 text-white text-xs shadow-sm hover:bg-[#e64d26]'
                    onClick={() => reset()}
                    disabled={isLoading}>
                    <X className='mr-1.5 h-3.5 w-3.5' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
};
