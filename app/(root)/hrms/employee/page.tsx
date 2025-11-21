'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { useEmployeeRegisterList } from '@/hooks/hrms/useEmployeeRegister';
import type { EmployeeListItem } from '@/types/hrms/employee';
import { Plus, Search, X } from 'lucide-react';
import { use, useMemo, useState } from 'react';
import { employeeColumns } from './_components/columns';
import EmployeeRegisterForm from './_components/employee-register-form';
import ToggleEmployeeForm from './_components/toggle-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeRegisterPage(props: {
    searchParams: SearchParams;
}) {
    // Safely unwrap searchParams - React's use() hook must be called unconditionally
    const _searchParams = use(props.searchParams);

    const { data: employeeList, isLoading, error } = useEmployeeRegisterList();

    // Transform employee list to match EmployeeListItem type - use useMemo for safety
    const transformedData: EmployeeListItem[] = useMemo(() => {
        if (!employeeList || !Array.isArray(employeeList)) {
            return [];
        }

        try {
            return employeeList
                .map((emp: any, index: number): EmployeeListItem | null => {
                    if (!emp || typeof emp !== 'object') {
                        return null;
                    }

                    return {
                        HRME_Id: emp.HRME_Id || emp.hrmE_Id || 0,
                        MI_Id: emp.MI_Id || emp.mI_Id || 0,
                        HRME_EmployeeFirstName: emp.HRME_EmployeeFirstName || emp.hrmE_EmployeeFirstName || '',
                        HRME_EmployeeMiddleName: emp.HRME_EmployeeMiddleName || emp.hrmE_EmployeeMiddleName,
                        HRME_EmployeeLastName: emp.HRME_EmployeeLastName || emp.hrmE_EmployeeLastName || '',
                        HRME_EmployeeCode: emp.HRME_EmployeeCode || emp.hrmE_EmployeeCode || '',
                        HRME_EmployeeOrder: emp.HRME_EmployeeOrder || emp.hrmE_EmployeeOrder || index + 1,
                        HRME_Photo: emp.HRME_Photo || emp.hrmE_Photo || '',
                        HRMET_EmployeeType: emp.HRMET_EmployeeType || emp.hrmET_EmployeeType || '',
                        HRMGT_EmployeeGroupType: emp.HRMGT_EmployeeGroupType || emp.hrmGT_EmployeeGroupType || '',
                        HRMD_DepartmentName: emp.HRMD_DepartmentName || emp.hrmD_DepartmentName || '',
                        HRMDES_DesignationName: emp.HRMDES_DesignationName || emp.hrmDES_DesignationName || '',
                        HRME_MobileNo: emp.HRME_MobileNo || emp.hrmE_MobileNo || 0,
                        HRME_EmailId: emp.HRME_EmailId || emp.hrmE_EmailId || '',
                        HRME_ActiveFlag: emp.HRME_ActiveFlag ?? emp.hrmE_ActiveFlag ?? true,
                        HRME_DOJ: emp.HRME_DOJ || emp.hrmE_DOJ || '',
                        HRME_DOB: emp.HRME_DOB || emp.hrmE_DOB || ''
                    };
                })
                .filter((item): item is EmployeeListItem => item !== null);
        } catch (transformError) {
            console.error('Error transforming employee list:', transformError);
            return [];
        }
    }, [employeeList]);

    return (
        <FormProvider<EmployeeListItem>>
            <EmployeeRegisterPageContent response={transformedData} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function EmployeeRegisterPageContent({
    response,
    isLoading,
    error
}: {
    response: EmployeeListItem[];
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<EmployeeListItem>();

    // Client-side search and pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return response;

        const query = searchQuery.toLowerCase();
        return response.filter((employee) => {
            const firstName = employee.HRME_EmployeeFirstName?.toLowerCase() || '';
            const middleName = employee.HRME_EmployeeMiddleName?.toLowerCase() || '';
            const lastName = employee.HRME_EmployeeLastName?.toLowerCase() || '';
            const code = employee.HRME_EmployeeCode?.toLowerCase() || '';
            const email = employee.HRME_EmailId?.toLowerCase() || '';
            const mobile = employee.HRME_MobileNo?.toString() || '';

            return (
                firstName.includes(query) ||
                middleName.includes(query) ||
                lastName.includes(query) ||
                code.includes(query) ||
                email.includes(query) ||
                mobile.includes(query)
            );
        });
    }, [response, searchQuery]);

    // Paginate filtered data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset to page 1 when search changes
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
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
                        Add Employee
                    </Button>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title="Employee's Details"
                    description='View, search, and manage all registered employees'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    {/* Search Input */}
                    <div className='mb-4'>
                        <div className='relative flex-1'>
                            <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder='Search by name, employee code, email, or mobile...'
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className={searchQuery ? 'pr-20 pl-10' : 'pl-10'}
                            />
                            {searchQuery && (
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleSearch('')}
                                    className='-translate-y-1/2 absolute top-1/2 right-1 h-7 px-2 text-xs hover:bg-muted'>
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Pagination Info */}
                    <div className='mb-2 text-muted-foreground text-sm'>
                        Showing {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
                        {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}{' '}
                        {searchQuery ? 'filtered' : 'total'} employees
                        {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                    </div>

                    <GenericDataTable<EmployeeListItem>
                        data={paginatedData}
                        totalItems={filteredData.length}
                        columns={employeeColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={true}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading employees...'
                        noDataTitle={searchQuery ? 'No Matching Employees' : 'No Employees Found'}
                        noDataDescription={searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first employee'}
                        errorTitle='Error Loading Employees'
                    />

                    {/* Custom Pagination Controls */}
                    {totalPages > 1 && (
                        <div className='mt-4 flex items-center justify-between'>
                            <div className='text-muted-foreground text-sm'>
                                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button variant='outline' size='sm' onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                    {'<<'}
                                </Button>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}>
                                    {'<'}
                                </Button>
                                <span className='text-sm'>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}>
                                    {'>'}
                                </Button>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}>
                                    {'>>'}
                                </Button>
                            </div>
                        </div>
                    )}
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
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<EmployeeListItem>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Employee'
                        description='Fill in the employee details below'
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
                            <EmployeeRegisterForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Employee'
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
                            <EmployeeRegisterForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleEmployeeForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
