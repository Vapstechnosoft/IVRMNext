'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

interface EmployeeSalaryDetailsFiltersProps {
    selectedFinancialYear: string;
    searchTerm: string;
    onFinancialYearChange: (year: string) => void;
    onSearchTermChange: (term: string) => void;
}

export function EmployeeSalaryDetailsFilters({
    selectedFinancialYear,
    searchTerm,
    onFinancialYearChange,
    onSearchTermChange
}: EmployeeSalaryDetailsFiltersProps) {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <>
            {/* Salary Details Section */}
            <CollapsibleSection
                title='SALARY DETAILS'
                description='Select financial year to view detailed salary breakdown'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <div className='space-y-4'>
                    {/* Financial Year Selection */}
                    <div className='flex items-center justify-center gap-4'>
                        <span className='font-medium text-foreground text-sm'>Financial Year :</span>
                        <Select value={selectedFinancialYear} onValueChange={onFinancialYearChange}>
                            <SelectTrigger className='w-48'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {currentYear &&
                                    Array.from({ length: 10 }, (_, i) => {
                                        const year = currentYear + 5 - i;
                                        return (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        );
                                    })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Monthwise Salary Details Section */}
            <CollapsibleSection
                title='MONTHWISE SALARY DETAILS'
                description='Detailed monthly salary breakdown with search functionality'
                defaultOpen={true}
                variant='outline'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <div className='space-y-4'>
                    <div className='mb-4 flex items-center justify-end'>
                        <Input
                            placeholder='Search by month...'
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            className='w-64'
                        />
                    </div>
                </div>
            </CollapsibleSection>
        </>
    );
}

