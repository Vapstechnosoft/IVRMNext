'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClassDetails, useSectionDropDown } from '@/hooks/timetable/reports';
import { useTimeTableAcademicYear, useTimeTableCategoryDropDownData } from '@/hooks/timetable/useMasters';
import { classWiseReportSchema } from '@/schemas/timetable/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

import { getClassWiseReport } from '@/server/timetable/reports/classwisett';

type FormFields = z.infer<typeof classWiseReportSchema.search>;

interface ClassWiseFormProps {
    onReportGenerated: (response: any, payload: any) => void;
    onCancel: () => void;
}

export default function ClassWiseForm({ onReportGenerated, onCancel }: ClassWiseFormProps) {
    const {
        data: academicyeardata,
    } = useTimeTableAcademicYear();

    const {
        data: categorydropdowndata,
    } = useTimeTableCategoryDropDownData();

    // Using new hook for classes
    const {
        data: classdata,
    } = useClassDetails();

    // Using new hook for sections
    const {
        data: sectiondata,
    } = useSectionDropDown();

    const academicList = (academicyeardata as any)?.data || [];
    const categoryList = (categorydropdowndata as any)?.data || [];
    const classList = (classdata as any)?.data || (Array.isArray(classdata) ? classdata : []);
    const sectionList = (sectiondata as any)?.data || (Array.isArray(sectiondata) ? sectiondata : []);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(classWiseReportSchema.search),
        defaultValues: {
            classId: [],
            sectionId: []
        }
    });

    const onFormSubmit = async (data: FormFields) => {
        // Construct payload
        const selectedClasses = classList.filter((c: any) => data.classId?.includes(c.asmcL_Id));
        const selectedSections = sectionList.filter((s: any) => data.sectionId?.includes(s.asmS_Id));

        const payload = {
            asmaY_Id: data.asmaY_Id,
            ttmC_Id: data.ttmC_Id,
            classarray: selectedClasses,
            sectionarray: selectedSections
        };

        try {
            console.log("class wise tt payload", JSON.stringify(payload));
            const response = await getClassWiseReport(payload);
            console.log("class wise tt response", response);
            onReportGenerated(response, payload);
        } catch (error: any) {
            console.error('Error generating class wise report:', error);
            throw error;
        }
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Academic Year */}
                <div className='space-y-2'>
                    <Label>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicList.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <span className='text-red-500 text-sm'>{errors.asmaY_Id.message}</span>}
                </div>

                {/* Category */}
                <div className='space-y-2'>
                    <Label>
                        Category Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='ttmC_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryList.map((item: any) => (
                                        <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                            {item.ttmC_CategoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ttmC_Id && <span className='text-red-500 text-sm'>{errors.ttmC_Id.message}</span>}
                </div>

                {/* Class */}
                <div className='space-y-2'>
                    <Label>
                        Class <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='classId'
                        render={({ field }) => (
                            <MultiSelect
                                options={classList.map((c: any) => ({ label: c.asmcL_ClassName, value: c.asmcL_Id.toString() }))}
                                defaultValue={(field.value || []).map(String)}
                                onValueChange={(val) => field.onChange(val.map(Number))}
                                placeholder='Select Classes'
                            />
                        )}
                    />
                    {errors.classId && <span className='text-red-500 text-sm'>{errors.classId.message}</span>}
                </div>

                {/* Section */}
                <div className='space-y-2'>
                    <Label>
                        Section <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='sectionId'
                        render={({ field }) => (
                            <MultiSelect
                                options={sectionList.map((s: any) => ({ label: s.asmC_SectionName, value: s.asmS_Id.toString() }))}
                                defaultValue={(field.value || []).map(String)}
                                onValueChange={(val) => field.onChange(val.map(Number))}
                                placeholder='Select Sections'
                            />
                        )}
                    />
                    {errors.sectionId && <span className='text-red-500 text-sm'>{errors.sectionId.message}</span>}
                </div>
            </div>

            <div className='flex justify-center space-x-2'>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    <Search className='mr-2 h-4 w-4' />
                    Report
                </Button>
                <Button type='button' variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
