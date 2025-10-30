'use client';

import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCreditAddition } from './columns';

export type LeaveCreditAdditionFormData = Record<string, unknown>;

interface LeaveCreditAdditionFormProps {
    editingLeaveCreditAddition: LeaveCreditAddition | null;
    onSubmit: (data: LeaveCreditAdditionFormData) => void;
    onCancel: () => void;
}

export function LeaveCreditAdditionForm({ editingLeaveCreditAddition, onSubmit, onCancel }: LeaveCreditAdditionFormProps) {
    const { handleSubmit } = useForm<LeaveCreditAdditionFormData>({
        mode: 'onChange',
        defaultValues: (editingLeaveCreditAddition as any) || {}
    });

    const handleFormSubmit: SubmitHandler<LeaveCreditAdditionFormData> = async (data) => {
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
