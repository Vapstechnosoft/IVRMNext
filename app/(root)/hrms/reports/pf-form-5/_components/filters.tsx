'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface Form5Filters {
    month: string;
    year: string;
}

interface PFForm5FiltersProps {
    filters: Form5Filters;
    onFilterChange: (filters: Form5Filters) => void;
    onGenerate: () => void;
    onCancel: () => void;
}

export function PFForm5Filters({ filters, onFilterChange, onGenerate, onCancel }: PFForm5FiltersProps) {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    const handleSelectChange = (key: keyof Form5Filters, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <CollapsibleSection
            title='PF FORM 5'
            description='Generate register of employees for Provident Fund'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            {/* Simple Month/Year Selection */}
            <div className='flex items-center justify-center gap-6'>
                {/* Month Filter */}
                <div className='space-y-2'>
                    <span className='font-medium text-foreground text-sm'>
                        Month: <span className='text-red-500'>*</span>
                    </span>
                    <Select value={filters.month} onValueChange={(value) => handleSelectChange('month', value)}>
                        <SelectTrigger className='w-40'>
                            <SelectValue placeholder='Select' />
                        </SelectTrigger>
                        <SelectContent>
                            {[
                                'January',
                                'February',
                                'March',
                                'April',
                                'May',
                                'June',
                                'July',
                                'August',
                                'September',
                                'October',
                                'November',
                                'December'
                            ].map((month) => (
                                <SelectItem key={month} value={month}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Year Filter */}
                <div className='space-y-2'>
                    <span className='font-medium text-foreground text-sm'>
                        Year: <span className='text-red-500'>*</span>
                    </span>
                    <Select value={filters.year} onValueChange={(value) => handleSelectChange('year', value)}>
                        <SelectTrigger className='w-32'>
                            <SelectValue placeholder='Select' />
                        </SelectTrigger>
                        <SelectContent>
                            {currentYear &&
                                Array.from({ length: 5 }, (_, i) => {
                                    const year = currentYear - 2 + i;
                                    return (
                                        <SelectItem key={`year-${year}`} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    );
                                })}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 pt-4'>
                <Button onClick={onGenerate} className='bg-blue-600 hover:bg-blue-700'>
                    GENERATE
                </Button>
                <Button variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </CollapsibleSection>
    );
}
