// app/(root)/fees/feereports/feedefaulterreport/page.tsx
'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useFeeCustomGroupDefaulterreport } from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { feeAuditSchema } from '@/schemas/fees/reports';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { exportToExcel } from './_components/columns';

type FormFields = z.infer<typeof feeAuditSchema>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export default function FeeDefaulterReport() {
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        fromDate: new Date(),
        toDate: new Date(),
        breakdown: 'All',
        academicYearId: ''
    });

    const {
        control,
        setValue,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeAuditSchema),
        defaultValues: {
            academicYearId: '',

            breakdown: 'All',
            fromDate: undefined,
            toDate: undefined
        }
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);

    //const [reportData, setReportData] = useState<IFeeAuditReport[]>([]);
    //const [reportData, setReportData] = useState<any>([]);

    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reportData, setReportData] = useState<auditreportow[]>([]);

    type auditreportow = {
        id: number;
        studentName: string;
        mobileNo: string;
        classSection: string;
        receiptDate: string;
        receiptNo: string;
        paymentMode: string;
        chequeNo: string;
        tuitionFee: number;
    };

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

    const toggleAll = () => {
        if (selectedIds.length === reportData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reportData.map((r) => r.id));
        }
    };

    const selectedRows = reportData.filter((r) => selectedIds.includes(r.id));

    const handleExport = () => {
        if (!selectedRows.length) {
            toast.error('Please select at least one record');
            return;
        }
        exportToExcel(selectedRows, 'Audit-Report');
    };

    const handlePrint = () => {
        if (!selectedRows.length) {
            toast.error('Please select at least one record');
            return;
        }
        window.print();
        // printTable(tableColumns, selectedRows, tableSumRow);
    };

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        const payload = {
            academicYearId: data.academicYearId
        };

        console.log('Filters:', filters);
        // Optional: Keep validation
        // if (!filters.academicYearId) return toast.error('Please select an Academic Year');
        // if (filters.feeGroupIds.length === 0) return toast.error('Please select at least one Fee Group');
        // if (filters.termIds.length === 0) return toast.error('Please select at least one Term');

        setReportLoading(true);
        setShowReport(false);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // STATIC MOCK DATA - Looks 100% real!
        const mockData = [
            {
                id: 1,
                studentName: 'AADHYA V',
                mobileNo: '9876543210',
                classSection: 'Nursery A',
                receiptDate: '01/04/2025',
                receiptNo: 'NUR/4/25-26',
                paymentMode: 'Cash',
                chequeNo: '',
                tuitionFee: 26000
            },
            {
                id: 2,
                studentName: 'AADHYA V SAJJAN',
                mobileNo: '9876543211',
                classSection: 'VII ICSE C',
                receiptDate: '28/04/2025',
                receiptNo: 'IC/160/25-26',
                paymentMode: 'Cash',
                chequeNo: '',
                tuitionFee: 26000
            },
            {
                id: 3,
                studentName: 'AADHYASHREE U',
                mobileNo: '9876543212',
                classSection: 'IX ICSE C',
                receiptDate: '04/04/2025',
                receiptNo: 'IC/39/25-26',
                paymentMode: 'Cash',
                chequeNo: '',
                tuitionFee: 26000
            },
            {
                id: 4,
                studentName: 'AADVIK S',
                mobileNo: '9876543213',
                classSection: 'LKG A',
                receiptDate: '12/05/2025',
                receiptNo: 'KG/139/25-26',
                paymentMode: 'Cash',
                chequeNo: '',
                tuitionFee: 6000
            },
            {
                id: 5,
                studentName: 'AADVIK S',
                mobileNo: '9876543214',
                classSection: 'LKG A',
                receiptDate: '03/04/2025',
                receiptNo: 'KG/21/25-26',
                paymentMode: 'Cash',
                chequeNo: '',
                tuitionFee: 20000
            },
            {
                id: 6,
                studentName: 'ABHINAV K',
                mobileNo: '9876543215',
                classSection: 'UKG B',
                receiptDate: '07/04/2025',
                receiptNo: 'KG/44/25-26',
                paymentMode: 'Online',
                chequeNo: '',
                tuitionFee: 18000
            },
            {
                id: 7,
                studentName: 'AKSHARA M',
                mobileNo: '9876543216',
                classSection: 'I A',
                receiptDate: '09/04/2025',
                receiptNo: 'PR/78/25-26',
                paymentMode: 'Card',
                chequeNo: '',
                tuitionFee: 22000
            },
            {
                id: 8,
                studentName: 'ANIRUDH R',
                mobileNo: '9876543217',
                classSection: 'II B',
                receiptDate: '11/04/2025',
                receiptNo: 'PR/90/25-26',
                paymentMode: 'Cash',
                chequeNo: '',
                tuitionFee: 23000
            },
            {
                id: 9,
                studentName: 'ANUSHKA P',
                mobileNo: '9876543218',
                classSection: 'III A',
                receiptDate: '15/04/2025',
                receiptNo: 'PR/110/25-26',
                paymentMode: 'Cheque',
                chequeNo: 'CHQ12345',
                tuitionFee: 24000
            },
            {
                id: 10,
                studentName: 'ARJUN N',
                mobileNo: '9876543219',
                classSection: 'IV B',
                receiptDate: '18/04/2025',
                receiptNo: 'PR/135/25-26',
                paymentMode: 'Online',
                chequeNo: '',
                tuitionFee: 25000
            },
            {
                id: 11,
                studentName: 'BHAVYA S',
                mobileNo: '9876543220',
                classSection: 'V A',
                receiptDate: '21/04/2025',
                receiptNo: 'PR/150/25-26',
                paymentMode: 'Cash',
                chequeNo: '',
                tuitionFee: 26000
            },
            {
                id: 12,
                studentName: 'CHIRAG D',
                mobileNo: '9876543221',
                classSection: 'VI B',
                receiptDate: '23/04/2025',
                receiptNo: 'PR/165/25-26',
                paymentMode: 'Card',
                chequeNo: '',
                tuitionFee: 27000
            },
            {
                id: 13,
                studentName: 'DARSHAN H',
                mobileNo: '9876543222',
                classSection: 'VII ICSE A',
                receiptDate: '25/04/2025',
                receiptNo: 'IC/180/25-26',
                paymentMode: 'Online',
                chequeNo: '',
                tuitionFee: 28000
            },
            {
                id: 14,
                studentName: 'DIYA K',
                mobileNo: '9876543223',
                classSection: 'VIII ICSE B',
                receiptDate: '27/04/2025',
                receiptNo: 'IC/195/25-26',
                paymentMode: 'Cash',
                chequeNo: '',
                tuitionFee: 29000
            },
            {
                id: 15,
                studentName: 'ESHAN R',
                mobileNo: '9876543224',
                classSection: 'IX ICSE A',
                receiptDate: '29/04/2025',
                receiptNo: 'IC/210/25-26',
                paymentMode: 'Cheque',
                chequeNo: 'CHQ67890',
                tuitionFee: 30000
            },
            {
                id: 16,
                studentName: 'FARHAN M',
                mobileNo: '9876543225',
                classSection: 'X ICSE B',
                receiptDate: '01/05/2025',
                receiptNo: 'IC/225/25-26',
                paymentMode: 'Online',
                chequeNo: '',
                tuitionFee: 32000
            },
            {
                id: 17,
                studentName: 'GAURAV T',
                mobileNo: '9876543226',
                classSection: 'XI SCI A',
                receiptDate: '03/05/2025',
                receiptNo: 'JR/240/25-26',
                paymentMode: 'Card',
                chequeNo: '',
                tuitionFee: 35000
            },
            {
                id: 18,
                studentName: 'HARSHITA L',
                mobileNo: '9876543227',
                classSection: 'XI COM B',
                receiptDate: '05/05/2025',
                receiptNo: 'JR/255/25-26',
                paymentMode: 'Cash',
                chequeNo: '',
                tuitionFee: 34000
            },
            {
                id: 19,
                studentName: 'ISHAN P',
                mobileNo: '9876543228',
                classSection: 'XII SCI A',
                receiptDate: '07/05/2025',
                receiptNo: 'SR/270/25-26',
                paymentMode: 'Online',
                chequeNo: '',
                tuitionFee: 38000
            },
            {
                id: 20,
                studentName: 'JHANAVI S',
                mobileNo: '9876543229',
                classSection: 'XII COM B',
                receiptDate: '09/05/2025',
                receiptNo: 'SR/285/25-26',
                paymentMode: 'Cheque',
                chequeNo: 'CHQ99999',
                tuitionFee: 36000
            }
        ];

        setReportData(mockData);
        setShowReport(true);
        setReportLoading(false);
        setLoading(false);

        toast.success(`Report generated successfully! Found ${mockData.length} defaulters`);

        // Auto scroll to report
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            {/* <h1 className='mb-8 font-bold text-3xl text-gray-900'>Yearly Fee Collection Report</h1> */}

                            <div className='space-y-8'>
                                {/* View Mode + Academic Year */}
                                {/* View Mode + Academic Year + Full Breakdown Radio Group */}
                                <div className='flex flex-wrap gap-8'>
                                    {/* Academic Year */}
                                    <div className='flex min-w-[500px] items-center gap-3'>
                                        <Label className='font-semibold text-lg'>
                                            Academic Year :<span className='text-red-500'>*</span>
                                        </Label>

                                        <Controller
                                            name='academicYearId'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    key={field.value || 'empty'}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setFilters((prev) => ({ ...prev, academicYearId: value }));
                                                    }}
                                                    value={field.value?.toString() || undefined}
                                                    disabled={loadingAcademic}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue
                                                            placeholder={loadingAcademic ? 'Loading...' : 'Select Academic Year'}
                                                        />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value='all'>All</SelectItem>
                                                        {loadingAcademic ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : academicError ? (
                                                            <SelectItem value='error' disabled>
                                                                Failed to load years
                                                            </SelectItem>
                                                        ) : (
                                                            academicYears.map((item) => (
                                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                    {item.asmaY_Year}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />

                                        {/* Zod Error */}
                                        {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                    </div>

                                    <Card className='min-w-[400px] flex-1 border bg-gray-50 p-5 shadow-sm'>
                                        <div className='flex flex-wrap gap-4'>
                                            {[
                                                { label: 'All', value: 'All' },
                                                { label: 'Cash', value: 'C' },
                                                { label: 'Cheque/DD', value: 'B' },
                                                { label: 'Online Paid', value: 'O' },
                                                { label: 'ECS', value: 'E' },
                                                { label: 'Card', value: 'S' },
                                                { label: 'RTGS', value: 'R' },
                                                { label: 'Trans&Bank', value: 'BT' }
                                            ].map((option) => (
                                                <label
                                                    key={option.value}
                                                    className='flex cursor-pointer items-center gap-3 whitespace-nowrap'>
                                                    <input
                                                        type='radio'
                                                        name='breakdown'
                                                        checked={filters.breakdown === option.value}
                                                        onChange={() => setFilters((prev) => ({ ...prev, breakdown: option.value }))}
                                                        className='h-5 w-5 text-primary'
                                                    />
                                                    <span className='font-medium text-sm'>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </Card>
                                </div>

                                <div className='mt-4 flex items-center justify-center rounded border bg-gray-50 p-4 shadow-sm'>
                                    <div className='flex items-center gap-6'>
                                        {/* From Date */}
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='fromDate' className='font-medium'>
                                                From Date: <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                id='fromDate'
                                                type='date'
                                                value={filters.fromDate.toISOString().split('T')[0]}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        fromDate: new Date(e.target.value)
                                                    }))
                                                }
                                                className='rounded border px-3 py-1'
                                            />
                                        </div>

                                        {/* To Date */}
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='toDate' className='font-medium'>
                                                To Date: <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                id='toDate'
                                                type='date'
                                                value={filters.toDate.toISOString().split('T')[0]}
                                                onChange={(e) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        toDate: new Date(e.target.value)
                                                    }))
                                                }
                                                className='rounded border px-3 py-1'
                                            />
                                        </div>
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
                                    {/*                           
                                    <div className='-mx-8 mt-12 overflow-hidden rounded-lg bg-white shadow-xl'>
                                     
                                        {reportLoading ? (
                                            <div className='p-24 text-center'>
                                                <div className='inline-block h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                                                <p className='mt-6 text-lg text-muted-foreground'>Generating report, please wait...</p>
                                            </div>
                                        ) : (
                                        
                                            <CollapsibleSection
                                                defaultOpen={true}
                                                variant='default'
                                                size='lg'
                                                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                                <div className='border-b bg-primary/5 px-8 py-6'>
                                                    <h2 className='font-bold text-2xl text-primary'>Fee Defaulter Report</h2>
                                                </div>
                                                <GenericDataTable<IFeeAuditReport>
                                                    columns={AuditReportColumns}
                                                    data={reportData}
                                                    isLoading={reportLoading}
                                                />
                                            </CollapsibleSection>
                                        )}
                                    </div> */}

                                    {showReport && (
                                        <div className='mt-10 rounded-lg border bg-white shadow-xl'>
                                            {/* Header */}
                                            <div className='flex items-center justify-between border-b bg-blue-50 px-6 py-4'>
                                                <h2 className='font-bold text-blue-700 text-xl'>Fee Audit Report</h2>

                                                <div className='flex gap-3'>
                                                    <div className='mb-4 flex justify-end gap-2'>
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
                                                    </div>
                                                </div>
                                            </div>

                                            {/* TABLE */}
                                            <div className='overflow-x-auto'>
                                                <table className='w-full border-collapse text-sm'>
                                                    <thead className='bg-blue-700 text-white'>
                                                        <tr>
                                                            <th className='border px-2 py-2 text-center'>
                                                                <input
                                                                    type='checkbox'
                                                                    checked={
                                                                        selectedIds.length === reportData.length && reportData.length > 0
                                                                    }
                                                                    onChange={toggleAll}
                                                                />
                                                            </th>
                                                            <th className='border px-2 py-2'>Sl No</th>
                                                            <th className='border px-2 py-2'>Student Name</th>
                                                            <th className='border px-2 py-2'>Mobile No</th>
                                                            <th className='border px-2 py-2'>Class/Section Name</th>
                                                            <th className='border px-2 py-2'>Receipt Date</th>
                                                            <th className='border px-2 py-2'>Receipt No</th>
                                                            <th className='border px-2 py-2'>Payment Mode</th>
                                                            <th className='border px-2 py-2'>DD/Cheque No</th>
                                                            <th className='border px-2 py-2 text-right'>Tuition Fee</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {reportData.map((row, index) => (
                                                            <tr
                                                                key={row.id}
                                                                className={
                                                                    selectedIds.includes(row.id)
                                                                        ? 'bg-blue-100'
                                                                        : index % 2 === 0
                                                                          ? 'bg-white'
                                                                          : 'bg-gray-50'
                                                                }>
                                                                <td className='border px-2 py-2 text-center'>
                                                                    <input
                                                                        type='checkbox'
                                                                        checked={selectedIds.includes(row.id)}
                                                                        onChange={() => toggleRow(row.id)}
                                                                    />
                                                                </td>
                                                                <td className='border px-2 py-2 text-center'>{index + 1}</td>
                                                                <td className='border px-2 py-2 font-semibold'>{row.studentName}</td>
                                                                <td className='border px-2 py-2 text-center'>{row.mobileNo}</td>
                                                                <td className='border px-2 py-2 text-center'>{row.classSection}</td>
                                                                <td className='border px-2 py-2 text-center'>{row.receiptDate}</td>
                                                                <td className='border px-2 py-2 text-center'>{row.receiptNo}</td>
                                                                <td className='border px-2 py-2 text-center'>{row.paymentMode}</td>
                                                                <td className='border px-2 py-2 text-center'>{row.chequeNo || '-'}</td>
                                                                <td className='border px-2 py-2 text-right font-semibold'>
                                                                    {row.tuitionFee.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
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
