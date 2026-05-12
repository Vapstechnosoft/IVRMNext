'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IPurchaseDonateReportRequest } from '@/types/library/reports/purchase-donate-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
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
}

export const ReportForm = ({ onSearch, isLoading }: ReportFormProps) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            book_Flag: 'Purchased',
            LMB_BookType: 'Book'
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
            className='mx-auto max-w-3xl space-y-6 p-8 bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400'
        >
            {/* Purchase / Donate Type */}
            <div className='flex items-center gap-4'>
                <Label className='min-w-[160px] text-right font-medium text-sm'>
                    Type: <span className='text-red-500'>*</span>
                </Label>
                <div className='flex-1'>
                    <Controller
                        control={control}
                        name='book_Flag'
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className='flex items-center gap-10'
                            >
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Purchased' id='r-purchased' />
                                    <Label htmlFor='r-purchased' className='font-normal cursor-pointer text-sm'>
                                        Purchase
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Donated' id='r-donated' />
                                    <Label htmlFor='r-donated' className='font-normal cursor-pointer text-sm'>
                                        Donate
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>
            </div>

            {/* Book Category */}
            <div className='flex items-center gap-4'>
                <Label className='min-w-[160px] text-right font-medium text-sm'>
                    Book Category: <span className='text-red-500'>*</span>
                </Label>
                <div className='flex-1'>
                    <Controller
                        control={control}
                        name='LMB_BookType'
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className='w-full border-muted-foreground/30'>
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
                        <p className='text-xs text-destructive mt-1'>{errors.LMB_BookType.message}</p>
                    )}
                </div>
            </div>

            <hr className='border-muted-foreground/20' />

            {/* Action Buttons */}
            <div className='flex items-center justify-center gap-4'>
                <Button
                    type='submit'
                    className='w-auto h-8 px-8 py-1 text-xs min-w-[120px] bg-[#4251b1] hover:bg-[#35418e] text-white shadow-sm rounded-sm'
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : <Search className='mr-1.5 h-3.5 w-3.5' />}
                    REPORT
                </Button>
                <Button
                    type='button'
                    className='w-auto h-8 px-8 py-1 text-xs min-w-[120px] bg-[#ff5a30] hover:bg-[#e64d26] text-white shadow-sm rounded-sm'
                    onClick={() => reset()}
                    disabled={isLoading}
                >
                    <X className='mr-1.5 h-3.5 w-3.5' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
};
