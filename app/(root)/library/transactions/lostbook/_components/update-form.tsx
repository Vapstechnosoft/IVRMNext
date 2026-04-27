'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { useLostBookList } from '@/hooks/library/useTransactions';
import { lostBookSchema } from '@/schemas/library/transactions';
import { getAuthorNameDropdown, getBookListDropdown, saveLostBookRecord } from '@/server/library/transactions/lost-book';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ILostBookList } from '@/types/library/transactions/transactions';
import { format } from 'date-fns';
import { Loader2, Save, X } from 'lucide-react';

type FormFields = z.infer<typeof lostBookSchema.addOrUpdate>;

interface UpdateLostBookFormProps {
    selectedRow: ILostBookList;
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

export default function UpdateLostBookForm({ selectedRow, onSuccess, onCancel, className = '' }: UpdateLostBookFormProps) {
    const { refetchAll } = useLostBookList();

    const [loading, setLoading] = useState(false);
    const [bookOptions, setBookOptions] = useState<any[]>([]);
    const [authorOptions, setAuthorOptions] = useState<{ id: number; name: string }[]>([]);

    const [bookCategory, setBookCategory] = useState<'book' | 'nonbook'>('book');
    const [bookType, setBookType] = useState<'issue' | 'ref'>('issue');

    let initialDate = format(new Date(), 'yyyy-MM-dd');
    if (selectedRow?.lmbanO_LostDamagedDate) {
        try {
            initialDate = format(new Date(selectedRow.lmbanO_LostDamagedDate), 'yyyy-MM-dd');
        } catch (e) {}
    }

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(lostBookSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            LMBANO_Id: selectedRow?.lmbanO_Id?.toString() || '',
            LMBANO_AvialableStatus: (selectedRow?.lmbanO_AvialableStatus?.toLowerCase() as any) || 'lost',
            LMBANO_LostDamagedDate: initialDate,
            LMBANO_LostDamagedReason: selectedRow?.lmbanO_LostDamagedReason || '',
            LMBANO_ModeOfPayment: (selectedRow?.lmbanO_ModeOfPayment as any) || undefined,
            LMBANO_AmountCollected: selectedRow?.lmbanO_AmountCollected?.toString() || ''
        }
    });

    useEffect(() => {
        loadBookOptions();
    }, [bookCategory, bookType]);

    // Pre-select book and author on load
    useEffect(() => {
        if (selectedRow?.lmbanO_Id && bookOptions.length > 0) {
            handleBookSelect(selectedRow.lmbanO_Id);
        }
    }, [bookOptions, selectedRow]);

    const loadBookOptions = async () => {
        try {
            const response = await getBookListDropdown(bookCategory, bookType);
            if (response.success && Array.isArray(response.data)) {
                const foundMatch = response.data.find((b: any) => b.lmbanO_Id === selectedRow?.lmbanO_Id);
                let finalOptions: any[] = response.data as any[];
                // If the selected book isn't in the default set, maybe we append it just for display?
                if (!foundMatch && selectedRow?.lmbanO_Id) {
                    finalOptions = [
                        {
                            lmbanO_Id: selectedRow.lmbanO_Id,
                            lmbanO_AccessionNo: selectedRow.lmbanO_AccessionNo,
                            lmB_BookTitle: selectedRow.lmB_BookTitle
                        },
                        ...(response.data as any[])
                    ];
                }

                setBookOptions(finalOptions);
            }
        } catch (error) {
            console.error('Failed to load book options:', error);
            toast.error('Failed to load book options');
        }
    };

    const handleBookSelect = async (bookId: number) => {
        setValue('LMBANO_Id', String(bookId));

        try {
            const response = await getAuthorNameDropdown(bookId);

            if (response.success && Array.isArray(response.data)) {
                setAuthorOptions(response.data);
            }
        } catch (error) {
            toast.error('Failed to load author information');
        }
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            setLoading(true);
            const response = await saveLostBookRecord(data);

            if (response.success) {
                toast.success('Lost book record updated successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to update record');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 p-4 ${className}`}>
            <div className='space-y-4'>
                <Label htmlFor='LMBANO_Id'>
                    Book Title: <span className='text-red-500'>*</span>
                </Label>
                <Select
                    disabled
                    value={selectedRow?.lmbanO_Id?.toString()}
                    onValueChange={(value) => handleBookSelect(Number.parseInt(value))}>
                    <SelectTrigger>
                        <SelectValue placeholder={`Select ${bookCategory === 'book' ? 'book' : 'non-book'}...`} />
                    </SelectTrigger>
                    <SelectContent>
                        {bookOptions.map((book) => (
                            <SelectItem key={book.lmbanO_Id} value={book.lmbanO_Id?.toString()}>
                                {book.lmbanO_AccessionNo} :: {book.lmB_BookTitle}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.LMBANO_Id && <p className='text-red-500 text-sm'>{errors.LMBANO_Id.message}</p>}
            </div>

            <div className='space-y-4'>
                <Label htmlFor='LMBANO_LostDamagedDate'>
                    Lost Date: <span className='text-red-500'>*</span>
                </Label>
                <Input id='LMBANO_LostDamagedDate' type='date' {...register('LMBANO_LostDamagedDate')} className='w-full' />
                {errors.LMBANO_LostDamagedDate && <p className='text-red-500 text-sm'>{errors.LMBANO_LostDamagedDate.message}</p>}
            </div>

            <div className='space-y-4'>
                <Label htmlFor='LMBANO_AmountCollected'>
                    Price: <span className='text-red-500'>*</span>
                </Label>
                <Input id='LMBANO_AmountCollected' placeholder='Enter Lost/Damage Price' {...register('LMBANO_AmountCollected')} />
                {errors.LMBANO_AmountCollected && <p className='text-red-500 text-sm'>{errors.LMBANO_AmountCollected.message}</p>}
            </div>

            <div className='space-y-4'>
                <Label className='font-semibold text-lg'>
                    Mode Of Payment: <span className='text-red-500'>*</span>
                </Label>
                <RadioGroup
                    defaultValue={(selectedRow?.lmbanO_ModeOfPayment as any) || undefined}
                    onValueChange={(value) => setValue('LMBANO_ModeOfPayment', value as 'Cash' | 'Bank')}
                    className='flex space-x-6'>
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='Cash' id='edit-cash' />
                        <Label htmlFor='edit-cash'>Cash</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='Bank' id='edit-bank' />
                        <Label htmlFor='edit-bank'>Bank</Label>
                    </div>
                </RadioGroup>
                {errors.LMBANO_ModeOfPayment && <p className='text-red-500 text-sm'>{errors.LMBANO_ModeOfPayment.message}</p>}
            </div>

            <div className='space-y-4'>
                <Label htmlFor='LMBANO_LostDamagedReason'>Delete Reason:</Label>
                <Textarea
                    id='LMBANO_LostDamagedReason'
                    placeholder='Enter the Remarks'
                    {...register('LMBANO_LostDamagedReason')}
                    rows={3}
                />
                {errors.LMBANO_LostDamagedReason && <p className='text-red-500 text-sm'>{errors.LMBANO_LostDamagedReason.message}</p>}
            </div>

            <div className='space-y-4'>
                <Label className='font-semibold text-lg'>
                    Book Status: <span className='text-red-500'>*</span>
                </Label>
                <RadioGroup
                    defaultValue={(selectedRow?.lmbanO_AvialableStatus?.toLowerCase() as any) || 'lost'}
                    onValueChange={(value) => setValue('LMBANO_AvialableStatus', value as 'lost' | 'damaged')}
                    className='flex space-x-6'>
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='lost' id='edit-lost' />
                        <Label htmlFor='edit-lost'>Lost</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='damaged' id='edit-damaged' />
                        <Label htmlFor='edit-damaged'>Damaged</Label>
                    </div>
                </RadioGroup>
                {errors.LMBANO_AvialableStatus && <p className='text-red-500 text-sm'>{errors.LMBANO_AvialableStatus.message}</p>}
            </div>

            <div className='flex justify-end space-x-4 pt-6'>
                {onCancel && (
                    <Button type='button' variant='outline' onClick={onCancel} className='flex items-center gap-2'>
                        <X className='h-4 w-4' />
                        CANCEL
                    </Button>
                )}
                <Button type='submit' disabled={isSubmitting || loading} className='flex items-center gap-2'>
                    {isSubmitting || loading ? (
                        <>
                            <Loader2 className='h-4 w-4 animate-spin' /> SAVING...
                        </>
                    ) : (
                        <>
                            <Save className='h-4 w-4' /> UPDATE
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
