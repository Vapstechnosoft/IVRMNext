'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, X } from 'lucide-react';

export interface FOMonthEndReportFilters {
    mode: 'Month Wise' | 'Date Wise';
    year: string;
    month: string;
    date: string;
}

interface FOMonthEndReportFiltersProps {
    filters: FOMonthEndReportFilters;
    onFilterChange: (filters: FOMonthEndReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
}

export function FOMonthEndReportFilters({ filters, onFilterChange, onSearch, onCancel }: FOMonthEndReportFiltersProps) {
    const handleFilterChange = (key: keyof FOMonthEndReportFilters, value: any) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <CollapsibleSection
            title='ATTENDANCE REPORT'
            description='Configure filters to generate month-end or date-wise attendance reports'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-12'>
                <div className='flex items-center gap-6 md:col-span-12'>
                    <label className='flex items-center gap-2 text-sm'>
                        <input
                            type='radio'
                            checked={filters.mode === 'Month Wise'}
                            onChange={() => handleFilterChange('mode', 'Month Wise')}
                        />
                        Month Wise
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                        <input
                            type='radio'
                            checked={filters.mode === 'Date Wise'}
                            onChange={() => handleFilterChange('mode', 'Date Wise')}
                        />
                        Date Wise
                    </label>
                </div>

                <div className='md:col-span-3'>
                    <label htmlFor='year-select' className='font-medium text-sm'>
                        Year
                    </label>
                    <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                        <SelectTrigger id='year-select'>
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
                </div>

                {filters.mode === 'Month Wise' ? (
                    <div className='md:col-span-3'>
                        <label htmlFor='month-select' className='font-medium text-sm'>
                            Month
                        </label>
                        <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                            <SelectTrigger id='month-select'>
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
                        />
                    </div>
                )}

                <div className='flex gap-2 md:col-span-12'>
                    <Button onClick={onSearch}>
                        <RefreshCw className='mr-2 h-4 w-4' /> Report
                    </Button>
                    <Button variant='outline' onClick={onCancel}>
                        <X className='mr-2 h-4 w-4' /> CANCEL
                    </Button>
                </div>
            </div>
        </CollapsibleSection>
    );
}
