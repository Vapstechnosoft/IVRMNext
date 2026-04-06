'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useEmployeeAbsentReport } from '@/hooks/hrms/attendance-management/useReports';
import { exportToExcel } from '@/lib/utils';
import { FileSpreadsheet, Printer, X, Download } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import AddEmployeeAbsentReportForm from './_components/add-from';
import type { EmployeeAbsentReportRow } from './_components/columns';
import { employeeAbsentReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeAbsentReportPage(props: {
    searchParams: SearchParams;
}) {
    const resolvedSearchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useEmployeeAbsentReport(resolvedSearchParams);
    const [lastToastId, setLastToastId] = useState<string | number | null>(null);

    // Toast notifications based on request state
    useEffect(() => {
        if (isLoading) {
            const id = toast.loading('Generating Absent Report...');
            setLastToastId(id);
        } else {
            if (lastToastId) {
                toast.dismiss(lastToastId);
                setLastToastId(null);
            }
            
            if (error) {
                toast.error('Failed to generate report');
            } else if (response?.data) {
                if (response.data.length > 0) {
                    toast.success(`Successfully generated report with ${response.data.length} records`);
                } else if (resolvedSearchParams?.fromDate) {
                    toast.info('No records found for the selected criteria');
                }
            }
        }
    }, [response]);

    // Process data to parse attendance_data JSON string
    const processedResponse = useMemo(() => {
        if (!response?.data) return response;
        const data = response.data.map((item: any) => {
            let attendance = {};
            try {
                if (typeof item.attendance_data === 'string') {
                    attendance = JSON.parse(item.attendance_data);
                } else {
                    attendance = item.attendance_data || {};
                }
            } catch (e) {
                console.error('Failed to parse attendance_data', e);
            }
            return {
                ...item,
                ...attendance
            };
        });
        return { ...response, data };
    }, [response]);

    return (
        <FormProvider<EmployeeAbsentReportRow>>
            <EmployeeAbsentReportPageContent
                response={processedResponse}
                isLoading={isLoading}
                error={error}
                resolvedSearchParams={resolvedSearchParams}
            />
        </FormProvider>
    );
}

function FormSections({ resolvedSearchParams, isLoading }: { resolvedSearchParams?: any, isLoading?: boolean }) {
    const { closeAddForm, addFormRef } = useFormContext<EmployeeAbsentReportRow>();

    return (
        <div ref={addFormRef}>
            <CollapsibleSection
                title='Employee Absent Report Filters'
                description='Configure filters to generate the absent report'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='slide-in-from-top-4 animate-in shadow-lg duration-300'
            >
                <AddEmployeeAbsentReportForm onSuccess={closeAddForm} resolvedSearchParams={resolvedSearchParams} isPageLoading={isLoading} />
            </CollapsibleSection>
        </div>
    );
}

function EmployeeAbsentReportPageContent({
    response,
    isLoading,
    error,
    resolvedSearchParams
}: {
    response: any;
    isLoading: boolean;
    error: any;
    resolvedSearchParams?: any;
}) {
    const tableProps = useDataTableProps(response);

    const handleExportToExcel = () => {
        const dataToExport = (response?.data || []);
        if (dataToExport.length === 0) return;

        const exportData = dataToExport.map((row: any, index: number) => ({
            'SLNO': index + 1,
            'Employee Code': row.ecode || '',
            'Employee Name': row.ename || '',
            'Designation': row.designation || '',
            'Total Absent': row.absentdays || 0
        }));

        exportToExcel(exportData, `Employee_Absent_Report_${new Date().toLocaleDateString()}`);
    };

    const handlePrint = () => {
        const dataToPrint = (response?.data || []);
        if (dataToPrint.length === 0) return;

        const fromDateFormatted = resolvedSearchParams?.fromDate ? new Date(resolvedSearchParams.fromDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '';
        const toDateFormatted = resolvedSearchParams?.toDate ? new Date(resolvedSearchParams.toDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '';

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Employee Absent Report</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; }
                    .report-header { 
                        background-color: #1e60ad; 
                        color: white; 
                        text-align: center; 
                        padding: 10px; 
                        font-weight: bold;
                        border: 1px solid #1e60ad;
                    }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    th, td { border: 1px solid #ccc; padding: 10px 8px; text-align: center; }
                    th { background-color: #f0f0f0; color: #333; font-weight: bold; }
                    .ename-cell { text-align: left; }
                    .absent-cell { font-weight: bold; }
                    .footer { margin-top: 20px; text-align: right; font-size: 10px; color: #666; }
                </style>
            </head>
            <body>
                <div class="report-header">
                    Monthly Report from ${fromDateFormatted} to ${toDateFormatted}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 60px">SLNO</th>
                            <th style="width: 120px">Employee Code</th>
                            <th>Employee Name</th>
                            <th>Designation</th>
                            <th style="width: 100px">Total Absent</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dataToPrint
                .map(
                    (row: any, index: number) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${row.ecode || ''}</td>
                                <td class="ename-cell">${row.ename || ''}</td>
                                <td>${row.designation || ''}</td>
                                <td class="absent-cell">${row.absentdays || 0}</td>
                            </tr>
                        `
                )
                .join('')}
                    </tbody>
                </table>
                <div class="footer">Generated on ${new Date().toLocaleString()}</div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const fromDateFormatted = resolvedSearchParams?.fromDate ? new Date(resolvedSearchParams.fromDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '';
    const toDateFormatted = resolvedSearchParams?.toDate ? new Date(resolvedSearchParams.toDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '';

    return (
        <div className='min-h-screen bg-background/50'>
            <div className='container max-w-7xl space-y-6 py-2'>
                {/* Add Form Section */}
                <FormSections resolvedSearchParams={resolvedSearchParams} isLoading={isLoading} />

                {
                    (response?.data && !isLoading || (resolvedSearchParams?.fromDate && response?.data)) && (
                        <CollapsibleSection
                            title="Employee Absent Report"
                            description='Managing the Employee Absent Report'
                            defaultOpen={true}
                        >
                            <div className="flex items-center justify-end px-4 py-2">

                                <div className='flex items-center gap-2'>
                                    <Button variant='outline' size='sm' onClick={handleExportToExcel} className='border-green-500 text-green-700 hover:bg-green-50'>
                                        <FileSpreadsheet className='h-4 w-4' /> Excel
                                    </Button>
                                    <Button variant='outline' size='sm' onClick={handlePrint} className='border-blue-500 text-blue-700 hover:bg-blue-50'>
                                        <Printer className='h-4 w-4' /> Print
                                    </Button>
                                </div>

                            </div>
                            <div className=' rounded-xl border'>
                                {/* Header Row */}
                                <div className='flex items-center justify-center py-2.5 text-center font-bold  shadow-sm'>
                                    Monthly Report from {fromDateFormatted || '...'} to {toDateFormatted || '...'}
                                </div>

                                <div className='px-2'>
                                    <GenericDataTable<EmployeeAbsentReportRow>
                                        {...tableProps}
                                        columns={employeeAbsentReportColumns}
                                        isLoading={isLoading}
                                        error={error}
                                        showViewOptions={false}
                                        columnPinning={{ left: ['hrme_id'], right: ['actions'] }}
                                        isPaginationRequired={true}
                                        loadingMessage='Analyzing attendance records...'
                                        noDataTitle='No records matches your criteria'
                                        noDataDescription='Try adjusting your category, department or date range filters.'
                                        errorTitle='Unable to load report'
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>
                    )
                }
                {/* Data Table Section */}

            </div>
        </div>
    );
}
