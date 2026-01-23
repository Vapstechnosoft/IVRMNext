'use client';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { CalendarYear } from '@/components/ui/calendar_year';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { z } from 'zod';
import PFChallan from './_components/columns';

type FormFields = z.infer<typeof PFform6aSchema>;

const tableProps = {
    records: [
        {
            serialNo: 1,
            accountNo: 'MH/56789/123',
            memberName: 'RAHUL KUMAR SHARMA',
            wagesDAFoodConcession: 50000,
            workerContribution: 6000,
            epfDiff: 833,
            pensionFund8_33: 4165,
            refundAdvance: 0,
            higherVoluntaryContribution: 0,
            remarks: ''
        }
    ],
    establishmentName: 'Vidya Vikasa Vidya Samsthe (R)',
    establishmentCode: 'PF',
    establishmentAddress: 'Basaveshwara Talkies rd, Gayatri circle, karantaka, 577501'
};
export const PFform6aSchema = z
    .object({
        fromDate: z.string().min(1, 'From Date is required'),
        toDate: z.string().min(1, 'To Date is required')
    })
    .refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
        message: 'From Date cannot be greater than To Date',
        path: ['toDate']
    });
export default function DepartmentSalaryReportPage() {
    const [isSearching, setIsSearching] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(PFform6aSchema),
        defaultValues: {
            fromDate: '',
            toDate: ''
        },
        mode: 'onChange'
    });

    const fromDate = watch('fromDate');
    const toDate = watch('toDate');

    const onSearch = async (data: FormFields) => {
        setIsSearching(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (data.fromDate) {
                const fromDateObj = new Date(data.fromDate);
            }

            setReportData(tableProps);

            toast.success('Report generated successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        reset({
            fromDate: '',
            toDate: ''
        });
        setReportData(null);
        toast.info('Form has been reset');
    };
    const handleCancel = () => {
        setReportData(null);
    };
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='min-h-screen p-8'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='PF Form6A'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='space-y-6'>
                        <div className='flex justify-center'>
                            <div className='flex justify-center gap-2 '>
                                <div>
                                    <Label className='font-medium text-sm text-white-900'>
                                        From Date<span className='text-red-600'>*</span>
                                    </Label>

                                    <Controller
                                        name='fromDate'
                                        control={control}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type='button'
                                                        variant='outline'
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'From date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <CalendarYear
                                                        mode='single'
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date: Date | undefined) => field.onChange(date?.toISOString() ?? '')}
                                                        captionLayout='dropdown'
                                                        fromYear={2000}
                                                        toYear={2050}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                    {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                                </div>
                                <div>
                                    <Label className='font-medium text-sm text-white-900'>
                                        To Date<span className='text-red-600'>*</span>
                                    </Label>
                                    <Controller
                                        name='toDate'
                                        control={control}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type='button'
                                                        variant='outline'
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'To date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <CalendarYear
                                                        mode='single'
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date: Date | undefined) => field.onChange(date?.toISOString() ?? '')}
                                                        captionLayout='dropdown'
                                                        fromYear={2000}
                                                        toYear={2050}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                    {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-center'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={isSearching || isSubmitting}
                                className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                Reset
                            </Button>
                            <Button
                                type='submit'
                                onClick={handleSubmit(onSearch)}
                                disabled={isSearching || isSubmitting}
                                className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                {isSearching ? (
                                    <>
                                        <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                        Searching...
                                    </>
                                ) : (
                                    <div className='flex items-center'>
                                        <Search className='mr-2 h-4 w-4' />
                                        Search
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* FIXED: Changed from isSearching to reportData */}
                {reportData && fromDate && toDate && (
                    <CollapsibleSection
                        title='PF Form6A'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <PFChallan
                            records={reportData.records || []}
                            establishmentName={reportData.establishmentName}
                            establishmentCode={reportData.establishmentCode}
                            establishmentAddress={reportData.establishmentAddress}
                            financialYear={(() => {
                                const fromYear = new Date(fromDate).getFullYear();
                                const toYear = new Date(toDate).getFullYear();
                                return `${fromYear}-${toYear}`;
                            })()}
                            periodFrom={format(new Date(fromDate), 'dd MMMM, yyyy')}
                            periodTo={format(new Date(toDate), 'dd MMMM, yyyy')}
                            onCancel={handleCancel}
                            onPrint={handlePrint}
                            isLoading={false}
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
