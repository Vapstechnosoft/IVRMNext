'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
    getPDAReportLoadData,
    generatePDAReport
} from '@/server/pda/report/pda-report';
import type {
    IPDAReportRow,
    IPDAReportRequest,
    IPDAReportResponse,
    IPDAPaidRecord,
    IPDAAdmStudent
} from '@/types/pda/report/pda-report';
import PDAReportForm from './_components/PDAReportForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PDAReportPrint from './_components/PDAReportPrint';

export interface IGroupedReport {
    stu_id: number;
    conces: number;
    paid: number;
    tot: number;
    final: number;
    stu_rpt: IPDAReportRow[];
    donation: IPDAReportRow[];
    fees: IPDAReportRow[];
    other: IPDAReportRow[];
    donationtotal: number;
    feestotal: number;
    othertotal: number;
    studentInfo?: IPDAAdmStudent;
}

export default function PDAReportPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [loadData, setLoadData] = useState<any>(null);
    const [reportResponse, setReportResponse] = useState<IPDAReportResponse | null>(null);
    const [filters, setFilters] = useState<any>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getPDAReportLoadData();
                if (response.success && response.data) {
                    setLoadData(response.data);
                }
            } catch (error) {
                console.error('Error fetching load data:', error);
                toast.error('Failed to load initial configurations');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleFormSubmit = async (data: IPDAReportRequest & { format1: boolean }) => {
        setGenerating(true);
        setReportResponse(null);
        setFilters(data);
        try {
            const response = await generatePDAReport(data);
            if (response.success && response.data?.headwise?.$values) {
                if (response.data.headwise.$values.length > 0) {
                    setReportResponse(response.data);
                    toast.success('Report generated successfully');
                } else {
                    toast.error('No Record Found');
                }
            } else {
                toast.error('No Record Found');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const groupedReport: IGroupedReport[] = useMemo(() => {
        if (!reportResponse) return [];

        const headwise = reportResponse.headwise?.$values || [];
        const paidList = reportResponse.searcharray?.$values || [];
        const admStudents = reportResponse.admsudentslist?.$values || [];

        const studentIds = Array.from(new Set(headwise.map(h => h.AMST_Id)));

        return studentIds.map(stuId => {
            const stuRpt = headwise.filter(h => h.AMST_Id === stuId);
            const paidRecord = paidList.find(p => p.amst_Id === stuId);
            const admInfo = admStudents.find(a => a.amst_Id === stuId);

            const fees = stuRpt.filter(h =>
                h.PDAMH_HeadName === "EDN ESTABLISHMENT and ADMINISTRATION FEE" ||
                h.PDAMH_HeadName === "BOARDING CHARGES"
            );
            const donation = stuRpt.filter(h =>
                h.PDAMH_HeadName === "STAFF SALARY FUND" ||
                h.PDAMH_HeadName === "DEVELOPMENT FUND" ||
                h.PDAMH_HeadName === "BUILDING FUND"
            );
            const other = stuRpt.filter(h =>
                !fees.includes(h) && !donation.includes(h)
            );

            const feestotal = fees.reduce((sum, h) => sum + h.PDAEH_Amount, 0);
            const donationtotal = donation.reduce((sum, h) => sum + h.PDAEH_Amount, 0);
            const othertotal = other.reduce((sum, h) => sum + h.PDAEH_Amount, 0);
            const tot = stuRpt.reduce((sum, h) => sum + h.PDAEH_Amount, 0);

            const paid = paidRecord?.fsS_PaidAmount || 0;
            const conces = paidRecord?.fsS_CurrentYrCharges || 0;

            return {
                stu_id: stuId,
                conces,
                paid,
                tot,
                final: Math.abs(paid - tot),
                stu_rpt: stuRpt,
                donation,
                fees,
                other,
                donationtotal,
                feestotal,
                othertotal,
                studentInfo: admInfo
            };
        });
    }, [reportResponse]);

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-gray-500 font-medium">Loading report configurations...</p>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto space-y-10 p-6">
            <Card className="border-none shadow-2xl bg-white/60 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                <CardHeader className="border-b bg-gray-50/50 px-8 py-6">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        Statement Parameters
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <PDAReportForm
                        academicYears={loadData?.fillyear?.$values || []}
                        classes={loadData?.classlist?.$values || []}
                        onSubmit={handleFormSubmit}
                        onReset={() => window.location.reload()}
                    />
                </CardContent>
            </Card>

            {generating && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-semibold text-gray-700">Fetching records...</p>
                </div>
            )}

            {groupedReport.length > 0 && !generating && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex justify-center">
                        <Button
                            onClick={handlePrint}
                            className="h-12 px-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                        >
                            <Printer className="mr-2 h-5 w-5" />
                            Print Statement
                        </Button>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <FileText size={200} />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between border-b pb-6">
                                <h3 className="text-2xl font-bold text-gray-800">Preview</h3>
                                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full font-bold text-sm">
                                    {groupedReport.length} Students Grouped
                                </div>
                            </div>

                            <p className="text-gray-500 italic">
                                Scroll down to see the print-optimized view or click "Print Statement" to generate the official document.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Print View */}
            {(isPrinting || groupedReport.length > 0) && (
                <div className={isPrinting ? "block" : "hidden"}>
                    <PDAReportPrint
                        reportData={groupedReport}
                        filters={filters}
                        year={loadData?.fillyear?.$values.find((y: any) => y.asmaY_Id === filters?.ASMAY_Id)?.asmaY_Year}
                    />
                </div>
            )}
        </div>
    );
}
