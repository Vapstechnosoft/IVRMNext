'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterPayrollStandard } from '@/hooks/hrms/useMasters';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import PayrollStandardForm from './_components/payroll-standard-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterPayrollStandardPage(_props: {
    searchParams: SearchParams;
}) {
    const roleId = HRMS_MI_ID;
    const { listQuery } = useMasterPayrollStandard(roleId);
    // Memoize array to prevent unnecessary re-renders
    const hrStandardList = useMemo(() => (listQuery.data?.hrStandardList || []) as any[], [listQuery.data?.hrStandardList]);

    // Get the first (and only) payroll standard record
    const existingData = hrStandardList[0];

    const isLoading = listQuery.isLoading;
    const error = listQuery.error;

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Loading State */}
                {isLoading && (
                    <div className='flex items-center justify-center py-12'>
                        <Loader2 className='h-8 w-8 animate-spin text-primary' />
                        <span className='ml-2 text-muted-foreground'>Loading payroll configuration...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className='flex items-center justify-center py-12'>
                        <div className='flex flex-col items-center gap-2 text-center'>
                            <AlertCircle className='h-12 w-12 text-destructive' />
                            <h3 className='font-semibold text-lg'>Error Loading Payroll Configuration</h3>
                            <p className='text-muted-foreground text-sm'>{error.message || 'An error occurred while loading data'}</p>
                        </div>
                    </div>
                )}

                {/* Form - Always Visible (No Table) */}
                {!isLoading && !error && (
                    <CollapsibleSection
                        title='Master Payroll Standard'
                        description='Configure organization-wide payroll standards and calculation rules'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <PayrollStandardForm existingData={existingData} />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
