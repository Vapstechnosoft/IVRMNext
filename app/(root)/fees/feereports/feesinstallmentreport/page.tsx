'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    useFeeClassListDefaulterreport,
    useFeeInstallmentreportBusRouteDropdown,
    useFeeInstallmentreportCategoryDropdown,
    useFeeInstallmentreportGroupDropdown,
    useFeeInstallmentreporttermDropdown,
    useFeeSectionListDefaulterreport,
    useFeeTransInstallmentYearlyfeecollectionreport
} from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { feesInstallmentReportSchema } from '@/schemas/fees/reports';
import { getFeeConsolidatedReportData } from '@/server/fees/reports/feeConsolidatedReport';
import { getFeesSectionListByClassId } from '@/server/fees/reports/fee_DefaulterReport';
import {
    getFeeInstallmentReportHeadDropdown,
    getInstallemntReportInstallmentDropdownData
} from '@/server/fees/reports/fee_installment_report';
import type {
    ConsolidatedReportInstallemntDropdownList,
    IFeeClassDropdownList,
    IFeeSectionDropdownList,
    IFeeTrasactionInstallmentDropdownList,
    IInstallmentReportFeeTermDropdownList,
    InstallmentReportGroupDropdownList,
    InstallmentReportHeadDropdownList
} from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
type FormFields = z.infer<typeof feesInstallmentReportSchema>;

