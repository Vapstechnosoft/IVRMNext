'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBookArrivalReportSearch } from '@/hooks/library/reports/useBookArrivalReport';
import { exportToExcel } from '@/lib/export-to-file';
import type { IBookArrivalReportGridData, IBookArrivalReportRequest } from '@/types/library/reports/book-arrival-report';
import { useState } from 'react';
import { BookArrivalReportColumns } from './columns';
import { ReportForm } from './report-form';

interface BookArrivalReportClientProps {
    initialData: any;
}

export function BookArrivalReportClient({ initialData }: BookArrivalReportClientProps) {
    const [view, setView] = useState<'form' | 'grid'>('form');
    const [reportData, setReportData] = useState<IBookArrivalReportGridData[]>([]);

    const searchMutation = useBookArrivalReportSearch();

    const handleSearch = (data: IBookArrivalReportRequest) => {
        searchMutation.mutate(data, {
            onSuccess: (response: any) => {
                const list = response?.data || response?.reportlist || response?.griddata || (Array.isArray(response) ? response : []);
                setReportData(Array.isArray(list) ? list : []);
                if (list?.length > 0) {
                    setView('grid');
                }
            }
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const columns = [
            { label: 'Accession No.', value: 'lmbanO_AccessionNo' },
            { label: 'Book Title', value: 'lmB_BookTitle' },
            { label: 'Department Name', value: 'lmD_DepartmentName' },
            { label: 'Author Name', value: 'authorName' },
            { label: 'Book Type', value: 'lmB_BookType' },
            { label: 'Call No', value: 'lmB_CallNo' },
            { label: 'Purchase Date', value: 'lmB_PurchaseDate' },
            { label: 'Entry Date', value: 'lmB_EntryDate' },
            { label: 'Language Name', value: 'lmL_LanguageName' }
        ];

        exportToExcel('Book_Arrival_Report', JSON.stringify(columns), JSON.stringify(reportData));
    };

    return (
        <div className='space-y-4'>
            <CollapsibleSection
                title='Book Arrival Report: Form'
                isOpen={view === 'form'}
                onToggle={() => setView(view === 'form' ? 'grid' : 'form')}
                defaultOpen={true}>
                <ReportForm
                    onSearch={handleSearch}
                    isLoading={searchMutation.isPending}
                    hasData={reportData.length > 0}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    initialData={initialData}
                />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <CollapsibleSection
                    title='Book Arrival Report Grid'
                    isOpen={view === 'grid'}
                    onToggle={() => setView(view === 'grid' ? 'form' : 'grid')}>
                    <GenericDataTable
                        columns={BookArrivalReportColumns}
                        data={reportData}
                        isLoading={false}
                        columnPinning={{ right: ['actions'] }}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
