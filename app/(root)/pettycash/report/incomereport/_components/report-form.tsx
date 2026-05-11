'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAcademicYearList } from '@/hooks/pettycash/report/usePDAReport';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import { FileDown, FileText, Printer, Search, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, { message: 'Academic Year is required' }),
    From_Date: z.date({ required_error: 'Date is required' }),
});

export type PDAFormValues = z.infer<typeof formSchema>;

interface PDAReportFormProps {
    onSearch: (values: PDAFormValues) => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
    showReportButtons: boolean;
}

export default function PDAReportForm({
    onSearch,
    onCancel,
    onExport,
    onPrint,
    showReportButtons
}: PDAReportFormProps) {
    const { data: yearList } = useAcademicYearList();
    console.log(yearList, "academic year")

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<PDAFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: '',
            From_Date: undefined,
        },
    });

    const yearsRaw = yearList?.data;
    const years: any[] = Array.isArray(yearsRaw)
        ? yearsRaw
        : (yearsRaw as any)?.acayyearbind || (yearsRaw as any)?.$values || [];



    function onSubmit(values: PDAFormValues) {
        onSearch(values);
    }

    const handleReset = () => {
        reset({
            ASMAY_Id: '',
            From_Date: undefined,
        });
        onCancel();
    };

    return (
        <div className="mx-auto w-full bg-white rounded-xl shadow-sm border border-purple-100 p-8 space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Academic Year */}
                <div className="space-y-3">
                    <Label className="text-purple-900 font-semibold">
                        Academic Year: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name="ASMAY_Id"
                        control={control}
                        render={({ field }) => (
                            <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years?.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ASMAY_Id && <span className='text-red-500 text-xs font-medium'>{errors.ASMAY_Id.message}</span>}
                </div>

                {/* From Date */}
                <div className="space-y-3">
                    <Label className="text-purple-900 font-semibold">
                        Date: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name="From_Date"
                        control={control}
                        render={({ field }) => (
                            <DatePicker date={field.value} setDate={field.onChange} placeholder="Select Date" />
                        )}
                    />
                    {errors.From_Date && <span className='text-red-500 text-xs font-medium'>{errors.From_Date.message}</span>}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-purple-50">
                <div className="flex items-center gap-4 whitespace-nowrap">
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 h-10 rounded-md font-bold shadow-md transition-all active:scale-95"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Report
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="border-orange-200 text-orange-700 hover:bg-orange-50 h-10 px-6 rounded-md font-bold shadow-sm transition-all"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>

                {showReportButtons && (
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onExport}
                            className='h-10 w-auto rounded-md border-green-200 bg-white px-6 text-xs font-bold text-green-700 shadow-sm hover:bg-green-50 hover:text-green-800'
                        >
                            <FileDown className='mr-1.5 h-4 w-4' />
                            Export Excel
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={onPrint}
                            className='h-10 w-auto rounded-md border-blue-200 bg-white px-6 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-50 hover:text-blue-800'
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
