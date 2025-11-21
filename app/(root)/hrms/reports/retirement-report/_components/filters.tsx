'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Search, X } from 'lucide-react';
import { headerFields } from './columns';

export interface RetirementFilters {
    selectedHeaders: string[];
    format: 'format1' | 'format2';
    dateFilter: 'dateOfBirth' | 'dateOfJoining' | 'dateOfLeaving';
    fromDate: Date | undefined;
    toDate: Date | undefined;
    employeeStatus: 'working' | 'left';
    reportScope: 'all' | 'individual';
}

interface RetirementReportFiltersProps {
    filters: RetirementFilters;
    onFilterChange: (key: keyof RetirementFilters, value: any) => void;
    onHeaderChange: (header: string, checked: boolean) => void;
    onHeaderSelectAll: (checked: boolean) => void;
    onDateChange: (key: 'fromDate' | 'toDate', date: Date | undefined) => void;
    onSearch: () => void;
    onCancel: () => void;
}

export function RetirementReportFilters({
    filters,
    onFilterChange,
    onHeaderChange,
    onHeaderSelectAll,
    onDateChange,
    onSearch,
    onCancel
}: RetirementReportFiltersProps) {
    return (
        <CollapsibleSection
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    {/* Header Selection */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                            <span className='font-medium text-foreground text-sm'>Header:</span>
                            <span className='text-red-500'>*</span>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='all-headers'
                                    checked={filters.selectedHeaders.length === headerFields.length}
                                    onCheckedChange={onHeaderSelectAll}
                                />
                                <label htmlFor='all-headers' className='cursor-pointer text-sm'>
                                    All
                                </label>
                            </div>
                        </div>
                        <div className='h-40 space-y-2 overflow-y-auto rounded-lg border p-3'>
                            {headerFields.map((header) => (
                                <div key={header} className='flex items-center gap-2'>
                                    <Checkbox
                                        id={`header-${header}`}
                                        checked={filters.selectedHeaders.includes(header)}
                                        onCheckedChange={(checked) => onHeaderChange(header, checked as boolean)}
                                    />
                                    <label htmlFor={`header-${header}`} className='cursor-pointer text-sm'>
                                        {header}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                    {/* Format Selection */}
                    <div className='space-y-3'>
                        <span className='font-medium text-foreground text-sm'>Format:</span>
                        <RadioGroup
                            value={filters.format}
                            onValueChange={(value) => onFilterChange('format', value)}
                            className='flex gap-4'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='format1' id='format1' />
                                <label htmlFor='format1' className='cursor-pointer text-sm'>
                                    Format 1
                                </label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='format2' id='format2' />
                                <label htmlFor='format2' className='cursor-pointer text-sm'>
                                    Format 2
                                </label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Date Filter Selection */}
                    <div className='space-y-3'>
                        <span className='font-medium text-foreground text-sm'>Date Filter:</span>
                        <RadioGroup
                            value={filters.dateFilter}
                            onValueChange={(value) => onFilterChange('dateFilter', value)}
                            className='flex gap-4'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='dateOfBirth' id='dateOfBirth' />
                                <label htmlFor='dateOfBirth' className='cursor-pointer text-sm'>
                                    Date of Birth
                                </label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='dateOfJoining' id='dateOfJoining' />
                                <label htmlFor='dateOfJoining' className='cursor-pointer text-sm'>
                                    Date of Joining
                                </label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='dateOfLeaving' id='dateOfLeaving' />
                                <label htmlFor='dateOfLeaving' className='cursor-pointer text-sm'>
                                    Date of Leaving
                                </label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Date Range Selection */}
                    <div className='flex items-center gap-4'>
                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>
                                From: <span className='text-red-500'>*</span>
                            </span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={cn(
                                            'w-[140px] justify-start text-left font-normal',
                                            !filters.fromDate && 'text-muted-foreground'
                                        )}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {filters.fromDate ? format(filters.fromDate, 'dd-MM-yyyy') : '17-09-2025'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <DatePickerWithYear
                                        mode='single'
                                        selected={filters.fromDate}
                                        onDayClick={(day) => onDateChange('fromDate', day)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className='space-y-2'>
                            <span className='font-medium text-foreground text-sm'>
                                To: <span className='text-red-500'>*</span>
                            </span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={cn(
                                            'w-[140px] justify-start text-left font-normal',
                                            !filters.toDate && 'text-muted-foreground'
                                        )}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {filters.toDate ? format(filters.toDate, 'dd-MM-yyyy') : '17-09-2025'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <DatePickerWithYear
                                        mode='single'
                                        selected={filters.toDate}
                                        onDayClick={(day) => onDateChange('toDate', day)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Employee Status */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='working'
                                    checked={filters.employeeStatus === 'working'}
                                    onCheckedChange={(checked) => checked && onFilterChange('employeeStatus', 'working')}
                                />
                                <label htmlFor='working' className='cursor-pointer text-sm'>
                                    Working
                                </label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='left'
                                    checked={filters.employeeStatus === 'left'}
                                    onCheckedChange={(checked) => checked && onFilterChange('employeeStatus', 'left')}
                                />
                                <label htmlFor='left' className='cursor-pointer text-sm'>
                                    Left
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Report Scope */}
                    <div className='space-y-3'>
                        <span className='font-medium text-foreground text-sm'>Report Scope:</span>
                        <RadioGroup
                            value={filters.reportScope}
                            onValueChange={(value) => onFilterChange('reportScope', value)}
                            className='flex gap-4'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='all' id='all' />
                                <label htmlFor='all' className='cursor-pointer text-sm'>
                                    All
                                </label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='individual' id='individual' />
                                <label htmlFor='individual' className='cursor-pointer text-sm'>
                                    Individual
                                </label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 pt-4'>
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
