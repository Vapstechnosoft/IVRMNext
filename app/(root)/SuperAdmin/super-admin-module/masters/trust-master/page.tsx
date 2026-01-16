'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { ITrustMaster } from '@/types/super-admin/super-admin-module/trust-masters';
import { Plus, X } from 'lucide-react';
import AddTrustMasterForm from './_components/add-form';
import { TrustMasterColumns } from './_components/columns';

// Static Data conforming to the updated ITrustMaster interface
const staticData: ITrustMaster[] = [
    {
        mO_Id: 1,
        mO_Name: 'Vaps Trust',
        mO_OrganisationType: 'Educational',
        mO_ActiveFlag: 1,
        ivrmmcT_Name: 'BANGALORE',
        ivrmmS_Id: 17,
        ivrmmC_Id: 101,
        mO_Address1: '1, 4th Main Rd, 6th Cross, Stage 1',
        mO_Address2: 'KHB Colony',
        mO_Address3: 'Basaveshwara Nagar',
        mO_Landmark: 'VAPS',
        mO_Pincode: 590079,
        mO_FaxNo: '0',
        mO_Website: 'www.vapstech.com',
        mT_Currency: 'Rs.',
        mT_Domain_name: 'Vaps',
        mO_AboutInstitute: '',
        mO_ContactDetails: '',
        mO_Logo: '',
        createdDate: '2017-05-19T00:00:00',
        updatedDate: '2026-01-05T14:06:06.549'
    },
    {
        mO_Id: 2,
        mO_Name: 'Global Education Trust',
        mO_OrganisationType: 'Charitable',
        mO_ActiveFlag: 0,
        ivrmmcT_Name: 'MYSORE',
        ivrmmS_Id: 18,
        ivrmmC_Id: 101,
        mO_Address1: '#23, 2nd Cross',
        mO_Address2: 'Jayalakshmipuram',
        mO_Address3: '',
        mO_Landmark: 'Near Temple',
        mO_Pincode: 570012,
        mO_FaxNo: '0821-123456',
        mO_Website: 'www.globaledu.com',
        mT_Currency: 'Rs.',
        mT_Domain_name: 'GlobalEdu',
        mO_AboutInstitute: 'Dedicated to education',
        mO_ContactDetails: 'contact@globaledu.com',
        mO_Logo: '',
        createdDate: '2018-06-10T00:00:00',
        updatedDate: '2025-12-20T10:00:00'
    },
    {
        mO_Id: 3,
        mO_Name: 'City School Trust',
        mO_OrganisationType: 'Educational',
        mO_ActiveFlag: 1,
        ivrmmcT_Name: 'MUMBAI',
        ivrmmS_Id: 10,
        ivrmmC_Id: 101,
        mO_Address1: 'Plot 45, Linking Rd',
        mO_Address2: 'Bandra West',
        mO_Address3: '',
        mO_Landmark: 'Opposite Mall',
        mO_Pincode: 400050,
        mO_FaxNo: '022-987654',
        mO_Website: 'www.cityschool.com',
        mT_Currency: 'Rs.',
        mT_Domain_name: 'CitySchool',
        mO_AboutInstitute: 'Excellence in schooling',
        mO_ContactDetails: 'info@cityschool.com',
        mO_Logo: '',
        createdDate: '2019-01-15T00:00:00',
        updatedDate: '2026-01-01T09:30:00'
    },
    {
        mO_Id: 4,
        mO_Name: 'Helping Hands',
        mO_OrganisationType: 'NGO',
        mO_ActiveFlag: 1,
        ivrmmcT_Name: 'DELHI',
        ivrmmS_Id: 22,
        ivrmmC_Id: 101,
        mO_Address1: 'Sec-4, RK Puram',
        mO_Address2: 'New Delhi',
        mO_Address3: '',
        mO_Landmark: 'Near Park',
        mO_Pincode: 110022,
        mO_FaxNo: '011-234567',
        mO_Website: 'www.helpinghands.org',
        mT_Currency: 'Rs.',
        mT_Domain_name: 'HelpingHands',
        mO_AboutInstitute: 'Service to humanity',
        mO_ContactDetails: 'support@helpinghands.org',
        mO_Logo: '',
        createdDate: '2020-03-20T00:00:00',
        updatedDate: '2025-11-15T16:20:00'
    },
    {
        mO_Id: 5,
        mO_Name: 'Future Leaders Trust',
        mO_OrganisationType: 'Educational',
        mO_ActiveFlag: 0,
        ivrmmcT_Name: 'CHENNAI',
        ivrmmS_Id: 25,
        ivrmmC_Id: 101,
        mO_Address1: '12, Anna Salai',
        mO_Address2: 'Teynampet',
        mO_Address3: '',
        mO_Landmark: 'Metro Station',
        mO_Pincode: 600018,
        mO_FaxNo: '044-876543',
        mO_Website: 'www.futureleaders.com',
        mT_Currency: 'Rs.',
        mT_Domain_name: 'FutureLeaders',
        mO_AboutInstitute: 'Creating leaders',
        mO_ContactDetails: 'admin@futureleaders.com',
        mO_Logo: '',
        createdDate: '2021-08-05T00:00:00',
        updatedDate: '2025-10-30T11:45:00'
    }
];

export default function TrustMasterPage() {
    return (
        <FormProvider<ITrustMaster>>
            <TrustMasterPageContent />
        </FormProvider>
    );
}

function TrustMasterPageContent() {
    const { openAddForm } = useFormContext<ITrustMaster>();

    // Simulate API loading state for now since we are on static data
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
                        Add Master Trust
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Trust Details'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                >
                    <GenericDataTable<ITrustMaster>
                        data={staticData}
                        columns={TrustMasterColumns}
                        isLoading={isLoading}
                        error={error}
                        totalItems={staticData.length}
                        loadingMessage='Loading trust details...'
                        noDataTitle='No Trust Details Found'
                        noDataDescription='No trust details available currently.'
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
    } = useFormContext<ITrustMaster>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Trust'
                        description='Fill in the details below to create a new trust'
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
                            <AddTrustMasterForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
