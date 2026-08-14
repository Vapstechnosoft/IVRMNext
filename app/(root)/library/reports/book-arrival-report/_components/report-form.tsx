'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IBookArrivalReportRequest } from '@/types/library/reports/book-arrival-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Download, FileText, Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const reportFormSchema = z
    .object({
        p_lmal_id: z.preprocess(
            (val) => (val === undefined || val === '' ? undefined : Number(val)),
            z.number({ required_error: 'Select Library', invalid_type_error: 'Select Library' }).min(1, 'Select Library')
        ),
        p_type: z.string().min(1, 'Book Type is required'),
        p_type2: z.string().min(1, 'Source Type is required'),
        p_lmd_id: z.coerce.string().default('0'), // 0 = ALL
        datewised: z.boolean().default(false),
        p_fromdate: z.date().optional(),
        p_todate: z.date().optional()
    })
    .refine(
        (data) => {
            if (data.datewised) {
                return !!data.p_fromdate && !!data.p_todate;
            }
            return true;
        },
        {
            message: 'Both dates are required when date filter is enabled',
            path: ['p_fromdate']
        }
    );

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IBookArrivalReportRequest) => void;
    isLoading: boolean;
    hasData: boolean;
    onPrint?: () => void;
    onExport?: () => void;
    initialData: any;
}

