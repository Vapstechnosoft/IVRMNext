'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useSTCSExportTotalStrengthReport,
    useSTCSTotalStrengthClasses,
    useSTCSTotalStrengthElectives,
    useSTCSTotalStrengthInitialDetails,
    useSTCSTotalStrengthReportDetails,
    useSTCSTotalStrengthSections
} from '@/hooks/admission/preadmission/useSTCSTotalStrength';
import { cn } from '@/lib/utils';
import { STCS_TotalStrengthSchema } from '@/schemas/admission/preadmission/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, FileSpreadsheet, FileText, Printer, RotateCcw, Square } from 'lucide-react';
import { Fragment, useRef, useState, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { z } from 'zod';
import { TotalStrengthPrint } from './_components/total-strength-print';

type FormFields = z.infer<typeof STCS_TotalStrengthSchema>;

export default function TotalStrengthPage() {
    const printRef = useRef<HTMLDivElement>(null);
    const [showReport, setShowReport] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const { data: academicYear, isLoading: ayLoading } = useAcademicYearDropdown();

    // Dropdown Hooks
    const { data: initialDetails, isLoading: initialLoading } = useSTCSTotalStrengthInitialDetails();

    const {
        control,
        watch,
        setValue,
        reset,
        trigger,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(STCS_TotalStrengthSchema),
        defaultValues: {
            reportType: 'All',
            status: 'Present',
            withTc: false,
            withDeactive: false,
            academicYear: 0,
            category: '0',
            class: '0',
            section: '0',
            electives: []
        }
    });

    const watchAcademicYear = watch('academicYear');
    const watchCategory = watch('category');
    const watchClass = watch('class');
    const watchReportType = watch('reportType');
    const watchStatus = watch('status');
    const watchElectives = watch('electives') || [];

    const { data: electiveResponse, isLoading: electiveLoading } = useSTCSTotalStrengthElectives(watchAcademicYear);
    const electiveList = electiveResponse?.data;
    const { data: classResponse, isLoading: classLoading } = useSTCSTotalStrengthClasses(watchAcademicYear, Number(watchCategory || 0));
    const classList = classResponse?.data;
    const { data: sectionResponse, isLoading: sectionLoading } = useSTCSTotalStrengthSections(watchAcademicYear, Number(watchClass || 0), Number(watchCategory || 0));
    const sectionList = sectionResponse?.data;

    const [reportPayload, setReportPayload] = useState<any>(null);
    const { data: reportResponse, isLoading: isReportLoading } = useSTCSTotalStrengthReportDetails(reportPayload);

    const handleReport = async () => {
        const isValid = await trigger();
        if (isValid) {
            const values = watch();

            let AMST_SOL = 'S';
            if (values.status === 'Present') AMST_SOL = 'S';
            else if (values.status === 'Left') AMST_SOL = 'L';
            else if (values.status === 'Deactive') AMST_SOL = 'D';

            const payload = {
                ASMAY_Id: values.academicYear,
                ASMCL_Id: values.reportType === 'All' ? 0 : Number(values.class),
                ASMC_Id: values.reportType === 'All' ? 0 : Number(values.section),
                Status_Flag: values.reportType === 'All' ? 'all' : 'indi',
                AMST_SOL: AMST_SOL,
                withtc: values.withTc ? 'Y' : 'N',
                withdeactive: values.withDeactive ? 'Y' : 'N',
                AMC_Id: Number(values.category || 0),
                Electivearray: values.electives.map(id => {
                    const item = Array.isArray(electiveList?.allElectives) ? (electiveList.allElectives as any[]).find((e: any) => e.ismS_Id === id) : undefined;
                    return { ismS_Id: id, ismS_SubjectName: item?.ismS_SubjectName || '' };
                })
            };

            setReportPayload(payload);
            setShowReport(true);
        }
    };

    const handleReset = () => {
        reset();
        setShowReport(false);
        setReportPayload(null);
    };

    const studentList: any[] = useMemo(() => {
        const list = reportResponse?.studentlist;
        return Array.isArray(list) ? list : [];
    }, [reportResponse]);

    const dynamicElectives: any[] = useMemo(() => {
        const list = reportResponse?.electivelist;
        return Array.isArray(list) ? list : [];
    }, [reportResponse]);

    const groupedData = useMemo(() => {
        const grouped: Record<number, any[]> = {};
        studentList.forEach((item: any) => {
            const rowNum = item.RowNumber || 0;
            if (!grouped[rowNum]) grouped[rowNum] = [];
            grouped[rowNum].push(item);
        });
        return grouped;
    }, [studentList]);

    const calculateClassTotalByRow = (rowNumber: number, field: string) => {
        const items = groupedData[rowNumber] || [];
        return items.reduce((sum, item) => sum + (item[field] || 0), 0);
    };

    const calculateGrandTotal = (field: string) => {
        return studentList.reduce((sum: number, item: any) => sum + (item[field] || 0), 0);
    };

    const triggerPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Total_Strength_Report'
    });

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            triggerPrint();
            setIsPrinting(false);
        }, 500);
    };

    const exportToExcelMutation = useSTCSExportTotalStrengthReport();

    const handleExportExcel = async () => {
        if (!reportPayload) return;
        try {
            const data = await exportToExcelMutation.mutateAsync(reportPayload);
            const blob = new Blob([new Uint8Array(data)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'TotalStrengthReport.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Excel exported successfully');
        } catch (error) {
            toast.error('Failed to export Excel');
        }
    };

    const toggleElective = (id: number) => {
        const current = [...watchElectives];
        const index = current.indexOf(id);
        if (index > -1) current.splice(index, 1);
        else current.push(id);
        setValue('electives', current);
    };

    const handleSelectAllElectives = () => {
        const allElectives = electiveList?.allElectives;
        if (watchElectives.length === (Array.isArray(allElectives) ? allElectives.length : 0)) {
            setValue('electives', []);
        } else {
            setValue('electives', Array.isArray(allElectives) ? (allElectives as any[]).map((e: any) => e.ismS_Id) : []);
        }
    };

    return (
        <div className='min-h-screen p-1'>
            <CollapsibleSection title='Total Strength Report' defaultOpen={true}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-4'>
                    <div className='space-y-4 border rounded-lg p-4 bg-gray-50/50'>
                        <div className='flex justify-center gap-8'>
                            <Controller
                                name='reportType'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='All' id='r-all' />
                                            <Label htmlFor='r-all'>All</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Individual' id='r-ind' />
                                            <Label htmlFor='r-ind'>Individual</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className='flex justify-center gap-8'>
                            <Controller
                                name='status'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Present' id='s-pre' />
                                            <Label htmlFor='s-pre'>Present</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Left' id='s-left' />
                                            <Label htmlFor='s-left'>Left</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Deactive' id='s-dea' />
                                            <Label htmlFor='s-dea'>Deactive</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className='flex justify-center gap-8 border-t pt-4'>
                            <div className='flex items-center gap-2'>
                                <Controller
                                    name='withTc'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='with-tc' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='with-tc'>With TC</Label>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Controller
                                    name='withDeactive'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='with-dea' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='with-dea'>With Deactive</Label>
                            </div>
                        </div>
                    </div>

                    <div className='space-y-4 border rounded-lg p-4 bg-gray-50/50'>
                        <div className='grid grid-cols-1 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='academicYear' className='font-medium'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='academicYear'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value > 0 ? field.value.toString() : ''}
                                            onValueChange={(value) => field.onChange(Number(value))}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent className='max-h-60'>
                                                {ayLoading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    academicYear?.data?.map((y) => (
                                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                            {y.asmaY_Year}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                            </div>

                            <div className='space-y-1'>
                                <Label>Category</Label>
                                <Controller
                                    name='category'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue placeholder='Select Category' /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='0'>All</SelectItem>
                                                {Array.isArray(initialDetails?.data?.category_list) && (initialDetails.data.category_list as any[]).map((c: any) => (
                                                    <SelectItem key={c.amC_Id} value={c.amC_Id.toString()}>{c.amC_Name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {watchReportType === 'Individual' && (
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-1'>
                                        <Label>Class <span className='text-red-500'>*</span></Label>
                                        <Controller
                                            name='class'
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger><SelectValue placeholder='Select Class' /></SelectTrigger>
                                                    <SelectContent>
                                                        {Array.isArray(classList?.allClass) && classList.allClass.map((c: any) => (
                                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>{c.asmcL_ClassName}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.class && <FormError>{errors.class.message}</FormError>}
                                    </div>
                                    <div className='space-y-1'>
                                        <Label>Section <span className='text-red-500'>*</span></Label>
                                        <Controller
                                            name='section'
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger><SelectValue placeholder='Select Section' /></SelectTrigger>
                                                    <SelectContent>
                                                        {Array.isArray(sectionList?.allSection) && sectionList.allSection.map((s: any) => (
                                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>{s.asmC_SectionName}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.section && <FormError>{errors.section.message}</FormError>}
                                    </div>
                                </div>
                            )}

                            <div className='space-y-1 border rounded p-2 bg-white'>
                                <div className='flex items-center justify-between border-b pb-1 mb-1'>
                                    <Label className='font-bold cursor-pointer flex items-center gap-2' onClick={handleSelectAllElectives}>
                                        <Checkbox checked={watchElectives.length === (Array.isArray(electiveList?.allElectives) ? electiveList.allElectives.length : 0) && watchElectives.length > 0} />
                                        Elective Subjects
                                    </Label>
                                </div>
                                <div className='max-h-32 overflow-y-auto grid grid-cols-2 gap-2'>
                                    {Array.isArray(electiveList?.allElectives) && (electiveList.allElectives as any[]).map((e: any) => (
                                        <div key={e.ismS_Id} className='flex items-center gap-2 text-sm'>
                                            <Checkbox
                                                id={`e-${e.ismS_Id}`}
                                                checked={watchElectives.includes(e.ismS_Id)}
                                                onCheckedChange={() => toggleElective(e.ismS_Id)}
                                            />
                                            <Label htmlFor={`e-${e.ismS_Id}`} className='cursor-pointer truncate'>{e.ismS_SubjectName}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex justify-center gap-4 p-4 border-t'>
                    <Button variant='outline' onClick={handleReset}><RotateCcw className='mr-2 h-4 w-4' /> Reset</Button>
                    <Button onClick={handleReport} disabled={isReportLoading}><FileText className='mr-2 h-4 w-4' /> Report</Button>
                    <Button variant='outline' onClick={handleExportExcel} disabled={!showReport}><FileSpreadsheet className='mr-2 h-4 w-4' /> Excel</Button>
                    <Button variant='outline' onClick={handlePrint} disabled={!showReport}><Printer className='mr-2 h-4 w-4' /> Print</Button>
                </div>
            </CollapsibleSection>

            {showReport && (
                <div className='mt-4'>
                    <CollapsibleSection title='Report Details' defaultOpen={true}>
                        <div className='overflow-x-auto p-4'>
                            <table className='w-full border-collapse border border-gray-300 text-sm'>
                                <thead>
                                    <tr className='bg-gray-100 uppercase'>
                                        <th className='border border-gray-300 p-2'>Sl.No</th>
                                        <th className='border border-gray-300 p-2 text-left'>Class</th>
                                        <th className='border border-gray-300 p-2 text-left'>Section</th>
                                        <th className='border border-gray-300 p-2'>Boys</th>
                                        <th className='border border-gray-300 p-2'>Girls</th>
                                        {dynamicElectives.map((e: any) => (
                                            <th key={e.ISMS_Id} className='border border-gray-300 p-2'>{e.ISMS_SubjectName}</th>
                                        ))}
                                        <th className='border border-gray-300 p-2'>New Adm</th>
                                        <th className='border border-gray-300 p-2 text-right'>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(groupedData)
                                        .sort(([a], [b]) => Number(a) - Number(b))
                                        .map(([rowNumber, sections], index) => (
                                            <Fragment key={rowNumber}>
                                                {sections.map((item: any, sectionIndex) => (
                                                    <tr key={`${rowNumber}-${sectionIndex}`} className='hover:bg-gray-50'>
                                                        <td className='border border-gray-300 p-2 text-center'>{sectionIndex === 0 ? index + 1 : ''}</td>
                                                        <td className='border border-gray-300 p-2'>{sectionIndex === 0 ? item.classname : ''}</td>
                                                        <td className='border border-gray-300 p-2'>{item.sectionname}</td>
                                                        <td className='border border-gray-300 p-2 text-center'>{item.boys}</td>
                                                        <td className='border border-gray-300 p-2 text-center'>{item.girls}</td>
                                                        {dynamicElectives.map((e: any) => (
                                                            <td key={e.ISMS_Id} className='border border-gray-300 p-2 text-center'>{item[e.ISMS_SubjectName] || 0}</td>
                                                        ))}
                                                        <td className='border border-gray-300 p-2 text-center'>{item.newAdmission || 0}</td>
                                                        <td className='border border-gray-300 p-2 text-right font-medium'>{item.totalstudents}</td>
                                                    </tr>
                                                ))}
                                                <tr className='bg-blue-50 font-bold'>
                                                    <td colSpan={3} className='border border-gray-300 p-2 text-right'>
                                                        Total for {sections[0]?.classname}
                                                    </td>
                                                    <td className='border border-gray-300 p-2 text-center'>{calculateClassTotalByRow(Number(rowNumber), 'boys')}</td>
                                                    <td className='border border-gray-300 p-2 text-center'>{calculateClassTotalByRow(Number(rowNumber), 'girls')}</td>
                                                    {dynamicElectives.map((e: any) => (
                                                        <td key={e.ISMS_Id} className='border border-gray-300 p-2 text-center'>{calculateClassTotalByRow(Number(rowNumber), e.ISMS_SubjectName)}</td>
                                                    ))}
                                                    <td className='border border-gray-300 p-2 text-center'>{calculateClassTotalByRow(Number(rowNumber), 'newAdmission')}</td>
                                                    <td className='border border-gray-300 p-2 text-right'>{calculateClassTotalByRow(Number(rowNumber), 'totalstudents')}</td>
                                                </tr>
                                            </Fragment>
                                        ))}
                                    <tr className='bg-green-100 font-black text-base uppercase'>
                                        <td colSpan={3} className='border border-gray-300 p-2 text-right'>Grand Total</td>
                                        <td className='border border-gray-300 p-2 text-center'>{calculateGrandTotal('boys')}</td>
                                        <td className='border border-gray-300 p-2 text-center'>{calculateGrandTotal('girls')}</td>
                                        {dynamicElectives.map((e: any) => (
                                            <td key={e.ISMS_Id} className='border border-gray-300 p-2 text-center'>{calculateGrandTotal(e.ISMS_SubjectName)}</td>
                                        ))}
                                        <td className='border border-gray-300 p-2 text-center'>{calculateGrandTotal('newAdmission')}</td>
                                        <td className='border border-gray-300 p-2 text-right'>{calculateGrandTotal('totalstudents')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            <div style={{ display: 'none' }}>
                <TotalStrengthPrint
                    ref={printRef}
                    groupedData={groupedData}
                    totalGrand={calculateGrandTotal('totalstudents')}
                    dynamicElectives={dynamicElectives}
                />
            </div>
        </div>
    );
}
