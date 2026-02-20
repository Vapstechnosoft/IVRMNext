'use client';
//timttablegeneration
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeTableGenerationValues, timeTableGenerationSchema } from '@/schemas/timetable/transactions/time-table-generation';
import { getGenerationDetails, getGenerationMasters } from '@/server/timetable/transactions/time-table-generation';
import { AcademicYear, Category } from '@/types/timetable/Transaction/time-table-generation';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

interface FormsProps {
    onFetch: (data: TimeTableGenerationValues | null) => void;
}

export default function Forms({ onFetch }: FormsProps) {
    const [years, setYears] = useState<AcademicYear[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const masters = await getGenerationMasters();
                setYears(masters.years);
                setCategories(masters.categories);
            } catch (error) {
                console.error("Failed to fetch masters", error);
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
            hrmE_Id: '',
            asms_Id: '',
            notConfirmedPeriods: ''
        }
    });

    const asmaY_Id = useWatch({ control, name: 'asmaY_Id' });
    const ttmC_Id = useWatch({ control, name: 'ttmC_Id' });

    //useEffect Function
    useEffect(() => {
        const fetchDetails = async () => {
            if (asmaY_Id && ttmC_Id) {
                try {
                    const details = await getGenerationDetails(Number(asmaY_Id), Number(ttmC_Id));
                    setValue('asmcL_Id', details.totalPeriods.toString());
                    setValue('asms_Id', details.allottedPeriods.toString());
                    setValue('hrmE_Id', details.notAllottedPeriods.toString());
                    setValue('notConfirmedPeriods', details.notConfirmedPeriods.toString());
                } catch (error) {
                    console.error("Failed to fetch generation details", error);
                }
            }
        };
        fetchDetails();
    }, [asmaY_Id, ttmC_Id, setValue]);


    const onSubmit = (data: TimeTableGenerationValues) => {
        onFetch(data);
    };

    const handleReset = () => {
        reset();
    };

    const FormSelect = ({ label, name, control, options, valueKey, labelKey, placeholder, error, isLoading }: any) => (
        <div className='space-y-1.5'>
            <Label className='font-semibold text-purple-900 text-xs'>{label}</Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Select key={field.value || 'empty'} value={field.value || undefined} onValueChange={(v) => field.onChange(v || '')}>
                        <SelectTrigger className='h-9 border-purple-100 text-sm'>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoading ? (
                                <SelectItem value='loading' disabled>
                                    Loading...
                                </SelectItem>
                            ) : (
                                options?.map((o: any) => (
                                    <SelectItem key={o[valueKey]} value={o[valueKey].toString()}>
                                        {o[labelKey]}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                )}
            />
            {error && <p className='text-red-500 text-xs'>{error}</p>}
        </div>
    );

    const FormInput = ({ label, name, control, error, readOnly }: any) => (
        <div className='space-y-1.5'>
            <Label className='font-semibold text-purple-900 text-xs'>{label}</Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        readOnly={readOnly}
                        className={`h-9 border-purple-100 text-sm ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                    />
                )}
            />
            {error && <p className='text-red-500 text-xs'>{error}</p>}
        </div>
    );


    return (
        <CollapsibleSection
            title='Time Table Generation'
            className='mx-auto max-w-7xl overflow-hidden rounded-xl border border-purple-100 bg-white shadow-md'
            defaultOpen>
            <div className='bg-white p-6'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    {/* Form Grid - 3 columns */}
                    <div className='grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3'>

                        <FormSelect
                            label='AcademicYear *'
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
                        />


                        <FormInput
                            label='Total No Of Periods'
                            name='asmcL_Id'
                            control={control}
                            error={errors.asmcL_Id?.message}
                            readOnly={true}
                        />

                        <FormInput
                            label='TotalNoOfPeriodsAllotted'
                            name='asms_Id'
                            control={control}
                            error={errors.asms_Id?.message}
                            readOnly={true}
                        />

                        <FormInput
                            label='TotalNoOfperiodNotallotted'
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

                    {/* ACTIONS */}
                    <div className='flex gap-3 border-t pt-4'>
                        <Button type='submit' className='h-9 bg-orange-500 px-6 font-semibold text-xs hover:bg-orange-600'>
                            Update
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleReset}
                            className='h-9'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Reset
                        </Button>
                    </div>
                </form>
            </div>
        </CollapsibleSection>
    );
}
