'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Printer, RefreshCw, X } from 'lucide-react';

export interface GPSLocationReportFilters {
    betweenDates: boolean;
    fromDate: string;
    toDate: string;
    employee: string;
}

interface GPSLocationReportFiltersProps {
    filters: GPSLocationReportFilters;
    employees: string[];
    onFilterChange: (filters: GPSLocationReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export function GPSLocationReportFilters({
    filters,
    employees,
    onFilterChange,
    onSearch,
    onCancel,
    onExport,
    onPrint
}: GPSLocationReportFiltersProps) {
    const handleFilterChange = (key: keyof GPSLocationReportFilters, value: any) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <CollapsibleSection
            title='ATTENDANCE GPS LOCATION REPORT'
            description='Configure filters to generate GPS location attendance reports'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-12'>
                <div className='flex items-center gap-6 md:col-span-12'>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            id='between-dates-checkbox'
                            checked={filters.betweenDates}
                            onCheckedChange={(v) => handleFilterChange('betweenDates', Boolean(v))}
                        />
                        <Label htmlFor='between-dates-checkbox'>Between Date</Label>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            id='employee-wise-checkbox'
                            checked={!filters.betweenDates}
                            onCheckedChange={(v) => handleFilterChange('betweenDates', !v)}
                        />
                        <Label htmlFor='employee-wise-checkbox'>Employee Wise</Label>
                    </div>
                </div>
                <div className='md:col-span-4'>
                    <label htmlFor='from-date-input' className='font-medium text-sm'>
                        From Date
                    </label>
                    <InputText
                        id='from-date-input'
                        type='date'
                        value={filters.fromDate}
                        onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                    />
                </div>
                <div className='md:col-span-4'>
                    <label htmlFor='to-date-input' className='font-medium text-sm'>
                        To Date
                    </label>
                    <InputText
                        id='to-date-input'
                        type='date'
                        value={filters.toDate}
                        onChange={(e) => handleFilterChange('toDate', e.target.value)}
                    />
                </div>
                <div className='md:col-span-4'>
                    <label htmlFor='employee-select' className='font-medium text-sm'>
                        Employee Name
                    </label>
                    <Select onValueChange={(value) => handleFilterChange('employee', value)}>
                        <SelectTrigger id='employee-select'>
                            <SelectValue placeholder='Search Employee Name here...' />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((name) => (
                                <SelectItem key={name} value={name}>
                                    {name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex gap-2 pt-2 md:col-span-12'>
                    <Button onClick={onSearch}>
                        <RefreshCw className='mr-2 h-4 w-4' /> Report
                    </Button>
                    <Button variant='outline' onClick={onExport}>
                        <FileDown className='mr-2 h-4 w-4' /> Export to Excel
                    </Button>
                    <Button variant='outline' onClick={onPrint}>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>
                    <Button variant='outline' onClick={onCancel}>
                        <X className='mr-2 h-4 w-4' /> CANCEL
                    </Button>
                </div>
            </div>
        </CollapsibleSection>
    );
}
