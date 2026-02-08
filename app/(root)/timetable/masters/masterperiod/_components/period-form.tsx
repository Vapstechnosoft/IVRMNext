'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDayDropDownMasterDayClasswise } from '@/hooks/timetable/useMasters';
import { cn } from '@/lib/utils';

import { masterPeriodSchema } from '@/schemas/timetable/masters';
import { savePeriod } from '@/server/timetable/masters/periodallocation';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Save, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterPeriodSchema.save>;

interface MasterPeriodFormProps {
    onSuccess?: () => void;
}

export default function MasterPeriodForm({ onSuccess }: MasterPeriodFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterPeriodSchema.save),
        defaultValues: {
            noOfPeriods: 1
        }
    });
    const [daySearch, setDaySearch] = useState('');

    const watchedNoOfPeriods = watch('noOfPeriods');
    const [periods, setPeriods] = useState<any[]>([]);

    const day_ids = watch('dayids') || [];
    const {
        data: Masterdaydata,
        isLoading: masterdaydataloading,
        error: masterdaydataError,
        refetchAll: masterdaydataRefetch
    } = useDayDropDownMasterDayClasswise();

    const filteredDayIds = Masterdaydata?.data?.filter((d) => d.ttmD_DayName.toLowerCase().includes(daySearch.toLowerCase())) ?? [];

    const toggleDay = (id: string) => {
        let updated: string[] = [];

        if (day_ids.includes(id)) {
            updated = day_ids.filter((v) => v !== id);
        } else {
            updated = [...day_ids, id];
        }

        if (updated.length === 0) {
            setValue('dayids', undefined as any);
        } else {
            setValue('dayids', updated as [string, ...string[]], {
                shouldValidate: true
            });
        }
    };

    useEffect(() => {
        const count = Number(watchedNoOfPeriods);
        if (!Number.isNaN(count) && count > 0 && count <= 20) {
            const arr = [];
            for (let i = 1; i <= count; i++) {
                arr.push({ key: i, label: `${i}` });
            }
            setPeriods(arr);
        } else {
            setPeriods([]);
        }
    }, [watchedNoOfPeriods]);

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                tempperiods: periods.map((p) => ({
                    key: p.key,
                    TTMP_PeriodName: p.label
                }))
            };
            const response = await savePeriod(payload);
            if (response.returnval) {
                toast.success('Saved successfully');
                onSuccess?.();
            } else if (response.returnduplicatestatus === 'Duplicate') {
                toast.error('Records Already Exist');
            } else {
                toast.error('Not Saved');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 p-4'>
            <div className='space-y-2'>
                <Label>
                    Period Name:<span className='text-red-500'>*</span>
                </Label>
                <Controller
                    name='periodname'
                    control={control}
                    render={({ field }) => (
                        <Select
                            key={field.value || 'empty'}
                            onValueChange={(value) => {
                                field.onChange(Number(value) || '');
                            }}
                            value={field.value?.toString() || undefined}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select Period Name' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key='1' value='1'>
                                    1
                                </SelectItem>
                                <SelectItem key='2' value='2'>
                                    2
                                </SelectItem>
                                <SelectItem key='3' value='3'>
                                    3
                                </SelectItem>
                                <SelectItem key='4' value='4'>
                                    4
                                </SelectItem>
                                <SelectItem key='5' value='5'>
                                    5
                                </SelectItem>
                                <SelectItem key='6' value='6'>
                                    6
                                </SelectItem>
                                <SelectItem key='7' value='7'>
                                    7
                                </SelectItem>
                                <SelectItem key='8' value='8'>
                                    8
                                </SelectItem>
                                <SelectItem key='9' value='9'>
                                    9
                                </SelectItem>
                                <SelectItem key='10' value='10'>
                                    10
                                </SelectItem>
                                <SelectItem key='11' value='11'>
                                    11
                                </SelectItem>
                                <SelectItem key='12' value='12'>
                                    12
                                </SelectItem>
                                <SelectItem key='13' value='13'>
                                    13
                                </SelectItem>
                                <SelectItem key='14' value='14'>
                                    14
                                </SelectItem>
                                <SelectItem key='15' value='15'>
                                    15
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.periodname && <span className='text-red-500 text-sm'>{errors.periodname.message}</span>}
            </div>
            <div className='space-y-2'>
                <Label>
                    Period Order:<span className='text-red-500'>*</span>
                </Label>
                <Controller
                    name='periodorder'
                    control={control}
                    render={({ field }) => (
                        <Select
                            key={field.value || 'empty'}
                            onValueChange={(value) => {
                                field.onChange(Number(value) || '');
                            }}
                            value={field.value?.toString() || undefined}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select Period Order' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key='1' value='1'>
                                    1
                                </SelectItem>
                                <SelectItem key='2' value='2'>
                                    2
                                </SelectItem>
                                <SelectItem key='3' value='3'>
                                    3
                                </SelectItem>
                                <SelectItem key='4' value='4'>
                                    4
                                </SelectItem>
                                <SelectItem key='5' value='5'>
                                    5
                                </SelectItem>
                                <SelectItem key='6' value='6'>
                                    6
                                </SelectItem>
                                <SelectItem key='7' value='7'>
                                    7
                                </SelectItem>
                                <SelectItem key='8' value='8'>
                                    8
                                </SelectItem>
                                <SelectItem key='9' value='9'>
                                    9
                                </SelectItem>
                                <SelectItem key='10' value='10'>
                                    10
                                </SelectItem>
                                <SelectItem key='11' value='11'>
                                    11
                                </SelectItem>
                                <SelectItem key='12' value='12'>
                                    12
                                </SelectItem>
                                <SelectItem key='13' value='13'>
                                    13
                                </SelectItem>
                                <SelectItem key='14' value='14'>
                                    14
                                </SelectItem>
                                <SelectItem key='15' value='15'>
                                    15
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.periodorder && <span className='text-red-500 text-sm'>{errors.periodorder.message}</span>}
            </div>
            <div className='space-y-2'>
                <Label>
                    Day <span className='text-red-500'>*</span>
                </Label>

                <div className='mt-2 rounded-md border border-gray-300 bg-white p-3'>
                    <InputText
                        placeholder='Search Day...'
                        value={daySearch}
                        onChange={(e) => setDaySearch(e.target.value)}
                        className='mb-3'
                    />

                    <div className='max-h-40 overflow-y-auto rounded-md border border-gray-300 p-1'>
                        {masterdaydataloading ? (
                            <div className='py-4 text-center text-gray-500 text-sm'>Loading Days...</div>
                        ) : filteredDayIds.length === 0 ? (
                            <div className='py-4 text-center text-gray-500 text-sm'>No Day found</div>
                        ) : (
                            filteredDayIds.map((d) => {
                                const id = d.ttmD_Id.toString();
                                const selected = day_ids.includes(id);

                                return (
                                    <div
                                        key={d.ttmD_Id}
                                        onClick={() => toggleDay(id)}
                                        className={cn(
                                            'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                            selected
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-300 hover:border-primary/40'
                                        )}>
                                        {selected ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>{d.ttmD_DayName}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {errors.dayids && <span className='text-red-500 text-sm'>{errors.dayids.message}</span>}
            </div>

            <div className='space-y-2'>
                {/* <Label>Select Half:</Label> */}
                <div className='flex items-center justify-center space-x-6'>
                    <div className='flex items-center space-x-2'>
                        <Controller
                            name='half'
                            control={control}
                            render={({ field }) => (
                                <input
                                    type='radio'
                                    id='first-half'
                                    checked={field.value === 'I Half'}
                                    onChange={() => field.onChange('I Half')}
                                    className='h-4 w-4 text-primary focus:ring-primary'
                                />
                            )}
                        />
                        <label htmlFor='first-half' className='font-medium text-sm'>
                            I Half
                        </label>
                    </div>

                    <div className='flex items-center space-x-2'>
                        <Controller
                            name='half'
                            control={control}
                            render={({ field }) => (
                                <input
                                    type='radio'
                                    id='second-half'
                                    checked={field.value === 'II Half'}
                                    onChange={() => field.onChange('II Half')}
                                    className='h-4 w-4 text-primary focus:ring-primary'
                                />
                            )}
                        />
                        <label htmlFor='second-half' className='font-medium text-sm'>
                            II Half
                        </label>
                    </div>
                </div>
                {errors.half && <span className='text-red-500 text-sm'>{errors.half.message}</span>}
            </div>

            <div className='flex justify-end gap-3'>
                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' />
                    Save
                </Button>
            </div>
        </form>
    );
}
