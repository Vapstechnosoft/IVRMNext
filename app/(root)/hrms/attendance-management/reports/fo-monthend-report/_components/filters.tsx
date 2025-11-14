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
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-12'>
                    <div className='md:col-span-3'>
                        <label htmlFor='year-select' className='font-medium text-sm'>
                            Year <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                            <SelectTrigger id='year-select' className={errors.year ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                {['2023', '2024', '2025', '2026'].map((y) => (
                                    <SelectItem key={y} value={y}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.year && <FormError>{errors.year.message}</FormError>}
                    </div>

                    <div className='md:col-span-3'>
                        <label htmlFor='month-select' className='font-medium text-sm'>
                            Month <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                            <SelectTrigger id='month-select' className={errors.month ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    { value: '01', label: 'January' },
                                    { value: '02', label: 'February' },
                                    { value: '03', label: 'March' },
                                    { value: '04', label: 'April' },
                                    { value: '05', label: 'May' },
                                    { value: '06', label: 'June' },
                                    { value: '07', label: 'July' },
                                    { value: '08', label: 'August' },
                                    { value: '09', label: 'September' },
                                    { value: '10', label: 'October' },
                                    { value: '11', label: 'November' },
                                    { value: '12', label: 'December' }
                                ].map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.month && <FormError>{errors.month.message}</FormError>}
                    </div>

                    <div className='md:col-span-3'>
                        <label htmlFor='ie-name-input' className='font-medium text-sm'>
                            IE Name <span className='text-red-500'>*</span>
                        </label>
                        <InputText
                            id='ie-name-input'
                            placeholder='Enter IE Name'
                            value={filters.ieName || ''}
                            onChange={(e) => handleFilterChange('ieName', e.target.value)}
                            error={errors.ieName?.message}
                        />
                    </div>

                    <div className='flex items-end gap-2 md:col-span-12'>
                        <Button type='submit' variant='default'>
                            <RefreshCw className='mr-2 h-4 w-4' /> REPORT
                        </Button>
                        <Button type='button' variant='outline' onClick={onCancel}>
                            <X className='mr-2 h-4 w-4' /> CLEAR
                        </Button>
                    </div>
                </div>
            </form>
        </CollapsibleSection>
    );
}
