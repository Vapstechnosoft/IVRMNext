// app/(root)/fees/feereports/feedefaulterreport/page.tsx
'use client';

import {
    useFeeStudentTermWisePaidReportAcademic,
    useFeeStudentTermWisePaidReportClassdrop,
    useFeeStudentTermWisePaidReportSectionDrop,
    useFeeTermforStudentTermWiseReport
} from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FormError } from '@/components/ui/extension/field';
import { feeStudentTermWisePaidReportSchema } from '@/schemas/fees/reports';
import type { IFeeTermDropdownList } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { type IFeeStudentTermWisePaidReport, exportToExcel, printTable } from './_components/export_and_excel';

type FormFields = z.infer<typeof feeStudentTermWisePaidReportSchema>;

const Checkbox = ({ checked, indeterminate, onCheckedChange, ...props }: any) => {
    const ref = useRef<HTMLButtonElement>(null);
    return <BaseCheckbox ref={ref} checked={checked} onCheckedChange={onCheckedChange} {...props} />;
};

export default function FeeAccountsPositionReport() {
    const {
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeStudentTermWisePaidReportSchema),
        defaultValues: {
            academicYearId: undefined,
            termIds: []
        }
    });

    const [feeTerms, setFeeTerms] = useState<IFeeTermDropdownList[]>([]);
    const [reportData, setReportData] = useState<IFeeStudentTermWisePaidReport[]>([]);
    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);
    const [selectedclassId, setSelectedClassId] = useState<number | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

    useEffect(() => {
        setReportData([]);
    }, [selectedclassId, selectedSectionId]);
    // Hooks
    const { data: academicYearData, isLoading: loadingYears } = useFeeStudentTermWisePaidReportAcademic();
    const { data: classListResponse, isLoading: loadingClasses } = useFeeStudentTermWisePaidReportClassdrop();
    const { data: sectionListResponse, isLoading: loadingSections } = useFeeStudentTermWisePaidReportSectionDrop();

    const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermforStudentTermWiseReport();

    useEffect(() => {
        if (feetermError) toast.error(feetermError?.message || 'Failed to load terms');
        else if (feetermData?.data) setFeeTerms(feetermData.data);
    }, [feetermData, feetermError]);

    const filteredData = useMemo(() => {
        const rows = [...reportData];
        return rows;
    }, [reportData]);

    const handleExportExcel = () => {
        exportToExcel(reportData, 'Fee_Term_Wise_Paid_Report');
    };

    const handlePrint = () => {
        const columns = ['Sl No', 'Adm No', 'Student Name', 'Class', 'Section', 'I Term', 'Total'].filter((col) => col !== '');

        const printableRows = reportData.map((row, index) => ({
            'Sl No': index + 1,
            'Adm No': row.admNumber,
            'Student Name': row.studentName,
            Class: row.className,
            Section: row.section,
            'I Term': row.fine,
            Total: row.collectionasperAcademicyear
        }));
        printTable(columns, printableRows);
    };

    const onSubmit: SubmitHandler<FormFields> = async () => {
        setReportLoading(true);
        setShowReport(false);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const mockData: IFeeStudentTermWisePaidReport[] = [
            {
                id: 10020,
                studentName: 'Rahul Sharma',
                admNumber: 2024001,
                feeHead: 'Tuition Fee',
                className: '10th Grade',
                section: 'C',
                RouteName: 'Route A - Downtown',
                ChargesasperAcademicyear: 50000,
                ConcessionasperAcademicyear: 5000,
                RebateScholarshipasperAcademicyear: 3000,
                waivedOffasperAcademicyear: 2000,
                collectionasperAcademicyear: 35000,
                fine: 500,
                balance: 12500,
                lastyearDue: 2500
            },
            {
                id: 10021,
                studentName: 'Priya Patel',
                admNumber: 2024002,
                feeHead: 'Transport + Tuition',
                section: 'A',
                className: '9th Grade',
                RouteName: 'Route B - Suburbs',
                ChargesasperAcademicyear: 75000,
                ConcessionasperAcademicyear: 8000,
                RebateScholarshipasperAcademicyear: 4000,
                waivedOffasperAcademicyear: 3000,
                collectionasperAcademicyear: 50000,
                fine: 1000,
                balance: 28500,
                lastyearDue: 0
            },
            {
                id: 10022,
                studentName: 'Amit Kumar',
                admNumber: 2024003,
                feeHead: 'Annual Charges',
                section: 'E',
                className: '11th Grade',
                RouteName: 'Route C - North Zone',
                ChargesasperAcademicyear: 20000,
                ConcessionasperAcademicyear: 2000,
                RebateScholarshipasperAcademicyear: 1000,
                waivedOffasperAcademicyear: 1000,
                collectionasperAcademicyear: 10000,
                fine: 200,
                balance: 8000,
                lastyearDue: 1500
            },
            {
                id: 10023,
                studentName: 'Sneha Reddy',
                admNumber: 2024004,
                feeHead: 'Tuition Fee',
                className: '12th Grade',
                section: 'D',
                RouteName: 'Route D - South Zone',
                ChargesasperAcademicyear: 60000,
                ConcessionasperAcademicyear: 6000,
                RebateScholarshipasperAcademicyear: 4000,
                waivedOffasperAcademicyear: 2000,
                collectionasperAcademicyear: 45000,
                fine: 0,
                balance: 15000,
                lastyearDue: 0
            },
            {
                id: 10024,
                studentName: 'Rohan Verma',
                admNumber: 2024005,
                feeHead: 'Lab + Tuition',
                className: '10th Grade',
                section: 'A',
                RouteName: 'Route A - Downtown',
                ChargesasperAcademicyear: 85000,
                ConcessionasperAcademicyear: 7000,
                RebateScholarshipasperAcademicyear: 5000,
                waivedOffasperAcademicyear: 4000,
                collectionasperAcademicyear: 65000,
                fine: 1500,
                balance: 42000,
                lastyearDue: 3000
            },
            {
                id: 10025,
                studentName: 'Anjali Mehta',
                admNumber: 2024006,
                feeHead: 'Tuition Fee',
                className: '8th Grade',
                section: 'B',
                RouteName: 'Route E - West Zone',
                ChargesasperAcademicyear: 42000,
                ConcessionasperAcademicyear: 4000,
                RebateScholarshipasperAcademicyear: 2000,
                waivedOffasperAcademicyear: 1000,
                collectionasperAcademicyear: 32000,
                fine: 300,
                balance: 6700,
                lastyearDue: 0
            },
            {
                id: 10026,
                studentName: 'Kunal Shah',
                admNumber: 2024007,
                feeHead: 'Transport Fee',
                className: '7th Grade',
                section: 'C',
                RouteName: 'Route F - City Center',
                ChargesasperAcademicyear: 18000,
                ConcessionasperAcademicyear: 1500,
                RebateScholarshipasperAcademicyear: 500,
                waivedOffasperAcademicyear: 0,
                collectionasperAcademicyear: 14000,
                fine: 0,
                balance: 2000,
                lastyearDue: 0
            },
            {
                id: 10027,
                studentName: 'Pavan Kumar',
                admNumber: 2024008,
                feeHead: 'Tuition + Lab',
                className: '9th Grade',
                section: 'D',
                RouteName: 'Route C - North Zone',
                ChargesasperAcademicyear: 78000,
                ConcessionasperAcademicyear: 6000,
                RebateScholarshipasperAcademicyear: 3000,
                waivedOffasperAcademicyear: 2000,
                collectionasperAcademicyear: 56000,
                fine: 800,
                balance: 15000,
                lastyearDue: 2000
            },
            {
                id: 10028,
                studentName: 'Divya Nair',
                admNumber: 2024009,
                feeHead: 'Tuition Fee',
                className: '6th Grade',
                section: 'A',
                RouteName: 'Route B - Suburbs',
                ChargesasperAcademicyear: 36000,
                ConcessionasperAcademicyear: 3000,
                RebateScholarshipasperAcademicyear: 1500,
                waivedOffasperAcademicyear: 500,
                collectionasperAcademicyear: 29000,
                fine: 0,
                balance: 2000,
                lastyearDue: 0
            },
            {
                id: 10029,
                studentName: 'Suresh Rao',
                admNumber: 2024010,
                feeHead: 'Annual Charges',
                className: '11th Grade',
                section: 'B',
                RouteName: 'Route D - South Zone',
                ChargesasperAcademicyear: 25000,
                ConcessionasperAcademicyear: 2000,
                RebateScholarshipasperAcademicyear: 1000,
                waivedOffasperAcademicyear: 500,
                collectionasperAcademicyear: 18000,
                fine: 400,
                balance: 5100,
                lastyearDue: 1000
            },
            {
                id: 10030,
                studentName: 'Mehul Jain',
                admNumber: 2024011,
                feeHead: 'Transport + Tuition',
                className: '10th Grade',
                section: 'E',
                RouteName: 'Route A - Downtown',
                ChargesasperAcademicyear: 90000,
                ConcessionasperAcademicyear: 10000,
                RebateScholarshipasperAcademicyear: 5000,
                waivedOffasperAcademicyear: 3000,
                collectionasperAcademicyear: 68000,
                fine: 1200,
                balance: 18000,
                lastyearDue: 4000
            },
            {
                id: 10031,
                studentName: 'Nisha Kulkarni',
                admNumber: 2024012,
                feeHead: 'Tuition Fee',
                className: '5th Grade',
                section: 'C',
                RouteName: 'Route F - City Center',
                ChargesasperAcademicyear: 30000,
                ConcessionasperAcademicyear: 2500,
                RebateScholarshipasperAcademicyear: 1000,
                waivedOffasperAcademicyear: 500,
                collectionasperAcademicyear: 24000,
                fine: 0,
                balance: 2000,
                lastyearDue: 0
            },
            {
                id: 10032,
                studentName: 'Ritesh Singh',
                admNumber: 2024013,
                feeHead: 'Lab + Tuition',
                className: '12th Grade',
                section: 'A',
                RouteName: 'Route C - North Zone',
                ChargesasperAcademicyear: 95000,
                ConcessionasperAcademicyear: 12000,
                RebateScholarshipasperAcademicyear: 6000,
                waivedOffasperAcademicyear: 4000,
                collectionasperAcademicyear: 70000,
                fine: 0,
                balance: 23000,
                lastyearDue: 5000
            },
            {
                id: 10033,
                studentName: 'Shalini Das',
                admNumber: 2024014,
                feeHead: 'Tuition Fee',
                className: '7th Grade',
                section: 'D',
                RouteName: 'Route E - West Zone',
                ChargesasperAcademicyear: 34000,
                ConcessionasperAcademicyear: 3000,
                RebateScholarshipasperAcademicyear: 1200,
                waivedOffasperAcademicyear: 800,
                collectionasperAcademicyear: 26000,
                fine: 200,
                balance: 2800,
                lastyearDue: 0
            },
            {
                id: 10034,
                studentName: 'Aditya Malhotra',
                admNumber: 2024015,
                feeHead: 'Transport Fee',
                className: '8th Grade',
                section: 'E',
                RouteName: 'Route B - Suburbs',
                ChargesasperAcademicyear: 22000,
                ConcessionasperAcademicyear: 2000,
                RebateScholarshipasperAcademicyear: 0,
                waivedOffasperAcademicyear: 0,
                collectionasperAcademicyear: 17000,
                fine: 500,
                balance: 3500,
                lastyearDue: 0
            }
        ];

        setReportData(mockData);
        setShowReport(true);
        setReportLoading(false);

        toast.success('Report generated successfully!');

        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <h1 className='mb-8 font-bold text-3xl text-gray-900'>Fee Student Term Wise Paid Report</h1>
                            <div className='space-y-8'>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2'>
                                    <div className='space-y-3'>
                                        <div className='space-y-3'>
                                            <Label className='font-semibold text-lg'>
                                                Academic Year <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='academicYearId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(v) => {
                                                            const num = Number(v);
                                                            field.onChange(num);
                                                        }}>
                                                        <SelectTrigger className='w-full text-center'>
                                                            <SelectValue placeholder='--Select Academic Year--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingYears ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                academicYearData?.data?.map((item: any) => (
                                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                        {item.asmaY_Year}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.academicYearId && (
                                                <FormError className='mt-1'>{errors.academicYearId.message}</FormError>
                                            )}{' '}
                                        </div>

                                        <div className='space-y-3'>
                                            <Label htmlFor='asmcl_Id' className='font-semibold text-lg'>
                                                Class <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='asmcl_Id'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(val) => {
                                                            const id = Number(val);
                                                            field.onChange(id);
                                                            setSelectedClassId(id);
                                                        }}>
                                                        <SelectTrigger className='w-full text-center'>
                                                            <SelectValue placeholder='--Select Class--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingClasses ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                classListResponse?.data?.map((item) => (
                                                                    <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                                                        {item.asmcL_ClassName}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>

                                        {errors.asmcl_Id && (
                                            <div className='mt-1'>
                                                <Label />
                                                <FormError>{errors.asmcl_Id.message}</FormError>
                                            </div>
                                        )}

                                        {/* Section */}

                                        <div className='space-y-3'>
                                            <Label htmlFor='asms_Id' className='font-semibold text-lg'>
                                                Section <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='asms_Id'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(val) => {
                                                            const id = Number(val);
                                                            field.onChange(id);
                                                            setSelectedSectionId(id);
                                                        }}>
                                                        <SelectTrigger className='w-full text-center'>
                                                            <SelectValue placeholder='--Select Section--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingSections ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                sectionListResponse?.data?.map((item) => (
                                                                    <SelectItem key={item.asmS_Id} value={String(item.asmS_Id)}>
                                                                        {item.asmC_SectionName}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>

                                        {errors.asms_Id && (
                                            <div className='mt-1'>
                                                <Label />
                                                <FormError>{errors.asms_Id.message}</FormError>
                                            </div>
                                        )}
                                    </div>
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Fee Term <span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            <Controller
                                                name='termIds'
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    const allIds = feeTerms.map((t) => t.fmT_Id);

                                                    const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

                                                    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

                                                    return (
                                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                            {/* SELECT ALL */}
                                                            <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                                <Checkbox
                                                                    checked={isAllSelected}
                                                                    indeterminate={isIndeterminate}
                                                                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                        const value = checked === true ? allIds : [];

                                                                        field.onChange(value);
                                                                        setValue('termIds', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                            shouldTouch: true
                                                                        });
                                                                    }}
                                                                />
                                                                <span>Select All</span>
                                                            </Label>

                                                            {/* LOADING */}
                                                            {loadingfeeterm ? (
                                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                            ) : feeTerms.length > 0 ? (
                                                                feeTerms.map((term) => {
                                                                    const checked = selectedIds.includes(term.fmT_Id);

                                                                    return (
                                                                        <Label
                                                                            key={term.fmT_Id}
                                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                            <Checkbox
                                                                                checked={checked}
                                                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                                    const value =
                                                                                        checked === true
                                                                                            ? [...selectedIds, term.fmT_Id]
                                                                                            : selectedIds.filter(
                                                                                                  (id) => id !== term.fmT_Id
                                                                                              );

                                                                                    field.onChange(value);
                                                                                    setValue('termIds', value, {
                                                                                        shouldValidate: true,
                                                                                        shouldDirty: true,
                                                                                        shouldTouch: true
                                                                                    });
                                                                                }}
                                                                            />
                                                                            <span className='text-sm'>{term.fmT_Name}</span>
                                                                        </Label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className='py-4 text-center text-gray-500'>No terms</div>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </Card>
                                        {errors.termIds && <FormError>{errors.termIds.message}</FormError>}
                                    </div>
                                </div>

                                <div>
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button size='lg' variant='outline' className='px-8' onClick={() => window.location.reload()}>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={isSubmitting} className='min-w-32'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                    </div>
                                    {showReport && reportData.length > 0 && (
                                        <div className='-mx-8 mt-12 overflow-hidden rounded-lg bg-white shadow-xl'>
                                            {/* Loading State */}
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
                                                    <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                        <div className='mb-6 text-center'>
                                                            <h2 className='font-bold text-2xl text-primary'>
                                                                Fee Student Term Wise Paid Report
                                                            </h2>
                                                        </div>
                                                        <div className='flex gap-3'>
                                                            <div className='mb-4 flex justify-end gap-2'>
                                                                <Button
                                                                    size='sm'
                                                                    className='h-8 w-auto px-3 text-xs'
                                                                    onClick={handleExportExcel}>
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
                                                    <div>
                                                        {/* Table */}
                                                        <div className='overflow-x-auto border'>
                                                            <table className='w-full table-auto border-collapse'>
                                                                <thead className='bg-primary text-white'>
                                                                    <tr>
                                                                        <th className='border px-2 py-2'>Sl No</th>
                                                                        <th className='border px-2 py-2'>Adm No</th>
                                                                        <th className='border px-2 py-2'>Student Name</th>
                                                                        <th className='border px-2 py-2'>Class</th>
                                                                        <th className='border px-2 py-2'>Section</th>
                                                                        <th className='border px-2 py-2'>I Term</th>
                                                                        <th className='border px-2 py-2'>Total</th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    {filteredData.map((row, index) => (
                                                                        <tr key={row.id} className='border-b'>
                                                                            <td className='border px-2 py-2 text-center'>{index + 1}</td>
                                                                            <td className='border px-2 py-2 text-center'>
                                                                                {row.admNumber}
                                                                            </td>
                                                                            <td className='border px-2 py-2 text-center'>
                                                                                {row.studentName}
                                                                            </td>
                                                                            <td className='border px-2 py-2 text-center'>
                                                                                {row.className}
                                                                            </td>
                                                                            <td className='border px-2 py-2 text-center'>{row.section}</td>
                                                                            <td className='border px-2 py-2 text-center'>{row.fine}</td>
                                                                            <td className='border px-2 py-2 text-center'>
                                                                                {row.collectionasperAcademicyear}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </CollapsibleSection>
                                            )}
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
