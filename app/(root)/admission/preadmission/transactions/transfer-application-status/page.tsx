'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useActivePreadmissionDetails,
    useApplicationStatusDropdown,
    useApplicationStudentList,
    usePreadmissionClassDropdown
} from '@/hooks/admission/preadmission/useTransactions';
import type { IPreadmissionApplicationList } from '@/types/admission/preadmission/transactions';
import { use, useState } from 'react';
import { transferApplicationColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function TransferApplicationStatusPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);

    const { data: activePreadmission, isLoading: activePreadmissionDeLoading } = useActivePreadmissionDetails();
    const {
        data: preadmissionClass,
        isLoading: preadmissionClassLoading,
        isError: preadmissionClassError
    } = usePreadmissionClassDropdown();

    const {
        data: applicationStatus,
        isLoading: applicationStatusLoading,
        isError: applicationStatusError
    } = useApplicationStatusDropdown();

    const [classId, setClassId] = useState<number>(0);
    const [statusId, setStatusId] = useState<number>(0);

    const {
        data: response,
        isLoading,
        error
    } = useApplicationStudentList(activePreadmission?.data?.asmaY_Id ?? 0, classId, statusId, searchParams);
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            {/* Header */}
            <div className='mb-3 flex w-fit flex-col gap-4 rounded-xl border p-4 shadow-xl'>
                {/* Header Section */}
                <div className='mt-3 flex items-center justify-between gap-4'>
                    <h1 className='font-bold text-2xl tracking-tight'>Academic Year</h1>
                    {activePreadmission?.data?.asmaY_Year && (
                        <p className='rounded-xl border bg-secondary px-2 py-1 font-bold'>{activePreadmission?.data?.asmaY_Year}</p>
                    )}
                </div>

                {/* Filter Options */}
                <div className='flex flex-wrap justify-start gap-6'>
                    {/* Class Filter */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='class' className='mb-1 font-semibold'>
                            Class
                        </Label>
                        <Select onValueChange={(value) => setClassId(Number(value))} value={classId?.toString() || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Class' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key={0} value={'0'}>
                                    All
                                </SelectItem>
                                {preadmissionClassLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : preadmissionClassError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading
                                    </SelectItem>
                                ) : (
                                    preadmissionClass?.data?.map((item) => (
                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                            {item.asmcL_ClassName}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Application Status Filter */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='application-status' className='mb-1 font-semibold'>
                            Application Status
                        </Label>
                        <Select
                            onValueChange={(value) => setStatusId(Number(value))}
                            value={statusId !== 0 ? statusId?.toString() || undefined : undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Application Status' />
                            </SelectTrigger>
                            <SelectContent>
                                {applicationStatusLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : applicationStatusError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading
                                    </SelectItem>
                                ) : (
                                    applicationStatus?.data?.map((item) => (
                                        <SelectItem key={item.id} value={item.id.toString()}>
                                            {item.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className='container space-y-4 p-1'>
                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IPreadmissionApplicationList>
                        {...tableProps}
                        columns={transferApplicationColumns}
                        isLoading={activePreadmissionDeLoading || isLoading}
                        error={error}
                        loadingMessage='Loading preadmission applications...'
                        noDataTitle='No Data Found'
                        noDataDescription='No preadmission applications found.'
                        errorTitle='Error Loading Preadmission Applications'
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
