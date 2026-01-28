'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { getMasterModules } from '@/server/super-admin/super-admin-module/general-setting/module';
import type { IMasterModule } from '@/types/super-admin/super-admin-module/general-setting/module';
import { Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AddMasterModuleForm from './_components/add-form';
import { columns } from './_components/columns';

export default function MasterModulePage() {
    return (
        <FormProvider<IMasterModule>>
            <MasterModulePageContent />
        </FormProvider>
    );
}

function MasterModulePageContent() {
    const { openAddForm } = useFormContext<IMasterModule>();
    const [data, setData] = useState<IMasterModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getMasterModules().then(res => {
            if (res.success) {
                setData(res.data || []);
            }
            setIsLoading(false);
        });
    }, []);

    const refreshData = () => {
        setIsLoading(true);
        getMasterModules().then(res => {
            if (res.success) {
                setData(res.data || []);
            }
            setIsLoading(false);
        });
    };

    return (
        <div className='container space-y-4 p-1'>
            {/* Header with Add Button */}
            <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                <Button
                    type='button'
                    onClick={openAddForm}
                    className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Master Module
                </Button>
            </div>

            <CollapsibleSection
                title='Master Modules'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg'
            >
                <div className='p-4'>
                    <GenericDataTable
                        data={data}
                        columns={columns}
                        isLoading={isLoading}
                    />
                </div>
            </CollapsibleSection>

            <FormSections onRefresh={refreshData} />
        </div>
    );
}

function FormSections({ onRefresh }: { onRefresh: () => void }) {
    const { isAddFormOpen, closeAddForm } = useFormContext<IMasterModule>();

    const handleSuccess = () => {
        closeAddForm();
        onRefresh();
    };

    return (
        <>
            {isAddFormOpen && (
                <CollapsibleSection
                    title='Add Master Module'
                    defaultOpen={true}
                    variant='outline'
                    size='lg'
                    className='shadow-lg animate-in slide-in-from-top-2'
                >
                    <div className='relative'>
                        <Button
                            type='button'
                            onClick={closeAddForm}
                            variant='ghost'
                            size='sm'
                            className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='h-4 w-4 text-destructive' /> Close
                        </Button>
                        <AddMasterModuleForm onSuccess={handleSuccess} />
                    </div>
                </CollapsibleSection>
            )}
        </>
    );
}
