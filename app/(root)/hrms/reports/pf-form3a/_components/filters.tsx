'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

export interface Form3AFilters {
    year: string;
    employeeCode: string;
}

interface PFForm3AFiltersProps {
    filters: Form3AFilters;
    employees: Array<{ code: string; name: string; pfNumber: string }>;
    onFilterChange: (filters: Form3AFilters) => void;
    onGenerate: () => void;
    onCancel: () => void;
}

export function PFForm3AFilters({ filters, employees, onFilterChange, onGenerate, onCancel }: PFForm3AFiltersProps) {
    const handleSelectChange = (key: keyof Form3AFilters, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <CollapsibleSection
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            {/* Year and Employee Selection */}
            <div className='flex items-center justify-center gap-6'>
                {/* Year Filter */}
                <div className='space-y-2'>
                    <label htmlFor='year-select' className='font-medium text-foreground text-sm'>
                        Year: <span className='text-red-500'>*</span>
                    </label>
                    <Select value={filters.year} onValueChange={(value) => handleSelectChange('year', value)}>
                        <SelectTrigger id='year-select' className='w-40'>
                            <SelectValue placeholder='Select' />
                        </SelectTrigger>
                        <SelectContent>
                            {['2023', '2024', '2025'].map((year) => (
                                <SelectItem key={year} value={year}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Employee Filter */}
                <div className='space-y-2'>
                    <label htmlFor='employee-select' className='font-medium text-foreground text-sm'>
                        Employee: <span className='text-red-500'>*</span>
                    </label>
                    <Select value={filters.employeeCode} onValueChange={(value) => handleSelectChange('employeeCode', value)}>
                        <SelectTrigger id='employee-select' className='w-60'>
                            <SelectValue placeholder='Select Employee' />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((emp) => (
                                <SelectItem key={emp.code} value={emp.code}>
                                    {emp.name} ({emp.code})
                                </SelectItem>
                            ))}
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
