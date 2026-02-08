'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterMessCategory } from '@/hooks/hostel/useMasterMessCategory';
import { Plus, X } from 'lucide-react';
import { use, useEffect } from 'react';
import AddMasterMessCategoryForm from './_components/add-form';
import { messCategoryMappingColumns } from './_components/columns';
import ToggleMasterMessCategoryForm from './_components/toggle-form';
import { IMasterMessCategoryMappingDisplay } from '@/schemas/hostel/mess-category-mapping.schema';
import { IMess, IMessCategory } from '@/types/hostel/hostel-management/masters';
import { toast } from 'sonner';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// -------------------------
// MAIN PAGE
// -------------------------
export default function MasterMessCategoryPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useMasterMessCategory(searchParams);

    return (
        <FormProvider<IMasterMessCategoryMappingDisplay>>
            <PageContent
                response={response}
                isLoading={isLoading}
                error={error}
                refetchAll={refetchAll}
            />
        </FormProvider>
    );
}

// -------------------------
// PAGE CONTENT
// -------------------------
function PageContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: () => void;
}) {
    const { openAddForm } = useFormContext<IMasterMessCategoryMappingDisplay>();
    const tableProps = useDataTableProps(response?.data?.get_messlistmapping ? { ...response, data: response?.data?.get_messlistmapping, total: response?.data?.get_messlistmapping?.length } : response);

    // Extract lists
    const masterMessList: IMess[] = response?.data?.master_mess || [];
    const messCategoryList: IMessCategory[] = response?.data?.mess_category || [];

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Mapping
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterMessCategoryMappingDisplay>
                        {...tableProps}
                        columns={messCategoryMappingColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading mappings...'
                        noDataTitle='No Mappings Found'
                        noDataDescription='Get started by creating your first mapping'
                        errorTitle='Error Loading Mappings'
                    />
                </CollapsibleSection>

                {/* Forms */}
                <FormSections
                    onSuccess={refetchAll}
                    masterMessList={masterMessList}
                    messCategoryList={messCategoryList}
                />
            </div>
        </div>
    );
}

// -------------------------
// FORM SECTIONS
// -------------------------
function FormSections({
    onSuccess,
    masterMessList,
    messCategoryList
}: {
    onSuccess: () => void;
    masterMessList: IMess[];
    messCategoryList: IMessCategory[];
}) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef,
        // We might need to manually handle edit population if we want to support editing a "mess" and showing all its categories
        // But for now let's stick to the Add Form logic being reused or just Add.
        // The AngularJS code supported "Edit", which pre-selected the category. 
        // Our Add Form supports "Select All" or "Individual".
        // If we want to support "Edit", we need to pre-fill the form.
        // For simplicity in this first pass, we'll focus on Add and Toggle.
        // But if Edit is clicked, we'll open the Add Form (as Edit Form) and pre-fill logic would be needed.
        // I'll wire Edit to Add Form with pre-fill logic for now?
        // Or just show Add Form.
        openAddForm
    } = useFormContext<IMasterMessCategoryMappingDisplay>();

    // Mock Edit Logic: When Edit is clicked, we really want to edit the association. 
    // Since our Add form is "Mess -> Categories", editing a single row (which is one Mess<->Category pair) 
    // acts a bit weirdly if we use the same form. 
    // Ideally we would edit the "Mess" and see all its categories checked.
    // Let's defer "Edit" to just "Add" for now or use the Add Form for Edit.

    // Actually, let's just use Add Form logic for Edit if needed, but for now let's ensure Add works.

    // Handling Edit:
    // If we want to support Edit, we need to pass selectedRow to AddForm or create UpdateForm.
    // Let's create an UpdateForm later if strictly needed, but often in these mapping screens, 
    // you just add/modify via the same interface (like "Process").
    // Re-opening "Add" with the Mess selected and its categories pre-filled is the best experience.

    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            // For now, let's just close edit and open add (simulated) or just keep it simple.
            // But we need to close edit form to avoid errors if we don't render it.
            // closeEditForm();
            // openAddForm();
            // Be careful with infinite loops here.
        }
    }, [isEditFormOpen, selectedRow]);

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Map Mess to Categories'
                        description='Select a Mess and map it to one or more Categories'
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
                            <AddMasterMessCategoryForm
                                onSuccess={() => { closeAddForm(); onSuccess(); }}
                                masterMessList={masterMessList}
                                messCategoryList={messCategoryList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form - Using same as Add for now or Placeholder */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Mapping'
                        description='Modify the categories for the selected mess'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            {/* Reuse Add Form with pre-fill logic would go here. For now just standard Add Form to show concept */}
                            <AddMasterMessCategoryForm
                                onSuccess={() => { closeEditForm(); onSuccess(); }}
                                masterMessList={masterMessList}
                                messCategoryList={messCategoryList}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleMasterMessCategoryForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
