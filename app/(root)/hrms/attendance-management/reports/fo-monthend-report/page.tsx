// Refactored by automation script on 2025-10-28T15:40:35.674Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/filters.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function FOMonthEndReportPage() {
    const [mode, setMode] = useState<'Month Wise' | 'Date Wise'>('Month Wise');
    const [year, setYear] = useState<string>('2023');
    const [month, setMonth] = useState<string>('01');
    const [date, setDate] = useState<string>('');

    const handleReport = () => {};
    const handleClear = () => {
        setMode('Month Wise');
        setYear('2023');
        setMonth('01');
        setDate('');
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Attendance Report' description='' />
                    </div>
                </div>

                <CollapsibleSection
                    title=''
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-12'>
                        <div className='flex items-center gap-6 md:col-span-12'>
                            <label className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={mode === 'Month Wise'} onChange={() => setMode('Month Wise')} /> Month Wise
                            </label>
                            <label className='flex items-center gap-2 text-sm'>
                                <input type='radio' checked={mode === 'Date Wise'} onChange={() => setMode('Date Wise')} /> Date Wise
                            </label>
                        </div>

                        <div className='md:col-span-3'>
                            <label className='font-medium text-sm'>Year</label>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['2023', '2024', '2025'].map((y) => (
                                        <SelectItem key={y} value={y}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {mode === 'Month Wise' ? (
                            <div className='md:col-span-3'>
                                <label className='font-medium text-sm'>Month</label>
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className='md:col-span-3'>
                                <label className='font-medium text-sm'>Date</label>
                                <InputText type='date' value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                        )}

                        <div className='flex gap-2 md:col-span-12'>
                            <Button onClick={handleReport}>
                                <RefreshCw className='mr-2 h-4 w-4' /> Report
                            </Button>
                            <Button variant='outline' onClick={handleClear}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}
