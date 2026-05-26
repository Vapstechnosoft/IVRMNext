'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useBookCirculationReportSearch } from '@/hooks/library/reports/useBookCirculationReport';
import type { IBookCirculationReportGridData, IBookCirculationReportRequest } from '@/types/library/reports/book-circulation-report';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getColumns } from './_components/columns';
import { ReportForm } from './_components/report-form';

export default function BookCirculationReportPage() {
    const [view, setView] = useState<'form' | 'grid'>('form');
    const [reportData, setReportData] = useState<IBookCirculationReportGridData[]>([]);
    const [memberType, setMemberType] = useState<string>('Student');

    const searchMutation = useBookCirculationReportSearch();

    const handleSearch = (data: IBookCirculationReportRequest) => {
        setMemberType(data.AGType);
        searchMutation.mutate(data, {
            onSuccess: (response) => {
                // response is now the array directly from the server action
                const list = Array.isArray(response) ? response : [];
                setReportData(list);
                if (list.length > 0) {
                    setView('grid');
                } else {
                    toast.info('No records found for the selected criteria');
                }
            }
        });
    };

    const handlePrint = () => {
        if (reportData.length > 0) {
            window.print();
        }
    };

    const handleExport = () => {
        if (reportData.length > 0) {
        }
    };

    return (
        <div className='space-y-4 print:p-0'>
            <CollapsibleSection
                title='Book Circulation Report: Form'
                isOpen={view === 'form'}
                onToggle={() => setView(view === 'form' ? 'grid' : 'form')}
                defaultOpen={true}
                className='print:hidden'>
                <ReportForm
                    onSearch={handleSearch}
                    isLoading={searchMutation.isPending}
                    onPrint={handlePrint}
                    onExport={handleExport}
                    hasData={reportData.length > 0}
                />
            </CollapsibleSection>

            {reportData.length > 0 && (
                <div className='mx-auto max-w-5xl overflow-hidden rounded-sm border bg-white shadow-sm'>
                    {/* Header Bar - Standardized Branded Blue */}
                    <div className='flex items-center justify-between bg-[#4255a7] px-4 py-2'>
                        <h2 className='font-bold text-sm text-white uppercase tracking-wider'>Book Circulation Report</h2>
                    </div>
                    {/* Orange accent line */}
                    <div className='h-1 bg-[#f47a1f]' />

                    <div className='space-y-4 p-4'>
                        {/* Records Count & Search Row */}
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <span className='font-bold text-slate-700 text-xs'>Total Grid Records :</span>
                                <span className='rounded-full bg-slate-500 px-2 py-0.5 font-bold text-[10px] text-white'>
                                    {reportData.length}
                                </span>
                            </div>
                            <div className='relative w-64'>
                                <Search className='-translate-y-1/2 absolute top-1/2 left-2 h-3.5 w-3.5 text-slate-400' />
                                <input
                                    type='text'
                                    placeholder='search here...'
                                    className='w-full rounded-sm border py-1.5 pr-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-[#3f51b5]'
                                />
                            </div>
                        </div>

                        <GenericDataTable columns={getColumns(memberType)} data={reportData} isLoading={false} />
                    </div>
                </div>
            )}
        </div>
    );
}
