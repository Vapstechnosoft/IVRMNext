'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useEmployeeYearlyReport } from '@/hooks/hrms/attendance-management/useReports';
import { exportToExcel } from '@/lib/utils';
import { format } from 'date-fns';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import AddEmployeeYearlyReportForm from './_components/add-from';
import { type YearRow, getEmployeeYearlyReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeYearlyReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useEmployeeYearlyReport(searchParams);

    return <EmployeeYearlyReportPageContent response={response} isLoading={isLoading} error={error} searchParams={searchParams} />;
}

function FormSections({ searchParams }: { searchParams?: any }) {
    const { closeAddForm, addFormRef } = useFormContext<YearRow>();

    return (
        <div ref={addFormRef}>
            <CollapsibleSection
                title='Generate Employee Yearly Report'
                description='Fill in the details below to generate the report'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                <AddEmployeeYearlyReportForm onSuccess={closeAddForm} searchParams={searchParams} />
            </CollapsibleSection>
        </div>
    );
}

function EmployeeYearlyReportPageContent({
    response,
    isLoading,
    error,
    searchParams
}: {
    response: any;
    isLoading: boolean;
    error: any;
    searchParams?: any;
}) {
    const [selectedRows, setSelectedRows] = useState<YearRow[]>([]);

    // Extract data from new response structure
    const reportData = useMemo(() => response?.data?.report || response?.data || [], [response]);
    const dynamicMonths = useMemo(() => response?.data?.columns || [], [response]);
    const _totalWorkingDays = response?.data?.tpdays;
    // Get modes from searchParams
    const rawModes = searchParams?.mode;
    const modes = useMemo(() => (Array.isArray(rawModes) ? rawModes : rawModes ? [rawModes as string] : []), [rawModes]);

    const tableProps = useMemo(
        () => ({
            ...response,
            data: reportData,
            total: response?.total ?? reportData.length,
            errorMessage: response?.message || response?.errorMessage
        }),
        [response, reportData]
    );

    const columns = useMemo(() => {
        return getEmployeeYearlyReportColumns(dynamicMonths, modes);
    }, [dynamicMonths, modes]);

    const handleRowSelectionChange = useCallback(
        (rows: YearRow[]) => {
            // Only update if selection has actually changed to prevent infinite loops
            if (
                rows.length !== selectedRows.length ||
                JSON.stringify(rows.map((r) => r.ecode)) !== JSON.stringify(selectedRows.map((r) => r.ecode))
            ) {
                setSelectedRows(rows);
            }
        },
        [selectedRows]
    );

    useEffect(() => {
        if (!isLoading && searchParams?.fromDate && searchParams?.toDate && reportData.length === 0 && response) {
            toast.error('No Data Found');
        }
    }, [isLoading, reportData.length, searchParams?.fromDate, searchParams?.toDate, response]);

    const handleExportToExcel = () => {
        const dataToExport = selectedRows.length > 0 ? selectedRows : reportData;
        if (dataToExport.length === 0) return;

        const exportData = dataToExport.map((row: YearRow, index: number) => {
            const exportRow: Record<string, any> = {
                'Sl.No': index + 1,
                'Employee Code': row.ecode || '',
                'Employee Name': row.ename || '',
                Designation: row.designation || ''
            };

            // Add dynamic months
            dynamicMonths.forEach((month: string) => {
                exportRow[month.replace('_', ' ')] = row[month] ?? '';
            });

            if (modes.includes('Total working Day')) {
                exportRow['Total Present'] = row.tpdays ?? '';
            }

            if (modes.includes('Show Holiday Punch')) {
                exportRow['Total Worked on Holidays'] = row.hwkdays ?? '';
            }

            if (modes.includes('Date Of Joining')) {
                exportRow['Date of Joining'] = row.doj ? format(new Date(row.doj), 'dd-MM-yyyy') : '';
            }

            return exportRow;
        });

        exportToExcel(exportData, `Employee_Yearly_Report_${Date.now()}`);
    };

    const handlePrint = () => {
        const dataToPrint = selectedRows.length > 0 ? selectedRows : reportData;
        if (dataToPrint.length === 0) return;

        // Create a print-friendly table
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const columnHeaders = [
            'Sl.No',
            'Employee Code',
            'Employee Name',
            'Designation',
            ...dynamicMonths.map((m: string) => m.replace('_', ' '))
        ];

        if (modes.includes('Total working Day')) columnHeaders.push('Total Present');
        if (modes.includes('Show Holiday Punch')) columnHeaders.push('Total Worked on Holidays');
        if (modes.includes('Date Of Joining')) columnHeaders.push('Date of Joining');

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Employee Yearly Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
                    h1 { color: #4f46e5; margin: 0; font-size: 24px; }
                    p { margin: 5px 0; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
                    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
                    th { background-color: #f8fafc; color: #1e293b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
                    tr:nth-child(even) { background-color: #f1f5f9; }
                    .footer { margin-top: 30px; text-align: right; font-size: 10px; color: #94a3b8; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1.5cm; landscape: true; }
                        table { font-size: 9px; }
                        .header { border-bottom-color: #000; }
                        th { background-color: #eee !important; color: #000 !important; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Employee Yearly Report</h1>
                    <p>Generated on ${format(new Date(), 'dd MMMM yyyy, hh:mm a')}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            ${columnHeaders.map((header) => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${dataToPrint
                            .map(
                                (row: YearRow, index: number) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${row.ecode || ''}</td>
                                <td>${row.ename || ''}</td>
                                <td>${row.designation || ''}</td>
                                ${dynamicMonths.map((m: string) => `<td>${row[m] ?? ''}</td>`).join('')}
                                ${modes.includes('Total working Day') ? `<td>${row.tpdays ?? ''}</td>` : ''}
                                ${modes.includes('Show Holiday Punch') ? `<td>${row.hwkdays ?? ''}</td>` : ''}
                                ${modes.includes('Date Of Joining') ? `<td>${row.doj ? format(new Date(row.doj), 'dd-MM-yyyy') : ''}</td>` : ''}
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
                <div class="footer">
                    Printed via IVRM Management System
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };

    return (
        <FormProvider<YearRow>>
            <div className='min-h-screen'>
                <div className='container space-y-4 p-1'>
                    <FormSections searchParams={searchParams} />

                    {/* Data Table Section - Only show when search criteria are provided AND data exists */}
                    {searchParams?.fromDate && searchParams?.toDate && reportData.length > 0 && (
                        <CollapsibleSection
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            {/* Action Buttons inside CollapsibleSection */}
                            {reportData.length > 0 && (
                                <div className='mb-4 flex items-center gap-2 rounded-lg border bg-blue-50/30 p-3 shadow-sm'>
                                    <div className='flex flex-col gap-0.5'>
                                        <span className='font-semibold text-blue-900 text-sm'>Report Actions</span>
                                        <span className='text-[10px] text-blue-700 text-muted-foreground'>
                                            {selectedRows.length > 0
                                                ? `${selectedRows.length} of ${reportData.length} records selected`
                                                : `${reportData.length} total records found`}
                                        </span>
                                    </div>
                                    <div className='ml-auto flex items-center gap-2'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={handleExportToExcel}
                                            className='h-8 border-emerald-200 bg-white text-emerald-700 shadow-sm hover:bg-emerald-50'>
                                            <FileSpreadsheet className='mr-2 h-3.5 w-3.5' />
                                            Excel
                                        </Button>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={handlePrint}
                                            className='h-8 border-blue-200 bg-white text-blue-700 shadow-sm hover:bg-blue-50'>
                                            <Printer className='mr-2 h-3.5 w-3.5' />
                                            Print
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <GenericDataTable<YearRow>
                                {...tableProps}
                                columns={columns}
                                isLoading={isLoading}
                                success={response?.success}
                                error={error}
                                errorMessage={response?.message || response?.errorMessage}
                                showViewOptions={false}
                                columnPinning={{ right: ['actions'] }}
                                isPaginationRequired={true}
                                onRowSelectionChange={handleRowSelectionChange}
                                loadingMessage='Loading Employee Yearly Reports...'
                                noDataTitle='No Employee Yearly Reports Found'
                                noDataDescription='Get started by generating your first Employee Yearly Report'
                                errorTitle='Error Loading Employee Yearly Reports'
                            />
                        </CollapsibleSection>
                    )}
                </div>
            </div>
        </FormProvider>
    );
}
