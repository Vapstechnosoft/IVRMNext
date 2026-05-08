'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRackReportInitialData } from '@/hooks/library/reports/useRackReport';
import type { IRackReportRequest } from '@/types/library/reports/rack-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const reportFormSchema = z.object({
    LMAL_Id: z.coerce.number().min(1, 'Library is required'),
    LMRA_RackName: z.string().min(1, 'Rack Name is required')
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IRackReportRequest) => void;
    isLoading: boolean;
}

export const ReportForm = ({ onSearch, isLoading }: ReportFormProps) => {
    const { data: initialDataWrapper } = useRackReportInitialData();
    const initialData = (initialDataWrapper as any)?.data || initialDataWrapper;

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            LMRA_RackName: ''
        }
    });

    const onSubmit = (data: ReportFormValues) => {
        onSearch(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-5xl space-y-6 p-8 bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400'>
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

            {/* Rack Name Row */}
            <div className='flex justify-center'>
                <div className='flex items-center gap-4 w-full max-w-2xl'>
                    <Label className='min-w-[150px] text-right font-medium text-sm'>
                        Rack Name :<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Controller
                            control={control}
                            name='LMRA_RackName'
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className='w-full border-muted-foreground/30'>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='ALL'>ALL</SelectItem>
                                        {Array.isArray(initialData?.racklist) &&
                                            initialData?.racklist?.map((rack: any) => (
                                                <SelectItem key={rack.lmrA_Id} value={rack.lmrA_RackName}>
                                                    {rack.lmrA_RackName}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.LMRA_RackName && <p className='text-xs text-destructive mt-1'>{errors.LMRA_RackName.message}</p>}
                    </div>
                </div>
            </div>

            <hr className='my-6 border-muted-foreground/20' />

            {/* Action Buttons */}
            <div className='flex items-center justify-center gap-4'>
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
