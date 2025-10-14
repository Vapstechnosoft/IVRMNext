'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import AddStudentApplicationForm from './_components/add-form';
import ApplicationFormSuccessDialog from './_components/success-dialog';

export default function StudentApplicationPage() {
    return (
        <FormProvider>
            <StudentApplicationPageContent />
        </FormProvider>
    );
}

function StudentApplicationPageContent() {
    const { openAddForm } = useFormContext();
    const [isSuccessOpen, setSuccessOpen] = useState(false);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Preadmission Application
                    </Button>
                </div>
                <ApplicationFormSuccessDialog isOpen={isSuccessOpen} onClose={() => setSuccessOpen(false)} />

                {/* Forms */}
                <FormSections setSuccessOpen={() => setSuccessOpen(true)} />
            </div>
        </div>
    );
}

function FormSections({ setSuccessOpen }: { setSuccessOpen: () => void }) {
    const { isAddFormOpen, closeAddForm, addFormRef } = useFormContext();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Preadmission Application'
                        description='Fill in the details below to create a new preadmission application'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <AddStudentApplicationForm
                                onSuccess={() => {
                                    closeAddForm();
                                    setSuccessOpen();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
