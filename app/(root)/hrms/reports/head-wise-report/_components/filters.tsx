'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface HeadWiseReportFilters {
    selectedGroupTypes: string[];
    month: string;
    year: string;
}

interface HeadWiseReportFiltersProps {
    filters: HeadWiseReportFilters;
    groupTypes: Array<{ id: number; groupType: string }>;
    onFilterChange: (filters: HeadWiseReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    onSelectAllGroupTypes: () => void;
    onGroupTypeToggle: (groupType: string) => void;
}

export function HeadWiseReportFilters({
    filters,
    groupTypes,
    onFilterChange,
    onSearch,
    onCancel,
    onSelectAllGroupTypes,
    onGroupTypeToggle
}: HeadWiseReportFiltersProps) {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <CollapsibleSection
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Left Column - Group Type Selection */}
                <div className='space-y-4'>
                    <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                            <span className='font-medium text-foreground text-sm'>
                                Group Type: <span className='text-red-500'>*</span>
                            </span>
                            <Button variant='outline' size='sm' onClick={onSelectAllGroupTypes} className='text-xs'>
                                {filters.selectedGroupTypes.length === groupTypes.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>

                        <div className='max-h-48 overflow-y-auto rounded-md border bg-background p-3'>
                            <div className='space-y-2'>
                                <div className='flex items-center gap-2 font-medium text-sm'>
                                    <Checkbox
                                        id='all-group-types'
                                        checked={filters.selectedGroupTypes.length === groupTypes.length}
                                        onCheckedChange={onSelectAllGroupTypes}
                                    />
                                    <label htmlFor='all-group-types' className='cursor-pointer'>
                                        All
                                    </label>
                                </div>
                                {groupTypes.map((group) => (
                                    <div key={group.id} className='flex items-center gap-2 text-sm'>
                                        <Checkbox
                                            id={`group-${group.id}`}
                                            checked={filters.selectedGroupTypes.includes(group.groupType)}
                                            onCheckedChange={() => onGroupTypeToggle(group.groupType)}
                                        />
                                        <label htmlFor={`group-${group.id}`} className='cursor-pointer'>
                                            {group.groupType}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Month and Year */}
                <div className='space-y-4'>
                    {/* Month Selection */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Month: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.month} onValueChange={(value) => onFilterChange({ ...filters, month: value })}>
                            <SelectTrigger>
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

                    {/* Year Selection */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Year: <span className='text-red-500'>*</span>
                        </span>
                        <Select value={filters.year} onValueChange={(value) => onFilterChange({ ...filters, year: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                                {currentYear &&
                                    Array.from({ length: 5 }, (_, i) => {
                                        const year = currentYear - 2 + i;
                                        return (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        );
                                    })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selected Group Types Display */}
                    {filters.selectedGroupTypes.length > 0 && (
                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>Selected Group Types:</span>
                            <div className='text-muted-foreground text-sm'>{filters.selectedGroupTypes.length} group type(s) selected</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2 pt-4'>
                <Button onClick={onSearch}>
                    <Search className='mr-2 h-4 w-4' />
                    SEARCH
                </Button>
                <Button variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </CollapsibleSection>
    );
}
