'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useCLGTransactionCountReportSearch } from '@/hooks/library/reports/useCLGTransactionCountReport';
import type {
    ICLGTransactionCountReportGridData,
    ICLGTransactionCountReportRequest
} from '@/types/library/reports/clg-transaction-count-report';
import { useState } from 'react';
import { CLGTransactionCountColumns, CLGTransactionStatusColumns } from './_components/columns';
import { ReportForm } from './_components/report-form';

import { exportToExcel } from '@/lib/export-to-file';

export default function CLGTransactionCountReportPage() {
    const [reportData, setReportData] = useState<ICLGTransactionCountReportGridData[]>([]);
    const [isStatusCount, setIsStatusCount] = useState(false);

    const searchMutation = useCLGTransactionCountReportSearch();

    const handleSearch = (data: ICLGTransactionCountReportRequest) => {
        setIsStatusCount(data.statuscount);
        searchMutation.mutate(data, {
            onSuccess: (response: any) => {
                const data = (response.alldata || response.reportlist || response.griddata || (Array.isArray(response) ? response : [])) as ICLGTransactionCountReportGridData[];
                setReportData(data);
            }
        });
    };

    const handleExport = () => {
        const columns = isStatusCount
            ? [
                  { label: 'Status', value: 'LBTR_Status' },
                  { label: 'Count', value: 'seccount' }
              ]
            : [
                  { label: 'Course', value: 'ASMCL_CourseName' },
                  { label: 'Branch', value: 'AMB_BranchName' },
                  { label: 'Semester', value: 'AMSE_SEMName' },
                  { label: 'Section', value: 'ACMS_SectionName' },
                  { label: 'Count', value: 'seccount' }
              ];

        exportToExcel(
            'College_Transaction_Report',
            JSON.stringify(columns),
            JSON.stringify(reportData)
        );
    };

    return (
        <div className='space-y-4'>
            <CollapsibleSection title='STUDENT BOOK Transaction Count Report' defaultOpen={true}>
                <ReportForm 
                    onSearch={handleSearch} 
                    isLoading={searchMutation.isPending} 
                    onPrint={() => window.print()}
                    onExport={handleExport}
                    hasData={reportData.length > 0}
                />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <CollapsibleSection title='Report Grid' defaultOpen={true}>
                    <GenericDataTable
                        columns={isStatusCount ? CLGTransactionStatusColumns : CLGTransactionCountColumns}
                        data={reportData}
                        isLoading={false}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
