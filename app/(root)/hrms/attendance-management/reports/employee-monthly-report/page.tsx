'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useEmployeeMonthlyReport } from '@/hooks/hrms/attendance-management/useReports';
import { exportToExcel } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { FileSpreadsheet, Printer, X } from 'lucide-react';
import { useState, useMemo, use, useRef, useEffect } from 'react';
import AddEmployeeMonthlyReportForm from './_components/add-from';
import type { MonthlyRow } from './_components/columns';
import {
    employeeMonthlyReportBaseColumns,
    getDynamicDateColumns,
    summaryColumns,
    formatOneColumns,
    getFormatOneEmployeeColumns,
    getStatusBadge
} from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeMonthlyReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const [currentSearchParams, setCurrentSearchParams] = useState<Record<string, string | string[] | undefined>>(searchParams);
    const { data: response, isLoading, error } = useEmployeeMonthlyReport(currentSearchParams);

    return (
        <FormProvider<MonthlyRow>>
            <EmployeeMonthlyReportPageContent
                response={response}
                isLoading={isLoading}
                error={error}
                searchParams={currentSearchParams}
                onSearchParamsChange={setCurrentSearchParams}
            />
        </FormProvider>
    );
}

function FormSections({ searchParams, onSearchParamsChange }: { searchParams?: any; onSearchParamsChange?: (params: Record<string, string | string[] | undefined>) => void }) {
    const { closeAddForm, addFormRef } = useFormContext<MonthlyRow>();

    return (
        <div ref={addFormRef}>
            <CollapsibleSection
                title='Generate Employee Monthly Report'
                description='Fill in the details below to generate the report'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='slide-in-from-top-4 animate-in shadow-lg duration-300 mt-10'>
                <AddEmployeeMonthlyReportForm
                    onSuccess={closeAddForm}
                    searchParams={searchParams}
                    onSearchParamsChange={onSearchParamsChange}
                />
            </CollapsibleSection>
        </div>
    );
}

