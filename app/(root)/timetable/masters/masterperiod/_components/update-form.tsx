'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategoryDropDownMasterPeriod, useMasterPeriodDetails } from '@/hooks/timetable/useMasters';
import { cn } from '@/lib/utils';
import type { IMasterPeriodDetailsList } from '@/types/timetable/masters/masters';

import { masterPeriodSchema } from '@/schemas/timetable/masters';
import { ADDORUPDATEMasterPeriod, getMasterPeriodEditDetails } from '@/server/timetable/masters/masterperiod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, RotateCcw, Save, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterPeriodSchema.save>;

interface MasterPeriodFormProps {
    onSuccess?: () => void;
    selectedRow?: IMasterPeriodDetailsList;
}

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target) return [];
    if (preferredKey && Array.isArray(target[preferredKey])) return target[preferredKey];
    const keys = ['geteditmaster', 'academiclist', 'catelist', 'classlist', 'sectionlist', 'stafflist', 'subjectlist', 'categorylist'];
    for (const key of keys) {
        if (Array.isArray(target[key])) return target[key];
    }
    return [];
};

export default function MasterPeriodForm({ onSuccess, selectedRow }: MasterPeriodFormProps) {
    const { refetchAll } = useMasterPeriodDetails();
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [PeriodSearch, setPeriodSearch] = useState('');

    const form = useForm<FormFields>({
        resolver: zodResolver(masterPeriodSchema.save),
        defaultValues: {
            periodname: 0,
            periodorder: 0,
            half: '',
            categoryids: [] as any,
            noOfPeriods: 1
        }
    });

    const {
        handleSubmit,
        watch,
        reset,
        control,
        setValue,
        formState: { errors, isSubmitting }
    } = form;

    const Category_ids = (watch('categoryids') || []).map(String);
    const { data: MasterPerioddata, isLoading: masterPerioddataloading } = useCategoryDropDownMasterPeriod();
    const categories = extractList(MasterPerioddata);

    const filteredPeriodIds = categories.filter((d: any) =>
        (d.amC_Name || d.amC_Name || '').toLowerCase().includes(PeriodSearch.toLowerCase())
    );

    const getCategoryId = (obj: any) => {
        if (!obj) return '';
        // Prioritize amC_Id for Master Period category mapping
        const id = obj.amC_Id ?? obj.amc_Id ?? obj.TTMC_Id ?? obj.ttmC_Id ?? obj.mC_Id ?? obj.mc_Id ?? obj.id;
        return id !== undefined && id !== null ? id.toString() : '';
    };

    const togglePeriod = (id: string) => {
        if (!id) return;
        const currentIds = (form.getValues('categoryids') || []).map(String);
        let updated: string[] = [];
        if (currentIds.includes(id)) {
            updated = currentIds.filter((v) => v !== id);
        } else {
            updated = [...currentIds, id];
        }

        setValue('categoryids', updated as [string, ...string[]], { shouldValidate: true });
    };

    useEffect(() => {
        const fetchEditData = async () => {
            if (!selectedRow?.imP_Id) {
                reset({
                    periodname: 0,
                    periodorder: 0,
                    half: '',
                    categoryids: [] as any,
                    noOfPeriods: 1
                });
                return;
            }

            setIsLoadingDetails(true);
            try {
                const response = await getMasterPeriodEditDetails(selectedRow.imP_Id);
                const editDataList = extractList(response, 'geteditmaster');

                if (editDataList && editDataList.length > 0) {
                    const editData = editDataList[0];
                    // Extract all unique category IDs from the edit list
                    const allCategoryIds = Array.from(new Set(
                        editDataList
                            .map((item: any) => getCategoryId(item))
                            .filter(Boolean)
                    ));

                    reset({
                        periodname: Number(editData.imP_PeriodName || selectedRow.imP_PeriodName),
                        periodorder: Number(editData.imP_PeriodOrder || selectedRow.imP_PeriodOrder),
                        half: editData.half || selectedRow.half,
                        categoryids: allCategoryIds as [string, ...string[]],
                        noOfPeriods: 1
                    });
                } else {
                    // Fallback to selectedRow's amC_Id if edit API doesn't provide the list
                    const catId = getCategoryId(selectedRow);
                    reset({
                        periodname: Number(selectedRow.imP_PeriodName),
                        periodorder: Number(selectedRow.imP_PeriodOrder),
                        half: selectedRow.half,
                        categoryids: catId ? [catId] : ([] as any),
                        noOfPeriods: 1
                    });
                }
            } catch (error) {
                console.error('Failed to fetch edit details:', error);
                const catId = getCategoryId(selectedRow);
                reset({
                    periodname: Number(selectedRow.imP_PeriodName),
                    periodorder: Number(selectedRow.imP_PeriodOrder),
                    half: selectedRow.half,
                    categoryids: catId ? [catId] : ([] as any),
                    noOfPeriods: 1
                });
            } finally {
                setIsLoadingDetails(false);
            }
        };

        fetchEditData();
    }, [selectedRow, reset]);

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                imP_Id: selectedRow?.imP_Id || 0,
                impcM_Id: selectedRow?.impcM_Id || 0,
                imP_PeriodName: data.periodname,
                imP_PeriodOrder: data.periodorder,
                half: data.half,
                selectedCategoryDetails: Category_ids.map((id) => ({ amC_Id: Number(id) }))
            };

            const response = await ADDORUPDATEMasterPeriod(payload);
            if (response.success) {
                toast.success(response.message);
                if (!selectedRow) reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    if (isLoadingDetails) {
        return <div className='flex h-40 items-center justify-center'>Loading details...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label>
                            Period Name <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='periodname'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    value={field.value?.toString() || undefined}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Period Name' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.periodname && <p className='text-red-500 text-sm'>{errors.periodname.message}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Period Order <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='periodorder'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    key={field.value || 'empty'}
                                    value={field.value?.toString() || undefined}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Period Order' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.periodorder && <p className='text-red-500 text-sm'>{errors.periodorder.message}</p>}
                    </div>

                    <div className='space-y-2 pt-2'>
                        <Label className='mb-3 block'>Select Half <span className='text-red-500'>*</span></Label>
                        <div className='flex items-center space-x-6'>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='half'
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type='radio'
                                            id='period-first-half'
                                            checked={field.value === 'I Half'}
                                            onChange={() => field.onChange('I Half')}
                                            className='h-4 w-4 text-primary focus:ring-primary'
                                        />
                                    )}
                                />
                                <label htmlFor='period-first-half' className='font-medium text-sm cursor-pointer'>I Half</label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='half'
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type='radio'
                                            id='period-second-half'
                                            checked={field.value === 'II Half'}
                                            onChange={() => field.onChange('II Half')}
                                            className='h-4 w-4 text-primary focus:ring-primary'
                                        />
                                    )}
                                />
                                <label htmlFor='period-second-half' className='font-medium text-sm cursor-pointer'>II Half</label>
                            </div>
                        </div>
                        {errors.half && <p className='text-red-500 text-sm'>{errors.half.message}</p>}
                    </div>
                </div>

                <div className='space-y-2'>
                    <Label>
                        Category <span className='text-red-500'>*</span>
                    </Label>
                    <div className='mt-2 rounded-md border border-gray-300 bg-white p-3'>
                        <InputText
                            placeholder='Search Category...'
                            value={PeriodSearch}
                            onChange={(e) => setPeriodSearch(e.target.value)}
                            className='mb-3'
                        />

                        <div className='max-h-48 overflow-y-auto rounded-md border border-gray-200 p-1'>
                            {masterPerioddataloading ? (
                                <div className='py-4 text-center text-gray-500 text-sm'>Loading Categories...</div>
                            ) : filteredPeriodIds.length === 0 ? (
                                <div className='py-4 text-center text-gray-500 text-sm'>No Category found</div>
                            ) : (
                                filteredPeriodIds.map((d: any) => {
                                    const id = getCategoryId(d);
                                    const selected = Category_ids.includes(id);

                                    return (
                                        <div
                                            key={id}
                                            onClick={() => togglePeriod(id)}
                                            className={cn(
                                                'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                selected
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-transparent hover:bg-gray-50'
                                            )}>
                                            {selected ? (
                                                <CheckSquare className='h-4 w-4 text-primary' />
                                            ) : (
                                                <Square className='h-4 w-4 text-gray-400' />
                                            )}
                                            <span>{d.amC_Name}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    {errors.categoryids && <p className='text-red-500 text-sm'>{errors.categoryids.message}</p>}
                </div>
            </div>

            <div className='flex items-center justify-start gap-3 border-t pt-6'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => reset()}
                    disabled={isSubmitting}
                >
                    <RotateCcw className='mr-2 h-4 w-4' /> Reset
                </Button>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    loadingText={selectedRow ? 'Updating...' : 'Saving...'}
                >
                    <Save className='mr-2 h-4 w-4' /> {selectedRow ? 'Update' : 'Save'} Master Period
                </Button>
            </div>
        </form>
    );
}
