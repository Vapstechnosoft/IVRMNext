'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeTableGenerationValues, timeTableGenerationSchema } from '@/schemas/timetable/transactions/time-table-generation';
import { generateTT, getGenerationDetails, getGenerationMasters, resetTT } from '@/server/timetable/transactions/time-table-generation';
import { AcademicYear, Category } from '@/types/timetable/Transaction/time-table-generation';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCcw, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface FormsProps {
    onFetch: (data: TimeTableGenerationValues | null) => void;
}

export default function Forms({ onFetch }: FormsProps) {
    const [years, setYears] = useState<AcademicYear[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const masters = await getGenerationMasters();
                setYears(masters.years || []);
                setCategories(masters.categories || []);
            } catch (error) {
                console.error('Failed to fetch masters', error);
                toast.error('Failed to load masters data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMasters();
    }, []);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<TimeTableGenerationValues>({
        resolver: zodResolver(timeTableGenerationSchema),
        defaultValues: {
            asmaY_Id: '',
            ttmC_Id: '',
            asmcL_Id: '',
            asms_Id: '',
            hrmE_Id: '',
            notConfirmedPeriods: ''
        }
    });

    const asmaY_Id = useWatch({ control, name: 'asmaY_Id' });
    const ttmC_Id = useWatch({ control, name: 'ttmC_Id' });

    useEffect(() => {
        const fetchDetails = async () => {
            if (asmaY_Id && ttmC_Id && ttmC_Id !== 'all') {
                try {
                    const details = await getGenerationDetails(Number(asmaY_Id), Number(ttmC_Id));
                    setValue('asmcL_Id', details.totalPeriods.toString());
                    setValue('asms_Id', details.allottedPeriods.toString());
                    setValue('hrmE_Id', details.notAllottedPeriods.toString());
                    setValue('notConfirmedPeriods', details.notConfirmedPeriods.toString());
                } catch (error) {
                    console.error('Failed to fetch generation details', error);
                }
            } else if (ttmC_Id === 'all') {
                // Handle "All" case if needed. For now, clear them or could implement aggregate fetch.
                setValue('asmcL_Id', '0');
                setValue('asms_Id', '0');
                setValue('hrmE_Id', '0');
                setValue('notConfirmedPeriods', '0');
            }
        };
        fetchDetails();
    }, [asmaY_Id, ttmC_Id, setValue]);

    const handleGenerate = async (data: TimeTableGenerationValues) => {
        if (!data.asmaY_Id || !data.ttmC_Id) {
            toast.error('Please Select Academic Year and Category');
            return;
        }

        setGenerating(true);
        try {
            const ttmc_idslist = data.ttmC_Id === 'all'
                ? categories.map(c => ({ ttmC_Id: Number(c.ttmC_Id) }))
                : [{ ttmC_Id: Number(data.ttmC_Id) }];

            const payload = {
                asmaY_Id: Number(data.asmaY_Id),
                ttmc_idslist: ttmc_idslist
            };

            const response = await generateTT(payload);
            if (response === true || response?.returnval === true) {
                toast.success('Time Table Generated successfully');
                onFetch(data);
            } else {
                toast.error(response?.message || 'Data Not Saved!');
            }
        } catch (error) {
            console.error('Error generating TT:', error);
            toast.error('An error occurred while generating the timetable');
        } finally {
            setGenerating(false);
        }
    };

    const handleResetTT = async () => {
        if (!asmaY_Id) {
            toast.error('Please select Academic Year first');
            return;
        }

        if (confirm('Are you sure you want to Reset TimeTable?')) {
            setResetting(true);
            try {
                const payload = { asmaY_Id: Number(asmaY_Id) };
                const response = await resetTT(payload);
                if (response === true || response?.returnval === true) {
                    toast.success('Time Table successfully Reseted!');
                    reset();
                } else {
                    toast.error('Reset failed. Please contact administration');
                }
            } catch (error) {
                console.error('Error resetting TT:', error);
                toast.error('An error occurred während resetting the timetable');
            } finally {
                setResetting(false);
            }
        }
    };

    const handleResetForm = () => {
        reset();
    };

    const FormSelect = ({ label, name, control, options, valueKey, labelKey, placeholder, error, isLoading, showAllOption }: any) => (
        <div className='space-y-2'>
            <Label className='text-sm font-medium'>{label}</Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Select key={field.value || 'empty'} value={field.value || undefined} onValueChange={(v) => field.onChange(v || '')}>
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoading ? (
                                <SelectItem value='loading' disabled>Loading...</SelectItem>
                            ) : (
                                <>
                                    {showAllOption && <SelectItem value='all'>All</SelectItem>}
                                    {options?.map((o: any) => (
                                        <SelectItem key={o[valueKey]} value={o[valueKey].toString()}>
                                            {o[labelKey]}
                                        </SelectItem>
                                    ))}
                                </>
                            )}
                        </SelectContent>
                    </Select>
                )}
            />
            {error && <p className='text-red-500 text-xs italic'>{error}</p>}
        </div>
    );

    const FormInput = ({ label, name, control, error, readOnly }: any) => (
        <div className='space-y-2'>
            <Label className='text-sm font-medium'>{label}</Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        readOnly={readOnly}
                        className={`w-full ${readOnly ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
                    />
                )}
            />
            {error && <p className='text-red-500 text-xs italic'>{error}</p>}
        </div>
    );

    return (
        <CollapsibleSection title='Time Table Generation' defaultOpen>
            <div className='rounded-xl border bg-card text-card-foreground shadow-sm'>
                <div className='p-6'>
                    <form onSubmit={handleSubmit(handleGenerate)} className='space-y-8'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            <FormSelect
                                label='Academic Year *'
                                name='asmaY_Id'
                                placeholder='Select Academic Year'
                                control={control}
                                options={years}
                                valueKey='asmaY_Id'
                                labelKey='asmaY_Year'
                                error={errors.asmaY_Id?.message}
                                isLoading={isLoading}
                            />

                            <FormSelect
                                label='Category Name *'
                                name='ttmC_Id'
                                placeholder='Select Category'
                                control={control}
                                options={categories}
                                valueKey='ttmC_Id'
                                labelKey='ttmC_CategoryName'
                                error={errors.ttmC_Id?.message}
                                isLoading={isLoading}
                                showAllOption={true}
                            />

                            <FormInput
                                label='Total No Of Periods'
                                name='asmcL_Id'
                                control={control}
                                error={errors.asmcL_Id?.message}
                                readOnly={true}
                            />

                            <FormInput
                                label='Total No Of Periods Allotted'
                                name='asms_Id'
                                control={control}
                                error={errors.asms_Id?.message}
                                readOnly={true}
                            />

                            <FormInput
                                label='Total No Of Period Not Allotted'
                                name='hrmE_Id'
                                control={control}
                                error={errors.hrmE_Id?.message}
                                readOnly={true}
                            />

                            <FormInput
                                label='Not Confirmed Periods'
                                name='notConfirmedPeriods'
                                control={control}
                                error={errors.notConfirmedPeriods?.message}
                                readOnly={true}
                            />
                        </div>

                        <div className='flex flex-wrap items-center justify-center gap-4 pt-6 border-t'>
                            <Button
                                type='submit'
                                className='min-w-[140px]'
                                disabled={generating}>
                                {generating ? (
                                    <RefreshCcw className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <RefreshCcw className='mr-2 h-4 w-4' />
                                )}
                                Generate TT
                            </Button>

                            <Button
                                type='button'
                                variant='destructive'
                                className='min-w-[140px]'
                                onClick={handleResetTT}
                                disabled={resetting || ttmC_Id !== 'all'}>
                                {resetting ? (
                                    <Trash2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <Trash2 className='mr-2 h-4 w-4' />
                                )}
                                Reset TT
                            </Button>

                            <Button
                                type='button'
                                variant='outline'
                                className='min-w-[140px]'
                                onClick={handleResetForm}>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </CollapsibleSection>
    );
}
