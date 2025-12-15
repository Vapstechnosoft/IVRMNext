'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useSalaryAdvanceList } from '@/hooks/hrms/useTransactions';
import { cn } from '@/lib/utils';
import type { EmployeeDropdown, LeaveYearDropdown, MonthDropdown, SalaryAdvanceItem } from '@/types/hrms/salary-advance';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AddSalaryAdvanceForm from './_components/add-form';
import { getSalaryAdvanceColumns } from './_components/columns';
import ToggleSalaryAdvanceForm from './_components/toggle-form';
import UpdateSalaryAdvanceForm from './_components/update-form';
import { use } from 'react';
import { X } from 'lucide-react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
interface SalaryAdvance extends SalaryAdvanceItem {
    selected?: boolean;
}
export default function SalaryAdvancePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useSalaryAdvanceList(searchParams);
    return (
        <FormProvider<SalaryAdvanceItem>>
            <SalaryAdvancePageContent response={response} isLoading={isLoading} error={error} refetch={refetchAll} />
        </FormProvider>
    );
}
function SalaryAdvancePageContent({
    response,
    isLoading,
    error,
    refetch
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
}) {
    const {
        openAddForm,
        isAddFormOpen,
        closeAddForm,
        addFormRef,
        isEditFormOpen,
        closeEditForm,
        editFormRef,
        isToggleFormOpen,
        closeToggleForm,
        selectedRow
    } = useFormContext<SalaryAdvanceItem>();
    const [selectedAdvances, setSelectedAdvances] = useState<number[]>([]);
    const advanceData = response?.data || response;
    const _salaryAdvances: SalaryAdvance[] = (advanceData?.empadvaList || []).map((advance: any) => ({
        ...advance,
        selected: false
    }));
    const filteredAdvances = _salaryAdvances;
    const employees = advanceData?.employeedropdown || [];
    const leaveYears = advanceData?.leaveyeardropdown || [];
    const months = advanceData?.monthdropdown || [];
    const tableProps = useDataTableProps(response);
    const _modeOfPayments = advanceData?.modeOfPaymentdropdown || [];
    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedAdvances(filteredAdvances.map((advance) => advance.HRESA_Id));
        } else {
            setSelectedAdvances([]);
        }
    };
    const handleAdvanceSelect = (advanceId: number, selected: boolean) => {
        if (selected) {
            setSelectedAdvances((prev) => [...prev, advanceId]);
        } else {
            setSelectedAdvances((prev) => prev.filter((id) => id !== advanceId));
        }
    };
    const getEmployeeName = (employee: EmployeeDropdown | null | undefined) => {
        if (!employee) return 'N/A';
        return (
            `${employee.HRME_EmployeeFirstName || ''} ${
                employee.HRME_EmployeeMiddleName || ''
            } ${employee.HRME_EmployeeLastName || ''}`.trim() || 'N/A'
        );
    };
    const getEmployeeCode = (employeeId: number) => {
        const employee = employees.find((emp: EmployeeDropdown) => emp.HRME_Id === employeeId);
        return employee?.HRME_EmployeeCode || `EMP${employeeId}`;
    };
    const getEmployeeNameById = (employeeId: number) => {
        const employee = employees.find((emp: EmployeeDropdown) => emp.HRME_Id === employeeId);
        return getEmployeeName(employee || null);
    };
    const getLeaveYearName = (yearId: number) => {
        const year = leaveYears.find((y: LeaveYearDropdown) => y.HRMLY_Id === yearId);
        return year?.HRMLY_LeaveYear || `Year ${yearId}`;
    };
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Salary Advance
                    </Button>
                </div>
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='space-y-4'>
                        {selectedAdvances.length > 0 && (
                            <div className='flex items-center gap-4 rounded-lg bg-blue-50 p-4'>
                                <span className='font-medium text-sm'>{selectedAdvances.length} record(s) selected</span>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => {
                                        toast.info('Bulk actions not implemented yet');
                                    }}>
                                    Bulk Actions
                                </Button>
                            </div>
                        )}
                        <GenericDataTable<SalaryAdvance>
                            {...tableProps}
                            columns={getSalaryAdvanceColumns({
                                selectedAdvances,
                                onSelectAll: handleSelectAll,
                                onAdvanceSelect: handleAdvanceSelect,
                                employees,
                                leaveYears,
                                months,
                                advances: filteredAdvances
                            })}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={true}
                            loadingMessage='Loading salary advances...'
                            noDataTitle='No Salary Advances Found'
                            noDataDescription='Get started by creating your first salary advance'
                            errorTitle='Error Loading Salary Advances'
                        />
                    </div>
                </CollapsibleSection>
                {/* Forms */}
                <FormSections response={response} onSuccess={refetch} />
            </div>
        </div>
    );
}

function FormSections({ response, onSuccess }: { response: any; onSuccess: () => void }) {
    const {
        isAddFormOpen,
        closeAddForm,
        addFormRef,
        isEditFormOpen,
        closeEditForm,
        editFormRef,
        isToggleFormOpen,
        closeToggleForm,
        selectedRow
    } = useFormContext<SalaryAdvanceItem>();
    const onloadData = response?.data || response;

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Salary Advance'
                        description='Fill in the details below to add a new salary advance'
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
                            <AddSalaryAdvanceForm
                                onloadData={onloadData}
                                onSuccess={() => {
                                    closeAddForm();
                                    onSuccess();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Salary Advance'
                        description='Update the details below to edit the salary advance'
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
                            <UpdateSalaryAdvanceForm
                                selectedRow={selectedRow}
                                onloadData={onloadData}
                                onSuccess={() => {
                                    closeEditForm();
                                    onSuccess();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleSalaryAdvanceForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
