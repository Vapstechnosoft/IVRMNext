'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { foMonthEndReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

export type FOMonthEndReportFilters = z.infer<typeof foMonthEndReportFilterSchema>;

interface FOMonthEndReportFiltersProps {
    filters: FOMonthEndReportFilters;
    onFilterChange: (filters: FOMonthEndReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
}

export function FOMonthEndReportFilters({ filters, onFilterChange, onSearch, onCancel }: FOMonthEndReportFiltersProps) {
    const {
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<FOMonthEndReportFilters>({
        resolver: zodResolver(foMonthEndReportFilterSchema),
        defaultValues: filters,
        mode: 'onChange'
    });

    const handleFilterChange = (key: keyof FOMonthEndReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setValue(key, value as any);
        onFilterChange(newFilters);
    };

    const onSubmit = (data: FOMonthEndReportFilters) => {
        onFilterChange(data);
        onSearch();
    };

    return (
        <CollapsibleSection
            title='ATTENDANCE REPORT'
            description='Configure filters to generate month-end or date-wise attendance reports'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-12'>
                    <div className='md:col-span-4'>
                        <label htmlFor='filter-type-select' className='font-medium text-sm'>
                            Filter Type <span className='text-red-500'>*</span>
                        </label>
                        <Select
                            value={filters.mode}
                            onValueChange={(value) => handleFilterChange('mode', value as 'Month Wise' | 'Date Wise')}>
                            <SelectTrigger id='filter-type-select' className={errors.mode ? 'border-red-500' : ''}>
                                <SelectValue placeholder='Select Filter Type' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Month Wise'>Month Wise</SelectItem>
                                <SelectItem value='Date Wise'>Date Wise</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.mode && <FormError>{errors.mode.message}</FormError>}
                    </div>

                    <div className='md:col-span-3'>
                        <label htmlFor='year-select' className='font-medium text-sm'>
                            Year <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                            <SelectTrigger id='year-select' className={errors.year ? 'border-red-500' : ''}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {['2023', '2024', '2025'].map((y) => (
                                    <SelectItem key={y} value={y}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.year && <FormError>{errors.year.message}</FormError>}
                    </div>

                    {filters.mode === 'Month Wise' ? (
                        <div className='md:col-span-3'>
                            <label htmlFor='month-select' className='font-medium text-sm'>
                                Month <span className='text-red-500'>*</span>
                            </label>
                            <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                                <SelectTrigger id='month-select' className={errors.month ? 'border-red-500' : ''}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m) => (
                                        <SelectItem key={m} value={m}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.month && <FormError>{errors.month.message}</FormError>}
                        </div>
                    ) : (
                        <div className='md:col-span-3'>
                            <label htmlFor='date-input' className='font-medium text-sm'>
                                Date
                            </label>
                            <InputText
                                id='date-input'
                                type='date'
                                value={filters.date}
                                onChange={(e) => handleFilterChange('date', e.target.value)}
                                error={errors.date?.message}
                            />
                        </div>
                    )}

                    <div className='flex gap-2 md:col-span-12'>
                        <Button type='submit'>
                            <RefreshCw className='mr-2 h-4 w-4' /> Report
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
