'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBookRegisterReportInitialData } from '@/hooks/library/reports/useBookRegisterReport';
import type { IBookRegisterReportRequest } from '@/types/library/reports/book-register-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    Type: z.enum(['all', 'Issue', 'Reference']),
    LMD_Id: z.preprocess((val) => Number(val), z.number().min(0, 'Department is required'))
});

interface ReportFormProps {
    onSearch: (data: IBookRegisterReportRequest) => void;
    isLoading: boolean;
}

export const ReportForm = ({ onSearch, isLoading }: ReportFormProps) => {
    const { data: initialDataWrapper, isLoading: isInitialLoading } = useBookRegisterReportInitialData();
    const initialData = (initialDataWrapper as any)?.data || initialDataWrapper;

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Type: 'all'
        }
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSearch(values);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-5xl space-y-6 p-8 bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400'>
            
            <div className='flex justify-center mb-6'>
                <div className='w-full max-w-2xl space-y-6'>
                    
                    {/* Book Type Radio */}
                    <div className='w-full'>
                        <Label className='font-semibold text-[#4251b1] block mb-4'>BOOK TYPE :-</Label>
                        <Controller
                            control={control}
                            name='Type'
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className='flex flex-row items-center justify-center gap-12 mt-2'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='all' id='r-all' />
                                        <Label htmlFor='r-all' className='cursor-pointer font-normal'>ALL</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Issue' id='r-issue' />
                                        <Label htmlFor='r-issue' className='cursor-pointer font-normal'>Issue</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Reference' id='r-reference' />
                                        <Label htmlFor='r-reference' className='cursor-pointer font-normal'>Reference</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                        {errors.Type && <p className='text-xs text-destructive mt-1 text-center'>{errors.Type.message}</p>}
                    </div>

                    <hr className='border-muted-foreground/20' />

                    {/* Department */}
                    <div className='flex items-center gap-4 mt-6'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            Department:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='LMD_Id'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0'>ALL</SelectItem>
                                            {(Array.isArray(initialData?.deptlist)
                                                ? initialData.deptlist
                                                : (initialData?.deptlist as any)?.$values || []
                                            ).map((item: any) => (
                                                <SelectItem key={item.lmD_Id} value={item.lmD_Id.toString()}>
                                                    {item.lmD_DepartmentName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.LMD_Id && <p className='text-xs text-destructive mt-1'>{errors.LMD_Id.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <hr className='my-6 border-muted-foreground/20' />

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
