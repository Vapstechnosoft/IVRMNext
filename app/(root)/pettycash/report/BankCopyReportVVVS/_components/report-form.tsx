'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAcademicYearList } from '@/hooks/pettycash/report/usePDAReport';
import { Label } from '@/components/ui/extension/field';
import { FileDown, Printer, Search, RotateCcw } from 'lucide-react';
import { useEffect, useMemo } from 'react';

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, { message: 'Academic Year is required' }),
    IVRM_Month_Id: z.string().min(1, { message: 'Month is required' }),
    ASMAY_Year: z.string().min(1, { message: 'Year is required' }),
});

export type BankCopyFormValues = z.infer<typeof formSchema>;

interface BankCopyReportFormProps {
    onSearch: (values: BankCopyFormValues) => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
    showReportButtons: boolean;
}

const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

export default function BankCopyReportForm({
    onSearch,
    onCancel,
    onExport,
    onPrint,
    showReportButtons
}: BankCopyReportFormProps) {
    const { data: yearList } = useAcademicYearList();

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<BankCopyFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: '',
            IVRM_Month_Id: '',
            ASMAY_Year: '',
        },
    });

    const years = useMemo(() => {
        const raw = yearList?.data;
        if (Array.isArray(raw)) return raw;
        return (raw as any)?.acayyearbind || (raw as any)?.$values || [];
    }, [yearList?.data]);

    const selectedAcademicYearId = useWatch({
        control,
        name: 'ASMAY_Id'
    });

    const splitYears = useMemo(() => {
        if (selectedAcademicYearId && years.length > 0) {
            const selectedYear = years.find((y: any) => y.asmaY_Id.toString() === selectedAcademicYearId);
            if (selectedYear && selectedYear.asmaY_Year) {
                const yearStr = selectedYear.asmaY_Year.toString();
                const s1 = yearStr.substring(0, 4);
                const s2 = yearStr.length > 5 ? yearStr.substring(5, yearStr.length) : '';

                const temp = [
                    { id: '0', year: s1 },
                ];
                if (s2) {
                    temp.push({ id: '1', year: s2 });
                }
                return temp;
            }
        }
        return [];
    }, [selectedAcademicYearId, years]);



    function onSubmit(values: BankCopyFormValues) {
        onSearch(values);
    }

    const handleReset = () => {
        reset();
        onCancel();
    };

    return (
        <div className="mx-auto w-full bg-white rounded-xl shadow-sm border border-purple-100 p-8 space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Academic Year */}
                <div className="space-y-3">
                    <Label className="text-purple-900 font-semibold text-xs">
                        Academic Year: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name="ASMAY_Id"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => {
                                field.onChange(val);
                                setValue('ASMAY_Year', ''); // Reset year when academic year changes
                            }} value={field.value}>
                                <SelectTrigger className='w-full h-9 text-xs'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years?.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()} className="text-xs">
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ASMAY_Id && <span className='text-red-500 text-[10px] font-medium'>{errors.ASMAY_Id.message}</span>}
                </div>

                {/* Month */}
                <div className="space-y-3">
                    <Label className="text-purple-900 font-semibold text-xs">
                        Month: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name="IVRM_Month_Id"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className='w-full h-9 text-xs'>
                                    <SelectValue placeholder='Select Month' />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((mon) => (
                                        <SelectItem key={mon.value} value={mon.value} className="text-xs">
                                            {mon.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.IVRM_Month_Id && <span className='text-red-500 text-[10px] font-medium'>{errors.IVRM_Month_Id.message}</span>}
                </div>

                {/* Year (from Academic Year) */}
                <div className="space-y-3">
                    <Label className="text-purple-900 font-semibold text-xs">
                        Year: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name="ASMAY_Year"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className='w-full h-9 text-xs'>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {splitYears?.map((y) => (
                                        <SelectItem key={y.id} value={y.year} className="text-xs">
                                            {y.year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ASMAY_Year && <span className='text-red-500 text-[10px] font-medium'>{errors.ASMAY_Year.message}</span>}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row items-center justify-center gap-4 pt-6 border-t border-purple-50 overflow-x-auto">
                <Button
                    onClick={handleSubmit(onSubmit)}
                    className="bg-gradient-to-r from-orange-500 to-orange-500 hover:from-orange-700 hover:to-orange-800 text-white px-6 h-9 rounded-md font-bold shadow-md transition-all active:scale-95 text-xs uppercase tracking-wider"
                >
                    <Search className="mr-2 h-4 w-4" />
                    Report
                </Button>

                <Button
                    variant="outline"
                    onClick={handleReset}
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-9 px-6 rounded-md font-bold shadow-sm transition-all text-xs uppercase tracking-wider"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Clear
                </Button>

                {showReportButtons && (
                    <>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onExport}
                            className='h-9 rounded-md border-green-200 bg-white px-6 text-[10px] font-bold text-green-700 shadow-sm hover:bg-green-50 hover:text-green-800 uppercase tracking-wider'
                        >
                            <FileDown className='mr-1.5 h-4 w-4' />
                            Export to Excel
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={onPrint}
                            className='h-9 rounded-md border-blue-200 bg-white px-6 text-[10px] font-bold text-blue-700 shadow-sm hover:bg-blue-50 hover:text-blue-800 uppercase tracking-wider'
                        >
                            <Printer className='mr-1.5 h-4 w-4' />
                            Print
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
