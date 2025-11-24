'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

export interface Form3AFilters {
    year: string;
    employeeCode: string;
}

interface PFForm3AFiltersProps {
    filters: Form3AFilters;
    employees: Array<{ id?: number; code: string; name: string; pfNumber?: string }>;
    onFilterChange: (filters: Form3AFilters) => void;
    onGenerate: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    years?: string[];
}

export function PFForm3AFilters({
    filters,
    employees,
    onFilterChange,
    onGenerate,
    onCancel,
    isLoading = false,
    years = []
}: PFForm3AFiltersProps) {
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
                            {isLoading ? (
                                <SelectItem value='__loading__' disabled>
                                    Loading...
                                </SelectItem>
                            ) : years.length === 0 ? (
                                <SelectItem value='__no_data__' disabled>
                                    No data available
                                </SelectItem>
                            ) : (
                                years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))
                            )}
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
                            {isLoading ? (
                                <SelectItem value='__loading__' disabled>
                                    Loading...
                                </SelectItem>
                            ) : employees.length === 0 ? (
                                <SelectItem value='__no_employees__' disabled>
                                    No employees available
                                </SelectItem>
                            ) : (
                                employees.map((emp) => (
                                    <SelectItem key={emp.code} value={emp.code}>
                                        {emp.name} ({emp.code})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2 pt-4'>
                <Button onClick={onGenerate}>
                    <Search className='mr-2 h-4 w-4' />
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