export const ReportForm = ({ onSearch, isLoading, hasData, onPrint, onExport, initialData: initialDataProp }: ReportFormProps) => {
    const initialData = (initialDataProp as any)?.data || initialDataProp;

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            p_type: 'ALL',
            p_type2: 'ALL',
            datewised: false,
            p_lmd_id: '0'
        }
    });

    const watchDatewised = watch('datewised');

    const onSubmit = (data: ReportFormValues) => {
        const payload: IBookArrivalReportRequest = {
            p_lmal_id: data.p_lmal_id,
            p_type: data.p_type,
            p_type2: data.p_type2,
            p_lmd_id: data.p_lmd_id,
            p_fromdate: data.datewised && data.p_fromdate ? format(data.p_fromdate, 'yyyy-MM-dd') : undefined,
            p_todate: data.datewised && data.p_todate ? format(data.p_todate, 'yyyy-MM-dd') : undefined,
            subjectsthomos: false,
            stthomosSubject: []
        };
        onSearch(payload);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-5xl space-y-6 rounded-lg border bg-white p-8 shadow-sm'>
            {/* Library Name Row */}
            <div className='flex justify-center'>
                <div className='flex w-full max-w-2xl items-center gap-4'>
                    <Label className='min-w-[150px] text-right font-medium text-sm'>
                        Library Name:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Controller
                            control={control}
                            name='p_lmal_id'
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
                        {errors.p_lmal_id && <p className='mt-1 text-destructive text-xs'>{errors.p_lmal_id.message}</p>}
                    </div>
                </div>
            </div>

            {/* Book Type Section */}
            <div className='mx-auto max-w-4xl space-y-2'>
                <div className='flex justify-center'>
                    <Label className='font-bold text-[#3b82f6] text-sm'>BOOK TYPE :-</Label>
                </div>
                <div className='rounded-md border bg-gray-50/30 p-4'>
                    <Controller
                        control={control}
                        name='p_type'
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className='flex flex-wrap justify-center gap-x-6 gap-y-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='ALL' id='bt_all' />
                                    <Label htmlFor='bt_all' className='cursor-pointer font-normal text-xs'>
                                        ALL
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Issue' id='bt_issue' />
                                    <Label htmlFor='bt_issue' className='cursor-pointer font-normal text-xs'>
                                        Issue
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Reference' id='bt_ref' />
                                    <Label htmlFor='bt_ref' className='cursor-pointer font-normal text-xs'>
                                        Reference
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Issuable' id='bt_issuable' />
                                    <Label htmlFor='bt_issuable' className='cursor-pointer font-normal text-xs'>
                                        Issuable
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Not Issuable' id='bt_notiss' />
                                    <Label htmlFor='bt_notiss' className='cursor-pointer font-normal text-xs'>
                                        Not Issuable
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='ReferenceonlyIssuable' id='bt_r_iss' />
                                    <Label htmlFor='bt_r_iss' className='cursor-pointer font-normal text-xs'>
                                        Reference only Issuable
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='ReferenceonlyNon-Issuable' id='bt_r_niss' />
                                    <Label htmlFor='bt_r_niss' className='cursor-pointer font-normal text-xs'>
                                        Reference only Non-Issuable
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>
            </div>

            {/* Source Type Section */}
            <div className='mx-auto max-w-4xl space-y-2'>
                <div className='flex justify-center'>
                    <Label className='font-bold text-[#3b82f6] text-sm'>SOURCE TYPE :-</Label>
                </div>
                <div className='rounded-md border bg-gray-50/30 p-4'>
                    <Controller
                        control={control}
                        name='p_type2'
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className='flex justify-center gap-12'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='ALL' id='st_all' />
                                    <Label htmlFor='st_all' className='cursor-pointer font-normal text-xs'>
                                        ALL
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Purchased' id='st_pur' />
                                    <Label htmlFor='st_pur' className='cursor-pointer font-normal text-xs'>
                                        Purchased
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Donated' id='st_don' />
                                    <Label htmlFor='st_don' className='cursor-pointer font-normal text-xs'>
                                        Donated
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>
            </div>

            {/* Department Row */}
            <div className='flex justify-center'>
                <div className='flex w-full max-w-2xl items-center gap-4'>
                    <Label className='min-w-[150px] text-right font-medium text-sm'>
                        Department:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Controller
                            control={control}
                            name='p_lmd_id'
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value === '0' ? undefined : field.value}>
                                    <SelectTrigger className='w-full border-muted-foreground/30'>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
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
                        {errors.p_lmd_id && <p className='mt-1 text-destructive text-xs'>{errors.p_lmd_id.message}</p>}
                    </div>
                </div>
            </div>

            {/* Date Range Section */}
            <div className='flex justify-center'>
                <div className='flex w-full max-w-2xl items-center gap-4'>
                    <Label className='min-w-[150px] text-right font-medium text-sm'>Between Entry Date :</Label>
                    <div className='flex flex-1 items-center rounded-md border bg-gray-50/30 p-3'>
                        <Controller
                            control={control}
                            name='datewised'
                            render={({ field }) => (
                                <div className='flex items-center space-x-2 pl-4'>
                                    <Checkbox id='datewised' checked={field.value} onCheckedChange={field.onChange} />
                                    <Label htmlFor='datewised' className='cursor-pointer font-normal text-xs'>
                                        Entry Date
                                    </Label>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className='flex justify-center'>
                <div className='flex w-full max-w-2xl items-center gap-4'>
                    <Label className='min-w-[150px] text-right font-medium text-sm'>From Date :</Label>
                    <div className='flex flex-1 items-center gap-4'>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='p_fromdate'
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
                        <Label className='font-medium text-sm'>To Date :</Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='p_todate'
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
            {errors.p_fromdate && (
                <div className='flex justify-center'>
                    <p className='text-destructive text-xs'>{errors.p_fromdate.message}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className='flex items-center justify-center gap-4 pt-4'>
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
                {hasData && (
                    <>
                        <Button
                            type='button'
                            className='h-8 min-w-[100px] rounded-sm bg-[#22c55e] px-4 py-1 text-white text-xs shadow-sm hover:bg-[#16a34a]'
                            onClick={onPrint}>
                            <FileText className='mr-1.5 h-3.5 w-3.5' />
                            PRINT
                        </Button>
                        <Button
                            type='button'
                            className='h-8 min-w-[100px] rounded-sm bg-[#eab308] px-4 py-1 text-white text-xs shadow-sm hover:bg-[#ca8a04]'
                            onClick={onExport}>
                            <Download className='mr-1.5 h-3.5 w-3.5' />
                            EXPORT TO EXCEL
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
};
