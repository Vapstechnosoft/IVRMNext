'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IadmissionStudentApplicationList } from '@/types/admission/admission';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';
import React, { useEffect, useState } from 'react';
import AddStudentAdmissionForm from './_components/add-form';
import { studentApplicationColumns } from './_components/columns';
import ApplicationFormSuccessDialog from './_components/success-dialog';
import AiInsightDialog from './_components/ai-insight-dialog';
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentApplicationPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);

    // Only pass asmay_id to the API so client-side changes don't trigger refetches or backend errors
    const apiSearchParams = React.useMemo(() => {
        return {
            asmay_id: searchParams?.asmay_id
        };
    }, [searchParams?.asmay_id]);

    const { data: activePreadmission } = useGetAllAdmissionLists();
    const { data: response, isLoading, error, refetch } = useGetAllAdmissionLists(apiSearchParams);
    const { data: masterConfig } = useAcademicYearMasterConfiguration(0);

    return (
        <FormProvider<IadmissionStudentApplicationList>>
            <StudentApplicationPageContent
                response={response}
                isLoading={isLoading}
                error={error}
                refetch={refetch}
                masterConfig={masterConfig}
                searchParams={searchParams}
            />
        </FormProvider>
    );
}

function StudentApplicationPageContent({
    response,
    isLoading,
    error,
    refetch,
    masterConfig,
    searchParams
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetch: () => void;
    masterConfig: any;
    searchParams: any;
}) {
    const { openAddForm } = useFormContext();

    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    
    const page = currentPage || 1;

    const filteredData = React.useMemo(() => {
        let result = response?.data?.studentList || [];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((row: any) =>
                Object.values(row).some(
                    (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(query)
                )
            );
        }
        return result;
    }, [response, searchQuery]);

    const paginatedData = React.useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredData.slice(start, end);
    }, [filteredData, page, pageSize]);

    const tableProps = useDataTableProps(
        response?.data && response.data.studentList
            ? { ...response, data: paginatedData, total: filteredData.length }
            : response
    );
    const [isSuccessOpen, setSuccessOpen] = useState(false);
    const [isAiInsightOpen, setAiInsightOpen] = useState(false);
    const [successType, setSuccessType] = useState<'create' | 'update'>('create');
    const [aiInsightMsg, setAiInsightMsg] = useState<string | undefined>(undefined);
    const [aiSeatStatusMsg, setAiSeatStatusMsg] = useState<string | undefined>(undefined);
    const session = useSession();

    useEffect(() => {
        // Don't force a full page reload when session role is temporarily undefined.
        // Session handling should be addressed centrally; avoid reloads here.
    }, [session?.data?.role]);

    // Listen for global admission changes and refetch the table when they occur
    useEffect(() => {
        const handler = () => refetch();
        window.addEventListener('admission:changed', handler as EventListener);
        return () => window.removeEventListener('admission:changed', handler as EventListener);
    }, [refetch]);

    const onCloseSuccessDialog = () => {
        setSuccessOpen(false);
        if (aiInsightMsg) {
            setAiInsightOpen(true);
        } else {
            refetch();
        }
    };

    const [selectedYear, setSelectedYear] = useQueryState('asmay_id', { defaultValue: '' });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div className='w-64'>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className='w-full bg-background'>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {response?.data?.academicyear?.map((year: any) => (
                                    <SelectItem key={year.yearid} value={year.yearid.toString()}>
                                        {year.year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add AdmissionForm
                    </Button>
                </div>
                {isSuccessOpen && (
                    <ApplicationFormSuccessDialog
                        isOpen={isSuccessOpen}
                        title={successType === 'update' ? 'Application Updated Successfully' : 'Application Submitted Successfully'}
                        message={successType === 'update' ? 'Application updated successfully' : 'Successfully submitted application form'}
                        onClose={onCloseSuccessDialog}
                    />
                )}
                {isAiInsightOpen && aiInsightMsg && (
                    <AiInsightDialog
                        isOpen={isAiInsightOpen}
                        insight={aiInsightMsg}
                        seatStatus={aiSeatStatusMsg}
                        onClose={() => {
                            setAiInsightOpen(false);
                            refetch();
                        }}
                    />
                )}
                {/* Forms */}
                <FormSections
                    setSuccess={(type: 'create' | 'update', insight?: string, seatStatus?: string) => {
                        setSuccessType(type);
                        setAiInsightMsg(insight);
                        setAiSeatStatusMsg(seatStatus);
                        setSuccessOpen(true);
                    }}
                    refetch={refetch}
                />
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='[&_table_tbody_tr:nth-child(even)]:!bg-primary/5 [&_table_tbody_tr[data-state=selected]]:!bg-purple-100 [&_table_tbody_tr:hover]:!bg-purple-200 [&_table_tbody_tr:hover_td]:!bg-purple-200 [&_table_tbody_tr]:cursor-pointer [&_table_tbody_tr]:transition-colors'>
                        <GenericDataTable<IadmissionStudentApplicationList>
                            {...tableProps}
                            columns={studentApplicationColumns as ColumnDef<IadmissionStudentApplicationList>[]}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading applications...'
                            noDataTitle='No Applications Found'
                            noDataDescription='Get started by creating your first applications'
                            errorTitle='Error Loading Applications'
                        />
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}

import { useGetAllAdmissionLists } from '@/hooks/admission/admissionForm';
import { useAcademicYearMasterConfiguration } from '@/hooks/admission/preadmission/useConfigurations';
import UpdateStudentAdmissionForm from './_components/update-form';

function FormSections({
    setSuccess,
    refetch
}: {
    setSuccess: (type: 'create' | 'update', insight?: string, seatStatus?: string) => void;
    refetch: () => void;
}) {
    const { isAddFormOpen, closeAddForm, addFormRef, isEditFormOpen, closeEditForm, editFormRef, selectedRow } = useFormContext();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Admission Application'
                        description='Fill in the details below to create a new admission application'
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
                            <AddStudentAdmissionForm
                                onSuccess={(res) => {
                                    closeAddForm();
                                    // Extract the AI insight from whatever property the backend decides to use
                                    const insight = res?.data?.aiInsight || res?.aiInsight || res?.ai_message || res?.insight;
                                    const seatStatus = res?.data?.aiSeatStatus;
                                    setSuccess('create', insight && typeof insight === 'string' ? insight : undefined, seatStatus);
                                    refetch();
                                }}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Admission Application'
                        description='Update the details below to edit the Admission application'
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
                            <UpdateStudentAdmissionForm
                                rowData={selectedRow}
                                onSuccess={(res) => {
                                    closeEditForm();
                                    const insight = res?.data?.aiInsight || res?.aiInsight || res?.ai_message || res?.insight;
                                    const seatStatus = res?.data?.aiSeatStatus;
                                    setSuccess('update', insight && typeof insight === 'string' ? insight : undefined, seatStatus);
                                    refetch();
                                }}
                                onClose={closeEditForm}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
