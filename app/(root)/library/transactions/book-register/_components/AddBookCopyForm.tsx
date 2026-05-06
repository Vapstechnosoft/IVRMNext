'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/extension/field';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { saveBookRegister } from '@/server/library/masters/bookRegister';
import { useBookRegister } from '@/hooks/library/useBookRegister';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';

const addCopySchema = z.object({
    noOfCopies: z.coerce.number().min(1, 'Minimum 1 copy required').max(100, 'Maximum 100 copies allowed'),
    accessions: z.array(z.object({
        lmbanO_No: z.string().min(1, 'Accession number is required')
    }))
});

type AddCopyFields = z.infer<typeof addCopySchema>;

export default function AddBookCopyForm({ 
    isOpen, 
    onClose, 
    bookData,
    onSuccess 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    bookData: BookRegisterPayload | null;
    onSuccess: () => void;
}) {
    const { refetchAll } = useBookRegister();
    const [numCopies, setNumCopies] = useState<number>(1);
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
        watch
    } = useForm<AddCopyFields>({
        resolver: zodResolver(addCopySchema),
        defaultValues: {
            noOfCopies: 1,
            accessions: [{ lmbanO_No: '' }]
        }
    });

    const accessions = watch('accessions');

    const handleGenerateRows = () => {
        const count = watch('noOfCopies');
        const newAccessions = Array.from({ length: count }, () => ({ lmbanO_No: '' }));
        setValue('accessions', newAccessions);
    };

    const onSubmit = async (data: AddCopyFields) => {
        if (!bookData) return;

        try {
            // Prepare payload: same as edit but with only the new accessions
            // Note: In some VAPS backends, sending an existing lmB_Id with a list of accessions 
            // will ADD those accessions to the book.
            const payload: BookRegisterPayload = {
                ...bookData,
                accessionList: data.accessions.map(a => ({
                    lmbanO_No: a.lmbanO_No,
                    lmbanO_AvialableStatus: 'Available'
                }))
            };

            const response = await saveBookRegister(payload);
            if (response.success) {
                toast.success('Book copies added successfully');
                reset();
                onSuccess();
                refetchAll();
                onClose();
            } else {
                toast.error(response.message || 'Failed to add copies');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='text-sm font-bold uppercase text-primary'>
                        ADD NEW BOOK COPY FOR THE BOOK: {bookData?.lmB_BookTitle}
                    </DialogTitle>
                </DialogHeader>

                <div className='py-4 space-y-6'>
                    <div className='flex items-center gap-4 bg-gray-50 p-4 rounded-lg'>
                        <div className='flex-1 flex flex-col gap-1.5'>
                            <Label className='text-xs font-semibold'>No. Of Copies: <span className='text-red-500'>*</span></Label>
                            <InputText 
                                {...register('noOfCopies')} 
                                type='number' 
                                className='bg-white'
                                error={errors.noOfCopies?.message}
                            />
                        </div>
                        <Button 
                            type='button' 
                            onClick={handleGenerateRows}
                            className='mt-5 bg-orange-500 hover:bg-orange-600'
                        >
                            OK
                        </Button>
                    </div>

                    <div className='border rounded-md'>
                        <Table>
                            <TableHeader className='bg-blue-600 hover:bg-blue-600'>
                                <TableRow className='hover:bg-transparent border-none'>
                                    <TableHead className='text-white font-bold w-20'>SL No</TableHead>
                                    <TableHead className='text-white font-bold'>Accession No</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accessions.map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='font-medium'>{index + 1}</TableCell>
                                        <TableCell>
                                            <InputText 
                                                {...register(`accessions.${index}.lmbanO_No` as const)}
                                                placeholder='Enter Accession No'
                                                error={errors.accessions?.[index]?.lmbanO_No?.message}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <DialogFooter className='flex justify-center gap-4 pt-4 border-t'>
                    <Button 
                        type='button' 
                        onClick={handleSubmit(onSubmit)}
                        className='bg-blue-700 hover:bg-blue-800 min-w-[100px] uppercase font-bold'
                    >
                        Save
                    </Button>
                    <Button 
                        variant='outline' 
                        onClick={onClose}
                        className='border-gray-400 text-gray-700 hover:bg-gray-100 min-w-[100px] uppercase font-bold'
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
