'use client';

import { useTimeTableAcademicYear } from '@/hooks/timetable/useMasters';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { staffdropdowndatattstaffreport } from '@/hooks/timetable/reports';
import { staffWiseReportSchema } from '@/schemas/timetable/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof staffWiseReportSchema.search>;

interface StaffWiseFormProps {
    initialData: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    onSuccess?: () => void;
}

export default function StaffWiseForm({ initialData, onSubmit, onSuccess, onCancel }: StaffWiseFormProps) {
    const {
        data: academicyeardata,
        isLoading: academicyearloading,
        error: academicyearerror,
        refetchAll: refetchAllAcademicYear
    } = useTimeTableAcademicYear();

    const {
        data: staffdata,
        isLoading: staffdropdowndatattstaffreportloading,
        error: staffdropdowndatattstaffreporterror,
        refetchAll: refetchAllstaffdropdowndatattstaffreport
    } = staffdropdowndatattstaffreport();

    const academicList = academicyeardata?.data || [];

    // Use initialData for these lists
    const staffList = staffdata?.data || [];
    const periodList = initialData?.periodslst || [];
    const daysList = initialData?.dayslst_fix || [];

    const staffOptions = useMemo(() => {
        let dataArray: any[] = [];
        // handle various response structures
        if (Array.isArray(staffList)) {
            dataArray = staffList;
        } else if (Array.isArray((staffList as any)?.data)) {
            dataArray = (staffList as any).data;
        } else if (Array.isArray((staffList as any)?.data?.$values)) {
            dataArray = (staffList as any).data.$values;
        }

        if (!dataArray || dataArray.length === 0) return [];

        const uniqueMap = new Map();
        dataArray.forEach((s: any) => {
            // Fallback for ID and Name properties
            const id = s.hrmE_Id || s.HRME_Id;
            if (id && !uniqueMap.has(id)) {
                uniqueMap.set(id, s);
            }
        });

        return Array.from(uniqueMap.values()).map((s: any) => ({
            label: s.staffName || s.empName || s.hrmE_EmployeeName || '',
            value: (s.hrmE_Id || s.HRME_Id).toString()
        }));
    }, [staffList]);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(staffWiseReportSchema.search),
        defaultValues: {
            staffId: [],
            rpttyp: 'SAWC'
        }
    });

    const onFormSubmit = (data: FormFields) => {
        // We need to pass the full staff objects for selected IDs

        // Re-derive staff array for filtering
        let dataArray: any[] = [];
        if (Array.isArray(staffList)) {
            dataArray = staffList;
        } else if (Array.isArray((staffList as any)?.data)) {
            dataArray = (staffList as any).data;
        } else if (Array.isArray((staffList as any)?.data?.$values)) {
            dataArray = (staffList as any).data.$values;
        }

        const selectedStaff = dataArray.filter((s: any) => data.staffId?.includes(s.hrmE_Id || s.HRME_Id));

        const payload = {
            ASMAY_Id: data.asmaY_Id,
            staffarray: selectedStaff,
            rpttyp: data.rpttyp
        };
        onSubmit(payload);
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

                {/* Staff */}
                <div className='space-y-2'>
                    <Label>
                        Staff Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='staffId'
                        render={({ field }) => (
                            <MultiSelect
                                options={staffOptions}
                                defaultValue={(field.value || []).map(String)}
                                onValueChange={(val) => field.onChange(val.map((item: string) => Number(item)))}
                                placeholder='Select Staff'
                            />
                        )}
                    />
                    {errors.staffId && <span className='text-red-500 text-sm'>{errors.staffId.message}</span>}
                </div>
            </div>

            {/* Report Type */}
            <div className='space-y-2'>
                <Label>Report Type</Label>
                <Controller
                    control={control}
                    name='rpttyp'
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex flex-row space-x-4'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='SAWC' id='SAWC' />
                                <Label htmlFor='SAWC'>Subject Along With Class</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='SNWC' id='SNWC' />
                                <Label htmlFor='SNWC'>Subject Not With Class</Label>
                            </div>
                        </RadioGroup>
                    )}
                />
            </div>

            <div className='flex justify-center space-x-2'>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    <Search className='mr-2 h-4 w-4' />
                    Report
                </Button>
                <Button type='button' variant='destructive' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
