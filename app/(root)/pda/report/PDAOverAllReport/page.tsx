'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    getPDAOverAllLoadData,
    generatePDAOverAllReport
} from '@/server/pda/report/pda-overall-report';
import type {
    IPDAOverAllReportRow,
    IPDAOverAllReportRequest
} from '@/types/pda/report/pda-overall-report';
import PDAOverAllReportForm from './_components/PDAOverAllReportForm';
import PDAOverAllReportGrid from './_components/PDAOverAllReportGrid';
import PDAOverAllReportPrint from './_components/PDAOverAllReportPrint';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileBarChart2 } from 'lucide-react';

export default function PDAOverAllReportPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [loadData, setLoadData] = useState<any>(null);
    const [reportDetails, setReportDetails] = useState<IPDAOverAllReportRow[]>([]);
    const [showGrid, setShowGrid] = useState(false);
    const [printData, setPrintData] = useState<IPDAOverAllReportRow[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getPDAOverAllLoadData();
                if (response.success && response.data) {
                    setLoadData(response.data);
                } else {
                    toast.error('Failed to load initial data');
                }
            } catch (error) {
                console.error('Error fetching load data:', error);
                toast.error('Error connecting to server');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleFormSubmit = async (filters: IPDAOverAllReportRequest) => {
        setGenerating(true);
        setShowGrid(false);
        try {
            const response = await generatePDAOverAllReport(filters);
            if (response.success && response.data?.headwise?.$values) {
                const data = response.data.headwise.$values;
                if (data.length > 0) {
                    setReportDetails(data);
                    setShowGrid(true);
                    toast.success(`Found ${data.length} records`);
                } else {
                    toast.error('No records found for the selected criteria');
                    setReportDetails([]);
                }
            } else {
                toast.error('No Record Found');
                setReportDetails([]);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    const handlePrint = (selectedRecords: IPDAOverAllReportRow[]) => {
        setPrintData(selectedRecords);
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 500);
    };

    const printTotals = React.useMemo(() => {
        return printData.reduce((acc, row) => ({
            opening: acc.opening + (row.Opening_Balance || 0),
            wallet: acc.wallet + (row.Wallet_Amount || 0),
            spent: acc.spent + (row.Spent_Amount || 0),
            balance: acc.balance + (row.Balance_Amount || 0),
        }), { opening: 0, wallet: 0, spent: 0, balance: 0 });
    }, [printData]);

    if (loading) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-gray-500 animate-pulse font-medium">Loading report configurations...</p>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto space-y-10 p-6">
            <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
            </div>

            <Card className="border-none shadow-2xl bg-white/60 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                <CardHeader className="border-b bg-gray-50/50 px-8 py-6">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        Report Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <PDAOverAllReportForm
                        academicYears={loadData?.fillyear?.$values || []}
                        classes={loadData?.classlist?.$values || []}
                        onSubmit={handleFormSubmit}
                        onReset={handleReset}
                    />
                </CardContent>
            </Card>

            {generating && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 animate-in fade-in duration-300">
                    <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-primary/20"></div>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">Processing records, please wait...</p>
                </div>
            )}

            {showGrid && !generating && (
                <Card className="border-none shadow-2xl bg-white animate-in slide-in-from-bottom-8 duration-700">
                    <CardHeader className="border-b bg-gray-50/50 px-8 py-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                            Report Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <PDAOverAllReportGrid
                            data={reportDetails}
                            onPrint={handlePrint}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Print View Component */}
            {isPrinting && (
                <PDAOverAllReportPrint
                    data={printData}
                    totals={printTotals}
                />
            )}
        </div>
    );
}
