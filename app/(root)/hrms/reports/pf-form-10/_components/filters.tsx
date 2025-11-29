// _components/filters.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function PFForm10Filters({ filters, years, onFilterChange, onGenerate, onCancel }: any) {
    return (
        <div className='rounded-lg border bg-white p-8 shadow-lg'>
            <h2 className='mb-6 text-center font-bold text-2xl text-blue-800'>PF Form 10 - Generate Report</h2>

            <div className='flex flex-wrap items-end justify-center gap-6'>
                <div className='space-y-2'>
                    <Label>
                        Month <span className='text-red-500'>*</span>
                    </Label>
                    <Select value={filters.month} onValueChange={(v) => onFilterChange({ ...filters, month: v })}>
                        <SelectTrigger className='w-48'>
                            <SelectValue placeholder='Select Month' />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((m) => (
                                <SelectItem key={m} value={m}>
                                    {m}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='space-y-2'>
                    <Label>
                        Year <span className='text-red-500'>*</span>
                    </Label>
                    <Select value={filters.year} onValueChange={(v) => onFilterChange({ ...filters, year: v })}>
                        <SelectTrigger className='w-32'>
                            <SelectValue placeholder='Select Year' />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y: any) => (
                                <SelectItem key={y.HRMLY_LeaveYear} value={y.HRMLY_LeaveYear}>
                                    {y.HRMLY_LeaveYear}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='flex gap-3'>
                    <Button
                        size='lg'
                        onClick={onGenerate}
                        disabled={!filters.month || !filters.year}
                        className='bg-green-600 hover:bg-green-700'>
                        <Search className='mr-2 h-5 w-5' />
                        GENERATE FORM
                    </Button>
                    <Button size='lg' variant='outline' onClick={onCancel}>
                        <X className='mr-2 h-5 w-5' />
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
