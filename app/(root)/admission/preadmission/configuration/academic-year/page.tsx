'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usePreAdmissionAcademicYear, usePreAdmissionAcademicYearSetOrder } from '@/hooks/admission/preadmission/useConfigurations';
import type { IMasterAcademicYearMasterList, IMasterSetOrderList } from '@/types/admission/preadmission/configaration';
import { GripVertical, Plus, Save, X } from 'lucide-react';
import { use, useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import AddAcademicYearMasterForm from './_components/add-form';
import { masterAcademicYearColumns } from './_components/columns';
import TogglePreAdmissionAcademicYearForm from './_components/toggle-form';
import UpdateMasterAcademicYearForm from './_components/update-form';

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
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Keep the list in sync when the API data changes
    useEffect(() => {
        if (orderResponse?.data) {
            setOrderedItems(orderResponse.data);
            setHasChanges(false);
        }
    }, [orderResponse?.data]);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === index) return;

        const newItems = [...orderedItems];
        const draggedItem = newItems[draggedIndex];
        newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);

        setOrderedItems(newItems);
        setDraggedIndex(index);
        setHasChanges(true);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSaveOrder = async () => {
        setHasChanges(false);
        toast.success('Academic year order has been saved successfully.');

        setOpenOrderModal(false);
    };

    const handleCancel = () => {
        if (orderResponse?.data) {
            setOrderedItems(orderResponse.data);
            setHasChanges(false);
        }
        setOpenOrderModal(false);
    };

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
                        Add Master Academic Year
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
                                    <DialogDescription>Drag and drop to reorder academic years</DialogDescription>
                                </DialogHeader>

                                <div className='my-6 max-h-96 space-y-3 overflow-y-auto'>
                                    {orderedItems.map((item, index) => (
                                        <div
                                            key={item.asmaY_Order}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`flex cursor-move items-center gap-3 rounded-md bg-muted/50 p-3 transition-all ${
                                                draggedIndex === index ? 'opacity-50' : 'hover:bg-muted'
                                            }`}>
                                            <GripVertical className='h-5 w-5 text-muted-foreground' />
                                            <span className='min-w-[2rem] font-semibold text-muted-foreground'>{index + 1}.</span>
                                            <span className='font-medium'>{item.asmaY_Year}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className='flex justify-end gap-2'>
                                    <Button variant='outline' onClick={handleCancel} className='w-fit'>
                                        Cancel
                                    </Button>
                                    {hasChanges && (
                                        <Button onClick={handleSaveOrder} className='w-fit gap-2'>
                                            <Save className='h-4 w-4' />
                                            Save Order
                                        </Button>
                                    )}
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
                        noDataDescription='Get started by creating your first Master Academic Year'
                        errorTitle='Error Loading Master Academic Year'
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
                        title='Add New Master Academic Year'
                        description='Fill in the details below to create a new Master Academic Year'
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
                        title='Edit Master Academic Year'
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
