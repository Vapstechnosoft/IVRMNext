'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { foMonthEndReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { useFOMonthEndReportOnload } from '@/hooks/hrms/useReports';
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

    // Fetch dropdown data from API
    const { data: onloadData, isLoading: isLoadingOnload } = useFOMonthEndReportOnload();

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
                        <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)} disabled={isLoadingOnload}>
                            <SelectTrigger id='year-select' className={errors.year ? 'border-red-500' : ''}>
                                <SelectValue placeholder={isLoadingOnload ? 'Loading...' : '--Select--'} />
                            </SelectTrigger>
                            <SelectContent>
                                {onloadData?.data?.years?.map((year) => (
                                    <SelectItem key={year.hrmlY_Id} value={year.hrmlY_LeaveYear}>
                                        {year.hrmlY_LeaveYear}
                                    </SelectItem>
                                )) || []}
                            </SelectContent>
                        </Select>
                        {errors.year && <FormError>{errors.year.message}</FormError>}
                    </div>

                    <div className='md:col-span-3'>
                        <label htmlFor='month-select' className='font-medium text-sm'>
                            Month <span className='text-red-500'>*</span>
                        </label>
                        <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)} disabled={isLoadingOnload}>
                            <SelectTrigger id='month-select' className={errors.month ? 'border-red-500' : ''}>
                                <SelectValue placeholder={isLoadingOnload ? 'Loading...' : '--Select--'} />
                            </SelectTrigger>
                            <SelectContent>
                                {onloadData?.data?.months?.map((month) => (
                                    <SelectItem key={month.monthid} value={month.monthid.toString().padStart(2, '0')}>
                                        {month.monthname.trim()}
                                    </SelectItem>
                                )) || []}
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
