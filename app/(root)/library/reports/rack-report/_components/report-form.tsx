'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRackReportInitialData, useRackReportLibraries } from '@/hooks/library/reports/useRackReport';
import type { IRackReportRequest } from '@/types/library/reports/rack-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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

    const _selectedLmalId = watch('LMAL_Id');

    const { data: librariesWrapper } = useRackReportLibraries();
    const { data: initialDataWrapper } = useRackReportInitialData();
    
    // Extract libraries from useRackReportLibraries
    let fetchedLibraries: any[] = [];
    if (Array.isArray(librariesWrapper)) {
        fetchedLibraries = librariesWrapper;
    } else if (librariesWrapper && typeof librariesWrapper === 'object') {
        const wrapper = (librariesWrapper as any).data || librariesWrapper;
        fetchedLibraries = wrapper.lib_list || wrapper.libraryList || wrapper.libList || [];
    }

    // Extract libraries and racklist from useRackReportInitialData
    let initialLibraries: any[] = [];
    let racklist: any[] = [];
    
    if (initialDataWrapper && typeof initialDataWrapper === 'object') {
        const wrapper = (initialDataWrapper as any).data || initialDataWrapper;
        initialLibraries = wrapper.lib_list || wrapper.libraryList || wrapper.libList || [];
        racklist = wrapper.racklist || wrapper.msterRacklist || [];
    }

    // Combine or fallback
    const libraries = fetchedLibraries.length > 0 ? fetchedLibraries : initialLibraries;

    useEffect(() => {
        if (libraries && libraries.length > 0) {
            const currentLmalId = watch('LMAL_Id');
            if (!currentLmalId) {
                if (libraries.length === 1) {
                    setValue('LMAL_Id', libraries[0].lmaL_Id);
                } else {
                    setValue('LMAL_Id', libraries[0].lmaL_Id);
                }
            }
        }
    }, [libraries, setValue, watch]);

    const onSubmit = (data: ReportFormValues) => {
        // Updated payload to match the user's requested structure exactly: { "LMAL_Id": 2, "LMRA_Id": 4 }
        const payload: IRackReportRequest = {
            LMAL_Id: data.LMAL_Id,
            LMRA_Id: data.LMRA_Id
        };
        onSearch(payload);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className='mx-auto max-w-5xl space-y-6 rounded-lg border border-t-4 border-t-orange-400 bg-white p-8 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
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
                                    value={field.value?.toString()}>
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
                        {errors.LMAL_Id && <p className='mt-1 text-destructive text-xs'>{errors.LMAL_Id.message}</p>}
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
