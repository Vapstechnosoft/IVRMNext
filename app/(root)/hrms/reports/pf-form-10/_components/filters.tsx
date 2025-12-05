'use client';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
export interface Form10Filters {
    month: string;
    year: string;
}
interface PFForm10FiltersProps {
    filters: Form10Filters;
    months: any[];
    years: any[];
    onFilterChange: (filters: Form10Filters) => void;
    onGenerate: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}
export function PFForm10Filters({ filters, months, years, onFilterChange, onGenerate, onCancel, isLoading = false }: PFForm10FiltersProps) {
    const handleSelectChange = (key: keyof Form10Filters, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };
    return (
        <CollapsibleSection
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            {/* Simple Month/Year Selection */}
            <div className='flex items-center justify-center gap-6'>
                {/* Month Filter */}
                <div className='space-y-2'>
                    <Label htmlFor='month' className='font-medium text-foreground text-sm'>
                        Month: <span className='text-red-500'>*</span>
                    </Label>
                    {isLoading ? (
                        <div className='h-10 w-40 animate-pulse rounded-md bg-muted' />
                    ) : months.length === 0 ? (
                        <div className='text-muted-foreground text-sm'>No months available</div>
                    ) : (
                        <Select value={filters.month} onValueChange={(value) => handleSelectChange('month', value)}>
                            <SelectTrigger className='w-40'>
                                <SelectValue placeholder='Select Month' />
                            </SelectTrigger>
                            <SelectContent>
                                {months
                                    .filter((month) => month.IVRM_Month_Id != null && month.IVRM_Month_Name)
                                    .map((month) => (
                                        <SelectItem key={month.IVRM_Month_Id} value={month.IVRM_Month_Name.trim()}>
                                            {month.IVRM_Month_Name.trim()}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                {/* Year Filter */}
                <div className='space-y-2'>
                    <Label htmlFor='year' className='font-medium text-foreground text-sm'>
                        Year: <span className='text-red-500'>*</span>
                    </Label>
                    {isLoading ? (
                        <div className='h-10 w-32 animate-pulse rounded-md bg-muted' />
                    ) : years.length === 0 ? (
                        <div className='text-muted-foreground text-sm'>No years available</div>
                    ) : (
                        <Select value={filters.year} onValueChange={(value) => handleSelectChange('year', value)}>
                            <SelectTrigger className='w-32'>
                                <SelectValue placeholder='Select Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {years
                                    .filter((year) => year.HRMLY_Id != null && year.HRMLY_LeaveYear)
                                    .map((year) => (
                                        <SelectItem key={year.HRMLY_Id} value={year.HRMLY_LeaveYear}>
                                            {year.HRMLY_LeaveYear}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    )}
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
