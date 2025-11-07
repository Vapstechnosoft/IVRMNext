'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Printer, RefreshCw, X } from 'lucide-react';

export interface EmployeeYearlyReportFilters {
    allOrIndividual: 'All' | 'Individual';
    employee: string;
    fromDate: string;
    toDate: string;
}

interface EmployeeYearlyReportFiltersProps {
    filters: EmployeeYearlyReportFilters;
    employees: string[];
    onFilterChange: (filters: EmployeeYearlyReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export function EmployeeYearlyReportFilters({
    filters,
    employees,
    onFilterChange,
    onSearch,
    onCancel,
    onExport,
    onPrint
}: EmployeeYearlyReportFiltersProps) {
    const handleFilterChange = (key: keyof EmployeeYearlyReportFilters, value: any) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <CollapsibleSection
            title='EMPLOYEE YEARLY REPORT'
            description='Configure filters to generate yearly attendance reports for employees'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
                <div className='flex items-center gap-4 md:col-span-12'>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            id='all-checkbox'
                            checked={filters.allOrIndividual === 'All'}
                            onCheckedChange={() => handleFilterChange('allOrIndividual', 'All')}
                        />
                        <Label htmlFor='all-checkbox'>All</Label>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            id='individual-checkbox'
                            checked={filters.allOrIndividual === 'Individual'}
                            onCheckedChange={() => handleFilterChange('allOrIndividual', 'Individual')}
                        />
                        <Label htmlFor='individual-checkbox'>Individual</Label>
                    </div>
                </div>
                <div className='md:col-span-6'>
                    <label htmlFor='employee-select' className='font-medium text-sm'>
                        Employee
                    </label>
                    <Select onValueChange={(value) => handleFilterChange('employee', value)}>
                        <SelectTrigger id='employee-select'>
                            <SelectValue placeholder='Select or Search Employee in list' />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((n) => (
                                <SelectItem key={n} value={n}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className='md:col-span-3'>
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
                <div className='md:col-span-3'>
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
                <div className='flex gap-2 md:col-span-12'>
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
