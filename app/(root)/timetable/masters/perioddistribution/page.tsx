'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBreakTimeSettings } from '@/hooks/timetable/useMasters';
import { deactivatePeriodDistribution, savePeriodDistribution } from '@/server/timetable/masters/perioddistribution';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { type PeriodDistributionColumn, createPeriodDistributionColumns } from './_components/columns';
import PeriodDistributionForm from './_components/period-distribution-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function PeriodDistributionPage() {
    const { data: response, isLoading, error, refetch } = useBreakTimeSettings();
    const [data, setData] = useState<PeriodDistributionColumn[]>([]);

    // The API returns all_period_distri_list for grid in the response object
    const tableProps = useDataTableProps(
        response && (response as any).all_period_distri_list ? { ...response, data: (response as any).all_period_distri_list } : response
    );

    useEffect(() => {
        if (response && (response as any).all_period_distri_list) {
            setData((response as any).all_period_distri_list);
        }
    }, [response]);

    const handleSave = async (payload: any) => {
        try {
            const res = await savePeriodDistribution(payload);
            if (res.returnval) {
                toast.success('Data successfully Saved');
                refetch();
            } else if (res.returnduplicatestatus === 'Duplicate') {
                toast.error('Records Already Exist!');
            } else {
                toast.error('Data Not Saved!');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleEdit = (row: PeriodDistributionColumn) => {
        // Implement edit logic if needed - typically this would fetch details and populate the form
        toast.info('Edit functionality requires fetching details.');
    };

    const handleDelete = (row: PeriodDistributionColumn) => {
        // Implement delete if supported API exists
    };

    const handleToggleActive = async (row: PeriodDistributionColumn) => {
        const payload = {
            ttfpD_Id: row.ttfpD_Id,
            ttfpD_ActiveFlag: row.ttfpD_ActiveFlag
        };
        try {
            const res = await deactivatePeriodDistribution(payload);
            if (res.returnval) {
                toast.success(row.ttfpD_ActiveFlag ? 'Deactivated successfully' : 'Activated successfully');
                refetch();
            } else {
                toast.error('Operation failed');
            }
        } catch (error: any) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    const columns = createPeriodDistributionColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onToggleActive: handleToggleActive
    });

    return (
        <div className='space-y-4 p-1'>
            <CollapsibleSection title='Period Distribution' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <PeriodDistributionForm onSuccess={handleSave} />
            </CollapsibleSection>

            <CollapsibleSection
                title='Grid View'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<PeriodDistributionColumn>
                    {...tableProps}
                    data={data}
                    columns={columns}
                    isLoading={isLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading period distribution data...'
                    noDataTitle='No Data Found'
                    noDataDescription='No period distribution records found'
                    errorTitle='Error Loading Data'
                />
            </CollapsibleSection>
        </div>
    );
}
