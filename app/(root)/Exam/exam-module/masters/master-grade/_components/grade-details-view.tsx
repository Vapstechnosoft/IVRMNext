'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { FormProvider } from '@/components/ui/form/form-provider';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';
import { useMasterGradeDetails } from '@/hooks/exam/exammodule/usemasters';
import type { IGradeDetails, IMasterGrade } from '@/types/exam/exam-module/masters';
import { GradeDetailsColumns } from './grade-details-columns';

interface MasterGradeDetailsPageProps {
    rowData: IMasterGrade; //  Will receive selected grade details
    onClose: () => void; //  Function to close the details view
}

export default function MasterGradeDetailsPage({ rowData, onClose }: MasterGradeDetailsPageProps) {
    const gradeId = rowData?.emgR_Id; // 👈 Assuming ex_Id is Grade ID

    // Fetch grade details by ID
    const { data: response, isLoading, error } = useMasterGradeDetails(gradeId);
    const tableProps = useDataTableProps(response);

    return (
        <FormProvider<IMasterGrade>>
            {/* Overlay */}
            <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[10vh]'>
                {/* Popup Container */}
                <div className='relative mx-auto w-[70%] rounded-2xl bg-white p-6 shadow-xl'>
                    {/* Header Section */}
                    <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='space-y-1'>
                            <Heading
                                title={`Grade Details - ${rowData.emgR_GradeName ?? ''}`}
                                description='Detailed view of grade configuration and marks distribution'
                            />
                        </div>
                        <div className='flex gap-2'>
                            <Button
                                variant='secondary'
                                onClick={onClose}
                                className='shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                Close
                            </Button>
                        </div>
                    </div>

                    {/* Grade Details Table */}
                    <GenericDataTable<IGradeDetails>
                        {...tableProps}
                        columns={GradeDetailsColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading grade details...'
                        noDataTitle='No Grade Details Found'
                        noDataDescription='No details available for this grade.'
                        errorTitle='Error Loading Grade Details'
                    />
                </div>
            </div>
        </FormProvider>
    );
}
