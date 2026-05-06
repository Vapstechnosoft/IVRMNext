'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { useScheduleReport, useSendScheduleMail } from '@/hooks/admission/preadmission/useReports';
import type { IScheduleReportList, IScheduleReportDetailsResponse } from '@/types/admission/preadmission/reports';
import React, { useRef, useState, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { FileDown, Printer, Mail } from 'lucide-react';
import * as XLSX from 'xlsx';
import AddScheduleReportForm from './_components/add-from';
import { getScheduleReportColumns } from './_components/columns';
import ScheduleReportPrint from './_components/report-print';
import SessionReportPrint from './_components/session-report-print';
import VerificationListPrint from './_components/verification-list-print';
import RegistrationReceiptPrint from './_components/registration-receipt-print';
import { getScheduleReportDetails } from '@/server/admission/preadmission/reports/schedule_report';
import { format } from 'date-fns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Schedule Report Page - Entry point for the module.
 */
export default function ScheduleReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = React.use(props.searchParams);
    const [filterPayload, setFilterPayload] = useState<any>(null);
    const [isSearched, setIsSearched] = useState(false);

    const { data: response, isLoading, error } = useScheduleReport(filterPayload, searchParams, isSearched);

    return (
        <FormProvider<IScheduleReportList>>
            <ScheduleReportPageContent
                response={response}
                isLoading={isLoading}
                error={error}
                onFilterChange={(payload, reset) => {
                    if (reset) {
                        setIsSearched(false);
                        setFilterPayload(null);
                    } else {
                        setFilterPayload(payload);
                        setIsSearched(true);
                    }
                }}
                isSearched={isSearched}
                filterPayload={filterPayload}
            />
        </FormProvider>
    );
}

