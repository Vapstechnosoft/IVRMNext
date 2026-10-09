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
    LMAL_Id: z.preprocess(
        (val) => (val === undefined || val === '' ? undefined : Number(val)),
        z.number({ required_error: 'Select Library', invalid_type_error: 'Select Library' }).min(1, 'Select Library')
    ),
    LMRA_Id: z.preprocess((val) => (val === undefined || val === null || val === '' ? 'ALL' : String(val)), z.string().optional())
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IRackReportRequest) => void;
    isLoading: boolean;
    hasData: boolean;
    onPrint?: () => void;
    onExport?: () => void;
    onCancel?: () => void;
    initialData?: any;
}

export const ReportForm = ({
    onSearch,
    isLoading,
    hasData,
    onPrint,
    onExport,
    onCancel,
    initialData: initialDataProp
}: ReportFormProps) => {
    const rawInitial = (initialDataProp as any)?.data || initialDataProp || {};
    const { data: hookInitialWrapper } = useRackReportInitialData();
    const { data: hookLibWrapper } = useRackReportLibraries();

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
            LMRA_Id: 'ALL'
        }
    });

    const extractList = (list: any): any[] => {
        if (!list) return [];
        if (Array.isArray(list)) return list;
        if (list && typeof list === 'object' && '$values' in list && Array.isArray(list.$values)) {
            return list.$values;
        }
        const inner = list.data || list.lib_list || list.libraryList || list.racklist || list.msterRacklist || list;
        if (Array.isArray(inner)) return inner;
        if (inner && typeof inner === 'object' && '$values' in inner && Array.isArray(inner.$values)) {
            return inner.$values;
        }
        return [];
    };

    const initialData = rawInitial?.lib_list?.length ? rawInitial : (hookInitialWrapper as any)?.data || hookInitialWrapper || rawInitial;

    const libList = extractList(initialData?.lib_list || initialData?.libraryList || initialData?.libList || hookLibWrapper || []);
    const rackList = extractList(initialData?.racklist || initialData?.msterRacklist || initialData?.rackList || []);

    const watchLmalId = watch('LMAL_Id');

    useEffect(() => {
        if (libList.length === 1 && !watchLmalId) {
            const firstLib = libList[0];
            const firstLibId = Number(firstLib?.lmaL_Id ?? firstLib?.LMAL_Id ?? firstLib?.lmal_Id ?? 0);
            if (firstLibId) {
                setValue('LMAL_Id', firstLibId);
            }
        }
    }, [libList, watchLmalId, setValue]);

    const onSubmit = (data: ReportFormValues) => {
        const rackVal = data.LMRA_Id === '0' || data.LMRA_Id === 'ALL' || !data.LMRA_Id ? 'ALL' : data.LMRA_Id;
        const payload: IRackReportRequest = {
            LMAL_Id: Number(data.LMAL_Id),
            LMRA_Id: rackVal
        };
        onSearch(payload);
    };

    const handleReset = () => {
        const defaultLibId = libList.length === 1 ? Number(libList[0]?.lmaL_Id ?? libList[0]?.LMAL_Id ?? 0) : undefined;
        reset({
            LMAL_Id: defaultLibId,
            LMRA_Id: 'ALL'
        });
        onCancel?.();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='mx-auto max-w-4xl space-y-4'>
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
                                            setValue('LMRA_Id', 'ALL');
                                        }}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Library' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {libList.map((lib: any) => {
                                                const id = lib.lmaL_Id ?? lib.LMAL_Id ?? lib.lmal_Id;
                                                const name =
                                                    lib.lmaL_LibraryName ??
                                                    lib.LMAL_LibraryName ??
                                                    lib.lmal_LibraryName ??
                                                    lib.libraryName ??
                                                    lib.name;
                                                return (
                                                    <SelectItem key={String(id)} value={String(id)}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.LMAL_Id?.message && <p className='mt-1 text-destructive text-xs'>{errors.LMAL_Id.message}</p>}
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
                                    <Select onValueChange={(v) => field.onChange(v)} value={field.value || 'ALL'}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Rack' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='ALL'>ALL</SelectItem>
                                            {rackList.map((rack: any) => {
                                                const id = rack.lmrA_Id ?? rack.LMRA_Id ?? rack.lmra_Id;
                                                const name =
                                                    rack.lmrA_RackName ??
                                                    rack.LMRA_RackName ??
                                                    rack.lmra_RackName ??
                                                    rack.rackName ??
                                                    rack.name;
                                                return (
                                                    <SelectItem key={String(id)} value={String(id)}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.LMRA_Id?.message && <p className='mt-1 text-destructive text-xs'>{errors.LMRA_Id.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons - Only REPORT and CANCEL */}
            <div className='flex items-center justify-center gap-4 pt-2'>
                <Button
                    type='submit'
                    className='!w-28 h-8 rounded-sm bg-[#4251b1] px-4 font-semibold text-white text-xs shadow-sm hover:bg-[#35418e]'
                    disabled={isLoading}>
                    {isLoading ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : <Search className='mr-1.5 h-3.5 w-3.5' />}
                    REPORT
                </Button>
                <Button
                    type='button'
                    className='!w-28 h-8 rounded-sm bg-[#ff5a30] px-4 font-semibold text-white text-xs shadow-sm hover:bg-[#e64d26]'
                    onClick={handleReset}
                    disabled={isLoading}>
                    <X className='mr-1.5 h-3.5 w-3.5' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
};
