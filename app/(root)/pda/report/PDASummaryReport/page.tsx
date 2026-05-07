'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
    getPDASummaryReportLoadData,
    generatePDASummaryReport
} from '@/server/pda/report/pda-summary-report';
import type {
    IPDASummaryReportResponse,
    IPDASummaryReportRequest,
    IPDAInvDetail,
    IPDAPdaDetail,
    IPDAObDetail,
    IPDAConcession,
    IProcessedSummaryRow
} from '@/types/pda/report/pda-summary-report';
import PDASummaryReportForm from './_components/PDASummaryReportForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileBarChart, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from '@/components/ui/table';

interface ITotalExpRecord {
    amst_id: number;
    totexp: number;
}

export default function PDASummaryReportPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [loadData, setLoadData] = useState<any>(null);
    const [reportResponse, setReportResponse] = useState<IPDASummaryReportResponse | null>(null);
    const [selectedYearName, setSelectedYearName] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getPDASummaryReportLoadData();
                if (response.success && response.data) {
                    setLoadData(response.data);
                }
            } catch (error) {
                console.error('Error fetching load data:', error);
                toast.error('Failed to load configurations');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleFormSubmit = async (data: IPDASummaryReportRequest) => {
        setGenerating(true);
        setReportResponse(null);

        const year = loadData?.fillyear?.$values.find((y: any) => y.asmaY_Id === data.ASMAY_Id);
        setSelectedYearName(year?.asmaY_Year || '');

        try {
            const response = await generatePDASummaryReport(data);
            if (response.success && response.data) {
                if (response.data.invdetails?.$values?.length > 0 ||
                    response.data.pdadetails?.$values?.length > 0) {
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

    const pdaHeads = useMemo(() => {
        return loadData?.pdaheadlist?.$values.filter((h: any) =>
            h.pdaR_RefundRemarks !== 'KANNADA COACHING' &&
            h.pdaR_RefundRemarks !== 'EXTRA STAFF SALARY'
        ) || [];
    }, [loadData]);

    const invHeads = useMemo(() => {
        return loadData?.invheadlist?.$values.filter((h: any) =>
            h.invmG_GroupName !== 'PUBLICATION SECTION'
        ) || [];
    }, [loadData]);

    const processedData = useMemo(() => {
        if (!reportResponse) return [];

        const invDetails = reportResponse.invdetails?.$values || [];
        const pdaDetails = reportResponse.pdadetails?.$values || [];
        const obDetails = reportResponse.obdetails?.$values || [];
        const concessions = reportResponse.transnumconfig?.$values || [];

        return invDetails.map(student => {
            const pdaInfo = pdaDetails.find(p => p.AMST_Id === student.AMST_Id) || ({} as IPDAPdaDetail);
            const obInfo = obDetails.find(o => o.AMST_Id === student.AMST_Id) || {
                PDAS_OBStudentDue: 0,
                PDAS_OBExcessPaid: 0,
                PDAS_CYDeposit: 0,
                PDAS_CYRefundAmt: 0
            };
            const conInfo = concessions.find(c => c.AMST_Id === student.AMST_Id) || ({} as IPDAConcession);

            // Calculate student total expenditure
            let studentTotExp = 0;
            invHeads.forEach((head: any) => {
                studentTotExp += (student[head.invmG_GroupName] || 0);
            });
            pdaHeads.forEach((head: any) => {
                studentTotExp += (pdaInfo[head.pdaR_RefundRemarks] || 0);
            });

            // Calculate balance
            const balance = (obInfo.PDAS_CYDeposit + conInfo.FSS_ConcessionAmount + obInfo.PDAS_OBExcessPaid) -
                (studentTotExp + obInfo.PDAS_OBStudentDue + obInfo.PDAS_CYRefundAmt);

            return {
                ...student,
                pdaInfo,
                obInfo,
                conInfo,
                studentTotExp,
                balance
            } as IProcessedSummaryRow;
        });
    }, [reportResponse, pdaHeads, invHeads]);

    const columnTotals = useMemo(() => {
        const totals: any = {
            studentDue: 0,
            schoolDue: 0,
            concession: 0,
            totalExp: 0,
            deposit: 0,
            balance: 0,
            refund: 0,
            pdaHeads: {},
            invHeads: {}
        };

        (processedData as IProcessedSummaryRow[]).forEach(row => {
            totals.studentDue += (row.obInfo.PDAS_OBStudentDue || 0);
            totals.schoolDue += (row.obInfo.PDAS_OBExcessPaid || 0);
            totals.concession += (row.conInfo.FSS_ConcessionAmount || 0);
            totals.totalExp += (row.studentTotExp || 0);
            totals.deposit += (row.obInfo.PDAS_CYDeposit || 0);
            totals.balance += (row.balance || 0);
            totals.refund += (row.obInfo.PDAS_CYRefundAmt || 0);

            pdaHeads.forEach((head: any) => {
                const headName = head.pdaR_RefundRemarks;
                totals.pdaHeads[headName] = (totals.pdaHeads[headName] || 0) + (row.pdaInfo[headName] || 0);
            });

            invHeads.forEach((head: any) => {
                const headName = head.invmG_GroupName;
                totals.invHeads[headName] = (totals.invHeads[headName] || 0) + (row[headName] || 0);
            });
        });

        return totals;
    }, [processedData, pdaHeads, invHeads]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-gray-500 font-medium">Initializing Summary Report...</p>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto space-y-10 p-6">
            <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-500 print:hidden">
            </div>

            <Card className="border-none shadow-2xl bg-white/60 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-700 print:hidden">
                <CardHeader className="border-b bg-gray-50/50 px-8 py-6">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        Report Selection
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <PDASummaryReportForm
                        academicYears={loadData?.academicyearlist?.length > 0 ? loadData.academicyearlist : (loadData?.fillyear?.$values || [])}
                        classes={loadData?.classlist?.$values || []}
                        onSubmit={handleFormSubmit}
                        onReset={() => window.location.reload()}
                    />
                </CardContent>
            </Card>

            {generating && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-semibold text-gray-700">Crunching data, please wait...</p>
                </div>
            )}

            {processedData.length > 0 && !generating && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex justify-center print:hidden">
                        <Button
                            onClick={handlePrint}
                            className="h-12 px-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
                        >
                            <Printer className="mr-2 h-5 w-5" />
                            Print Summary Report
                        </Button>
                    </div>

                    <div id="summary-print-area" className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 overflow-x-auto print:p-0 print:shadow-none print:border-none">
                        <div className="text-center mb-8 hidden print:block">
                            <h2 className="text-2xl font-bold uppercase tracking-widest">PDA Consolidated Report for {selectedYearName}</h2>
                            <div className="w-48 h-1 bg-gray-800 mx-auto mt-2"></div>
                        </div>

                        <Table className="min-w-full border-collapse border border-gray-300 text-[10px]">
                            <TableHeader>
                                <TableRow className="bg-gray-100/80">
                                    <TableHead rowSpan={2} className="border border-gray-300 text-center font-bold text-gray-900">Sl.No</TableHead>
                                    <TableHead rowSpan={2} className="border border-gray-300 text-center font-bold text-gray-900">Adm No</TableHead>
                                    <TableHead rowSpan={2} className="border border-gray-300 text-center font-bold text-gray-900 min-w-[150px]">Student Name</TableHead>
                                    <TableHead rowSpan={2} className="border border-gray-300 text-center font-bold text-gray-900">Class:Section</TableHead>
                                    <TableHead colSpan={2} className="border border-gray-300 text-center font-bold text-gray-900">Opening Balance</TableHead>
                                    <TableHead colSpan={pdaHeads.length} className="border border-gray-300 text-center font-bold text-gray-900">PDA Heads</TableHead>
                                    <TableHead colSpan={invHeads.length} className="border border-gray-300 text-center font-bold text-gray-900">Stores</TableHead>
                                    <TableHead rowSpan={2} className="border border-gray-300 text-center font-bold text-gray-900">Concession</TableHead>
                                    <TableHead rowSpan={2} className="border border-gray-300 text-center font-bold text-gray-900">Total Exp</TableHead>
                                    <TableHead rowSpan={2} className="border border-gray-300 text-center font-bold text-gray-900">Deposit</TableHead>
                                    <TableHead rowSpan={2} className="border border-gray-300 text-center font-bold text-gray-900">Balance</TableHead>
                                    <TableHead rowSpan={2} className="border border-gray-300 text-center font-bold text-gray-900">Refund</TableHead>
                                </TableRow>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="border border-gray-300 text-center font-semibold text-gray-700">Student Due</TableHead>
                                    <TableHead className="border border-gray-300 text-center font-semibold text-gray-700">School Due</TableHead>
                                    {pdaHeads.map((h: any, i: number) => (
                                        <TableHead key={i} className="border border-gray-300 text-center font-semibold text-gray-700 whitespace-nowrap px-2">
                                            {h.pdaR_RefundRemarks}
                                        </TableHead>
                                    ))}
                                    {invHeads.map((h: any, i: number) => (
                                        <TableHead key={i} className="border border-gray-300 text-center font-semibold text-gray-700 whitespace-nowrap px-2">
                                            {h.invmG_GroupName}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedData.map((row, index) => (
                                    <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="border border-gray-300 text-center">{index + 1}</TableCell>
                                        <TableCell className="border border-gray-300 text-center font-medium">{row.AMST_AdmNo}</TableCell>
                                        <TableCell className="border border-gray-300 text-left px-2 font-semibold text-gray-800">{row.AMST_FirstName}</TableCell>
                                        <TableCell className="border border-gray-300 text-center whitespace-nowrap">{row.ASMCL_ClassName}-{row.ASMC_SectionName}</TableCell>
                                        <TableCell className="border border-gray-300 text-right px-2">{row.obInfo.PDAS_OBStudentDue?.toFixed(0)}</TableCell>
                                        <TableCell className="border border-gray-300 text-right px-2">{row.obInfo.PDAS_OBExcessPaid?.toFixed(0)}</TableCell>

                                        {pdaHeads.map((h: any, i: number) => (
                                            <TableCell key={i} className="border border-gray-300 text-right px-2">
                                                {row.pdaInfo[h.pdaR_RefundRemarks]?.toFixed(0) || '-'}
                                            </TableCell>
                                        ))}
                                        {invHeads.map((h: any, i: number) => (
                                            <TableCell key={i} className="border border-gray-300 text-right px-2">
                                                {row[h.invmG_GroupName]?.toFixed(0) || '-'}
                                            </TableCell>
                                        ))}

                                        <TableCell className="border border-gray-300 text-right px-2 font-medium">{row.conInfo.FSS_ConcessionAmount?.toFixed(0)}</TableCell>
                                        <TableCell className="border border-gray-300 text-right px-2 font-bold text-indigo-600">{row.studentTotExp?.toFixed(0)}</TableCell>
                                        <TableCell className="border border-gray-300 text-right px-2 font-medium">{row.obInfo.PDAS_CYDeposit?.toFixed(0)}</TableCell>
                                        <TableCell className={`border border-gray-300 text-right px-2 font-bold ${row.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            {row.balance?.toFixed(0)}
                                        </TableCell>
                                        <TableCell className="border border-gray-300 text-right px-2">{row.obInfo.PDAS_CYRefundAmt?.toFixed(0)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter className="font-bold bg-gray-100">
                                <TableRow>
                                    <TableCell colSpan={4} className="border border-gray-300 text-right px-4 py-3 uppercase">Total</TableCell>
                                    <TableCell className="border border-gray-300 text-right px-2">{columnTotals.studentDue.toFixed(0)}</TableCell>
                                    <TableCell className="border border-gray-300 text-right px-2">{columnTotals.schoolDue.toFixed(0)}</TableCell>

                                    {pdaHeads.map((h: any, i: number) => (
                                        <TableCell key={i} className="border border-gray-300 text-right px-2">
                                            {columnTotals.pdaHeads[h.pdaR_RefundRemarks]?.toFixed(0)}
                                        </TableCell>
                                    ))}
                                    {invHeads.map((h: any, i: number) => (
                                        <TableCell key={i} className="border border-gray-300 text-right px-2">
                                            {columnTotals.invHeads[h.invmG_GroupName]?.toFixed(0)}
                                        </TableCell>
                                    ))}

                                    <TableCell className="border border-gray-300 text-right px-2">{columnTotals.concession.toFixed(0)}</TableCell>
                                    <TableCell className="border border-gray-300 text-right px-2 text-indigo-700">{columnTotals.totalExp.toFixed(0)}</TableCell>
                                    <TableCell className="border border-gray-300 text-right px-2">{columnTotals.deposit.toFixed(0)}</TableCell>
                                    <TableCell className={`border border-gray-300 text-right px-2 ${columnTotals.balance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                                        {columnTotals.balance.toFixed(0)}
                                    </TableCell>
                                    <TableCell className="border border-gray-300 text-right px-2">{columnTotals.refund.toFixed(0)}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 1cm;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #summary-print-area, #summary-print-area * {
                        visibility: visible;
                    }
                    #summary-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