function ScheduleReportPageContent({
    response,
    isLoading,
    error,
    onFilterChange,
    isSearched,
    filterPayload
}: {
    response: any;
    isLoading: boolean;
    error: any;
    onFilterChange?: (payload: any, reset?: boolean) => void;
    isSearched: boolean;
    filterPayload: any;
}) {
    const [printMode, setPrintMode] = useState<'standard' | 'session' | 'verification' | 'receipt'>('standard');
    const [allData, setAllData] = useState<IScheduleReportList[]>([]);
    const [isFetchingAll, setIsFetchingAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState<IScheduleReportList[]>([]);
    
    const printRef = useRef<HTMLDivElement>(null);
    const sendMailMutation = useSendScheduleMail();

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Schedule_Report_${printMode}_${format(new Date(), 'yyyyMMdd')}`,
    });

    const studentsList = useMemo(() => {
        if (!response) return [];
        // Case 1: Direct array
        if (Array.isArray(response)) return response;
        // Case 2: Object with known list properties
        const list = 
            response.searchstudentlist || 
            response.StudentList || 
            response.searchStudentList || 
            response.student || 
            response.Student || 
            response.students || 
            response.Students || 
            response.$values;
        if (Array.isArray(list)) return list;
        // Case 3: Nested data property (standard ApiResponse structure)
        if (response.data) {
            if (Array.isArray(response.data)) return response.data;
            if (Array.isArray(response.data.$values)) return response.data.$values;
            const nestedList = 
                response.data.searchstudentlist || 
                response.data.StudentList || 
                response.data.searchStudentList || 
                response.data.student || 
                response.data.Student || 
                response.data.students || 
                response.data.Students;
            if (Array.isArray(nestedList)) return nestedList;
        }
        return [];
    }, [response]);

    const normalizeList = (res: any) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        const list = res.searchstudentlist || res.StudentList || res.student || res.Student || res.students || res.Students || res.$values;
        if (Array.isArray(list)) return list;
        if (res.data) {
            if (Array.isArray(res.data)) return res.data;
            const nested = res.data.searchstudentlist || res.data.StudentList || res.data.student || res.data.Student || res.data.students || res.data.Students;
            if (Array.isArray(nested)) return nested;
        }
        return [];
    };

    const handlePrintAction = async (mode: 'standard' | 'session' | 'verification' | 'receipt', useSelected = false) => {
        try {
            setPrintMode(mode);
            if (useSelected) {
                if (selectedRows.length === 0) {
                    toast.error('Please select at least one student from the table to print receipts');
                    return;
                }
                setAllData(selectedRows);
                // Give a small delay for state update and re-render in the hidden container
                setTimeout(() => handlePrint(), 300);
                return;
            }

            setIsFetchingAll(true);
            toast.loading('Fetching all records for print...', { id: 'print-loading' });

            // Fetch full list without pagination for printing all records
            const fullResponse = (await getScheduleReportDetails(filterPayload)) as any;
            const fullList = normalizeList(fullResponse);

            if (fullList && fullList.length > 0) {
                setAllData(fullList);
                setTimeout(() => {
                    handlePrint();
                    toast.dismiss('print-loading');
                    setIsFetchingAll(false);
                }, 800);
            } else {
                toast.error('No records found to print');
                toast.dismiss('print-loading');
                setIsFetchingAll(false);
            }
        } catch (error: any) {
            toast.error(error.message || 'Print generation failed');
            toast.dismiss('print-loading');
            setIsFetchingAll(false);
        }
    };

    const handleResendMail = async () => {
        if (selectedRows.length === 0) {
            toast.error('Please select at least one student to resend mail');
            return;
        }

        try {
            toast.loading('Sending emails...', { id: 'mail-loading' });
            const payload = {
                smsMailStudentDetailst: selectedRows
            };
            const res = await sendMailMutation.mutateAsync(payload);
            toast.dismiss('mail-loading');
            
            if (res && res.success === true) {
                toast.success(res.message || 'Emails sent successfully to selected students');
            } else {
                toast.error(res?.message || 'Failed to send emails. Please try again.');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error occurred while sending mail');
            toast.dismiss('mail-loading');
        }
    };

    const exportToExcel = () => {
        const dataToExport = studentsList;
        if (dataToExport.length === 0) {
            toast.error('No records available to export');
            return;
        }

        const excelData = dataToExport.map((row: any, index: number) => {
            const scheduleDate = row.ScheduleDate || row.scheduledate;
            return {
                'SL.NO': index + 1,
                'NAME': row.name,
                'REG NO': row.regno,
                'CLASS': row.class,
                'GENDER': row.gender,
                'DATE': scheduleDate ? format(new Date(scheduleDate), 'dd-MM-yyyy') : 'N/A',
                'FROM': row.ScheduleTime || row.scheduletime || '',
                'TO': row.ScheduleTimeTo || row.scheduletimeto || '',
                'REMARKS': row.PAOTS_Remarks || row.remarks || ''
            };
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ScheduleReport');
        XLSX.writeFile(wb, `Schedule_Report_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
        toast.success('Excel file exported');
    };

    const columns = getScheduleReportColumns();

    return (
        <div className='min-h-screen bg-slate-50/50'>
            <div className='container mx-auto space-y-4 py-4 px-4'>
                <div className='flex items-center gap-2 mb-2'>
                    <h1 className='text-xl font-bold text-slate-700 tracking-tight uppercase'>PREADMISSION</h1>
                </div>

                <Card className='shadow-md border-slate-200 overflow-hidden bg-white'>
                    <CardHeader className='bg-white border-b py-2 px-6'>
                        <CardTitle className='text-sm font-bold text-blue-900 uppercase tracking-widest'>
                            SCHEDULE REPORT
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='p-6'>
                        <AddScheduleReportForm onFilterChange={onFilterChange} />
                    </CardContent>
                </Card>

                {isSearched && (
                    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-white p-4 rounded-lg shadow-sm border border-slate-100'>
                            <Button 
                                variant='outline' 
                                onClick={() => handlePrintAction('standard')} 
                                className='bg-blue-50/50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-colors h-9 text-xs font-bold uppercase'
                            >
                                <Printer className='mr-2 h-3 w-3' /> Standard Report
                            </Button>
                            <Button 
                                variant='outline' 
                                onClick={() => handlePrintAction('session')} 
                                className='bg-indigo-50/50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 hover:text-indigo-800 transition-colors h-9 text-xs font-bold uppercase'
                            >
                                <Printer className='mr-2 h-3 w-3' /> Session Report
                            </Button>
                            <Button 
                                variant='outline' 
                                onClick={() => handlePrintAction('verification')} 
                                className='bg-emerald-50/50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-800 transition-colors h-9 text-xs font-bold uppercase'
                            >
                                <Printer className='mr-2 h-3 w-3' /> Verification List
                            </Button>
                            <Button 
                                variant='outline' 
                                onClick={() => handlePrintAction('receipt', true)} 
                                className='bg-purple-50/50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800 transition-colors h-9 text-xs font-bold uppercase'
                            >
                                <Printer className='mr-2 h-3 w-3' /> Receipt (Selected)
                            </Button>
                            
                            <Button 
                                variant='outline' 
                                onClick={handleResendMail} 
                                className='bg-rose-50/50 hover:bg-rose-100 border-rose-200 text-rose-700 hover:text-rose-800 transition-colors h-9 text-xs font-bold uppercase'
                            >
                                <Mail className='mr-2 h-3 w-3' /> Resend Mail
                            </Button>
                            <Button 
                                variant='outline' 
                                onClick={exportToExcel} 
                                className='bg-orange-50/50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:text-orange-800 transition-colors h-9 text-xs font-bold uppercase'
                            >
                                <FileDown className='mr-2 h-3 w-3' /> Export Excel
                            </Button>
                        </div>

                        <div className='bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden'>
                            <GenericDataTable<IScheduleReportList>
                                data={studentsList}
                                totalItems={studentsList.length}
                                columns={columns}
                                isLoading={isLoading}
                                error={error}
                                onRowSelectionChange={(rows) => setSelectedRows(rows as IScheduleReportList[])}
                                loadingMessage='Fetching schedule records...'
                                noDataTitle='No Records Found'
                                noDataDescription='Adjust your filters and try again'
                                isPaginationRequired={true}
                                showViewOptions={true}
                            />
                        </div>

                        {/* Hidden Print Container */}
                        <div style={{ display: 'none' }}>
                            <div ref={printRef} className='print-container'>
                                {printMode === 'standard' && <ScheduleReportPrint data={allData} />}
                                {printMode === 'session' && (
                                    <SessionReportPrint 
                                        data={allData} 
                                        academicYear={allData[0]?.Syllabus || ''} 
                                        scheduleName={filterPayload?.schedulename}
                                        scheduleTime={allData[0]?.ScheduleTime || allData[0]?.scheduletime}
                                        scheduleDate={allData[0]?.ScheduleDate || allData[0]?.scheduledate}
                                    />
                                )}
                                {printMode === 'verification' && (
                                    <VerificationListPrint 
                                        data={allData}
                                        scheduleName={filterPayload?.schedulename}
                                        scheduleTime={allData[0]?.ScheduleTime || allData[0]?.scheduletime}
                                        scheduleDate={allData[0]?.ScheduleDate || allData[0]?.scheduledate}
                                    />
                                )}
                                {printMode === 'receipt' && <RegistrationReceiptPrint data={allData} />}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
