'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IPurchaseDonateReportRequest } from '@/types/library/reports/purchase-donate-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X, Printer, FileSpreadsheet, LayoutGrid } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const reportFormSchema = z.object({
    book_Flag: z.enum(['Purchased', 'Donated']),
    LMB_BookType: z.string().min(1, 'Book Category is required')
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IPurchaseDonateReportRequest) => void;
    isLoading: boolean;
    onPrint: () => void;
    onExport: () => void;
    onCancel: () => void;
    hasData: boolean;
}

export const ReportForm = ({ onSearch, isLoading, onPrint, onExport, onCancel, hasData }: ReportFormProps) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            book_Flag: 'Purchased',
            LMB_BookType: ''
        }
    });

    const onSubmit = (data: ReportFormValues) => {
        onSearch({
            mI_Id: 30,
            circ_Flag: data.LMB_BookType,   // "Book" or "Non-Book"
            lbcpA_Flg: data.book_Flag       // "Purchased" or "Donated"
        });
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className='mx-auto max-w-2xl space-y-8 p-10 bg-white rounded-[20px] shadow-lg border border-slate-100'
        >
            {/* Purchase / Donate Type - Matches Screenshot */}
            <div className='flex items-center justify-center gap-12'>
                <Controller
                    control={control}
                    name='book_Flag'
                    render={({ field }) => (
                        <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className='flex items-center gap-12'
                        >
                            <div className='flex items-center space-x-3'>
                                <RadioGroupItem value='Purchased' id='r-purchased' className="w-5 h-5 border-[#3f51b5] text-[#3f51b5]" />
                                <Label htmlFor='r-purchased' className='font-bold cursor-pointer text-xs text-[#3f51b5] uppercase tracking-wide'>
                                    Purchase
                                </Label>
                            </div>
                            <div className='flex items-center space-x-3'>
                                <RadioGroupItem value='Donated' id='r-donated' className="w-5 h-5 border-[#3f51b5] text-[#3f51b5]" />
                                <Label htmlFor='r-donated' className='font-bold cursor-pointer text-xs text-[#3f51b5] uppercase tracking-wide'>
                                    Donate
                                </Label>
                            </div>
                        </RadioGroup>
                    )}
                />
            </div>

            {/* Book Category - Row */}
            <div className='flex justify-center items-center gap-4'>
                <Label className='min-w-[120px] text-right font-bold text-[13px] text-[#3f51b5]'>
                    Book Category: <span className='text-red-500'>*</span>
                </Label>
                <div className='w-full max-w-sm'>
                    <Controller
                        control={control}
                        name='LMB_BookType'
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className='w-full border-slate-300 h-10 rounded-full px-4 text-sm'>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Book'>Book</SelectItem>
                                    <SelectItem value='Non-Book'>Non-Book</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.LMB_BookType && (
                        <p className='text-xs text-red-500 mt-1 ml-4'>{errors.LMB_BookType.message}</p>
                    )}
                </div>
            </div>

            {/* Action Buttons - Matches Screenshot style */}
            <div className='flex flex-row flex-wrap items-center justify-center gap-4 pt-4'>
                <Button
                    type='submit'
                    className='w-fit min-w-[140px] h-10 px-6 text-xs font-bold uppercase tracking-wider bg-[#3f51b5] hover:bg-[#303f9f] text-white shadow-md rounded-lg'
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <LayoutGrid className='mr-2 h-4 w-4' />}
                    REPORT
                </Button>
                
                <Button
                    type='button'
                    className='w-fit min-w-[140px] h-10 px-6 text-xs font-bold uppercase tracking-wider bg-[#ff5722] hover:bg-[#e64a19] text-white shadow-md rounded-lg'
                    onClick={() => {
                        reset();
                        onCancel();
                    }}
                    disabled={isLoading}
                >
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>

                {hasData && (
                    <>
                        <Button 
                            type='button' 
                            onClick={onPrint}
                            className='w-fit min-w-[140px] h-10 px-6 text-xs font-bold uppercase tracking-wider bg-[#3f51b5] hover:bg-[#303f9f] text-white shadow-md rounded-lg'
                        >
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>

                        <Button 
                            type='button' 
                            onClick={onExport}
                            className='w-fit min-w-[140px] h-10 px-6 text-xs font-bold uppercase tracking-wider bg-[#3f51b5] hover:bg-[#303f9f] text-white shadow-md rounded-lg'
                        >
                            <FileSpreadsheet className='mr-2 h-4 w-4' />
                            EXPORT TO EXCEL
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
};
