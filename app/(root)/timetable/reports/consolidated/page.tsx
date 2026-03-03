'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getConsolidatedReportDetails } from '@/server/timetable/reports/consolidated';
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from '@tanstack/react-table';
import { Download, FileDown, Printer, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import ConsolidatedForm from './_components/consolidated-form';
import ConsolidatedReportGrid from './_components/consolidated-report-grid';

export default function ConsolidatedReportPage() {
    const [initialData, setInitialData] = useState<any>({});
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<string>('');
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await getConsolidatedReportDetails({});
                if (data) setInitialData(data);
            } catch (error) {
                // Keep empty initialData to show form
            }
        };
        fetchDetails();
    }, []);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Consolidated_Report_${reportType}`,
    });

    const handleFormSubmit = async (payload: any) => {
        if (payload.CLEAR) {
            setReportData([]);
            return;
        }

        setLoading(true);
        setReportType(payload.TYPE);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        generateMockData(payload.TYPE);
        setLoading(false);
    };

    const generateMockData = (type: string) => {
        const staffNames = [
            'Aarthi Rao', 'Aksa Mariyam Varghese', 'Alka Saksena', 'Alousia Jennifer',
            'Alphonsa Mahesh', 'Angelina Judith White', 'Anita Janet Valerine Pereira',
            'Anitha C', 'Anitha D Souza', 'Anitha Saldanha', 'Bhavya Hegde', 'Deepa M',
            'Gowri Sankar', 'Hema Malini', 'Indira Gandhi', 'Jyothi Lakshmi'
        ];
        const staffAbbrs = ['Aarthi', 'Aksa', 'Alka', 'Alousla', 'Alphonsa', 'Angelina', 'Anita J V P', 'Anitha C', 'Anitha D', 'Anitha S', 'Bhavya', 'Deepa', 'Gowri', 'Hema', 'Indira', 'Jyothi'];

        // Shuffle staff names to make it "change randomly"
        const shuffledStaff = [...staffNames].sort(() => Math.random() - 0.5);
        const limit = Math.floor(Math.random() * 10) + 10; // Random length between 10 and 20

        const data = shuffledStaff.slice(0, limit).map((name) => {
            const mon = Math.floor(Math.random() * 8);
            const tue = Math.floor(Math.random() * 8);
            const wed = Math.floor(Math.random() * 8);
            const thu = Math.floor(Math.random() * 8);
            const fri = Math.floor(Math.random() * 8);
            const total = mon + tue + wed + thu + fri;

            return {
                name: name,
                abbr: staffAbbrs[staffNames.indexOf(name)],
                mon,
                tue,
                wed,
                thu,
                fri,
                total
            };
        });

        setReportData(data);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Consolidated Report' defaultOpen={true}>
                <ConsolidatedForm initialData={initialData} onSubmit={handleFormSubmit} />
            </CollapsibleSection>

            {loading && (
                <div className='flex items-center justify-center p-12'>
                    <RefreshCw className='h-8 w-8 animate-spin text-purple-600' />
                    <span className='ml-3 font-medium text-purple-800 text-lg'>Processing Report Data...</span>
                </div>
            )}

            {reportData.length > 0 && !loading && (
                <CollapsibleSection
                    title={`${reportType.replace('_', ' ')} Consolidated Report`}
                    defaultOpen={true}
                >
                    <div className='p-2' ref={componentRef}>
                        <ConsolidatedReportGrid
                            reportData={reportData}
                            onPrint={handlePrint}
                            reportType={reportType}
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}

