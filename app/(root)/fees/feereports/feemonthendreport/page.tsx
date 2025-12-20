// app/(root)/fees/feereports/feedefaulterreport/page.tsx
'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useFeeCustomGroupDefaulterreport } from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { feeMonthEndReportsSchema } from '@/schemas/fees/reports';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { InputText } from '@/components/ui/extension/input-text';
import { useacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import { get_split_year } from '@/server/fees/masters/fee_terms_period';
import { getAuditReport } from '@/server/fees/reports/auditreport';
import { Input } from 'react-aria-components';
import { FeeMonthEndChart } from './chart';

type FormFields = z.infer<typeof feeMonthEndReportsSchema>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export default function FeeDefaulterReport() {
    const [loading, setLoading] = useState(false);

    const {
        control,
        setValue,
        handleSubmit,
        watch,
        register,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeMonthEndReportsSchema),
        defaultValues: {
            //fmtP_Year: '',

            from_Month: ''
        }
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);

    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);

    const [splitAcademicYear, setSplitAcademicYear] = useState<any>(null); // store API result

    const [isSplitLoading, setIsSplitLoading] = useState(false);
    const [selectedSplitYear, setSelectedSplitYear] = useState<string | null>(null);

    const { data: academicYear, isLoading: academicYearLoading, error: academicYearError } = useacademicyerdropdowndatafee();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Hooks
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    const { data: customGroupResponse, isLoading: loadingCustomGroup, error: customGroupError } = useFeeCustomGroupDefaulterreport();

    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
            setAcademicYears([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const formatted: IAcademicYear[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id ?? '',
                asmaY_Year: item.asmaY_Year ?? 'Unknown Year',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            formatted.sort((a, b) => (b.asmaY_Order || 0) - (a.asmaY_Order || 0));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    const toggleRow = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    // const handleExport = () => {
    //     if (!selectedRows.length) {
    //         toast.error('Please select at least one record');
    //         return;
    //     }
    //     // exportToExcel(selectedRows, 'Audit-Report');
    // };

    // const handlePrint = () => {
    //     if (!selectedRows.length) {
    //         toast.error('Please select at least one record');
    //         return;
    //     }
    //     window.print();
    //     // printTable(tableColumns, selectedRows, tableSumRow);
    // };

    const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || 'My School';
    const schoolAddress = process.env.NEXT_PUBLIC_SCHOOL_ADDRESS || 'My Address';
    const month = watch('from_Month') || '';

    useEffect(() => {
        if (selectedAcademicYear !== null) {
            const fetchSplitAcademicYear = async () => {
                setIsSplitLoading(true); // 🔥 Disable immediately
                setSplitAcademicYear(null); // 🔥 Clear old data
                setSelectedSplitYear(null); // 🔥 Reset selected option
                try {
                    const response = await get_split_year(Number(selectedAcademicYear));
                    console.log('Split Academic Year:', response);
                    setSplitAcademicYear(response.data); // store result if needed
                } catch (err) {
                    console.error('Failed to fetch split academic year', err);
                } finally {
                    setIsSplitLoading(false); // 🔥 Re-enable dropdown
                }
            };

            fetchSplitAcademicYear();
        }
    }, [selectedAcademicYear]);
    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        const payload = {
            //academicYearId: data.academicYearId
            // asmayId: data.academicYearId,
            // fromDate: filters.fromDate.toISOString().split('T')[0],
            // toDate: filters.toDate.toISOString().split('T')[0],
            // flag: filters.breakdown
        };

        console.log('payload', payload);
        const response = await getAuditReport(payload);

        // if (!response?.success || !Array.isArray(response.data)) {
        //     toast.error('Failed to fetch data');
        //     setReportData([]);
        //    // setShowReport(false);
        //     return;
        // }

        // // success = true but no records
        // if (response.data.length === 0) {
        //     setReportData([]);
        //     setSelectedIds([]);
        //    // setShowReport(false);
        //     toast.info('No records found for selected criteria');
        //     return;
        // }

        // const mapApiToReportRows = (apiData: any[]): auditreportow[] => {
        //     return apiData.map((item, index) => ({
        //         id: index + 1,
        //         studentName: item.name?.trim() || '-',
        //         mobileNo: item.mobileNo || '-',
        //         classSection: `${item.asmcL_ClassName || ''} ${item.asmC_SectionName || ''}`.trim(),
        //         receiptDate: item.date || '-',
        //         receiptNo: item.fyP_Receipt_No || '-',
        //         paymentMode: item.fyP_Bank_Or_Cash || '-',
        //         chequeNo: item.fyP_DD_Cheque_No || '',
        //         tuitionFee: Number(item.tutionfees) || 0
        //     }));
        // };

        // const mappedRows = mapApiToReportRows(response.data);

        // setReportData(mappedRows);
        setSelectedIds([]);
        setShowReport(true);
        setReportLoading(false);
        // Found ${mappedRows.length} records
        toast.success('Report generated successfully! ');

        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className='flex w-full flex-col items-center justify-center space-y-6'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <div className='space-y-8'>
                                <div className='grid grid-cols-2 gap-x-16 gap-y-8'>
                                    <div className='flex items-center gap-6'>
                                        <Label className='w-[150px] text-right'>
                                            Academic Year:<span className='ml-1 text-red-500'>*</span>
                                        </Label>
                                        <div className='w-[400px]'>
                                            <Controller
                                                name='asmay_Id'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={(val) => {
                                                            const id = Number(val);
                                                            field.onChange(id);
                                                            setSelectedAcademicYear(id);
                                                        }}
                                                        value={field.value ? String(field.value) : ''}>
                                                        <SelectTrigger className='w-full text-center'>
                                                            <SelectValue placeholder='--Select Academic Year--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {academicYear?.data?.map((item: any) => (
                                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                    {item.asmaY_Year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.asmay_Id && <FormError className='mt-1'>{errors.asmay_Id.message}</FormError>}
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-6'>
                                        <Label className='w-[150px] text-right'>
                                            Month:<span className='ml-1 text-red-500'>*</span>
                                        </Label>
                                        <div className='w-[400px]'>
                                            <Controller
                                                name='from_Month'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select value={field.value || ''} onValueChange={field.onChange}>
                                                        <SelectTrigger className='w-full text-center'>
                                                            <SelectValue placeholder='--Select Month--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {months.map((month) => (
                                                                <SelectItem key={month} value={month}>
                                                                    {month}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.from_Month && <FormError className='mt-1'>{errors.from_Month.message}</FormError>}
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-6'>
                                        <Label className='w-[150px] text-right'>
                                            Year:<span className='ml-1 text-red-500'>*</span>
                                        </Label>
                                        <div className='w-[400px]'>
                                            <Controller
                                                name='fmtP_Year'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value || ''}
                                                        onValueChange={(val) => {
                                                            field.onChange(val);
                                                            setSelectedSplitYear(val);
                                                        }}
                                                        // disabled={!selectedAcademicYear}
                                                    >
                                                        <SelectTrigger className='w-full text-center'>
                                                            <SelectValue placeholder='--Select Year--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {splitAcademicYear?.map((item: any) => (
                                                                <SelectItem key={item.fmtP_Year} value={item.fmtP_Year}>
                                                                    {item.fmtP_Year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.fmtP_Year && <FormError className='mt-1'>{errors.fmtP_Year.message}</FormError>}
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-6'>
                                        <Label className='w-[150px] text-right'>IE Name:</Label>
                                        <div className='w-[400px]'>
                                            <InputText id='iename' {...register('iename')} error={errors.iename?.message} />
                                        </div>
                                    </div>

                                    {/* Checkboxes (Full Width Row) */}
                                    <div className='col-span-2 mt-4 flex justify-center gap-20'>
                                        <Label className='flex items-center gap-2'>
                                            <Input type='checkbox' />
                                            User Entry
                                        </Label>

                                        <Label className='flex items-center gap-2'>
                                            <Input type='checkbox' />
                                            Settlement Report
                                        </Label>
                                    </div>
                                </div>

                                <div>
                                    {/* ==================== ACTION BUTTONS ==================== */}
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button size='lg' variant='outline' className='px-8' onClick={() => window.location.reload()}>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={isSubmitting} className='px-12'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>

                                        {/* <Button
                                            size='lg'
                                            className='px-12'
                                            type='submit'
                                        onClick={handleSubmit}
                                        disabled={
                                            reportLoading ||
                                            !filters.academicYearId ||
                                            filters.feeGroupIds.length === 0 ||
                                            filters.termIds.length === 0
                                        }
                                        >
                                            Generate Report
                                        </Button> */}
                                    </div>

                                    {/* ==================== REPORT SECTION ==================== */}

                                    {showReport && (
                                        <div className='mt-10 rounded-lg border bg-white shadow-xl'>
                                            <div className='flex items-center justify-between border-b bg-blue-50 px-6 py-4'>
                                                <h2 className='font-bold text-blue-700 text-xl'>Fee Month End Report</h2>

                                                <div className='flex gap-3'>
                                                    {/* <div className='mb-4 flex justify-end gap-2'>
                                                        <Button size='sm' className='h-8 w-auto px-3 text-xs' onClick={handleExport}>
                                                            Export Excel
                                                        </Button>

                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            className='h-8 w-auto px-3 text-xs'
                                                            onClick={handlePrint}>
                                                            Print
                                                        </Button>
                                                    </div> */}
                                                </div>
                                            </div>

                                            <div className='border bg-white p-6 text-sm'>
                                                {/* ================= HEADER ================= */}
                                                <div className='text-center'>
                                                    {/* <h1 className="font-bold text-lg uppercase">{schoolName}</h1>
                                                    <p className="text-xs">{schoolAddress}</p> */}

                                                    {/* <h2 className="mt-4 font-bold uppercase">
                                                        School Fees {month} Month Report
                                                    </h2> */}
                                                </div>

                                                {/* ================= INFO TABLE ================= */}
                                                <table className='mt-6 w-full border'>
                                                    <tbody>
                                                        <tr>
                                                            <td className='border p-2'>Name :</td>
                                                            {/* <td className="border p-2">{name}</td> */}
                                                            <td className='border p-2'>Date :</td>
                                                            {/* <td className="border p-2">{date}</td> */}
                                                        </tr>
                                                        <tr>
                                                            <td className='border p-2'>Designation :</td>
                                                            {/* <td className="border p-2">{designation}</td> */}
                                                            <td className='border p-2'>Academic Year :</td>
                                                            {/* <td className="border p-2">{academicYear}</td> */}
                                                        </tr>
                                                        <tr>
                                                            <td className='border p-2'>Total SMS :</td>
                                                            {/* <td className="border p-2">{totalSMS}</td> */}
                                                            <td className='border p-2'>Total Email :</td>
                                                            {/* <td className="border p-2">{totalEmail}</td> */}
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                {/* ================= SUMMARY TABLE ================= */}
                                                <table className='mt-6 w-full border text-center'>
                                                    <thead className='bg-blue-700 text-white'>
                                                        <tr>
                                                            <th className='border p-2'>SL.NO</th>
                                                            <th className='border p-2 text-left'>Name</th>
                                                            <th className='border p-2'>Count</th>
                                                            <th className='border p-2'>Kiosk</th>
                                                            <th className='border p-2'>Portal and Dashboard</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className='border p-2'>1</td>
                                                            <td className='border p-2 text-left'>Fee Collection By Cash</td>
                                                            {/* <td className="border p-2">{stats.cash}</td> */}
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='border p-2'>2</td>
                                                            <td className='border p-2 text-left'>Fee Collection By Bank</td>
                                                            {/* <td className="border p-2">{stats.bank}</td> */}
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='border p-2'>3</td>
                                                            <td className='border p-2 text-left'>Fee Collection By Online</td>
                                                            {/* <td className="border p-2">{stats.online}</td> */}
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='border p-2'>4</td>
                                                            <td className='border p-2 text-left'>Fee Collection By RTGS</td>
                                                            {/* <td className="border p-2">{stats.rtgs}</td> */}
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='border p-2'>5</td>
                                                            <td className='border p-2 text-left'>Fee Collection By Card</td>
                                                            {/* <td className="border p-2">{stats.card}</td> */}
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='border p-2'>6</td>
                                                            <td className='border p-2 text-left'>Fee Collection By ECS</td>
                                                            {/* <td className="border p-2">{stats.ecs}</td> */}
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='border p-2'>7</td>
                                                            <td className='border p-2 text-left'>Fee Refund By Cash</td>
                                                            {/* <td className="border p-2">{stats.refundCash}</td> */}
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='border p-2'>8</td>
                                                            <td className='border p-2 text-left'>Fee Refund By Bank</td>
                                                            {/* <td className="border p-2">{stats.refundBank}</td> */}
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='border p-2'>9</td>
                                                            <td className='border p-2 text-left'>Fee Defaulters</td>
                                                            {/* <td className="border p-2">{stats.defaulters}</td> */}
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                            <td className='border p-2'>0</td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                {/* ================= FOOTER ================= */}
                                                <div className='mt-16 grid grid-cols-2 gap-10'>
                                                    <div>Implementation Engineer: _______________</div>
                                                    <div>Nodal Officer: _______________</div>
                                                    <div>End User: _______________</div>
                                                    <div>Seal</div>
                                                </div>
                                                <FeeMonthEndChart
                                                    cash={1}
                                                    bank={2}
                                                    online={5}
                                                    rtgs={6}
                                                    card={7}
                                                    ecs={8}
                                                    cashRefund={9}
                                                    bankRefund={10}
                                                    defaulters={11}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
