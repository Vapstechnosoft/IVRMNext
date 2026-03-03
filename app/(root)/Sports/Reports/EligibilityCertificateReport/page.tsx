'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useEligibilityCertificateReport } from '@/hooks/sports/useEligibilityCertificateReport';
import type { IEligibilityCertificateReportDetail } from '@/types/sports/reports/eligibility-certificate-report';
import { useEffect, useState } from 'react';
import { columns } from './_components/columns';
import ReportForm from './_components/report-form';
import { toast } from 'sonner';

export default function EligibilityCertificateReportPage() {
    const { data: loadGridData, isLoading, error } = useEligibilityCertificateReport();
    const [reportData, setReportData] = useState<IEligibilityCertificateReportDetail[]>([]);

    // Initial load
    useEffect(() => {
        if (loadGridData?.success && loadGridData?.data?.pudatareport) {
            setReportData(loadGridData.data.pudatareport);
        }
    }, [loadGridData]);

    const handleReport = (data: any) => {
        if (Array.isArray(data)) {
            setReportData(data);
        } else if (data?.pudatareport && Array.isArray(data.pudatareport)) {
            setReportData(data.pudatareport);
        } else if (data?.datareport && Array.isArray(data.datareport)) {
            setReportData(data.datareport);
        } else if (data?.data?.pudatareport && Array.isArray(data.data.pudatareport)) {
            setReportData(data.data.pudatareport);
        } else if (data?.data?.datareport && Array.isArray(data.data.datareport)) {
            setReportData(data.data.datareport);
        } else if (data?.data && Array.isArray(data.data)) {
            setReportData(data.data);
        } else {
            setReportData([]);
        }
    };

    const handleReset = () => {
        if (loadGridData?.data?.pudatareport) {
            setReportData(loadGridData.data.pudatareport);
        } else {
            setReportData([]);
        }
    };

    const handlePrint = () => {
        if (reportData.length > 0) {
            toast.info('Print functionality will be implemented here');
        }
    };

    const handleExcel = () => {
        if (reportData.length > 0) {
            toast.info('Excel export functionality will be implemented here');
        }
    };

    const tableProps = useDataTableProps(reportData);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                <div className='flex items-center justify-between'>
                    <h2 className='font-bold text-2xl tracking-tight'>Eligibility Certificate Report</h2>
                </div>

                <CollapsibleSection title='Report Filters' defaultOpen={true} variant='default' className='shadow-lg'>
                    <ReportForm
                        onReport={handleReport}
                        onReset={handleReset}
                        onPrint={handlePrint}
                        onExcel={handleExcel}
                        hasData={reportData.length > 0}
                    />
                </CollapsibleSection>

                <CollapsibleSection
                    title='ELIGIBILITY CERTIFICATE REPORT LIST'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'>
                    <GenericDataTable<IEligibilityCertificateReportDetail>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={true}
                        loadingMessage='Loading report data...'
                        noDataTitle='No Records Found'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
