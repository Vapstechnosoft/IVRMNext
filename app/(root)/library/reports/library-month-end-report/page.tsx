'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useLibraryMonthEndReportSearch } from '@/hooks/library/reports/useLibraryMonthEndReport';
import type { ILibraryMonthEndReportGridData, ILibraryMonthEndReportRequest } from '@/types/library/reports/library-month-end-report';
import { useState } from 'react';
import { LibraryMonthEndReportColumns, type MonthEndReportDisplayData } from './_components/columns';
import { ReportForm } from './_components/report-form';

export default function LibraryMonthEndReportPage() {
    const [reportDisplayData, setReportDisplayData] = useState<MonthEndReportDisplayData[]>([]);

    const handlePrint = () => {
        window.print();
    };

    const searchMutation = useLibraryMonthEndReportSearch();

    const processData = (data: ILibraryMonthEndReportGridData[]) => {
        const processed: MonthEndReportDisplayData[] = [];
        data.forEach((ff) => {
            // Logic replicated from legacy AngularJS controller
            if (ff.TOTALBOOK >= 0) processed.push({ TNAME: 'TOTAL BOOKS', COUNT: ff.TOTALBOOK });
            if (ff.AVAILBOOK >= 0) processed.push({ TNAME: 'AVAILABLE BOOKS', COUNT: ff.AVAILBOOK });
            if (ff.PURCHASECNT >= 0) processed.push({ TNAME: 'PURCHASED BOOKS', COUNT: ff.PURCHASECNT });
            if (ff.DONATECNT >= 0) processed.push({ TNAME: 'DONATED BOOKS', COUNT: ff.DONATECNT });

            if (ff.STDISSUECNT >= 0) processed.push({ TNAME: 'STUDENT BOOK ISSUE', COUNT: ff.STDISSUECNT });
            if (ff.STDRETURNCNT >= 0) processed.push({ TNAME: 'STUDENT BOOK RETURN', COUNT: ff.STDRETURNCNT });

            if (ff.STFISSUECNT >= 0) processed.push({ TNAME: 'STAFF BOOK ISSUE', COUNT: ff.STFISSUECNT });
            if (ff.STFRETURNCNT >= 0) processed.push({ TNAME: 'STAFF BOOK RETURN', COUNT: ff.STFRETURNCNT });

            if (ff.DEPISSUECNT >= 0) processed.push({ TNAME: 'DEPARTMENT BOOK ISSUE', COUNT: ff.DEPISSUECNT });
            if (ff.DEPRETURNCNT >= 0) processed.push({ TNAME: 'DEPARTMENT BOOK RETURN', COUNT: ff.DEPRETURNCNT });

            if (ff.GSTISSUECNT >= 0) processed.push({ TNAME: 'GUEST BOOK ISSUE', COUNT: ff.GSTISSUECNT });
            if (ff.GSTRETURNCNT >= 0) processed.push({ TNAME: 'GUEST BOOK RETURN', COUNT: ff.GSTRETURNCNT });

            if (ff.FINEAMOUNT >= 0) processed.push({ TNAME: 'TOTAL FINE', COUNT: ff.FINEAMOUNT });

            if (ff.SMSCOUNT >= 0) processed.push({ TNAME: 'SMS', COUNT: ff.SMSCOUNT });
            if (ff.EMAILCOUNT >= 0) processed.push({ TNAME: 'EMAIL', COUNT: ff.EMAILCOUNT });
        });
        return processed;
    };

    const handleSearch = (data: ILibraryMonthEndReportRequest) => {
        searchMutation.mutate(data, {
            onSuccess: (response: any) => {
                const rawGridData = (response || []) as ILibraryMonthEndReportGridData[];
                const displayData = processData(rawGridData);
                setReportDisplayData(displayData);
            }
        });
    };

    return (
        <div className='space-y-4'>
            <CollapsibleSection title='Month End Report' defaultOpen={true}>
                <ReportForm
                    onSearch={handleSearch}
                    onPrint={reportDisplayData.length > 0 ? handlePrint : undefined}
                    isLoading={searchMutation.isPending}
                />
            </CollapsibleSection>

            {reportDisplayData.length > 0 && (
                <div className='print-container'>
                    <style type="text/css" media="print">
                        {`
                            @page { size: portrait; margin: 10mm; }
                            body * { visibility: hidden; }
                            .print-container, .print-container * { visibility: visible; }
                            .print-container {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                            }
                            /* Hide interactive elements and scrolling areas */
                            .print-container button { display: none !important; }
                            .print-container .overflow-auto, .print-container .overflow-x-auto, .print-container .max-h-[500px] { 
                                overflow: visible !important; 
                                max-height: none !important;
                            }
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                            th, td { border: 1px solid #000 !important; padding: 6px; text-align: left; font-size: 12px; color: #000; }
                            th { background-color: #e5e7eb !important; font-weight: bold; -webkit-print-color-adjust: exact; }
                            tr { page-break-inside: avoid; }
                        `}
                    </style>
                    <CollapsibleSection title='Library Month End Report List' defaultOpen={true}>
                        <div className="print-title hidden print:block text-center text-xl font-bold mb-4 uppercase">
                            Library Month End Report
                        </div>
                        <GenericDataTable columns={LibraryMonthEndReportColumns} data={reportDisplayData} isLoading={false} />
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
