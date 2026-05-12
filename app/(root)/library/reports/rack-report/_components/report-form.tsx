'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRackReportInitialData, useRackReportLibraries } from '@/hooks/library/reports/useRackReport';
import type { IRackReportRequest } from '@/types/library/reports/rack-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';

const reportFormSchema = z.object({
    LMAL_Id: z.coerce.number().min(1, 'Library is required'),
    LMRA_Id: z.coerce.number()
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IRackReportRequest) => void;
    isLoading: boolean;
}

export const ReportForm = ({ onSearch, isLoading }: ReportFormProps) => {
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            LMRA_Id: 0
        }
    });

    const selectedLmalId = watch('LMAL_Id');
    
    const { data: librariesWrapper } = useRackReportLibraries();
    const { data: initialDataWrapper } = useRackReportInitialData();
    
    const libraries = Array.isArray(librariesWrapper) ? librariesWrapper : (librariesWrapper as any)?.lib_list || (librariesWrapper as any)?.libraryList || [];
    const initialData = (initialDataWrapper as any)?.data || initialDataWrapper;
    const racklist = Array.isArray(initialData?.racklist) ? initialData.racklist : [];

    useEffect(() => {
        if (libraries?.length === 1) {
            setValue('LMAL_Id', libraries[0].lmaL_Id);
        }
    }, [libraries, setValue]);

    const onSubmit = (data: ReportFormValues) => {
        // Updated payload to match the user's requested structure exactly: { "LMAL_Id": 2, "LMRA_Id": 4 }
        const payload: IRackReportRequest = {
            LMAL_Id: data.LMAL_Id,
            LMRA_Id: data.LMRA_Id
        };
        onSearch(payload);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-5xl space-y-6 p-8 bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Library Name */}
                <div className='flex items-center gap-4'>
                    <Label className='min-w-[120px] text-right font-medium text-sm'>
                        Library Name:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Controller
                            control={control}
                            name='LMAL_Id'
                            render={({ field }) => (
                                <Select 
                                    onValueChange={(v) => {
                                        field.onChange(Number(v));
                                        setValue('LMRA_Id', 0);
                                    }} 
                                    value={field.value?.toString()}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select Library' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {libraries?.map((lib: any) => (
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

                {/* Rack Name */}
                <div className='flex items-center gap-4'>
                    <Label className='min-w-[120px] text-right font-medium text-sm'>
                        Rack Name:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <Controller
                            control={control}
                            name='LMRA_Id'
                            render={({ field }) => (
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select Rack' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>ALL</SelectItem>
                                        {racklist?.map((rack: any) => (
                                            <SelectItem key={rack.lmrA_Id} value={rack.lmrA_Id.toString()}>
                                                {rack.lmrA_RackName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </div>
            </div>

            <hr className='my-6 border-muted-foreground/20' />

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
