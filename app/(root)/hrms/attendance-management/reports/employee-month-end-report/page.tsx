'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Printer, Image as ImageIcon } from 'lucide-react';
import AddEmployeeMonthReportForm from './_components/add-form';
import type { EmployeeMonthReportRow } from './_components/columns';
import { employeeMonthReportColumns } from './_components/columns';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getMasterInstitution } from '@/server/hrms/master-dropdown';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';

export default function EmployeeMonthReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [institution, setInstitution] = useState<IMasterInstitution | Institution | null>(null);
    const [resetKey, setResetKey] = useState(0);
    const chartRef = useRef<HTMLDivElement>(null);

    const handleReset = () => {
        setReportData(null);
        setResetKey(prev => prev + 1);
    };

    const handlePrint = () => {
        if (!reportData) return;

        const popupWin = window.open('', '_blank', 'width=1000,height=1000');
        if (popupWin) {
            popupWin.document.open();
            popupWin.document.write(`
                <html>
                    <head>
                        <title>Front Office Month End Report</title>
                        <style>
                            body { font-family: 'Times New Roman', serif; padding: 40px; }
                            .print-header { display: flex; align-items: center; justify-content: center; gap: 24px; border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 24px; }
                            .logo { width: 100%; height: 100%; object-fit: contain; }
                            .institution-info { text-align: center; }
                            .institution-name { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0; }
                            .institution-address { font-size: 12px; font-weight: 600; color: #444; margin: 2px 0; }
                            .report-title { text-align: center; margin: 24px 0; }
                            .report-title h2 { font-size: 20px; font-weight: bold; text-transform: uppercase; margin: 0; }
                            .report-title h3 { font-size: 18px; font-weight: 500; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 8px 0; text-transform: uppercase; margin: 8px 0; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid black; padding: 10px; text-align: left; font-size: 14px; }
                            .bg-gray { background-color: #f9f9f9; font-weight: bold; }
                            .text-center { text-align: center; }
                            .footer { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 14px; font-weight: 500; }
                            .footer-item { margin-bottom: 40px; }
                            .footer-right { text-align: right; }
                            @page { size: auto; margin: 0; }
                        </style>
                    </head>
                    <body onload="window.print(); window.close();">
                        <div class="print-header">
                            ${institution?.mI_Logo ? `<img src="${institution.mI_Logo}" class="logo" alt="Logo" />` : ''}
                            
                        </div>

                        <div class="report-title">
                            <h2>Front Office Month End Report</h2>
                            <h3>${reportData.meta?.monthName || ''} Month Report</h3>
                        </div>

                        <table>
                            <tbody>
                                <tr>
                                    <td class="w-1/4 bg-gray">Name</td>
                                    <td class="w-1/4">${reportData.meta?.ieName || 'N/A'}</td>
                                    <td class="w-1/4 bg-gray">Date</td>
                                    <td class="w-1/4">${format(new Date(), 'MMM dd, yyyy')}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray">Designation</td>
                                    <td>Implementation Engineer</td>
                                    <td class="bg-gray">Academic Year</td>
                                    <td>${reportData.meta?.academicYear || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray">Module</td>
                                    <td colspan="3">Front Office</td>
                                </tr>
                            </tbody>
                        </table>

                        <table style="margin-top: 32px;">
                            <thead>
                                <tr class="bg-gray text-center">
                                    <td style="width: 80px;">SL.NO</td>
                                    <td>No.of Employee Joined</td>
                                    <td>SMS Count</td>
                                    <td>Email Count</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="text-center">
                                    <td>1</td>
                                    <td>${reportData.total_staff_joined_in_month || 0}</td>
                                    <td>${reportData.sms_sent || 0}</td>
                                    <td>${reportData.email_sent || 0}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="margin-top: 32px;">
                            <h4 style="font-size: 16px; font-weight: bold; text-transform: uppercase;">Front Office Month End Report</h4>
                            <div style="width: 100%;">
                                ${chartRef.current ? chartRef.current.innerHTML : '<div style="height: 200px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999;">Chart Visualization (No Data)</div>'}
                            </div>
                        </div>

                        <div class="footer">
                            <div class="footer-item">Implementation Engineer: ___________________</div>
                            <div class="footer-item footer-right">Nodal Officer: ___________________</div>
                            <div class="footer-item">End User: ___________________</div>
                            <div class="footer-item footer-right">Seal: ___________________</div>
                        </div>
                    </body>
                </html>
            `);
            popupWin.document.close();
        }
    };

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const institution_res = await getMasterInstitution();
                const { data: institution_data } = institution_res;
                setInstitution(institution_data);
                console.log("institution_data", institution_data)
            } catch (error) {
                console.error("Error fetching institution:", error);
                toast.error("Failed to fetch the institution");
            }
        };

        fetchInstitution();
    }, []);

    const handleSuccess = (data: any) => {
        setReportData(data);
    };


    const chartData = reportData ? [
        {
            name: 'Employee Join Count',
            count: reportData.total_staff_joined_in_month || 0,
        },
        {
            name: 'SMS Count',
            count: reportData.sms_sent || 0,
        },
        {
            name: 'EMAIL Count',
            count: reportData.email_sent || 0,
        }
    ] : [];

    return (
        <div className='container min-h-screen space-y-6 p-4 print:p-0'>
            {/* Search Form Section */}
            <CollapsibleSection
                title='Employee MonthEnd Report Generate'
                description='Select year and month to load data'
                defaultOpen={true}
                variant='outline'
                className='bg-white shadow-md border-primary/10'
            >
                <AddEmployeeMonthReportForm
                    key={resetKey}
                    onSuccess={handleSuccess}
                    onReset={handleReset}
                />
            </CollapsibleSection>

            {reportData && (
                <>
                    <CollapsibleSection
                        title='Employee MonthEnd Report Result'
                        defaultOpen={true}
                        variant='default'
                        className='animate-in fade-in duration-500 bg-white p-4 sm:p-8 shadow-sm print:hidden'
                    >
                        <div className='space-y-6' id="report-content">
                            {/* Print Button - Top Right */}
                            <div className="print:hidden flex justify-end w-full">
                                <div className="w-fit">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrint}
                                        className="gap-2 shadow-sm border-primary/20 hover:bg-primary hover:text-white transition-all duration-300"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Print Report
                                    </Button>
                                </div>
                            </div>
                            {/* Institution Header */}
                            <div className='flex flex-col items-center text-center space-y-2 border-b-2 border-blue-900 pb-4'>
                                <div className='flex w-full items-center justify-between'>
                                    <div className=' flex items-center justify-center border rounded overflow-hidden bg-white shadow-sm'>
                                        {institution?.mI_Logo && (
                                            <img
                                                src={institution?.mI_Logo}
                                                alt="Institution Logo"
                                                className='max-h-full max-w-full object-contain'
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Title Section */}
                            <div className='text-center space-y-2 pt-4'>
                                <h2 className='text-xl font-bold text-blue-800 tracking-wide uppercase'>
                                    FRONT OFFICE MONTH END REPORT
                                </h2>
                                <h3 className='text-md font-semibold text-gray-700 uppercase'>
                                    {reportData.meta?.monthName} MONTH REPORT
                                </h3>
                            </div>

                            {/* Report Metadata Table */}
                            <div className='border rounded-sm overflow-hidden'>
                                <table className='w-full text-sm border-collapse'>
                                    <tbody className='divide-y'>
                                        <tr className='divide-x'>
                                            <td className='bg-gray-50 p-2 font-bold w-1/4 text-center'>Name</td>
                                            <td className='p-2 w-1/4 text-center'>{reportData.meta?.ieName || 'N/A'}</td>
                                            <td className='bg-gray-50 p-2 font-bold w-1/4 text-center'>Date</td>
                                            <td className='p-2 w-1/4 text-center'>{format(new Date(), 'MMM dd, yyyy')}</td>
                                        </tr>
                                        <tr className='divide-x'>
                                            <td className='bg-gray-50 p-2 font-bold text-center'>Designation</td>
                                            <td className='p-2 text-center'>Implementation Engineer</td>
                                            <td className='bg-gray-50 p-2 font-bold text-center'>Academic Year</td>
                                            <td className='p-2 text-center'>{reportData.meta?.academicYear || 'N/A'}</td>
                                        </tr>
                                        <tr className='divide-x'>
                                            <td className='bg-gray-50 p-2 font-bold text-center'>Module</td>
                                            <td className='p-2 text-center' colSpan={3}>Front Office</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Counts Table */}
                            <div className='pt-6'>
                                <div className='overflow-x-auto border rounded-sm'>
                                    <table className='w-full text-sm border-collapse'>
                                        <thead>
                                            <tr className='bg-gray-500 text-white text-center font-bold'>
                                                <td className='p-2 border border-white w-16'>SL.NO</td>
                                                <td className='p-2 border border-white'>No.of Employee Joined</td>
                                                <td className='p-2 border border-white'>SMS Count</td>
                                                <td className='p-2 border border-white'>Email Count</td>
                                            </tr>
                                        </thead>
                                        <tbody className='text-center'>
                                            <tr className='hover:bg-gray-50'>
                                                <td className='p-2 border'>1</td>
                                                <td className='p-2 border'>{reportData.total_staff_joined_in_month || 0}</td>
                                                <td className='p-2 border'>{reportData.sms_sent || 0}</td>
                                                <td className='p-2 border'>{reportData.email_sent || 0}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Chart Section */}
                            <div className='pt-8 space-y-4'>
                                <h3 className='text-lg font-bold text-[#334466] uppercase'>
                                    FRONT OFFICE MONTH END REPORT
                                </h3>
                                <div ref={chartRef} className='h-[400px] w-full border-b pb-4'>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid vertical={false} stroke="#ccc" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={true}
                                                tickLine={true}
                                                tick={{ fontSize: 12, fill: '#666' }}
                                            />
                                            <YAxis axisLine={true} tickLine={true} />
                                            <Tooltip cursor={{ fill: '#f5f5f5' }} />
                                            <Legend
                                                verticalAlign="bottom"
                                                align="center"
                                                iconType="square"
                                                formatter={(value) => <span style={{ color: '#333' }}>{value}</span>}
                                            />
                                            <Bar
                                                name="Count"
                                                dataKey="count"
                                                fill="#ffd700"
                                                barSize={40}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Signature Footer */}
                            <div className='pt-12 grid grid-cols-2 gap-y-10 text-sm font-medium'>
                                <div className='flex flex-col space-y-1'>
                                    <span>Implementation Engineer:___________________</span>
                                </div>
                                <div className='flex flex-col space-y-1 text-right'>
                                    <span>Nodal Officer:___________________</span>
                                </div>
                                <div className='flex flex-col space-y-1 pt-4'>
                                    <span>End User:___________________</span>
                                </div>
                                <div className='flex flex-col space-y-1 text-right pt-4'>
                                    <span>Seal:___________________</span>
                                </div>
                            </div>

                            {/* Detailed Staff List Section */}
                            {/* <div className='pt-12 print:mt-10'>
                            <CollapsibleSection
                                title='Detailed Joinee Staff List'
                                defaultOpen={false}
                                variant='default'
                                className='shadow-sm border-primary/10 print:block'
                            >
                                <GenericDataTable<EmployeeMonthReportRow>
                                    data={reportData.staff_list || []}
                                    columns={employeeMonthReportColumns}
                                    isLoading={false}
                                    showViewOptions={false}
                                    isPaginationRequired={false}
                                    loadingMessage='Loading joinee staff...'
                                    noDataTitle='No Staff Joined'
                                    noDataDescription='No new staff members joined in this month'
                                />
                            </CollapsibleSection>
                        </div> */}

                        </div>
                    </CollapsibleSection>
                </>
            )}
        </div>
    );
}