function EmployeeMonthlyReportPageContent({
    response,
    isLoading,
    error,
    searchParams,
    onSearchParamsChange
}: {
    response: any;
    isLoading: boolean;
    error: any;
    searchParams?: any;
    onSearchParamsChange?: (params: Record<string, string | string[] | undefined>) => void;
}) {
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const tableRef = useRef<HTMLDivElement>(null);

    const reportOptions = useMemo(() => {
        const opt = searchParams?.reportOptions || response?.reportOptions;
        return Array.isArray(opt) ? opt : opt ? [opt] : [];
    }, [searchParams?.reportOptions, response?.reportOptions]);

    const isFormatOne = useMemo(() => reportOptions.includes('Format One'), [reportOptions]);

    // Data Processing
    const processedData = useMemo(() => {
        if (!response) return [];
        
        const rawData = Array.isArray(response?.data) 
            ? response.data 
            : (response?.data?.$values ? response.data.$values : (Array.isArray(response) ? response : []));
            
        if (!Array.isArray(rawData) || rawData.length === 0) return [];

        const employees = rawData.map((emp: any) => {
            let attendance = {};
            if (typeof emp.attendance_data === 'string' && emp.attendance_data) {
                try {
                    const parsed = JSON.parse(emp.attendance_data);
                    attendance = parsed.daily_attendance || {};
                } catch (e) {
                    console.error('Failed to parse attendance_data', e);
                }
            } else if (emp.attendance_data?.daily_attendance) {
                attendance = emp.attendance_data.daily_attendance;
            }

            const flatEmp = { ...emp };
            Object.entries(attendance).forEach(([date, status]) => {
                flatEmp[`attendance_${date}`] = status;
            });
            return flatEmp;
        });

        if (isFormatOne) {
            // Transform to Date Rows
            const dateMap: Record<string, any> = {};
            employees.forEach((emp: any) => {
                let attendance = {};
                if (typeof emp.attendance_data === 'string' && emp.attendance_data) {
                    try {
                        const parsed = JSON.parse(emp.attendance_data);
                        attendance = parsed.daily_attendance || {};
                    } catch (e) { /* noop */ }
                } else if (emp.attendance_data?.daily_attendance) {
                    attendance = emp.attendance_data.daily_attendance;
                }

                Object.entries(attendance).forEach(([date, status]) => {
                    if (!dateMap[date]) dateMap[date] = { date };
                    dateMap[date][`emp_${emp.hrme_id}`] = status;
                });
            });

            return Object.values(dateMap).sort((a: any, b: any) => a.date.localeCompare(b.date));
        }

        return employees;
    }, [response?.data, isFormatOne]);

    console.log('Processed Data:', processedData);
    // Columns Generation
    const columns = useMemo(() => {
        const rawData = Array.isArray(response?.data) 
            ? response.data 
            : (response?.data?.$values ? response.data.$values : (Array.isArray(response) ? response : []));
            
        if (!Array.isArray(rawData) || rawData.length === 0) return employeeMonthlyReportBaseColumns;

        if (isFormatOne) {
            const employees = rawData.map((emp: any) => ({
                ecode: emp.ecode,
                ename: emp.ename,
                hrme_id: emp.hrme_id
            }));
            return [...formatOneColumns, ...getFormatOneEmployeeColumns(employees)];
        }

        // Collect all unique dates
        const allDatesSet = new Set<string>();
        rawData.forEach((emp: any) => {
            let attendance = {};
            if (typeof emp.attendance_data === 'string' && emp.attendance_data) {
                try {
                    const parsed = JSON.parse(emp.attendance_data);
                    attendance = parsed.daily_attendance || {};
                } catch (e) { /* noop */ }
            } else if (emp.attendance_data?.daily_attendance) {
                attendance = emp.attendance_data.daily_attendance;
            }
            Object.keys(attendance).forEach((d) => allDatesSet.add(d));
        });

        const sortedDates = Array.from(allDatesSet).sort();
        const dateCols = getDynamicDateColumns(sortedDates);

        // Filter summary columns based on options
        const activeSummaryCols = summaryColumns.filter((col: any) => {
            if (col.accessorKey === 'hwkdays') return reportOptions.includes('Total Working Days');
            if (col.accessorKey === 'tpdays') return true; // Show present days by default or if needed
            return true;
        });

        return [...employeeMonthlyReportBaseColumns, ...dateCols, ...activeSummaryCols];
    }, [response?.data, isFormatOne, reportOptions]);

    const tableProps = useDataTableProps({ ...response, data: processedData });

    const handleRowSelectionChange = (rows: any[]) => {
        setSelectedRows(rows);
    };

    const handleExportToExcel = () => {
        if (selectedRows.length === 0) return;

        const exportData = selectedRows.map((row, index) => {
            const exportRow: Record<string, any> = { 'Sl.No': index + 1 };

            columns.forEach((col: any) => {
                if (col.id === 'select' || col.accessorKey === 'slNo' || !col.accessorKey) return;

                const header = typeof col.header === 'string' ? col.header : (col.title || col.accessorKey);
                let value = row[col.accessorKey];

                if (col.accessorKey === 'hrme_doj') value = value ? format(parseISO(value), 'dd-MM-yyyy') : '';
                if (col.accessorKey === 'date') value = value ? format(parseISO(value), 'dd-MM-yyyy') : '';

                exportRow[header] = value ?? '';
            });

            return exportRow;
        });

        exportToExcel(exportData, 'Employee_Monthly_Report');
    };

    const handlePrint = () => {
        const rowsToPrint = selectedRows.length > 0 ? selectedRows : processedData;

        const visibleColumns = columns.filter((col: any) => col.accessorKey && col.accessorKey !== 'slNo');

        const headerTitles = visibleColumns.map((col: any) => {
            if (col.accessorKey === 'ecode') return 'Emp. Code';
            if (col.accessorKey === 'ename') return 'Employee Name';
            if (col.accessorKey === 'designation') return 'Designation';
            if (col.accessorKey === 'hrme_doj') return 'DOJ';
            if (col.accessorKey === 'hwkdays') return 'Working Days';
            if (col.accessorKey === 'tpdays') return 'Present Days';
            if (col.accessorKey?.startsWith('attendance_')) {
                const date = col.accessorKey.replace('attendance_', '');
                return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            }
            if (col.accessorKey?.startsWith('emp_')) return col.accessorKey;
            return col.accessorKey || '';
        });

        const formatCellValue = (row: any, accessorKey: string) => {
            const value = row[accessorKey];
            if (accessorKey === 'hrme_doj') {
                return value ? format(parseISO(value), 'dd-MM-yyyy') : '';
            }
            if (accessorKey?.startsWith('attendance_') || accessorKey?.startsWith('emp_')) {
                const normalizedValue = value != null ? String(value).trim() : '';
                if (normalizedValue === '1') return 'P';
                if (normalizedValue === '0') return 'A';
                if (normalizedValue === '2') return 'H';
                if (normalizedValue === '3') return 'AL';
                if (normalizedValue === '4') return 'OD';
                if (normalizedValue === '5') return 'HD';
                return normalizedValue;
            }
            return value ?? '';
        };

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <html>
            <head>
                <title>Employee Monthly Report</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; font-size: 10px; }
                    th, td { border: 1px solid #ccc; padding: 4px; text-align: center; }
                    th { background: #f4f4f4; }
                    td { white-space: nowrap; }
                </style>
            </head>
            <body>
                <h2 style="text-align: center;">Employee Monthly Report (${response?.message || ''})</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Sl.No</th>
                            ${headerTitles.map((title) => `<th>${title}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsToPrint.map((row: any, idx: number) => `
                            <tr>
                                <td>${idx + 1}</td>
                                ${visibleColumns.map((col: any) => `<td>${formatCellValue(row, col.accessorKey)}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    useEffect(() => {
        if (processedData?.length > 0 && tableRef.current) {
            setTimeout(() => {
                tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [processedData?.length]);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <FormSections searchParams={searchParams} onSearchParamsChange={onSearchParamsChange} />

                {processedData?.length > 0 && (
                    <div ref={tableRef}>
                    <CollapsibleSection  defaultOpen={true} variant='default' size='lg' className='shadow-lg' >
                        { (
                            <div className='flex items-center gap-2 rounded-lg p-4 shadow-sm'>
                                {/* <span className='font-medium text-gray-700 text-sm '>
                                    {selectedRows.length} row{selectedRows.length > 1 ? 's' : ''} selected
                                </span> */}
                                <div className='ml-auto flex items-center gap-2'>
                                    <Button variant='outline' size='sm' onClick={handleExportToExcel} className='border-green-500 text-green-700 hover:bg-green-50'>
                                        <FileSpreadsheet className='mr-2 h-4 w-4' /> Excel
                                    </Button>
                                    <Button variant='outline' size='sm' onClick={handlePrint} className='border-blue-500 text-blue-700 hover:bg-blue-50'>
                                        <Printer className='mr-2 h-4 w-4' /> Print
                                    </Button>
                                </div>
                            </div>
                        )}

                        <GenericDataTable<any>
                            {...tableProps}
                            columns={columns}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={false}
                            isPaginationRequired={false}
                            maxHeight='400px'
                            scrollable
                            onRowSelectionChange={handleRowSelectionChange}
                            loadingMessage='Loading Employee Monthly Reports...'
                            noDataTitle='No Employee Monthly Reports Found'
                        />

                    </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
