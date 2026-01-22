'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterInstitution } from '@/types/super-admin/super-admin-module/institution/master-institution';
import { Plus, X } from 'lucide-react';
import AddMasterInstitutionForm from './_components/add-form';
import { MasterInstitutionColumns } from './_components/columns';

// Static Data
const staticData: IMasterInstitution[] = [
    {
        mI_Id: 1,
        mO_Id: 1,
        mO_Name: 'Vaps Trust',
        mI_Name: 'Vaps Institution',
        mI_OrganisationType: 'University',
        mI_Address1: '1st Main, Bengaluru',
        mI_Address2: '2nd Cross',
        mI_Address3: 'Bengaluru',
        ivrmmcT_Name: 'Bengaluru',
        ivrmmS_Id: 17,
        ivrmmC_Id: 101,
        mI_Pincode: '560010',
        mI_ActiveFlag: 1,
        mI_FaxNo: '123456',
        mI_ContactDetails: 'Contact',
        mI_AboutInstitute: 'About',

        // Mandatory fields added for type compliance
        mI_Subdomain: 'subdomain',
        mI_Affiliation: 'University',
        mI_NAAC_InstitutionTypeFlg: 'University',
        mI_NAAC_SubInstitutionTypeFlg: 'Others',
        mI_EntityId: '123',
        mI_CreditType: 'OTP',

        createdDate: '2025-01-01',
        updatedDate: '2025-01-01'
    }
];

export default function MasterInstitutionPage() {
    return (
        <FormProvider<IMasterInstitution>>
            <MasterInstitutionPageContent />
        </FormProvider>
    );
}

function MasterInstitutionPageContent() {
    const { openAddForm } = useFormContext<IMasterInstitution>();

    // Simulate API loading state
    const isLoading = false;
    const error = null;

    return (
        <div>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Master Institution
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='List of Institutions'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                >
                    <GenericDataTable<IMasterInstitution>
                        data={staticData}
                        columns={MasterInstitutionColumns}
                        isLoading={isLoading}
                        error={error}
                        totalItems={staticData.length}
                        loadingMessage='Loading institution details...'
                        noDataTitle='No Institution Details Found'
                        noDataDescription='No institution details available currently.'
                        isSearchRequired={true}
                        isPaginationRequired={true}
                        columnPinning={{ right: ['actions'] }}
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
        closeAddForm,
        addFormRef
    } = useFormContext<IMasterInstitution>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Institution'
                        description='Fill in the details below to create a new institution'
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
                            <AddMasterInstitutionForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
