'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { masterPeriodSchema } from '@/schemas/timetable/masters';
import { savePeriod } from '@/server/timetable/masters/periodallocation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterPeriodSchema.save),
        defaultValues: {
            noOfPeriods: 1
        }
    });

    const watchedNoOfPeriods = watch('noOfPeriods');
    const [periods, setPeriods] = useState<any[]>([]);

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
            <div className='flex flex-col items-end gap-4 md:flex-row'>
                <div className='w-full md:w-1/3'>
                    <InputText
                        label='No of Period'
                        type='number'
                        required
                        {...register('noOfPeriods')}
                        error={errors.noOfPeriods?.message}
                        min={1}
                        max={20}
                    />
                </div>
            </div>

            <div className='space-y-2'>
                <Label className='font-medium text-sm'>Generated Periods</Label>
                <div className='flex flex-wrap gap-2 rounded-md border bg-muted/20 p-2'>
                    {periods.map((p) => (
                        <div key={p.key} className='flex items-center space-x-2 rounded border bg-background p-2'>
                            <Checkbox checked disabled />
                            <Label className='font-medium text-sm'>{p.label}</Label>
                        </div>
                    ))}
                </div>
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
