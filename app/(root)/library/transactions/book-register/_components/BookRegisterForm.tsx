'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBookRegister, useBookRegisterInitialData } from '@/hooks/library/useBookRegister';
import { bookRegisterSchema } from '@/schemas/library/bookRegister';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import TabAuthorDetails from './TabAuthorDetails';
import TabBookDetails from './TabBookDetails';
import TabPurchaseDetails from './TabPurchaseDetails';

export default function BookRegisterForm({ initialData, onSuccess }: { initialData?: BookRegisterPayload; onSuccess: () => void }) {
    const { saveMutation } = useBookRegister();
    const { data: dropdownData, isLoading: isLoadingDropdowns } = useBookRegisterInitialData();
    const [activeTab, setActiveTab] = useState('bookDetails');

    const form = useForm<BookRegisterPayload>({
        resolver: zodResolver(bookRegisterSchema.addOrUpdate),
        defaultValues: initialData || {
            lmB_BookTitle: '',
            lmB_BookType: '',
            lmB_EntryDate: new Date(),
            purchase_Date: new Date(),
            lmbanO_AvialableStatus: 'Available',
            with_Accessories: false,
            accessionList: [{ lmbanO_No: '' }],
            attachementList: [{ lmbA_FileName: '', lmbA_FilePath: '' }]
        }
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

    const onSubmit = (data: BookRegisterPayload) => {
        saveMutation.mutate(data, {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success(res.message);
                    onSuccess();
                } else {
                    toast.error(res.message);
                }
            }
        });
    };

    const handleNext = () => {
        if (activeTab === 'bookDetails') setActiveTab('purchaseDetails');
        else if (activeTab === 'purchaseDetails') setActiveTab('authorDetails');
    };

    const handlePrevious = () => {
        if (activeTab === 'purchaseDetails') setActiveTab('bookDetails');
        else if (activeTab === 'authorDetails') setActiveTab('purchaseDetails');
    };

    const handleClear = () => {
        form.reset();
    };

    if (isLoadingDropdowns) {
        return (
            <div className='flex justify-center p-4'>
                <Loader2 className='h-6 w-6 animate-spin' />
            </div>
        );
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className='grid w-full grid-cols-3'>
                        <TabsTrigger value='bookDetails'>Books,Category Details</TabsTrigger>
                        <TabsTrigger value='purchaseDetails'>purchase,Language Details</TabsTrigger>
                        <TabsTrigger value='authorDetails'>Author,Accessories Details</TabsTrigger>
                    </TabsList>

                    <div className='mt-2 min-h-[300px] rounded-md border p-4'>
                        <TabsContent value='bookDetails'>
                            <TabBookDetails
                                dropdownData={dropdownData}
                                onNext={handleNext}
                                onCancel={() => onSuccess()}
                                onClear={handleClear}
                            />
                        </TabsContent>
                        <TabsContent value='purchaseDetails'>
                            <TabPurchaseDetails
                                dropdownData={dropdownData}
                                onNext={handleNext}
                                onPrevious={handlePrevious}
                                onCancel={() => onSuccess()}
                                onClear={handleClear}
                            />
                        </TabsContent>
                        <TabsContent value='authorDetails'>
                            <TabAuthorDetails
                                dropdownData={dropdownData}
                                onSave={form.handleSubmit(onSubmit)}
                                onPrevious={handlePrevious}
                                onCancel={() => onSuccess()}
                                onClear={handleClear}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </form>
        </FormProvider>
    );
}