// Checkbox with full indeterminate support
const Checkbox = ({ checked, indeterminate, onCheckedChange, ...props }: any) => {
    const ref = useRef<HTMLButtonElement>(null);

    return <BaseCheckbox ref={ref} checked={checked} onCheckedChange={onCheckedChange} {...props} />;
};

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export default function FeeInstallemntReport() {
    type catg = 'Category' | 'Class' | 'transport' | 'Consolidate' | 'GroupWise';
    const userTypeOptions: { label: string; value: catg }[] = [
        { label: 'Category Wise', value: 'Category' },
        { label: 'Class Wise', value: 'Class' },
        { label: 'Transport', value: 'transport' },
        { label: 'Consolidate', value: 'Consolidate' },
        { label: 'Group Wise', value: 'GroupWise' }
    ];

    type con = 'Datewise' | 'Classwise';
    const conOptions: { label: string; value: con }[] = [
        { label: 'Date Wise', value: 'Datewise' },
        { label: 'Class Wise', value: 'Classwise' }
    ];

    const {
        handleSubmit,
        setValue,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feesInstallmentReportSchema),
        defaultValues: {
            catg: 'Category',
            academicYearId: undefined,
            classId: 0,
            sectionId: 0,
            con: 'Datewise'
        }
    });

    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        catg: 'Category' as catg,
        con: 'Datewise' as con,
        fromDate: new Date(),
        toDate: new Date(),

        academicYearId: '',
        classId: 0,
        sectionId: 0,
        installmentIds: [] as number[],
        termIds: [] as number[],
        groupIds: [] as number[],
        headIds: [] as number[]
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);

    const [reportData, setReportData] = useState<any[]>([]);
    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);

    const [installments, setInstallments] = useState<ConsolidatedReportInstallemntDropdownList[]>([]);

    const [heads, setHeads] = useState<InstallmentReportHeadDropdownList[]>([]);

    const [feeInstallments, setfeeInstallments] = useState<IFeeTrasactionInstallmentDropdownList[]>([]);

    const [feeTerms, setfeeTerms] = useState<IInstallmentReportFeeTermDropdownList[]>([]);

    const [feeGroups, setfeeGroups] = useState<InstallmentReportGroupDropdownList[]>([]);

    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'feeGroup' | 'totalDue' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [sectionLoading, setSectionLoading] = useState(false);

    const [installemnetsloding, setinstallemnetsloding] = useState(false);
    const [headsloading, setheadsloading] = useState(false);

    // Hooks
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();

    const {
        data: feeInstallmentData,
        isLoading: feeInstallmentLoading,
        error: feeInstallmentError
    } = useFeeTransInstallmentYearlyfeecollectionreport();

    const { data: termsdropdowndata, isLoading: termsloading, error: termserror } = useFeeInstallmentreporttermDropdown();
    //useFeeInstallmentreportGroupDropdown

    const { data: groupsdata, isLoading: groupsloading, error: groupserror } = useFeeInstallmentreportGroupDropdown();

    const {
        data: categorydropdowndata,
        isLoading: categoryloading,
        error: categoryerror,
        refetchAll: refetchCategory
    } = useFeeInstallmentreportCategoryDropdown();

    //heads

    // const { data: headsdata, isLoading: headsloading, error: headserror, refetchAll:  refetchHeads } = useFeeInstallmentreportCategoryDropdown();

    //useFeeInstallmentreportBusRouteDropdown

    const {
        data: busroutedata,
        isLoading: busrouteLoading,
        error: busrouteError,
        refetchAll: refetchBusRoute
    } = useFeeInstallmentreportBusRouteDropdown();

    useEffect(() => {
        if (feeInstallmentError) toast.error(feeInstallmentError?.message || 'Failed to load fee installments');
        else if (feeInstallmentData?.data) setfeeInstallments(feeInstallmentData.data);
    }, [feeInstallmentData, feeInstallmentError]);

    useEffect(() => {
        if (termserror) toast.error(termserror?.message || 'Failed to load fee terms');
        else if (termsdropdowndata?.data) setfeeTerms(termsdropdowndata.data);
    }, [termsdropdowndata, termserror]);

    useEffect(() => {
        if (groupserror) toast.error(groupserror?.message || 'Failed to load fee groups');
        else if (groupsdata?.data) setfeeGroups(groupsdata.data);
    }, [groupsdata, groupserror]);

    const {
        data: sectionListResponse,
        isLoading: loadingSections,
        error: sectionListError,
        refetch: refetchSections
    } = useFeeSectionListDefaulterreport();

    // Load data effects (unchanged)
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
            //  formatted.sort((a, b) => (b.asmaY_Order || 0) - (a.asmaY_Order || 0));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (classListError) {
            toast.error(classListError?.message || 'Failed to load classes');
            setClasses([]);
            return;
        }
        if (classListResponse?.data && Array.isArray(classListResponse.data)) {
            setClasses(classListResponse.data);
        }
    }, [classListResponse, classListError]);

    useEffect(() => {
        if (filters.classId > 0) refetchSections();
        else {
            setSections([]);
            setFilters((prev) => ({ ...prev, sectionId: 0 }));
        }
    }, [filters.classId, refetchSections]);

    const classId = watch('classId') ?? 0;
    const academicYearId = watch('academicYearId');
    //const includeClassSection = watch('includeClassSection');

    useEffect(() => {
        const fetchSections = async () => {
            if (!academicYearId || classId <= 0) {
                setSections([]);
                setValue('sectionId', 0);
                return;
            }

            setSectionLoading(true);

            try {
                const result = await getFeesSectionListByClassId(Number(academicYearId), classId);

                console.log('sectionsdata', result);

                const data = Array.isArray(result?.data) ? result.data : [];
                setSections(data);

                if (data.length === 0) {
                    toast.info('No sections found for this class');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to load sections');
                setSections([]);
            } finally {
                setSectionLoading(false);
            }
        };

        fetchSections();
    }, [academicYearId, classId, setValue]);

    //getInstallmentDropdownData

    useEffect(() => {
        const fetchInstallments = async () => {
            if (!academicYearId) {
                setInstallments([]);

                return;
            }

            setinstallemnetsloding(true);

            try {
                const result = await getInstallemntReportInstallmentDropdownData(Number(academicYearId));

                console.log('installments', JSON.stringify(result));
                const data = Array.isArray(result?.data) ? result.data : [];

                setInstallments(data);
                if (data.length === 0) {
                    //  toast.info('No sections found for this class');
                }
            } catch (error: any) {
                // toast.error(error.message);
                setInstallments([]);
            }
        };

        fetchInstallments();
    }, [academicYearId, setValue]);

    //heads

    const groupidnew = watch('fmg_id');

    console.log('groupidnew', groupidnew);

    useEffect(() => {
        const fetchHeads = async () => {
            if (!academicYearId && !groupidnew) {
                setHeads([]);

                return;
            }

            setheadsloading(true);

            try {
                const result = await getFeeInstallmentReportHeadDropdown(Number(academicYearId), Number(groupidnew));

                console.log('installments', JSON.stringify(result));
                const data = Array.isArray(result?.data) ? result.data : [];

                setHeads(data);
                if (data.length === 0) {
                    setheadsloading(false);
                    // toast.info('No Heads found ');
                }
            } catch (error: any) {
                // toast.error(error.message);
                setHeads([]);
            }
        };

        fetchHeads();
    }, [academicYearId, setValue, groupidnew]);

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

    function transformReportData(apiData: any[]) {
        const studentMap = new Map<string, any>();

        apiData.forEach((item) => {
            const key = `${item.amaY_RollNo}-${item.studentName}`;

            if (!studentMap.has(key)) {
                studentMap.set(key, {
                    rollNo: item.amaY_RollNo,
                    studentName: item.studentName?.trim(),
                    className: item.className,
                    sectionName: item.sectionName,
                    installments: {}
                });
            }

            studentMap.get(key).installments[String(item.ftI_Id)] = {
                receiptNo: item.receiptNo,
                date: item.date,
                chequeNo: item.chequeNo,
                amount: item.paid
            };
        });

        return Array.from(studentMap.values());
    }

    // const handleExportAlltype = () => {
    //     if (!reportData.length) {
    //         toast.error('No data to export');
    //         return;
    //     }

    //     const groupedRows = transformReportData(reportData);

    //     exportToExcelAll(groupedRows, installments, 'Fee Consolidated Report');
    // };

    const handleExportAlltype = () => {
        if (!reportData.length) {
            toast.error('No data to export');
            return;
        }

        // Remove this line: const groupedRows = transformReportData(reportData);
        // reportData is already pivoted/grouped for 'All' mode

        // exportToExcelAll(reportData, installments, 'Fee Consolidated Report');
    };

    const handlePrintAlltype = () => {
        if (!reportData.length) {
            toast.error('No data to print');
            return;
        }

        // printTableAll(reportData, installments);
    };

    const handleExport = () => {
        if (!selectedRows.length) {
            toast.error('Please select at least one record');
            return;
        }
        //exportToExcel(selectedRows, 'Fee Consolidated-Report');
    };

    const handlePrint = () => {
        if (!selectedRows.length) {
            toast.error('Please select at least one record');
            return;
        }

        const columns = [
            'Sl No',
            'Student Name',
            'Adm.No',
            'Class & Section',
            'Paid Amount',
            'Receipt No',
            'Bank Name',
            'Date',
            'Cheque No',
            'Cheque Date'
        ];

        const rowsToPrint = selectedRows.map((row, index) => ({
            'Sl No': index + 1,
            'Student Name': row.studentName,
            'Adm.No': row.admNo,
            'Class & Section': row.classSection,
            'Paid Amount': row.paidAmount,
            'Receipt No': row.receiptNo,
            'Bank Name': row.bankName,
            Date: row.chequeDate,
            'Cheque No': row.chequeNo,
            'Cheque Date': row.chequeDate
        }));

        // ✅ TOTAL ROW
        const totalAmount = selectedRows.reduce((sum, row) => sum + (row.tuitionFee || 0), 0);

        const totalRow = {
            // 'Sl No': '',
            // 'Student Name': 'TOTAL',
            // 'Mobile No': '',
            // 'Class/Section Name': '',
            // 'Receipt Date': '',
            // 'Receipt No': '',
            // 'Payment Mode': '',
            // 'DD/Cheque No': '',
            // 'Tuition Fee': totalAmount.toLocaleString()
        };

        //printTable(columns, rowsToPrint, totalRow);
    };

    const pivotReportData = (data: any[]) => {
        const grouped: Record<number, any> = {};

        data.forEach((item) => {
            const studentId = item.amsT_Id;

            if (!grouped[studentId]) {
                grouped[studentId] = {
                    id: studentId,
                    rollNo: item.amaY_RollNo,
                    studentName: item.studentName?.trim(),
                    className: item.className,
                    sectionName: item.sectionName,
                    installments: {}
                };
            }

            grouped[studentId].installments[item.ftI_Id] = {
                receiptNo: item.receiptNo,
                date: item.date,
                chequeNo: item.chequeNo,
                amount: item.paid
            };
        });

        return Object.values(grouped);
    };

    const selectedCatg = watch('catg');

    const selectedCon = watch('con');

    const termwise = watch('termswise');

    const toggleInstallment = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            installmentIds: prev.installmentIds.includes(id) ? prev.installmentIds.filter((x) => x !== id) : [...prev.installmentIds, id]
        }));

    const toggleHeads = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            headIds: prev.headIds.includes(id) ? prev.headIds.filter((x) => x !== id) : [...prev.headIds, id]
        }));

    const toggleterms = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            termIds: prev.termIds.includes(id) ? prev.termIds.filter((x) => x !== id) : [...prev.termIds, id]
        }));

    const allTermIds = feeTerms.map((t) => t.fmT_Id);

    const isAllTermsSelected = feeTerms.length > 0 && filters.termIds.length === feeTerms.length;

    const toggleAllTerms = () => {
        setFilters((prev) => ({
            ...prev,
            termIds: isAllTermsSelected ? [] : allTermIds
        }));
    };

    /////====

    const togglegroups = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            groupIds: prev.groupIds.includes(id) ? prev.groupIds.filter((x) => x !== id) : [...prev.groupIds, id]
        }));

    const allGroupIds = feeGroups.map((t) => t.fmG_Id);

    const isAllGroupsSelected = feeGroups.length > 0 && filters.groupIds.length === feeGroups.length;

    const toggleAllGroups = () => {
        setFilters((prev) => ({
            ...prev,
            groupIds: isAllGroupsSelected ? [] : allGroupIds
        }));
    };

    // const handleSubmit = async () => {
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setReportLoading(true);
        setShowReport(false);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        const response = await getFeeConsolidatedReportData(Number(data.academicYearId), data.classId, data.sectionId, filters.catg);

        console.log('responsedata', JSON.stringify(response));

        const mapIndiResponseToTable = (data: any[]) => {
            return data.map((item, index) => ({
                id: index + 1,
                studentName: item.studentName?.trim(),
                admNo: item.amaY_RollNo,
                classSection: `${item.className} ${item.sectionName}`,
                paidAmount: item.paid,
                receiptNo: item.receiptNo,
                bankName: item.fyP_Bank_Name || '',
                date: item.date,
                chequeNo: item.chequeNo || '',
                chequeDate: item.fyP_DD_Cheque_Date || ''
            }));
        };

        // if (filters.userType === 'indi') {
        //     const mappedData = mapIndiResponseToTable(response?.data || []);
        //     setReportData(mappedData);
        // } else {
        //     const pivoted = pivotReportData(response?.data || []);
        //     setReportData(pivoted);
        // }
        setReportData([]);
        setShowReport(true);
        setReportLoading(false);
        setLoading(false);
        setShowReport(true);
        setReportLoading(false);
        setLoading(false);

        toast.success('Report generated successfully');

        // Auto scroll to report
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    // const isAcademicYearSelected = !!filters.academicYearId;
    const isAcademicYearSelected = watch('academicYearId');

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <div className='space-y-8'>
                                {/* User Type Card */}
                                <Card className='border bg-gray-50 p-5 shadow-sm'>
                                    <div className='flex flex-wrap items-center justify-center gap-10'>
                                        <Controller
                                            name='catg'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex flex-wrap items-center justify-center gap-10'>
                                                    {userTypeOptions.map(({ label, value }) => (
                                                        <label key={value} className='flex cursor-pointer items-center gap-3'>
                                                            <input
                                                                type='radio'
                                                                name={field.name} // IMPORTANT
                                                                value={value}
                                                                checked={field.value === value}
                                                                onChange={() => field.onChange(value)}
                                                                className='h-5 w-5 accent-primary'
                                                            />
                                                            <span className='font-medium text-base'>{label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </Card>
                                {selectedCatg === 'Consolidate' && (
                                    <Card className='border bg-gray-50 p-5 shadow-sm'>
                                        <div className='flex flex-wrap items-center justify-center gap-10'>
                                            <Controller
                                                name='con'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex flex-wrap items-center justify-center gap-10'>
                                                        {conOptions.map(({ label, value }) => (
                                                            <label key={value} className='flex cursor-pointer items-center gap-3'>
                                                                <input
                                                                    type='radio'
                                                                    name={field.name} // IMPORTANT
                                                                    value={value}
                                                                    checked={field.value === value}
                                                                    onChange={() => field.onChange(value)}
                                                                    className='h-5 w-5 accent-primary'
                                                                />
                                                                <span className='font-medium text-base'>{label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </Card>
                                )}

                                <div className='flex items-center gap-12'>
                                    {/* Academic Year */}
                                    <div className='flex w-[420px] items-center gap-4'>
                                        <Label className='w-36 text-right'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>

                                        <div className='flex-1'>
                                            <Controller
                                                name='academicYearId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(v) => field.onChange(Number(v))}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='--Select Academic Year--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {academicYears.map((item) => (
                                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                    {item.asmaY_Year}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                        </div>
                                    </div>

                                    {(selectedCatg === 'Class' || selectedCatg === 'Category') && (
                                        <div className='flex items-center gap-3'>
                                            <Controller
                                                name='termswise'
                                                control={control}
                                                render={({ field }) => (
                                                    <input
                                                        type='checkbox'
                                                        checked={field.value === 1}
                                                        onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                                        className='h-4 w-4'
                                                    />
                                                )}
                                            />
                                            <Label className='font-medium'>Terms Wise</Label>
                                        </div>
                                    )}

                                    {selectedCatg === 'GroupWise' && (
                                        <>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='termswise'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value === 1}
                                                            onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Active</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='termswise'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value === 1}
                                                            onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>De-Active</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='termswise'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value === 1}
                                                            onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Left</Label>
                                            </div>
                                        </>
                                    )}

                                    {selectedCatg === 'transport' && (
                                        <div className='flex items-center gap-12'>
                                            <>
                                                <Label className='w-36 text-right'>
                                                    Fee Head <span className='text-red-500'>*</span>
                                                </Label>
                                                <Card className='border bg-gray-50 p-4'>
                                                    <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                        {/* <Label
                                                    htmlFor='installmentSelectAll'
                                                    className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
                                                        id='installmentSelectAll'
                                                        checked={
                                                            feeInstallments.length > 0 &&
                                                            filters.installmentIds.length === feeInstallments.length
                                                        }
                                                        indeterminate={
                                                            filters.installmentIds.length > 0 &&
                                                            filters.installmentIds.length < feeInstallments.length
                                                        }
                                                        onCheckedChange={(checked: any) => selectAllInstallments(!!checked)}
                                                    />
                                                    <span>Select All</span>
                                                </Label> */}

                                                        {headsloading ? (
                                                            <div className='py-6 text-center text-gray-500'>Loading...</div>
                                                        ) : heads.length > 0 ? (
                                                            heads.map((hd) => (
                                                                <Label
                                                                    key={hd.fmH_Id}
                                                                    htmlFor={`hd-${hd.fmH_Id}`}
                                                                    className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                    <Checkbox
                                                                        id={`hd-${hd.fmH_Id}`}
                                                                        checked={filters.installmentIds.includes(hd.fmH_Id)}
                                                                        onCheckedChange={() => toggleHeads(hd.fmH_Id)}
                                                                    />
                                                                    <span className='text-sm'>{hd.fmH_FeeName}</span>
                                                                </Label>
                                                            ))
                                                        ) : (
                                                            <div className='py-4 text-center text-gray-500'>No fee heads found</div>
                                                        )}
                                                    </div>
                                                </Card>
                                            </>
                                        </div>
                                    )}

                                    {selectedCatg === 'Consolidate' && selectedCon === 'Datewise' && (
                                        <>
                                            <div className='flex w-[420px] items-center gap-4'>
                                                <Label htmlFor='fromDate'>
                                                    From Date: <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
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
                                            <div className='flex w-[420px] items-center gap-4'>
                                                <Label htmlFor='fromDate'>
                                                    To Date: <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    id='toDate'
                                                    type='date'
                                                    value={filters.toDate.toISOString().split('T')[0]}
                                                    onChange={(e) =>
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            fromDate: new Date(e.target.value)
                                                        }))
                                                    }
                                                    className='rounded border px-3 py-1'
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {(selectedCatg === 'Class' || selectedCatg === 'GroupWise' || selectedCon === 'Classwise') && (
                                    <div className='mt-4 flex items-center gap-12'>
                                        {/* Class */}
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Class <span className='text-red-500'>*</span>
                                            </Label>

                                            <div className='flex-1'>
                                                <Controller
                                                    name='classId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value ? field.value.toString() : ''}
                                                            onValueChange={(v) => {
                                                                field.onChange(Number(v));
                                                                setValue('sectionId', 0);
                                                            }}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--Select Class--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {classes.map((cls) => (
                                                                    <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                                        {cls.asmcL_ClassName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.classId && <FormError>{errors.classId.message}</FormError>}
                                            </div>
                                        </div>

                                        {/* Section */}
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Section <span className='text-red-500'>*</span>
                                            </Label>

                                            <div className='flex-1'>
                                                <Controller
                                                    name='sectionId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value ? field.value.toString() : ''}
                                                            onValueChange={(v) => field.onChange(Number(v))}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--All--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {sections.map((sec) => (
                                                                    <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                                        {sec.asmC_SectionName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.sectionId && <FormError>{errors.sectionId.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selectedCatg === 'GroupWise' && (
                                    <div className='flex items-center gap-12'>
                                        <>
                                            <Label className='w-36 text-right'>
                                                Group <span className='text-red-500'>*</span>
                                            </Label>
                                            <Card className='border bg-gray-50 p-4'>
                                                <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                    {/* <Label
                                                    htmlFor='installmentSelectAll'
                                                    className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
                                                        id='installmentSelectAll'
                                                        checked={
                                                            feeInstallments.length > 0 &&
                                                            filters.installmentIds.length === feeInstallments.length
                                                        }
                                                        indeterminate={
                                                            filters.installmentIds.length > 0 &&
                                                            filters.installmentIds.length < feeInstallments.length
                                                        }
                                                        onCheckedChange={(checked: any) => selectAllInstallments(!!checked)}
                                                    />
                                                    <span>Select All</span>
                                                </Label> */}

                                                    {groupsloading ? (
                                                        <div className='py-6 text-center text-gray-500'>Loading...</div>
                                                    ) : feeGroups.length > 0 ? (
                                                        feeGroups.map((grp) => (
                                                            <Label
                                                                key={grp.fmG_Id}
                                                                htmlFor={`installment-${grp.fmG_Id}`}
                                                                className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                <Checkbox
                                                                    id={`groups-${grp.fmG_Id}`}
                                                                    checked={filters.groupIds.includes(grp.fmG_Id)}
                                                                    onCheckedChange={() => toggleInstallment(grp.fmG_Id)}
                                                                />
                                                                <span className='text-sm'>{grp.fmg_groupname}</span>
                                                            </Label>
                                                        ))
                                                    ) : (
                                                        <div className='py-4 text-center text-gray-500'>No Groups</div>
                                                    )}
                                                </div>
                                            </Card>
                                        </>
                                    </div>
                                )}

                                {selectedCatg === 'Category' && (
                                    <div className='flex items-center gap-12'>
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Category <span className='text-red-500'>*</span>
                                            </Label>

                                            <div className='flex-1'>
                                                <Controller
                                                    name='fmcc_id'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={field.value || 'empty'}
                                                            onValueChange={(value) => {
                                                                field.onChange(Number(value) || '');
                                                            }}
                                                            value={field.value?.toString() || undefined}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--Select Category--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {categoryloading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading Category...
                                                                    </SelectItem>
                                                                ) : categoryerror ? (
                                                                    <SelectItem value='error' disabled>
                                                                        Error loading Category
                                                                    </SelectItem>
                                                                ) : (
                                                                    categorydropdowndata?.data?.map((item) => (
                                                                        <SelectItem key={item.fmcC_Id} value={item.fmcC_Id.toString()}>
                                                                            {item.fmcC_ClassCategoryName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.fmcc_id && <FormError>{errors.fmcc_id.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selectedCatg === 'transport' && (
                                    <div className='flex items-center gap-12'>
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Group <span className='text-red-500'>*</span>
                                            </Label>

                                            <div className='flex-1'>
                                                <Controller
                                                    name='fmg_id'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={field.value || 'empty'}
                                                            // onValueChange={(value) => {
                                                            //     field.onChange(Number(value) || '');
                                                            // }}
                                                            // value={field.value?.toString() || undefined}
                                                            value={field.value ? String(field.value) : undefined}
                                                            onValueChange={(value) => {
                                                                const num = Number(value);
                                                                field.onChange(Number.isNaN(num) ? undefined : num);
                                                            }}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--Select Group--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {groupsloading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading Groups...
                                                                    </SelectItem>
                                                                ) : categoryerror ? (
                                                                    <SelectItem value='error' disabled>
                                                                        Error loading Groups
                                                                    </SelectItem>
                                                                ) : (
                                                                    groupsdata?.data?.map((item) => (
                                                                        <SelectItem key={item.fmG_Id} value={item.fmG_Id.toString()}>
                                                                            {item.fmg_groupname}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.fmg_id && <FormError>{errors.fmg_id.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {selectedCatg === 'transport' && (
                                    <div className='flex items-center gap-12'>
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Bus Route <span className='text-red-500'>*</span>
                                            </Label>

                                            <div className='flex-1'>
                                                <Controller
                                                    name='fmcc_id'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            key={field.value || 'empty'}
                                                            onValueChange={(value) => {
                                                                field.onChange(Number(value) || '');
                                                            }}
                                                            value={field.value?.toString() || undefined}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--Select Bus Route--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {busrouteLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading Bus Routes...
                                                                    </SelectItem>
                                                                ) : busrouteError ? (
                                                                    <SelectItem value='error' disabled>
                                                                        Error loading Bus Routes
                                                                    </SelectItem>
                                                                ) : (
                                                                    busroutedata?.data?.map((item) => (
                                                                        <SelectItem key={item.trmR_Id} value={item.trmR_Id.toString()}>
                                                                            {item.trmR_RouteNo}:{item.trmR_RouteName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(selectedCatg === 'Class' || selectedCatg === 'Category') && termwise !== 1 && (
                                    <div className='mt-4 flex items-start gap-6'>
                                        {/* Label */}
                                        <Label className='text-right'>
                                            Installment Name <span className='text-red-500'>*</span>
                                        </Label>

                                        {/* Dropdown */}
                                        <Card className='w-[420px] border bg-gray-50 p-4'>
                                            <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                {feeInstallmentLoading ? (
                                                    <div className='py-6 text-center text-gray-500'>Loading...</div>
                                                ) : feeInstallments.length > 0 ? (
                                                    feeInstallments.map((installment) => (
                                                        <Label
                                                            key={installment.ftI_Id}
                                                            htmlFor={`installment-${installment.ftI_Id}`}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                            <Checkbox
                                                                id={`installment-${installment.ftI_Id}`}
                                                                checked={filters.installmentIds.includes(installment.ftI_Id)}
                                                                onCheckedChange={() => toggleInstallment(installment.ftI_Id)}
                                                            />
                                                            <span className='text-sm'>{installment.ftI_InstallmentName}</span>
                                                        </Label>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-gray-500'>No installments</div>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {termwise === 1 && (
                                    <div className='mt-4 flex items-start gap-12'>
                                        {/* TERMS */}
                                        <div className='flex items-start gap-4'>
                                            <Label className='w-24 pt-2 text-right'>
                                                Terms <span className='text-red-500'>*</span>
                                            </Label>

                                            <Card className='w-[360px] border bg-gray-50 p-4'>
                                                <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                    {feeTerms.length > 0 && (
                                                        <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-100'>
                                                            <Checkbox checked={isAllTermsSelected} onCheckedChange={toggleAllTerms} />
                                                            <span>Select All</span>
                                                        </Label>
                                                    )}
                                                    {termsloading ? (
                                                        <div className='py-6 text-center text-gray-500'>Loading...</div>
                                                    ) : feeTerms?.length > 0 ? (
                                                        feeTerms.map((terms) => (
                                                            <Label
                                                                key={terms.fmT_Id}
                                                                htmlFor={`term-${terms.fmT_Id}`}
                                                                className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                <Checkbox
                                                                    id={`term-${terms.fmT_Id}`}
                                                                    checked={filters.termIds.includes(terms.fmT_Id)}
                                                                    onCheckedChange={() => toggleterms(terms.fmT_Id)}
                                                                />
                                                                <span className='text-sm'>{terms.fmT_Name}</span>
                                                            </Label>
                                                        ))
                                                    ) : (
                                                        <div className='py-4 text-center text-gray-500'>No Terms</div>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>

                                        {/* GROUP */}
                                        <div className='flex items-start gap-4'>
                                            <Label className='w-24 pt-2 text-right'>
                                                Group <span className='text-red-500'>*</span>
                                            </Label>

                                            <Card className='w-[360px] border bg-gray-50 p-4'>
                                                <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                    {feeGroups.length > 0 && (
                                                        <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-100'>
                                                            <Checkbox checked={isAllGroupsSelected} onCheckedChange={toggleAllGroups} />
                                                            <span>Select All</span>
                                                        </Label>
                                                    )}
                                                    {groupsloading ? (
                                                        <div className='py-6 text-center text-gray-500'>Loading...</div>
                                                    ) : feeGroups.length > 0 ? (
                                                        feeGroups.map((grp) => (
                                                            <Label
                                                                key={grp.fmG_Id}
                                                                htmlFor={`group-${grp.fmG_Id}`}
                                                                className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                <Checkbox
                                                                    id={`group-${grp.fmG_Id}`}
                                                                    checked={filters.installmentIds.includes(grp.fmG_Id)}
                                                                    onCheckedChange={() => togglegroups(grp.fmG_Id)}
                                                                />
                                                                <span className='text-sm'>{grp.fmg_groupname}</span>
                                                            </Label>
                                                        ))
                                                    ) : (
                                                        <div className='py-4 text-center text-gray-500'>No installments</div>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button size='lg' variant='outline' className='px-8' onClick={() => window.location.reload()}>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={isSubmitting} className='px-12'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                    </div>

                                    {showReport && (
                                        <CollapsibleSection defaultOpen={true}>
                                            <div className='mt-10 rounded-lg border bg-white shadow-xl'>
                                                {/* Header */}
                                                <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                    {/* <h2 className='font-bold text-blue-700 text-xl'>Fee Audit Report</h2> */}
                                                    <div className='mb-6 text-center'>
                                                        <h2 className='font-bold text-2xl text-primary'>Fee Consolidated Report</h2>
                                                        {/* <div className="mt-1 text-sm text-gray-600">
                                                    From {formatDate(fromDate)} To {formatDate(toDate)}
                                                </div> */}
                                                    </div>
                                                    {/* {filters.userType === 'indi' && (
                                                        <div className='flex gap-3'>
                                                            <div className='mb-4 flex justify-end gap-2'>
                                                                <Button
                                                                    size='sm'
                                                                    className='h-8 w-auto px-3 text-xs'
                                                                    onClick={handleExport}>
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
                                                    )} */}

                                                    {/* {filters.userType === 'All' && (
                                                        <div className='flex gap-3'>
                                                            <div className='mb-4 flex justify-end gap-2'>
                                                                <Button
                                                                    size='sm'
                                                                    className='h-8 w-auto px-3 text-xs'
                                                                    onClick={handleExportAlltype}>
                                                                    Export Excel
                                                                </Button>

                                                                <Button
                                                                    size='sm'
                                                                    variant='outline'
                                                                    className='h-8 w-auto px-3 text-xs'
                                                                    onClick={handlePrintAlltype}>
                                                                    Print
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )} */}
                                                </div>

                                                {/* ================= INDIVIDUAL TABLE ================= */}
                                                {/* {filters.userType === 'indi' && (
                                                    <div className='overflow-x-auto'>
                                                        <table className='w-full border-collapse text-sm'>
                                                            <thead className='bg-primary text-white'>
                                                                <tr>
                                                                    <th className='border px-2 py-2 text-center'>
                                                                        <input
                                                                            type='checkbox'
                                                                            checked={
                                                                                selectedIds.length === reportData.length &&
                                                                                reportData.length > 0
                                                                            }
                                                                            onChange={toggleAll}
                                                                        />
                                                                    </th>
                                                                    <th className='border px-2 py-2'>Sl No</th>
                                                                    <th className='border px-2 py-2'>Student Name</th>
                                                                    <th className='border px-2 py-2'>Adm.No</th>
                                                                    <th className='border px-2 py-2'>Class & Section</th>
                                                                    <th className='border px-2 py-2'>Paid Amount</th>
                                                                    <th className='border px-2 py-2'>Receipt No</th>
                                                                    <th className='border px-2 py-2'>Bank Name</th>
                                                                    <th className='border px-2 py-2'>Date</th>
                                                                    <th className='border px-2 py-2'>Cheque No</th>
                                                                    <th className='border px-2 py-2'>Cheque Date</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {reportData.map((row, index) => (
                                                                    <tr
                                                                        key={row.id ?? index}
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
                                                                        <td className='border px-2 py-2'>{row.studentName}</td>
                                                                        <td className='border px-2 py-2 text-center'>{row.admNo}</td>
                                                                        <td className='border px-2 py-2 text-center'>{row.classSection}</td>
                                                                        <td className='border px-2 py-2 text-right'>
                                                                            {row.paidAmount?.toLocaleString()}
                                                                        </td>
                                                                        <td className='border px-2 py-2'>{row.receiptNo}</td>
                                                                        <td className='border px-2 py-2'>{row.bankName}</td>
                                                                        <td className='border px-2 py-2'>{row.date}</td>
                                                                        <td className='border px-2 py-2'>{row.chequeNo}</td>
                                                                        <td className='border px-2 py-2'>{row.chequeDate}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )} */}
                                                {/* {filters.userType === 'All' && (
                                                    <div className='overflow-x-auto'>
                                                        <table className='w-full border-collapse text-sm'>
                                                           
                                                            <thead className='bg-primary text-white'>
                                                              
                                                                <tr>
                                                                    <th rowSpan={2} className='border px-2 py-2 text-center'>
                                                                        SLNO
                                                                    </th>
                                                                    <th rowSpan={2} className='border px-2 py-2 text-center'>
                                                                        Roll No
                                                                    </th>
                                                                    <th rowSpan={2} className='border px-2 py-2'>
                                                                        Student Name
                                                                    </th>
                                                                    <th rowSpan={2} className='border px-2 py-2 text-center'>
                                                                        Class
                                                                    </th>
                                                                    <th rowSpan={2} className='border px-2 py-2 text-center'>
                                                                        Section
                                                                    </th>

                                                                    {installments.map((inst) => (
                                                                        <th
                                                                            key={inst.ftI_Id}
                                                                            colSpan={4}
                                                                            className='border px-2 py-2 text-center font-semibold'>
                                                                            {inst.ftI_Name}
                                                                        </th>
                                                                    ))}
                                                                </tr>

                                                               
                                                                <tr>
                                                                    {installments.map((inst) => (
                                                                        <React.Fragment key={`${inst.ftI_Id}-sub`}>
                                                                            <th className='border px-2 py-2'>Receipt No</th>
                                                                            <th className='border px-2 py-2'>Date</th>
                                                                            <th className='border px-2 py-2'>Cheque No</th>
                                                                            <th className='border px-2 py-2 text-right'>Amount</th>
                                                                        </React.Fragment>
                                                                    ))}
                                                                </tr>
                                                            </thead>

                                                           
                                                            <tbody>
                                                                {reportData.map((row, index) => (
                                                                    <tr
                                                                        key={row.id}
                                                                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                        <td className='border px-2 py-2 text-center'>{index + 1}</td>
                                                                        <td className='border px-2 py-2 text-center'>{row.rollNo}</td>
                                                                        <td className='border px-2 py-2'>{row.studentName}</td>
                                                                        <td className='border px-2 py-2 text-center'>{row.className}</td>
                                                                        <td className='border px-2 py-2 text-center'>{row.sectionName}</td>

                                                                        {installments.map((inst) => {
                                                                            const instData = row.installments?.[inst.ftI_Id];

                                                                            return (
                                                                                <React.Fragment key={`${row.id}-${inst.ftI_Id}`}>
                                                                                    <td className='border px-2 py-2'>
                                                                                        {instData?.receiptNo || '-'}
                                                                                    </td>
                                                                                    <td className='border px-2 py-2'>
                                                                                        {instData?.date || '-'}
                                                                                    </td>
                                                                                    <td className='border px-2 py-2'>
                                                                                        {instData?.chequeNo || '-'}
                                                                                    </td>
                                                                                    <td className='border px-2 py-2 text-right'>
                                                                                        {instData?.amount
                                                                                            ? instData.amount.toLocaleString()
                                                                                            : '-'}
                                                                                    </td>
                                                                                </React.Fragment>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )} */}
                                            </div>
                                        </CollapsibleSection>
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
