'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usePreAdmissionAcademicYear, usePreAdmissionAcademicYearSetOrder } from '@/hooks/admission/preadmission/useConfigurations';
import type { IMasterAcademicYearMasterList, IMasterSetOrderList } from '@/types/admission/preadmission/configaration';
import { Plus, X } from 'lucide-react';
import { use, useEffect } from 'react';
import AddAcademicYearMasterForm from './_components/add-form';
import { masterAcademicYearColumns } from './_components/columns';
import UpdateMasterAcademicYearForm from './_components/update-form';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import TogglePreAdmissionAcademicYearForm from './_components/toggle-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterAcademicYearPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);

    const {
        data: academicYearResponse,
        isLoading: isLoadingAcademicYear,
        error: academicYearError
    } = usePreAdmissionAcademicYear(searchParams);

    const { data: orderResponse, isLoading: isLoadingOrder, error: orderError } = usePreAdmissionAcademicYearSetOrder();

    return (
        <FormProvider<IMasterAcademicYearMasterList>>
            <MasterAcademicYearPageContent
                response={academicYearResponse}
                orderResponse={orderResponse}
                isLoading={isLoadingAcademicYear || isLoadingOrder}
                error={academicYearError || orderError}
            />
        </FormProvider>
    );
}

function MasterAcademicYearPageContent({
    response,
    orderResponse,
    isLoading,
    error
}: {
    response: any;
    orderResponse: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterAcademicYearMasterList>();
    const tableProps = useDataTableProps(response);

    const [openOrderModal, setOpenOrderModal] = useState(false);
    const [orderedItems, setOrderedItems] = useState<IMasterSetOrderList[]>(orderResponse?.data ?? []);

    // Keep the list in sync when the API data changes
    useEffect(() => {
        if (orderResponse?.data) setOrderedItems(orderResponse.data);
    }, [orderResponse?.data]);

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
                        Add Academic Year Master
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='mb-4 flex justify-end'>
                        <Dialog open={openOrderModal} onOpenChange={setOpenOrderModal}>
                            <DialogTrigger asChild>
                                <Button type='button' variant='secondary' className='w-fit transition-all duration-200 hover:scale-105'>
                                    Set Order
                                </Button>
                            </DialogTrigger>

                            <DialogContent className='max-w-2xl'>
                                <DialogHeader>
                                    <DialogTitle>Academic Year Order</DialogTitle>
                                    <DialogDescription>Current order of academic years</DialogDescription>
                                </DialogHeader>

                                <div className='my-6 max-h-96 space-y-3 overflow-y-auto'>
                                    {orderedItems.map((item, index) => (
                                        <div key={item.asmaY_Order} className='flex items-center gap-3 rounded-md bg-muted/50 p-3'>
                                            <span className='min-w-[2rem] font-semibold text-muted-foreground'>{index + 1}.</span>
                                            <span className='font-medium'>{item.asmaY_Year}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className='flex justify-end'>
                                    <Button variant='outline' onClick={() => setOpenOrderModal(false)}>
                                        Close
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <GenericDataTable<IMasterAcademicYearMasterList>
                        {...tableProps}
                        columns={masterAcademicYearColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading master Academic Year...'
                        noDataTitle='No Master Academic Year Found'
                        noDataDescription='Get started by creating your first Academic Year Master'
                        errorTitle='Error Loading Academic Year Master'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const {
        isAddFormOpen,
        isToggleFormOpen,
        isEditFormOpen,
        closeToggleForm,
        selectedRow,
        closeAddForm,
        closeEditForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterAcademicYearMasterList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Academic Year Master'
                        description='Fill in the details below to create a new Academic Year Master'
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
                            <AddAcademicYearMasterForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Academic Year Master'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <UpdateMasterAcademicYearForm selectedRow={selectedRow as any} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <TogglePreAdmissionAcademicYearForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
