'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Printer, RefreshCw, X } from 'lucide-react';

export interface EmployeeInOutReportFilters {
    branch: string;
    type: string;
    department: string;
    designation: string;
    allOrIndividual: 'All' | 'Individual';
    codeOrName: 'Code' | 'Name';
    query: string;
    fromDate: string;
    toDate: string;
}

interface EmployeeInOutReportFiltersProps {
    filters: EmployeeInOutReportFilters;
    branches: string[];
    departments: string[];
    designations: string[];
    onFilterChange: (filters: EmployeeInOutReportFilters) => void;
    onSearch: () => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
}

export function EmployeeInOutReportFilters({
    filters,
    branches,
    departments,
    designations,
    onFilterChange,
    onSearch,
    onCancel,
    onExport,
    onPrint
}: EmployeeInOutReportFiltersProps) {
    const handleFilterChange = (key: keyof EmployeeInOutReportFilters, value: any) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <CollapsibleSection
            title='EMPLOYEE IN/OUT REPORT'
            description='Configure filters to generate employee attendance in/out reports'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='branch'>
                        Branch
                    </label>
                    <Select onValueChange={(value) => handleFilterChange('branch', value)}>
                        <SelectTrigger id='branch'>
                            <SelectValue placeholder='Select Branch' />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map((b) => (
                                <SelectItem key={b} value={b}>
                                    {b}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='type'>
                        Type
                    </label>
                    <Select onValueChange={(value) => handleFilterChange('type', value)}>
                        <SelectTrigger id='type'>
                            <SelectValue placeholder='Type' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Permanent'>Permanent</SelectItem>
                            <SelectItem value='Contract'>Contract</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='department'>
                        Department
                    </label>
                    <Select onValueChange={(value) => handleFilterChange('department', value)}>
                        <SelectTrigger id='department'>
                            <SelectValue placeholder='Department' />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((b) => (
                                <SelectItem key={b} value={b}>
                                    {b}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='designation'>
                        Designation
                    </label>
                    <Select onValueChange={(value) => handleFilterChange('designation', value)}>
                        <SelectTrigger id='designation'>
                            <SelectValue placeholder='Designation' />
                        </SelectTrigger>
                        <SelectContent>
                            {designations.map((b) => (
                                <SelectItem key={b} value={b}>
                                    {b}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='flex items-center gap-4 pt-2 md:col-span-12'>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            checked={filters.allOrIndividual === 'All'}
                            onCheckedChange={() => handleFilterChange('allOrIndividual', 'All')}
                        />
                        <span>All</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                        <Checkbox
                            checked={filters.allOrIndividual === 'Individual'}
                            onCheckedChange={() => handleFilterChange('allOrIndividual', 'Individual')}
                        />
                        <span>Individual</span>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-2 text-sm'>
                            <Checkbox
                                checked={filters.codeOrName === 'Code'}
                                onCheckedChange={() => handleFilterChange('codeOrName', 'Code')}
                            />
                            <span>Code</span>
                        </div>
                        <div className='flex items-center gap-2 text-sm'>
                            <Checkbox
                                checked={filters.codeOrName === 'Name'}
                                onCheckedChange={() => handleFilterChange('codeOrName', 'Name')}
                            />
                            <span>Name</span>
                        </div>
                        <InputText
                            placeholder={filters.codeOrName === 'Code' ? 'Code' : 'Name'}
                            value={filters.query}
                            onChange={(e) => handleFilterChange('query', e.target.value)}
                        />
                    </div>
                </div>

                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='fromDate'>
                        From Date
                    </label>
                    <InputText
                        id='fromDate'
                        type='date'
                        value={filters.fromDate}
                        onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                    />
                </div>
                <div className='md:col-span-3'>
                    <label className='font-medium text-sm' htmlFor='toDate'>
                        To Date
                    </label>
                    <InputText
                        id='toDate'
                        type='date'
                        value={filters.toDate}
                        onChange={(e) => handleFilterChange('toDate', e.target.value)}
                    />
                </div>
                <div className='flex items-end gap-2 md:col-span-6'>
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
