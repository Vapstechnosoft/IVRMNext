'use client';

import { masterClassSchema } from '@/schemas/fees/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AddMasterClassForm from './_components/add-form';

export default function MasterClassYearlyPage() {
    const methods = useForm({
        resolver: zodResolver(masterClassSchema.addOrUpdate),
        mode: 'onSubmit',
        defaultValues: {
            academicYear: '',
            classCategory: '',
            classes: []
        }
    });

    const onSubmit = async (data: any) => {
        toast.info(`Submitting: ${JSON.stringify(data, null, 2)}`);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className='p-4'>
                <AddMasterClassForm />
            </form>
        </FormProvider>
    );
}
