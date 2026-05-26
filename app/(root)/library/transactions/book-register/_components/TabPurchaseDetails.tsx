'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';

export default function TabPurchaseDetails({
    dropdownData,
    onNext,
    onPrevious,
    onCancel,
    onClear
}: {
    dropdownData: any;
    onNext: () => void;
    onPrevious: () => void;
    onCancel: () => void;
    onClear: () => void;
}) {
    const {
        control,
        register,
        watch,
        formState: { errors }
    } = useFormContext<BookRegisterPayload>();
    const purchaseType = watch('lmB_PurOrDonated');

    return (
        <div className='flex flex-col gap-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Purchase Date <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='purchase_Date'
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                        {field.value ? format(new Date(field.value), 'dd-MM-yyyy') : <span>Pick a date</span>}
                                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar
                                        mode='single'
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={field.onChange}
                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.purchase_Date && <FormError>{errors.purchase_Date.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Purchased/Donated/Specimen <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lmB_PurOrDonated'
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Purchased'>Purchased</SelectItem>
                                    <SelectItem value='Donated'>Donated</SelectItem>
                                    <SelectItem value='Specimen'>Specimen</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lmB_PurOrDonated && <FormError>{errors.lmB_PurOrDonated.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Language <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lmL_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdownData?.langlist?.map((item: any) => (
                                        <SelectItem key={item.lmL_Id} value={item.lmL_Id.toString()}>
                                            {item.lmL_LanguageName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lmL_Id && <FormError>{errors.lmL_Id.message}</FormError>}
                </div>

                <InputText label='Voucher No' {...register('voucher_No')} placeholder='Enter Voucher No.' />

                <div className='flex flex-col gap-1.5'>
                    <Label>Vendor</Label>
                    <Controller
                        control={control}
                        name='lmV_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdownData?.vendorList?.map((item: any) => (
                                        <SelectItem key={item.lmV_Id} value={item.lmV_Id.toString()}>
                                            {item.lmV_VendorName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <InputText label='Bill No' {...register('lmB_BillNo')} placeholder='Enter Bill No.' />

                {purchaseType === 'Donated' && (
                    <>
                        <InputText label='Donor Name' {...register('donor_Id')} />
                        <InputText label='Donor Address' {...register('lmB_DonorAddress')} />
                    </>
                )}

                <div className='flex flex-col gap-1.5'>
                    <Label>Keywords</Label>
                    <textarea
                        {...register('mB_Keywords')}
                        placeholder='Enter the Keywords'
                        className='min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                    />
                </div>

                <InputText label='Currency Type' {...register('currencyType')} placeholder='Enter Currency Type' />
            </div>

            {/* PUBLISHER DETAILS Section */}
            <div className='mt-4'>
                <h3 className='mb-4 border-b pb-2 font-bold text-blue-800 uppercase tracking-wide'>Publisher Details</h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='flex flex-col gap-1.5'>
                        <Label>Publisher</Label>
                        <Controller
                            control={control}
                            name='lmP_Id'
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dropdownData?.publisherList?.map((item: any) => (
                                            <SelectItem key={item.lmP_Id} value={item.lmP_Id.toString()}>
                                                {item.lmP_PublisherName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>Remarks</Label>
                        <textarea
                            {...register('mB_Remarks')}
                            placeholder='Enter the Remarks'
                            className='min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        />
                    </div>

                    <InputText label='Bibliography Page' {...register('bibliography_Page')} placeholder='Enter the Bibliography Page' />
                    <InputText label='Index Page' {...register('index_Page')} placeholder='Enter the Index Page' />
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 border-t pt-4'>
                <Button
                    type='button'
                    variant='default'
                    onClick={onPrevious}
                    className='bg-blue-600 px-6 font-bold text-xs uppercase hover:bg-blue-700'>
                    Previous
                </Button>
                <Button
                    type='button'
                    variant='destructive'
                    onClick={onClear}
                    className='bg-red-500 px-6 font-bold text-xs uppercase hover:bg-red-600'>
                    Clear
                </Button>
                <Button
                    type='button'
                    variant='warning'
                    onClick={onCancel}
                    className='bg-orange-500 px-6 font-bold text-xs uppercase hover:bg-orange-600'>
                    Cancel
                </Button>
                <Button
                    type='button'
                    variant='default'
                    onClick={onNext}
                    className='bg-blue-600 px-6 font-bold text-xs uppercase hover:bg-blue-700'>
                    Save & Next
                </Button>
            </div>
        </div>
    );
}
