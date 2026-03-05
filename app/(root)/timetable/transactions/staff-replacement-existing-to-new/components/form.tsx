'use client';
//staffReplacementExistingToNew
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    StaffRepacementExistingToNewSchema,
    type StaffReplacementExistingToNewValues
} from '@/schemas/timetable/transactions/staff-replacement-existing-to-new';

import {
    useSectionsByClass,
    useStaffReplacementExistingToNewMasters
} from '@/hooks/timetable/transaction/useStaff-replacement-existing-to-new';
import { getStaffReplacementExistingToNewMasters } from '@/server/timetable/transactions/staff-replacement-existing-to-new';


type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface StaffReplacementFormProps {
    onFetch: (data: StaffReplacementExistingToNewValues | null) => void;
}

export default function StaffReplacementExistingToNewForm({ onFetch }: StaffReplacementFormProps) {
    const { data: masters } = useStaffReplacementExistingToNewMasters();
    const [saving, setSaving] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<StaffReplacementExistingToNewValues>({
        resolver: zodResolver(StaffRepacementExistingToNewSchema),
        defaultValues: {
            ttmC_Id: '',
            asmcL_Id: '',
            asms_Id: '',
            hrmE_Id_From: '',
            hrmE_Id_To: '',
            ismS_Id: ''
        }
    });

    const watchClass = watch('asmcL_Id');
    const { data: sections, isLoading: sectionsLoading } = useSectionsByClass(Number(watchClass || 0));

    const onSubmit = async (data: StaffReplacementExistingToNewValues) => {
        if (saving) return;
        setSaving(true);
        try {
            // Usually we might call a save/process endpoint here
            // But following the current onFetch pattern
            toast.success('Details loaded');
            onFetch(data);
        } catch {
            toast.error('Unable to load details');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        reset();
    };

    const FormSelect = ({ label, name, control, options, valueKey, labelKey, placeholder, error, isLoading }: any) => (
        <div className='space-y-2'>
            <Label className='text-sm font-medium'>
                {label} {label.includes('*') ? '' : ''}
            </Label>
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
            {error && <p className='text-red-500 text-xs italic'>{error}</p>}
        </div>
    );

    return (
        <CollapsibleSection title='Staff Replacement Existing To New' defaultOpen>
            <div className='rounded-lg bg-white p-6 shadow-sm border'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        <FormSelect
                            label='Category Name *'
                            name='ttmC_Id'
                            placeholder='-- Select Category --'
                            control={control}
                            options={masters?.categories}
                            valueKey='ttmC_Id'
                            labelKey='ttmC_CategoryName'
                            error={errors.ttmC_Id?.message}
                        />

                        <FormSelect
                            label='Subject'
                            name='ismS_Id'
                            placeholder='-- Select Subject --'
                            control={control}
                            options={masters?.subjects}
                            valueKey='ismS_Id'
                            labelKey='ismS_SubjectName'
                            error={errors.ismS_Id?.message}
                        />

                        <FormSelect
                            label='Class'
                            name='asmcL_Id'
                            placeholder='-- Select Class --'
                            control={control}
                            options={masters?.classes}
                            valueKey='asmcL_Id'
                            labelKey='asmcL_ClassName'
                            error={errors.asmcL_Id?.message}
                        />

                        <FormSelect
                            label='Section'
                            name='asms_Id'
                            placeholder='-- Select Section --'
                            control={control}
                            options={sections}
                            valueKey='asms_Id'
                            labelKey='asms_SectionName'
                            isLoading={sectionsLoading}
                            error={errors.asms_Id?.message}
                        />

                        <FormSelect
                            label='Replace Staff From *'
                            name='hrmE_Id_From'
                            placeholder='-- Replace Staff From --'
                            control={control}
                            options={masters?.staff}
                            valueKey='hrmE_Id'
                            labelKey='staffName'
                            error={errors.hrmE_Id_From?.message}
                        />

                        <FormSelect
                            label='Replace Staff To *'
                            name='hrmE_Id_To'
                            placeholder='-- Replace Staff To --'
                            control={control}
                            options={masters?.staff}
                            valueKey='hrmE_Id'
                            labelKey='staffName'
                            error={errors.hrmE_Id_To?.message}
                        />
                    </div>

                    <div className='flex justify-center items-center gap-4 pt-4 border-t'>
                        <Button type='submit' className='min-w-[120px] font-semibold flex items-center gap-2'>
                            <Search className='h-4 w-4' />
                            Update
                        </Button>

                        <Button type='button' variant='outline' onClick={handleReset} className='min-w-[120px]'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Reset
                        </Button>
                    </div>
                </form>
            </div>
        </CollapsibleSection>
    );
}
