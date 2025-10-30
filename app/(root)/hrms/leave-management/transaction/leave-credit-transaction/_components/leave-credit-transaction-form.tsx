'use client';

import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCreditTransaction } from './columns';

export type LeaveCreditTransactionFormData = Record<string, unknown>;

interface LeaveCreditTransactionFormProps {
    editingLeaveCreditTransaction: LeaveCreditTransaction | null;
    onSubmit: (data: LeaveCreditTransactionFormData) => void;
    onCancel: () => void;
}

export function LeaveCreditTransactionForm({ editingLeaveCreditTransaction, onSubmit, onCancel }: LeaveCreditTransactionFormProps) {
    const { handleSubmit } = useForm<LeaveCreditTransactionFormData>({
        mode: 'onChange',
        defaultValues: (editingLeaveCreditTransaction as any) || {}
    });

    const handleFormSubmit: SubmitHandler<LeaveCreditTransactionFormData> = async (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* TODO: Add form fields */}

            <div className='flex justify-center gap-4 border-t pt-6 md:col-span-2'>
                <Button type='button' variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
                <Button type='submit' disabled={false}>
                    <div className='flex items-center'>
                        <Save className='mr-2 h-4 w-4' />
                        Save
                    </div>
                </Button>
            </div>
        </form>
    );
}
