'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { feeReceiptLogo } from '@/hooks/fees/useReports';
import { numberToWords } from '@/lib/utils';
import { IFeeIncomeTaxReportResult } from '@/types/fees/reports/FeeIncomeTax_Report';
import { Printer, X } from 'lucide-react';
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import { FeeIncomeTaxPrint } from './feeIncomeTax_print';

interface FeeIncomeTaxReportProps {
    data: IFeeIncomeTaxReportResult[];
    onClose: () => void;
}

export default function FeeIncomeTaxReport({ data, onClose }: FeeIncomeTaxReportProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const { data: logoData } = feeReceiptLogo();

    const logoUrl = (logoData as any)?.data?.[0]?.asC_Logo_Path || '';

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Fee_Income_Tax_Report',
    });

    if (!data || data.length === 0) return null;

    return (
        <div className='mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <Card className='shadow-2xl border-0 overflow-hidden'>
                <div className='flex justify-end p-4 border-b bg-gray-50/50 print:hidden'>
                    <Button
                        variant='default'
                        size='sm'
                        onClick={handlePrint}
                        className='w-40 transition-all duration-200 hover:scale-105 bg-blue-500 hover:bg-blue-700 shadow-md'
                    >
                        <Printer className='mr-2 h-4 w-4' />
                        Print Report
                    </Button>
                </div>
                <CardContent className='p-0'>
                    <FeeIncomeTaxPrint ref={printRef} data={data} logoUrl={logoUrl} />
                </CardContent>
            </Card>
        </div>
    );
}
