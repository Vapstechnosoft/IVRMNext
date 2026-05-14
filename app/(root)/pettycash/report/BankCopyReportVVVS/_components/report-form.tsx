'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAcademicYearList } from '@/hooks/pettycash/report/usePDAReport';
import { Label } from '@/components/ui/extension/field';
import { FileDown, Printer, Search, RotateCcw } from 'lucide-react';


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

    const yearsRaw = yearList?.data;
    const years: any[] = Array.isArray(yearsRaw) 
        ? yearsRaw 
        : (yearsRaw as any)?.acayyearbind || (yearsRaw as any)?.$values || [];



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
                                const selectedYear = years.find(y => y.asmaY_Id.toString() === val);
                                if (selectedYear) setValue('ASMAY_Year', selectedYear.asmaY_Year);
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
                                    {years?.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Year} className="text-xs">
                                            {year.asmaY_Year}
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-purple-50">
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        className="bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white px-6 h-9 rounded-md font-bold shadow-md transition-all active:scale-95 text-xs"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Report
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-9 px-6 rounded-md font-bold shadow-sm transition-all text-xs"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                </div>

                {showReportButtons && (
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onExport}
                            className='h-9 w-auto rounded-md border-green-200 bg-white px-6 text-[10px] font-bold text-green-700 shadow-sm hover:bg-green-50 hover:text-green-800 uppercase tracking-wider'
                        >
                            <FileDown className='mr-1.5 h-4 w-4' />
                            Export to Excel
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={onPrint}
                            className='h-9 w-auto rounded-md border-blue-200 bg-white px-6 text-[10px] font-bold text-blue-700 shadow-sm hover:bg-blue-50 hover:text-blue-800 uppercase tracking-wider'
                        >
                            <Printer className='mr-1.5 h-4 w-4' />
                            Print
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
