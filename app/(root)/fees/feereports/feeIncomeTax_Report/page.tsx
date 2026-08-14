'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { numberToWords } from '@/lib/utils';
import { IFeeIncomeTaxReportResult } from '@/types/fees/reports/FeeIncomeTax_Report';
import { Printer, X } from 'lucide-react';
import { useRef, useState } from 'react';
import FeeIncomeTaxForm from './components/feeIncomeTax_Form';
import FeeIncomeTaxReport from './components/feeIncomeTax_report';

export default function FeeIncomeTaxReportPage() {
    const [reportData, setReportData] = useState<IFeeIncomeTaxReportResult[]>([]);
    const [showReport, setShowReport] = useState(false);

    const handleReportGenerated = (data: IFeeIncomeTaxReportResult[]) => {
        setReportData(data);
        setShowReport(true);
    };

    const handleCloseReport = () => {
        setShowReport(false);
    };
    const handleResetForm = () => {
        setReportData([]);
        setShowReport(false);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <Card className='shadow-lg'>
                <CardContent className='p-6'>
                    <FeeIncomeTaxForm onReportGenerated={handleReportGenerated} onReset={handleResetForm} />
                </CardContent>
            </Card>

            {showReport && reportData.length > 0 && (
                <FeeIncomeTaxReport data={reportData} onClose={handleCloseReport} />
            )}
        </div>
    );
}
