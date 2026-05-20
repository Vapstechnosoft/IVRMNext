'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { usePurchaseDonateReportSearch } from '@/hooks/library/reports/usePurchaseDonateReport';
import type { IPurchaseDonateReportGridData, IPurchaseDonateReportRequest } from '@/types/library/reports/purchase-donate-report';
import { useState } from 'react';
import { columns } from './_components/columns';
import { ReportForm } from './_components/report-form';
import { Search } from 'lucide-react';
import { exportToExcel } from '@/lib/utils';

export default function PurchaseDonateReportPage() {
    const [reportData, setReportData] = useState<IPurchaseDonateReportGridData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const searchMutation = usePurchaseDonateReportSearch();

    const handleSearch = (data: IPurchaseDonateReportRequest) => {
        searchMutation.mutate(data, {
            onSuccess: (response) => {
                // server returns the data array directly
                setReportData(Array.isArray(response) ? response : []);
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
            exportToExcel(reportData, 'Purchase_Donate_Report');
        }
    };

    const filteredData = reportData.filter((item) =>
        Object.values(item).some((val) =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className='space-y-6 print:p-0 print:m-0'>
            <div className="print:hidden">
                <ReportForm 
                    onSearch={handleSearch} 
                    isLoading={searchMutation.isPending} 
                    onPrint={handlePrint}
                    onExport={handleExport}
                    onCancel={() => {
                        setReportData([]);
                        setSearchTerm('');
                    }}
                    hasData={reportData.length > 0}
                />
            </div>

            {reportData.length > 0 && (
                <div className="mx-auto max-w-5xl border rounded-sm overflow-hidden shadow-sm bg-white print:max-w-none print:border-none print:shadow-none print:m-0 print:p-0">
                    {/* Header Bar - Exactly like Reference */}
                    <div className="bg-[#3f51b5] px-4 py-2 flex items-center justify-between print:bg-white print:border-b-2 print:border-black">
                        <h2 className="text-white font-bold text-sm uppercase tracking-wider print:text-black print:text-lg">Purchase / Donate Reports</h2>
                    </div>
                    {/* Orange accent line - hide on print or make black */}
                    <div className="h-1 bg-[#ff9800] print:hidden" />
                    
                    <div className="p-4 space-y-4 print:p-0 print:pt-4">
                        {/* Records Count & Search Row */}
                        <div className="flex items-center justify-between print:hidden">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700">Total Grid Records :</span>
                                <span className="bg-slate-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    {reportData.length}
                                </span>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="search here..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 border rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-[#3f51b5]"
                                />
                            </div>
                        </div>

                        <div className="print:block">
                            <GenericDataTable 
                                columns={columns} 
                                data={filteredData} 
                                isLoading={false} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
