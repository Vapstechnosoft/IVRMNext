'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useMonthEndReport } from '@/hooks/admission/preadmission/useReports';
import AdmissionMonthEndReport from './_components/columns';
export default function MonthendreportPage() {
    const auth = async () => {
        try {
            const session = await import('next-auth/react').then(({ getSession }) => getSession());
            return session;
        } catch (error) {
            console.error('Error fetching session:', error);
            return null;
        }
    };
    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<number>(0);
    const [implementationName, setImplementationName] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<ReportItem[]>([]);

    const requestData = {
        ASMAY_Id: academicYearId,
        month: selectedMonth,
        year: selectedYear
    };
    const monthList = [
        { id: 1, name: 'January' },
        { id: 2, name: 'February' },
        { id: 3, name: 'March' },
        { id: 4, name: 'April' },
        { id: 5, name: 'May' },
        { id: 6, name: 'June' },
        { id: 7, name: 'July' },
        { id: 8, name: 'August' },
        { id: 9, name: 'September' },
        { id: 10, name: 'October' },
        { id: 11, name: 'November' },
        { id: 12, name: 'December' }
    ];
    const yearList = [2023, 2024, 2025, 2026, 2027];

    interface ReportItem {
        name: string;
        count?: number; // optional
        photo?: number;
        email?: number;
        phone?: number;
        missingphoto?: number;
        missingemail?: number;
        missingphone?: number;
    }

    const { data: academicYearOptions, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const { refetch } = useMonthEndReport(requestData, {}, false);
    // Handle Reset
    const handleReset = () => {
        setAcademicYearId(0);
        setSelectedMonth('');
        setSelectedYear(0);
        setImplementationName('');
    };

    // Handle Report Generate

    const handleGenerateReport = async () => {
        if (!academicYearId || !selectedMonth || !selectedYear) {
            toast.error('Please fill all required fields!');
            return;
        }

        // Show loading toast and store ID
        const toastId = toast.loading('Loading report...');

        try {
            const res = await refetch();
            toast.dismiss(toastId);

            if (res?.data?.data?.reportdatelist?.length) {
                const r = res.data.data.reportdatelist[0];

                setReportData([
                    { name: 'Student Strength', count: r.totalcount },
                    { name: 'TC Taken', count: r.total_tc },

                    {
                        name: 'New Admission',
                        count: r.totalnew,
                        missingphoto: r.missingphoto,
                        missingemail: r.missingemail,
                        missingphone: r.missingphone
                    },

                    { name: 'Bonafide Certificate', count: r.DOB_Certificate_count }
                ]);

                setShowReport(true);
                toast.success('Report generated!');
            } else {
                toast.error('No report data found!');
            }
        } catch (_error) {
            toast.dismiss(toastId);
            toast.error('Something went wrong!');
        }
    };

    const downloadExcel = async () => {
        try {
            const queryParams = new URLSearchParams({
                page: '1',
                pageSize: '100000',
                exportType: 'FULL'
            }).toString();
            const session = await auth();
            const response = await fetch(
                `https://ivrm-dev-admission-api.azurewebsites.net/api/monthendreport/ExportMonthEndReportToExcel?${queryParams}&AcayId=${requestData.ASMAY_Id}&Month=${requestData.month}&Year=${requestData.year}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${session?.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Excel download failed');
            }

            // ✅ Extract filename from header
            const disposition = response.headers.get('content-disposition');
            let fileName = 'MonthEndReport.xlsx';

            if (disposition) {
                const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
                if (match?.[1]) {
                    fileName = decodeURIComponent(match[1]);
                }
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);

            toast.success('Excel downloaded successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to download Excel');
        }
    };

    return (
        <div className='min-h-screen'>
            {/* FILTER CARD */}
            <div className='mb-3 space-y-6 rounded-xl border p-6 shadow-xl'>
                <div className='grid grid-cols-2 gap-6 sm:grid-cols-1 md:grid-cols-4'>
                    {/* Academic Year */}
                    <div className='flex w-full flex-col gap-2'>
                        <Label className='font-semibold'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>

                        <Select
                            onValueChange={(value) => setAcademicYearId(Number(value))}
                            value={academicYearId ? String(academicYearId) : undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>

                            <SelectContent>
                                {academicYearLoading && (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                )}

                                {academicYearOptions?.data?.map((item) => (
                                    <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                        {item.asmaY_Year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Month */}
                    <div className='flex w-full flex-col gap-2 '>
                        <Label className='font-semibold'>
                            Month <span className='text-red-500'>*</span>
                        </Label>

                        <Select
                            onValueChange={(value) => setSelectedMonth(value)}
                            value={selectedMonth ? String(selectedMonth) : undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Month' />
                            </SelectTrigger>

                            <SelectContent>
                                {monthList.map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Year */}
                    <div className='flex w-full flex-col gap-2 '>
                        <Label className='font-semibold'>
                            Year <span className='text-red-500'>*</span>
                        </Label>

                        <Select
                            onValueChange={(value) => setSelectedYear(Number(value))}
                            value={selectedYear ? String(selectedYear) : undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Year' />
                            </SelectTrigger>

                            <SelectContent>
                                {yearList.map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Implementation Engineer */}
                    <div className='flex w-full flex-col gap-2 '>
                        <InputText
                            label='Implementation Name'
                            id='implementation-name'
                            placeholder='Enter Name'
                            value={implementationName}
                            onChange={(e) => setImplementationName(e.target.value)}
                        />
                    </div>
                </div>

                {/* BUTTON SECTION */}
                <div className='flex gap-4 pt-4'>
                    <Button onClick={handleReset} variant='outline' className='w-fit'>
                        Reset
                    </Button>
                    <Button onClick={handleGenerateReport} className='w-fit'>
                        Generate Report
                    </Button>
                    <Button onClick={downloadExcel} className='w-fit'>
                        Export to Excel
                    </Button>
                </div>
            </div>
            {showReport && (
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <AdmissionMonthEndReport
                        reportData={reportData}
                        month={selectedMonth}
                        year={selectedYear}
                        academicYear={academicYearId}
                        implementationName={implementationName}
                    />
                </CollapsibleSection>
            )}
        </div>
    );
}
