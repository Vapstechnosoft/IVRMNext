'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useState, useMemo, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileText, Printer, RotateCcw, X, Search, CheckSquare, Square, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

import { CategoryWiseAttendanceSchema } from '@/schemas/admission/preadmission/reports';
import {
    useCategoryWiseAttendanceInitialDetails,
    useCategoryWiseAttendanceReport
} from '@/hooks/admission/preadmission/useCategoryWiseAttendance';
import { CategoryWiseAttendancePrint } from './_components/category-wise-attendance-print';

export default function CategoryWiseAttendancePage() {
    /* ---------------- Hooks & State ---------------- */

    const { data: initialData, isLoading: isInitialLoading } = useCategoryWiseAttendanceInitialDetails();
    const [reportPayload, setReportPayload] = useState<{ asmaY_Id: number; fromdate: Date; categoryIds: number[] } | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [printTimestamp, setPrintTimestamp] = useState('');
    const printRef = useRef<HTMLDivElement>(null);

    const { data: reportResponse, isFetching: isReportLoading, error: reportError } = useCategoryWiseAttendanceReport(
        reportPayload?.asmaY_Id ?? 0,
        reportPayload?.fromdate,
        reportPayload?.categoryIds ?? [],
        {},
        showReport
    );

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(CategoryWiseAttendanceSchema),
        defaultValues: {
            asmaY_Id: 0,
            categoryList: [] as number[],
            date: new Date()
        }
    });

    const watchedYear = watch('asmaY_Id');
    const selectedCategories = watch('categoryList');

    /* ---------------- Memoized Data ---------------- */

    const years = (initialData?.data as any)?.academicList || [];
    const categories = (initialData?.data as any)?.category_list || [];
    const logoUrl = (reportResponse?.data as any)?.AMC_logo?.[0]?.amC_FilePath || (initialData?.data as any)?.imgname;

    const filteredCategories = useMemo(() => {
        return categories.filter((cat: any) =>
            cat.amC_Name.toLowerCase().includes(categorySearch.toLowerCase())
        );
    }, [categories, categorySearch]);

    const reportData = useMemo(() => {
        return (reportResponse?.data as any)?.studentAttendanceList || [];
    }, [reportResponse]);

    /* ---------------- Handlers ---------------- */

    const handleSelectAllCategories = (checked: boolean) => {
        if (checked) {
            setValue('categoryList', filteredCategories.map((c: any) => c.amC_Id));
        } else {
            setValue('categoryList', []);
        }
    };

    const onSubmit = (data: any) => {
        setReportPayload({
            asmaY_Id: data.asmaY_Id,
            fromdate: data.date,
            categoryIds: data.categoryList
        });
        setShowReport(true);
        toast.info('Generating report...');
    };

    const handleReset = () => {
        reset();
        setShowReport(false);
        setReportPayload(null);
    };

    const exportToExcel = () => {
        if (!reportData.length) return;

        const yearLabel = years.find((y: any) => y.asmaY_Id === reportPayload?.asmaY_Id)?.asmaY_Year || '';
        const reportDate = reportPayload?.fromdate ? format(reportPayload.fromdate, 'dd-MM-yyyy') : '';

        const worksheetData = reportData.map((row: any, idx: number) => ({
            'SL. No.': idx + 1,
            'Category Name': row.AMC_Name,
            'Total Boys': row.Total_Male,
            'Total Girls': row.Total_Female,
            'Total Students': (row.Total_Male || 0) + (row.Total_Female || 0),
            'Present Boys': row.Premale,
            'Present Girls': row.PreFemale,
            'Total Present': (row.Premale || 0) + (row.PreFemale || 0),
            'Absent Boys': row.absmale,
            'Absent Girls': row.absFemale,
            'Total Absent': (row.absmale || 0) + (row.absFemale || 0)
        }));

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
        XLSX.writeFile(wb, `CategoryWiseAttendance_${yearLabel}_${reportDate}.xlsx`);
    };

    const triggerPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'CategoryWiseAttendanceReport'
    });

    const handlePrint = () => {
        setPrintTimestamp(new Date().toLocaleString());
        setTimeout(() => triggerPrint(), 300);
    };

    /* ---------------- Table Config ---------------- */

    const columns: any[] = [
        {
            header: 'SL. No.',
            cell: (info: any) => info.row.index + 1,
            size: 70
        },
        {
            header: 'Category Name',
            accessorKey: 'AMC_Name',
            size: 200
        },
        {
            header: 'Total No. of Students on Roll',
            columns: [
                {
                    header: 'Total Boys',
                    accessorKey: 'Total_Male',
                    size: 110
                },
                {
                    header: 'Total Girls',
                    accessorKey: 'Total_Female',
                    size: 110
                },
                {
                    header: 'Total Students',
                    cell: (info: any) => (info.row.original.Total_Male || 0) + (info.row.original.Total_Female || 0),
                    size: 130
                }
            ]
        },
        {
            header: 'No. of Students Attended',
            columns: [
                {
                    header: 'Boys',
                    accessorKey: 'Premale',
                    size: 100
                },
                {
                    header: 'Girls',
                    accessorKey: 'PreFemale',
                    size: 100
                },
                {
                    header: 'Total Present',
                    cell: (info: any) => (info.row.original.Premale || 0) + (info.row.original.PreFemale || 0),
                    size: 140
                }
            ]
        },
        {
            header: 'No. of Students Absentees',
            columns: [
                {
                    header: 'Boys',
                    accessorKey: 'absmale',
                    size: 100
                },
                {
                    header: 'Girls',
                    accessorKey: 'absFemale',
                    size: 100
                },
                {
                    header: 'Total Absent',
                    cell: (info: any) => (info.row.original.absmale || 0) + (info.row.original.absFemale || 0),
                    size: 140
                }
            ]
        }
    ];

    /* ---------------- Render ---------------- */

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <CollapsibleSection title='Categorywise Attendance Report' defaultOpen>
                <form onSubmit={handleSubmit(onSubmit)} className='p-4 space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <div className='space-y-2'>
                                <Label>Academic Year *</Label>
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((y: any) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asmaY_Id && <p className='text-xs text-red-500'>{errors.asmaY_Id.message}</p>}
                            </div>

                            {/* Select Date */}
                            <div className='space-y-2'>
                                <Label>Select Date *</Label>
                                <Controller
                                    name='date'
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value}
                                            setDate={field.onChange}
                                            className='w-full'
                                        />
                                    )}
                                />
                                {errors.date && <p className='text-xs text-red-500'>{errors.date.message}</p>}
                            </div>
                        </div>

                        {/* Category Multiselect */}
                        <div className='space-y-2'>
                            <Label>Category *</Label>
                            <div className='border rounded-md p-2 space-y-2'>
                                <div className='relative'>
                                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        placeholder='Search category...'
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        className='pl-8 mb-2'
                                    />
                                </div>
                                <div className='flex items-center space-x-2 pb-2 border-b'>
                                    <Checkbox
                                        id='select-all'
                                        checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                                        onCheckedChange={(checked) => handleSelectAllCategories(!!checked)}
                                    />
                                    <label htmlFor='select-all' className='text-sm font-medium leading-none cursor-pointer'>
                                        Select All
                                    </label>
                                </div>
                                <div className='h-40 overflow-y-auto space-y-2 mt-2'>
                                    {filteredCategories.map((cat: any) => (
                                        <div key={cat.amC_Id} className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={`cat-${cat.amC_Id}`}
                                                checked={selectedCategories.includes(cat.amC_Id)}
                                                onCheckedChange={(checked) => {
                                                    const updated = !!checked
                                                        ? [...selectedCategories, cat.amC_Id]
                                                        : selectedCategories.filter((id) => id !== cat.amC_Id);
                                                    setValue('categoryList', updated);
                                                }}
                                            />
                                            <label htmlFor={`cat-${cat.amC_Id}`} className='text-sm leading-none cursor-pointer'>
                                                {cat.amC_Name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {errors.categoryList && <p className='text-xs text-red-500'>{errors.categoryList.message}</p>}
                        </div>
                    </div>

                    <div className='flex justify-center gap-3 pt-4 border-t'>
                        <Button type='submit' isLoading={isReportLoading}>
                            <FileText className='mr-2 h-4 w-4' />
                            Report
                        </Button>
                        <Button variant='outline' type='button' onClick={handleReset}>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Reset
                        </Button>
                        <Button variant='outline' type='button' disabled={!showReport || !reportData.length} onClick={exportToExcel}>
                            <FileSpreadsheet className='mr-2 h-4 w-4' />
                            Export
                        </Button>
                        <Button variant='outline' type='button' disabled={!showReport || !reportData.length} onClick={handlePrint}>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                        <Button variant='ghost' type='button'>
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {showReport && (
                <CollapsibleSection title='Report Details' defaultOpen>
                    <div className='p-4'>
                        <GenericDataTable
                            data={reportData}
                            columns={columns}
                            isLoading={isReportLoading}
                            noDataTitle='No records found for the selected criteria'
                            isPaginationRequired={reportData.length > 10}
                        />
                    </div>
                </CollapsibleSection>
            )}

            {/* Hidden Print Content */}
            <div style={{ display: 'none' }}>
                <CategoryWiseAttendancePrint
                    ref={printRef}
                    data={reportData}
                    academicYear={years.find((y: any) => y.asmaY_Id === reportPayload?.asmaY_Id)?.asmaY_Year}
                    date={reportPayload?.fromdate}
                    logoUrl={logoUrl}
                />
            </div>
        </div>
    );
}
