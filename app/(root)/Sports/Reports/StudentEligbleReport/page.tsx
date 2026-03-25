'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useStudentEligibleReport } from '@/hooks/sports/useStudentEligibleReport';
import type { IStudentEligibleReportDetail } from '@/types/sports/reports/student-eligible-report';
import { useEffect, useState } from 'react';
import { columns } from './_components/columns';
import ReportForm from './_components/report-form';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

export default function StudentEligibleReportPage() {
    const { data: loadGridData, isLoading, error } = useStudentEligibleReport();
    const [reportResponse, setReportResponse] = useState<any>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Student_Eligible_Report',
        pageStyle: `
          @page { size: portrait; margin: 20mm; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            table { border-collapse: collapse !important; width: 100% !important; }
            th, td { border: 1px solid #000 !important; padding: 8px !important; text-align: center !important; }
          }
        `
    });

    const handleExcel = () => {
        if (reportResponse?.data) {
            const worksheet = XLSX.utils.json_to_sheet(reportResponse.data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
            XLSX.writeFile(workbook, "StudentEligibleReport.xlsx");
        }
    };

    useEffect(() => {
        if (loadGridData) {
            setReportResponse(loadGridData);
        }
    }, [loadGridData]);

    const handleReport = (data: any) => {
        setReportResponse(data);
    };

    const handleReset = () => {
        if (loadGridData) {
            setReportResponse(loadGridData);
        }
    };

    // const handlePrint = () => {
    //     // Combined with react-to-print
    // };

    // const handleExcel = () => {
    //     // Local implementation above
    // };

    const tableProps = useDataTableProps(reportResponse);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                <div className='flex items-center justify-between'>
                    <h2 className='font-bold text-2xl tracking-tight'>Student Eligible Report</h2>
                </div>

                <CollapsibleSection title='Report Filters' defaultOpen={true} variant='default' className='shadow-lg'>
                    <ReportForm
                        onReport={handleReport}
                        onReset={handleReset}
                        onPrint={() => handlePrint()}
                        onExcel={handleExcel}
                        hasData={!!reportResponse?.data?.length}
                    />
                </CollapsibleSection>

                <CollapsibleSection
                    title='STUDENT ELIGIBLE REPORT LIST'
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg'>
                    <div ref={componentRef} className="p-4 bg-white rounded-lg">
                        <style jsx global>{`
                            @media screen {
                                .print-only { display: none !important; }
                            }
                            @media print {
                                .screen-only { display: none !important; }
                                .print-only { display: block !important; }
                                body { -webkit-print-color-adjust: exact !important; background: white !important; }
                            }
                        `}</style>

                        <div className="hidden print:block text-center mb-6">
                            <h2 className="text-2xl font-bold uppercase underline text-primary">Student Eligible Report</h2>
                        </div>

                        <div className="screen-only">
                            <GenericDataTable<IStudentEligibleReportDetail>
                                {...tableProps}
                                columns={columns}
                                isLoading={isLoading}
                                error={error}
                                //manualPagination={false}
                                showViewOptions={true}
                                loadingMessage='Loading report data...'
                                noDataTitle='No Records Found'
                                errorTitle='Error Loading Data'
                            />
                        </div>

                        <div className="print-only overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300 text-center text-[10pt]">
                                <thead>
                                    <tr className="bg-gray-100">
                                        {columns.map((col: any, i) => (
                                            <th key={i} className="border border-gray-300 p-2 font-bold bg-gray-50 whitespace-nowrap">
                                                {typeof col.header === 'string' ? col.header : (col.header?.toString() || '')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(reportResponse?.data || []).length > 0 ? (
                                        (reportResponse.data).map((row: any, rowIndex: number) => (
                                            <tr key={rowIndex}>
                                                {columns.map((col: any, colIndex) => (
                                                    <td key={colIndex} className="border border-gray-300 p-2">
                                                        {col.accessorKey ? row[col.accessorKey] : 
                                                         col.cell ? (col.cell as any)({ row: { original: row, index: rowIndex } }) : ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={columns.length} className="border border-gray-300 p-10 text-center text-muted-foreground font-medium">
                                                No Records Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
}
