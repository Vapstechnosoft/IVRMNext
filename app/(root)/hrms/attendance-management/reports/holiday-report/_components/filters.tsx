'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { holidayReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

export type HolidayReportFilters = z.infer<typeof holidayReportFilterSchema>;

interface HolidayReportFiltersProps {
    filters: HolidayReportFilters;
    calendarYears: string[];
    onFilterChange: (filters: HolidayReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
}

const holidayTypes = ['PUBLIC HOLIDAY', 'WEEK DAY', 'WEEK END', 'NATIONAL HOLIDAY', 'FESTIVAL', 'OPTIONAL HOLIDAY'];

export function HolidayReportFilters({
    filters,
    calendarYears,
    onFilterChange,
    onSearch,
    onCancel
}: HolidayReportFiltersProps) {
    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<HolidayReportFilters>({
        resolver: zodResolver(holidayReportFilterSchema),
        defaultValues: filters,
        mode: 'onChange'
    });

    const handleFilterChange = (key: keyof HolidayReportFilters, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setValue(key, value as any);
        onFilterChange(newFilters);
    };

    const onSubmit = (data: HolidayReportFilters) => {
        onFilterChange(data);
        onSearch();
    };

    return (
        <CollapsibleSection
            title='HOLIDAY REPORT'
            description='Configure filters to generate holiday reports'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
                <div className='md:col-span-4'>
                    <label className='font-medium text-sm' htmlFor='calendarYear'>
                        Calendar Year <span className='text-red-500'>*</span>
                    </label>
                    <Select value={filters.calendarYear} onValueChange={(value) => handleFilterChange('calendarYear', value)}>
                        <SelectTrigger id='calendarYear' className={errors.calendarYear ? 'border-red-500' : ''}>
                            <SelectValue placeholder='Select Calendar Year' />
                        </SelectTrigger>
                        <SelectContent>
                            {calendarYears.map((year) => (
                                <SelectItem key={year} value={year}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.calendarYear && <FormError>{errors.calendarYear.message}</FormError>}
                </div>

                <div className='md:col-span-4'>
                    <label className='font-medium text-sm' htmlFor='holidayType'>
                        Holiday Type <span className='text-red-500'>*</span>
                    </label>
                    <Select value={filters.holidayType} onValueChange={(value) => handleFilterChange('holidayType', value)}>
                        <SelectTrigger id='holidayType' className={errors.holidayType ? 'border-red-500' : ''}>
                            <SelectValue placeholder='Select Holiday Type' />
                        </SelectTrigger>
                        <SelectContent>
                            {holidayTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.holidayType && <FormError>{errors.holidayType.message}</FormError>}
                </div>

                <div className='flex items-end gap-2 md:col-span-4'>
                    <Button type='submit'>
                        <Check className='mr-2 h-4 w-4' /> Report
                    </Button>
                    <Button type='button' variant='outline' onClick={onCancel}>
                        <X className='mr-2 h-4 w-4' /> CANCEL
                    </Button>
                </div>
                </div>
            </form>
        </CollapsibleSection>
    );
}

