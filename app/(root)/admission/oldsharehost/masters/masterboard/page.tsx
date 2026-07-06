'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { getMasterBoardData, deleteMasterBoard } from '@/server/admission/oldsharedhost/masters/master-board';
import { IMasterBoard } from '@/types/admission/oldsharedhost/masters/master-board';
import { Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddMasterBoardForm from './_components/add-form';
import { columns } from './_components/columns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from '@/components/ui/spinner';

export default function MasterBoardPage() {
    return (
        <FormProvider<IMasterBoard>>
            <MasterBoardPageContent />
        </FormProvider>
    );
}

function MasterBoardPageContent() {
    const { openAddForm, isAddFormOpen } = useFormContext<IMasterBoard>();
    const [data, setData] = useState<IMasterBoard[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = () => {
        setIsLoading(true);
        getMasterBoardData().then(res => {
            if (res.success) {
                if (res.data && Array.isArray(res.data.boardList)) {
                    setData(res.data.boardList);
                } else if (Array.isArray(res.data)) {
                    setData(res.data);
                } else {
                    setData([]);
                }
            } else {
                setData([]);
            }
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refreshData = () => {
        fetchData();
    };

    return (
        <div className='container space-y-4 p-1'>
            {/* Header with Add Button - Only show if form is NOT open */}
            {!isAddFormOpen && (
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Master Board
                    </Button>
                </div>
            )}

            <FormSections onRefresh={refreshData} />

            <CollapsibleSection
                title='Master Board List'
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
                        totalItems={data.length}
                    />
                </div>
            </CollapsibleSection>
        </div>
    );
}

function FormSections({ onRefresh }: { onRefresh: () => void }) {
    const {
        isAddFormOpen,
        isDeleteFormOpen,
        selectedRow,
        closeAddForm,
        closeDeleteForm,
        addFormRef
    } = useFormContext<IMasterBoard>();

    const [isDeleting, setIsDeleting] = useState(false);

    const handleSuccess = () => {
        closeAddForm();
        onRefresh();
    };

    const handleDelete = async () => {
        if (!selectedRow) return;
        setIsDeleting(true);
        try {
            const res = await deleteMasterBoard(selectedRow.ivrmmB_Id);
            if (res.success || res.returnval === true || res.returnval === "true") {
                toast.success(res.message || 'Record deleted successfully');
                closeDeleteForm();
                onRefresh();
            } else if (res.returnval === "mapped") {
                toast.error(res.message || "Sorry.....You can not delete this record. Because it is mapped to student");
                closeDeleteForm();
            } else {
                toast.error(res.message || 'Failed to delete record');
                closeDeleteForm();
            }
        } catch (error) {
            toast.error('An error occurred while deleting.');
            closeDeleteForm();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title={selectedRow ? 'Edit Master Board' : 'Add Master Board'}
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
                            <AddMasterBoardForm onSuccess={handleSuccess} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            <AlertDialog open={isDeleteFormOpen} onOpenChange={closeDeleteForm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Do you want to delete record?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting ? <Spinner className="mr-2 h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
                            Yes, delete it!
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
