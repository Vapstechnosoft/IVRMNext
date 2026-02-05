// app/(root)/fees/feereports/feedefaulterreport/page.tsx
'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    useFeeBusRouteDefaulterreport,
    useFeeClassListDefaulterreport,
    useFeeCustomGroupDefaulterreport,
    useFeeGroupDefaulterreport,
    useFeeSectionListDefaulterreport,
    useFeeTermDropDownDataForReports,
    useFeeTransInstallmentYearlyfeecollectionreport
} from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type {
    IFeeBusRouteDropdownList,
    IFeeClassDropdownList,
    IFeeCustomGroupDropdownList,
    IFeeGroupDropdownList,
    IFeeSectionDropdownList,
    IFeeTermDropdownList,
    IFeeTrasactionInstallmentDropdownList,
    IFeeYearlyCollectionReportRow
} from '@/types/fees/reports/reports';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { exportToExcel } from '@/lib/utils';
import { yearlyFeeCollectionSchema } from '@/schemas/fees/reports';
import { getFeeYearlyCollectionReport } from '@/server/fees/reports/fee_yearlyCollectionReport';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';
import {
    type BreakdownType,
    type FeeYearlyTableRow,
    createTotalRow,
    exportToExcelDynamic,
    getDynamicColumns,
    mapYearlyCollectionReport,
    printTableDynamic
} from './_components/columns';

// Checkbox with full indeterminate support
const Checkbox = ({ checked, indeterminate, onCheckedChange, ...props }: any) => {
    const ref = useRef<HTMLButtonElement>(null);

    //   useEffect(() => {
    //     if (ref.current) {
    //       ref.current.indeterminate = !!indeterminate;
    //     }
    //   }, [indeterminate]);

    return <BaseCheckbox ref={ref} checked={checked} onCheckedChange={onCheckedChange} {...props} />;
};

type FormFields = z.infer<typeof yearlyFeeCollectionSchema>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export default function FeeYearlyCollectionReport() {
    // ---------------------------- FORM ----------------------------
    const {
        control,
        handleSubmit,
        reset,
        register,
        setValue,

        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(yearlyFeeCollectionSchema),
        mode: 'all'
        // ,

        // defaultValues: {
        //     report: 'students',
        //     rpttyp: 'Individual',
        //     reportdate: 'transdate',
        //     asmaY_Id: 0,
        //     groupIds: [],
        //     chequeDate: false,
        //     acdmyr: false,
        //     headwise: false,
        //     paymentwise: false,
        //     fromDate: today,
        //     toDate: today,
        //     enableAllClasses: false,
        //     Fmc_allorsudentorother: 'All',
        //     Fmc_allorcorddorop: 'All'
        // }
    });

    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        userType: 'Students' as 'Students' | 'Staff' | 'Others',
        viewMode: 'year' as 'year' | 'date',

        //breakdown: 'Fee Group Wise',
        breakdown: 'FGW',
        academicYearId: '',
        classId: 0,
        sectionId: 0,
        includeClassSection: false,
        status: {
            active: true,
            deactive: false,
            left: false,
            balance: false
        },
        customGroupIds: [] as number[],
        feeGroupIds: [] as number[],
        termIds: [] as number[],
        installmentIds: [] as number[],
        busRouteIds: [] as number[],
        formatI: false,
        dueDate: new Date(),
        dueDateType: 'Due Date' as 'Due Date' | 'Till Due Date',
        bulkDownload: false,
        dateFilter: '1' as '1' | '2' | '3' | '4'
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);
    const [feeGroups, setFeeGroups] = useState<IFeeGroupDropdownList[]>([]);
    const [feeTerms, setFeeTerms] = useState<IFeeTermDropdownList[]>([]);
    const [feeBusRoutes, setFeeBusRoutes] = useState<IFeeBusRouteDropdownList[]>([]);
    const [customGroups, setCustomGroups] = useState<IFeeCustomGroupDropdownList[]>([]);

    // const [reportData, setReportData] = useState<IFeeYearlyCollectionReportRow[]>([]);
    const [reportData, setReportData] = useState<FeeYearlyTableRow[]>([]);

    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);
    //const [feeInstallments, setfeeInstallments] = useState<IFeeInstallmentDropdownList[]>([]);
    const [feeInstallments, setfeeInstallments] = useState<IFeeTrasactionInstallmentDropdownList[]>([]);

    const [wiseType, setWiseType] = useState<'Yearly Wise' | 'Date Wise'>('Date Wise');

    // Hooks
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();
    const {
        data: sectionListResponse,
        isLoading: loadingSections,
        error: sectionListError,
        refetch: refetchSections
    } = useFeeSectionListDefaulterreport();
    const { data: feegroupData, isLoading: loadingfeegroup, error: feegroupError } = useFeeGroupDefaulterreport();
    //const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermDefaulterreport();

    const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermDropDownDataForReports();

    const { data: busRouteResponse, isLoading: loadingBusRoutes, error: busRouteError } = useFeeBusRouteDefaulterreport();
    const { data: customGroupResponse, isLoading: loadingCustomGroup, error: customGroupError } = useFeeCustomGroupDefaulterreport();

    // const {
    //     data: feeInstallmentData,
    //     isLoading: feeInstallmentLoading,
    //     error: feeInstallmentError
    // } = useFeeInstallmentYearlyfeecollectionreport();

    const {
        data: feeInstallmentData,
        isLoading: feeInstallmentLoading,
        error: feeInstallmentError
    } = useFeeTransInstallmentYearlyfeecollectionreport();

    console.log('feeInstallmentData', feeInstallmentData);

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
            // formatted.sort((a, b) => (b.asmaY_Order || 0) - (a.asmaY_Order || 0));
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

    useEffect(() => {
        if (sectionListError) {
            toast.error(sectionListError?.message || 'Failed to load sections');
            setSections([]);
            return;
        }
        if (sectionListResponse?.data && Array.isArray(sectionListResponse.data)) {
            setSections(sectionListResponse.data);
        }
    }, [sectionListResponse, sectionListError]);

    useEffect(() => {
        if (feegroupError) toast.error(feegroupError?.message || 'Failed to load fee groups');
        else if (feegroupData?.data) setFeeGroups(feegroupData.data);
    }, [feegroupData, feegroupError]);

    useEffect(() => {
        if (feetermError) toast.error(feetermError?.message || 'Failed to load terms');
        else if (feetermData?.data) setFeeTerms(feetermData.data);
    }, [feetermData, feetermError]);

    useEffect(() => {
        if (feeInstallmentError) toast.error(feeInstallmentError?.message || 'Failed to load fee installments');
        else if (feeInstallmentData?.data) setfeeInstallments(feeInstallmentData.data);
    }, [feeInstallmentData, feeInstallmentError]);

    useEffect(() => {
        if (busRouteError) toast.error(busRouteError?.message || 'Failed to load bus routes');
        else if (busRouteResponse?.data) setFeeBusRoutes(busRouteResponse.data as IFeeBusRouteDropdownList[]);
    }, [busRouteResponse, busRouteError]);

    useEffect(() => {
        if (customGroupError) toast.error(customGroupError?.message || 'Failed to load custom groups');
        else if (customGroupResponse?.data) setCustomGroups(customGroupResponse.data);
    }, [customGroupResponse, customGroupError]);

    useEffect(() => {
        if (customGroups.length > 0 && filters.customGroupIds.length === 0) {
            setFilters((prev) => ({
                ...prev,
                customGroupIds: customGroups.map((g) => g.fmgG_Id)
            }));
        }
    }, [customGroups]);

    // Toggle handlers
    const toggleCustomGroup = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            customGroupIds: prev.customGroupIds.includes(id) ? prev.customGroupIds.filter((x) => x !== id) : [...prev.customGroupIds, id]
        }));

    const toggleFeeGroup = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            feeGroupIds: prev.feeGroupIds.includes(id) ? prev.feeGroupIds.filter((x) => x !== id) : [...prev.feeGroupIds, id]
        }));

    const toggleTerm = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            termIds: prev.termIds.includes(id) ? prev.termIds.filter((x) => x !== id) : [...prev.termIds, id]
        }));

    const toggleInstallment = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            installmentIds: prev.installmentIds.includes(id) ? prev.installmentIds.filter((x) => x !== id) : [...prev.installmentIds, id]
        }));

    const toggleBusRoute = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            busRouteIds: prev.busRouteIds.includes(id) ? prev.busRouteIds.filter((x) => x !== id) : [...prev.busRouteIds, id]
        }));

    // const selectAllCustomGroups = (checked: boolean) => {
    //     setFilters((prev) => ({ ...prev, customGroupIds: checked ? customGroups.map((g) => g.fmgG_Id) : [] }));

    // };

    const selectAllCustomGroups = (checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            customGroupIds: checked ? customGroups.map((g) => g.fmgG_Id) : []
        }));
    };

    const selectAllFeeGroups = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, feeGroupIds: checked ? feeGroups.map((g) => g.fmG_Id) : [] }));
    };

    const selectAllTerms = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, termIds: checked ? feeTerms.map((t) => t.fmT_Id) : [] }));
    };

    const selectAllInstallments = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, installmentIds: checked ? feeInstallments.map((t) => t.ftI_Id) : [] }));
    };

    const selectAllBusRoutes = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, busRouteIds: checked ? feeBusRoutes.map((r) => r.trmR_Id) : [] }));
    };

    const toggleStatus = (status: 'active' | 'deactive' | 'left' | 'balance') => {
        setFilters((prev) => ({
            ...prev,
            status: { ...prev.status, [status]: !prev.status[status] }
        }));
    };

    const handleReset = () => {
        reset();
        window.location.reload();
    };

    const totalRow = createTotalRow(reportData.filter((r): r is IFeeYearlyCollectionReportRow => !('__isTotal' in r)));

    const tableData: FeeYearlyTableRow[] = [...reportData.filter((r) => !('__isTotal' in r)), totalRow];

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        // Optional: Keep validation
        if (!filters.academicYearId) return toast.error('Please select an Academic Year');
        if (filters.feeGroupIds.length === 0) return toast.error('Please select at least one Fee Group');
        if (filters.breakdown === 'TRMW') {
            if (filters.termIds.length === 0) return toast.error('Please select at least one Term');
        }

        if (filters.breakdown === 'FSW' || filters.breakdown === 'SWTPC' || filters.breakdown === 'CWTPC') {
            if (filters.classId === 0) return toast.error('Please select Class');

            if (filters.sectionId === 0) return toast.error('Please select Section');
        }

        setReportLoading(true);
        setShowReport(false);

        const { fromDate, toDate } = data;
        const today = new Date();

        const effectiveFromDate = fromDate || today;
        const effectiveToDate = toDate || today;

        try {
            const payload = {
                // // Fee Group Ids
                FMG_Ids: filters.feeGroupIds,

                // Term OR Installment Ids
                FTI_ids: filters.breakdown === 'INMW' ? filters.installmentIds : filters.termIds,
                FMT_Ids: filters.breakdown === 'FGW' ? filters.termIds : [],
                // FMG_Ids: [385, 385, 377, 378],
                //FTI_ids: [83],

                // Academic Year
                ASMAY_Id: Number(filters.academicYearId),

                // Year / Date wise
                reporttype: filters.viewMode, // "year" | "date"

                // Breakdown radio value
                radioval: filters.breakdown, // e.g. "INMW"

                // Status flags (1 / 0)
                active: filters.status.active ? 1 : 0,
                deactive: filters.status.deactive ? 1 : 0,
                left: filters.status.left ? 1 : 0,
                //  From_Date: '2025-12-18',
                //  To_Date: '2025-12-18',

                // // Date filters
                // From_Date:
                //     filters.viewMode === 'date'
                //         ? format(fromDate ?? today, 'yyyy-MM-dd')
                //         : null,

                // To_Date:
                //     filters.viewMode === 'date'
                //         ? format(toDate ?? today, 'yyyy-MM-dd')
                //         : null,

                From_Date: filters.viewMode === 'date' ? format(effectiveFromDate, 'yyyy-MM-dd') : format(today, 'yyyy-MM-dd'),

                To_Date: filters.viewMode === 'date' ? format(effectiveToDate, 'yyyy-MM-dd') : format(today, 'yyyy-MM-dd'),

                // Term Group (Hardcoded / configurable)
                term_group: 'T',
                //filters.breakdown === 'INMW' ? 'I' : 'T',

                // Category / Class / Section
                FMCC_Id: 1, // static (change if required)
                ASMCL_Id: filters.classId ?? 0,
                AMSC_Id: filters.sectionId ?? 0
            };

            const js = JSON.stringify(payload);

            console.log('Fee Defaulter Payload 👉', js);

            // 🔹 API CALL HERE
            // const response = await fetchFeeDefaulterReport(payload);
            const response = await getFeeYearlyCollectionReport(payload);

            console.log('Fee yearly collection response 👉', response);

            const apiList = response?.data?.list ?? [];

            const tableData = mapYearlyCollectionReport(apiList, filters.breakdown as BreakdownType);

            setReportData(tableData);

            if (apiList.length === 0) {
                setShowReport(false);
                toast.info('No records found for selected criteria');
                return;
            }
            setShowReport(true);

            toast.success(`Report generated (${tableData.length} records)`);

            toast.success('Report generated successfully');
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to generate report');
        } finally {
            setReportLoading(false);
        }

        // await new Promise((resolve) => setTimeout(resolve, 1200));
    };
    const handlePrint = () => {
        const rows = tableData.filter((r): r is IFeeYearlyCollectionReportRow => !('__isTotal' in r));

        const totalRow = tableData.find((r): r is FeeYearlyTableRow => '__isTotal' in r);

        printTableDynamic(filters.breakdown as BreakdownType, rows, totalRow);
    };

    const handleExportExcel = () => {
        exportToExcelDynamic(filters.breakdown as BreakdownType, reportData, 'Yearly_Fee_Collection_Report');
    };

    const isAcademicYearSelected = !!filters.academicYearId;
    const isClassSectionEnabled = filters.includeClassSection;
    const showDateSection = filters.viewMode === 'date';
    const showBalancecheckbox = filters.userType === 'Students' && filters.breakdown === 'Student/Staff Wise';

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            {/* <h1 className='mb-8 font-bold text-3xl text-gray-900'>Yearly Fee Collection Report</h1> */}

                            <div className='space-y-8'>
                                <Card className='border bg-gray-50 p-5 shadow-sm'>
                                    <div className='flex flex-wrap items-center justify-center gap-10'>
                                        {(
                                            [
                                                { label: 'Yearly Wise', value: 'year' },
                                                { label: 'Date Wise', value: 'date' }
                                            ] as const
                                        ).map((mode) => (
                                            <label key={mode.value} className='flex cursor-pointer items-center gap-3'>
                                                <input
                                                    type='radio'
                                                    name='viewMode'
                                                    checked={filters.viewMode === mode.value}
                                                    onChange={() => setFilters((prev) => ({ ...prev, viewMode: mode.value }))}
                                                    className='h-5 w-5 text-primary'
                                                />
                                                <span className='font-medium text-base'>{mode.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </Card>

                                {/* View Mode + Academic Year */}
                                {/* View Mode + Academic Year + Full Breakdown Radio Group */}
                                <div className='flex flex-wrap gap-8'>
                                    {/* Full Breakdown Radio Group */}
                                    <Card className='min-w-[400px] flex-1 border bg-gray-50 p-5 shadow-sm'>
                                        <div className='flex flex-wrap gap-4'>
                                            {[
                                                { label: 'Fee Group Wise', value: 'FGW' },
                                                { label: 'Fee Head Wise', value: 'FHW' },
                                                { label: 'Class Wise', value: 'FCW' },
                                                { label: 'Student Wise', value: 'FSW' },
                                                { label: 'Term Wise', value: 'TRMW' },
                                                { label: 'Installment Wise', value: 'INMW' },
                                                { label: 'Student Term Wise', value: 'STRMW' },
                                                { label: 'Category Wise', value: 'CW' },
                                                { label: 'Class-Section-Installmentwise Consolidated', value: 'CTW' },
                                                { label: 'Class-Installmentwise Consolidated', value: 'CTC' },
                                                { label: 'Student Wise Total Paid Count', value: 'SWTPC' },
                                                { label: 'Class-Section Wise Total Paid Count', value: 'CWTPC' },
                                                { label: 'Parent Wise', value: 'FPW' }
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

                                    {/* Academic Year */}
                                    <div className='min-w-[300px] space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select
                                            value={filters.academicYearId}
                                            onValueChange={(val) => setFilters((prev) => ({ ...prev, academicYearId: val }))}
                                            disabled={loadingAcademic}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={loadingAcademic ? 'Loading...' : 'Select Academic Year'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((year) => (
                                                    <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                                    {/* Column 1: Custom Group */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Custom Group <span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                <Label
                                                    htmlFor='customGroupSelectAll'
                                                    className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
                                                        id='customGroupSelectAll'
                                                        checked={
                                                            customGroups.length > 0 && filters.customGroupIds.length === customGroups.length
                                                        }
                                                        indeterminate={
                                                            filters.customGroupIds.length > 0 &&
                                                            filters.customGroupIds.length < customGroups.length
                                                        }
                                                        onCheckedChange={(checked: any) => selectAllCustomGroups(!!checked)}
                                                    />
                                                    <span>Select All</span>
                                                </Label>

                                                {loadingCustomGroup ? (
                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                ) : customGroups.length > 0 ? (
                                                    customGroups.map((group) => (
                                                        <Label
                                                            key={group.fmgG_Id}
                                                            htmlFor={`customGroup-${group.fmgG_Id}`}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                            <Checkbox
                                                                id={`customGroup-${group.fmgG_Id}`}
                                                                checked={filters.customGroupIds.includes(group.fmgG_Id)}
                                                                onCheckedChange={() => toggleCustomGroup(group.fmgG_Id)}
                                                            />
                                                            <span className='font-medium text-sm'>{group.fmgG_GroupName}</span>
                                                        </Label>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-gray-500'>No custom groups</div>
                                                )}
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Column 2: Fee Group */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Fee Group <span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                <Label
                                                    htmlFor='feeGroupSelectAll'
                                                    className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
                                                        id='feeGroupSelectAll'
                                                        checked={feeGroups.length > 0 && filters.feeGroupIds.length === feeGroups.length}
                                                        indeterminate={
                                                            filters.feeGroupIds.length > 0 && filters.feeGroupIds.length < feeGroups.length
                                                        }
                                                        onCheckedChange={(checked: any) => selectAllFeeGroups(!!checked)}
                                                    />
                                                    <span>Select All</span>
                                                </Label>

                                                {loadingfeegroup ? (
                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                ) : feeGroups.length > 0 ? (
                                                    feeGroups.map((group) => (
                                                        <Label
                                                            key={group.fmG_Id}
                                                            htmlFor={`feeGroup-${group.fmG_Id}`}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                            <Checkbox
                                                                id={`feeGroup-${group.fmG_Id}`}
                                                                checked={filters.feeGroupIds.includes(group.fmG_Id)}
                                                                onCheckedChange={() => toggleFeeGroup(group.fmG_Id)}
                                                            />
                                                            <span className='text-sm'>{group.fmG_GroupName}</span>
                                                        </Label>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-gray-500'>No fee groups</div>
                                                )}
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Column 3: Term OR Installment */}
                                    <div className='space-y-3'>
                                        {filters.breakdown !== 'INMW' && (
                                            <>
                                                <Label className='font-semibold text-lg'>
                                                    Term Name <span className='text-red-500'>*</span>
                                                </Label>
                                                <Card className='border bg-gray-50 p-4'>
                                                    <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                        <Label
                                                            htmlFor='termSelectAll'
                                                            className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                            <Checkbox
                                                                id='termSelectAll'
                                                                checked={feeTerms.length > 0 && filters.termIds.length === feeTerms.length}
                                                                indeterminate={
                                                                    filters.termIds.length > 0 && filters.termIds.length < feeTerms.length
                                                                }
                                                                onCheckedChange={(checked: any) => selectAllTerms(!!checked)}
                                                            />
                                                            <span>Select All</span>
                                                        </Label>

                                                        {loadingfeeterm ? (
                                                            <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                        ) : feeTerms.length > 0 ? (
                                                            feeTerms.map((term) => (
                                                                <Label
                                                                    key={term.fmT_Id}
                                                                    htmlFor={`term-${term.fmT_Id}`}
                                                                    className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                    <Checkbox
                                                                        id={`term-${term.fmT_Id}`}
                                                                        checked={filters.termIds.includes(term.fmT_Id)}
                                                                        onCheckedChange={() => toggleTerm(term.fmT_Id)}
                                                                    />
                                                                    <span className='text-sm'>{term.fmT_Name}</span>
                                                                </Label>
                                                            ))
                                                        ) : (
                                                            <div className='py-4 text-center text-gray-500'>No terms</div>
                                                        )}
                                                    </div>
                                                </Card>
                                            </>
                                        )}

                                        {filters.breakdown === 'INMW' && (
                                            <>
                                                <Label className='font-semibold text-lg'>
                                                    Installment Name <span className='text-red-500'>*</span>
                                                </Label>
                                                <Card className='border bg-gray-50 p-4'>
                                                    <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                        <Label
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
                                                        </Label>

                                                        {feeInstallmentLoading ? (
                                                            <div className='py-4 text-center text-gray-500'>Loading...</div>
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
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Class & Section + Status + Date (Date section is conditional) */}
                                <div className='space-y-6 border-t pt-8'>
                                    <div className='flex w-full flex-wrap justify-between gap-6'>
                                        {/* Status Checkboxes */}
                                        <div className='flex flex-grow flex-wrap items-center gap-4'>
                                            <div className='flex items-center gap-2'>
                                                <Checkbox checked={filters.status.active} onCheckedChange={() => toggleStatus('active')} />
                                                <Label className='cursor-pointer'>Active</Label>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <Checkbox
                                                    checked={filters.status.deactive}
                                                    onCheckedChange={() => toggleStatus('deactive')}
                                                />
                                                <Label className='cursor-pointer'>Deactive</Label>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <Checkbox checked={filters.status.left} onCheckedChange={() => toggleStatus('left')} />
                                                <Label className='cursor-pointer'>Left</Label>
                                            </div>
                                            {showBalancecheckbox && (
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        checked={filters.status.balance}
                                                        onCheckedChange={() => toggleStatus('balance')}
                                                    />
                                                    <Label className='cursor-pointer'>Balance</Label>
                                                </div>
                                            )}
                                        </div>
                                        {(filters.breakdown === 'FSW' ||
                                            filters.breakdown === 'STRMW' ||
                                            filters.breakdown === 'SWTPC' ||
                                            filters.breakdown === 'CWTPC') && (
                                            <>
                                                {/* Class */}
                                                <div className='flex min-w-[220px] flex-grow items-center gap-3'>
                                                    <Label htmlFor='includeClass' className='whitespace-nowrap font-medium'>
                                                        Class <span className='text-red-500'>*</span>:
                                                    </Label>
                                                    <Select
                                                        value={filters.classId === 0 ? '' : String(filters.classId)}
                                                        onValueChange={(val) => {
                                                            const id = Number(val);
                                                            setFilters((prev) => ({ ...prev, classId: id, sectionId: 0 }));
                                                        }}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select Class'} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {classes.map((cls) => (
                                                                <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                                    {cls.asmcL_ClassName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Section */}
                                                <div className='flex min-w-[220px] flex-grow items-center gap-3'>
                                                    <Label className='whitespace-nowrap font-medium'>
                                                        Section <span className='text-red-500'>*</span>:
                                                    </Label>
                                                    <Select
                                                        value={filters.sectionId === 0 ? '' : String(filters.sectionId)}
                                                        onValueChange={(val) =>
                                                            setFilters((prev) => ({ ...prev, sectionId: Number(val) }))
                                                        }>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue
                                                                placeholder={
                                                                    !filters.classId
                                                                        ? 'Select Class first'
                                                                        : loadingSections
                                                                          ? 'Loading...'
                                                                          : 'Select Section'
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {sections.map((sec) => (
                                                                <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                                    {sec.asmC_SectionName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Date section - ONLY shown when Date Wise is selected */}
                                    {showDateSection && (
                                        <div className='fade-in flex animate-in flex-wrap items-center gap-6 duration-300'>
                                            <Label className='min-w-32 font-medium'>
                                                Date <span className='text-red-500'>*</span>
                                            </Label>

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant='outline' className='w-[240px] justify-start text-left font-normal'>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {format(filters.dueDate, 'dd-MM-yyyy')}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <Calendar
                                                        mode='single'
                                                        selected={filters.dueDate}
                                                        onSelect={(date) => date && setFilters((prev) => ({ ...prev, dueDate: date }))}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>

                                            <Card className='border bg-gray-50 p-4 shadow-sm'>
                                                <div className='flex items-center gap-10'>
                                                    <Label className='flex cursor-pointer items-center gap-3'>
                                                        <input
                                                            type='radio'
                                                            name='dueDateType'
                                                            checked={filters.dueDateType === 'Due Date'}
                                                            onChange={() => setFilters((prev) => ({ ...prev, dueDateType: 'Due Date' }))}
                                                            className='h-4 w-4 text-primary'
                                                        />
                                                        <span className='font-medium'>Due Date</span>
                                                    </Label>
                                                    <Label className='flex cursor-pointer items-center gap-3'>
                                                        <input
                                                            type='radio'
                                                            name='dueDateType'
                                                            checked={filters.dueDateType === 'Till Due Date'}
                                                            onChange={() =>
                                                                setFilters((prev) => ({ ...prev, dueDateType: 'Till Due Date' }))
                                                            }
                                                            className='h-4 w-4 text-primary'
                                                        />
                                                        <span className='font-medium'>Till Due Date</span>
                                                    </Label>
                                                </div>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                                {filters.viewMode === 'date' && (
                                    <div className='mt-4 flex items-center justify-between rounded border bg-gray-50 p-4 shadow-sm'>
                                        <div className='flex flex-wrap items-center gap-6'>
                                            <Label className='flex cursor-pointer items-center gap-3'>
                                                <input
                                                    type='radio'
                                                    name='dateFilter'
                                                    value='1'
                                                    checked={filters.dateFilter === '1'}
                                                    onChange={() => setFilters((prev) => ({ ...prev, dateFilter: '1' }))}
                                                    className='h-4 w-4'
                                                />
                                                Transaction Date
                                            </Label>

                                            <Label className='flex cursor-pointer items-center gap-3'>
                                                <input
                                                    type='radio'
                                                    name='dateFilter'
                                                    value='2'
                                                    checked={filters.dateFilter === '2'}
                                                    onChange={() => setFilters((prev) => ({ ...prev, dateFilter: '2' }))}
                                                    className='h-4 w-4'
                                                />
                                                Cheque Date
                                            </Label>

                                            <Label className='flex cursor-pointer items-center gap-3'>
                                                <input
                                                    type='radio'
                                                    name='dateFilter'
                                                    value='4'
                                                    checked={filters.dateFilter === '4'}
                                                    onChange={() => setFilters((prev) => ({ ...prev, dateFilter: '4' }))}
                                                    className='h-4 w-4'
                                                />
                                                Transaction & Cheque
                                            </Label>

                                            <Label className='flex cursor-pointer items-center gap-3'>
                                                <input
                                                    type='radio'
                                                    name='dateFilter'
                                                    value='3'
                                                    checked={filters.dateFilter === '3'}
                                                    onChange={() => setFilters((prev) => ({ ...prev, dateFilter: '3' }))}
                                                    className='h-4 w-4'
                                                />
                                                All
                                            </Label>
                                        </div>

                                        <div className='flex items-center gap-6'>
                                            <div className='flex flex-col'>
                                                <Label htmlFor='fromDate' className='font-medium'>
                                                    From Date:
                                                </Label>
                                                <input
                                                    id='fromDate'
                                                    type='date'
                                                    onChange={(e) =>
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            fromDate: e.target.value ? new Date(e.target.value) : null
                                                        }))
                                                    }
                                                    className='rounded border px-3 py-1'
                                                />
                                            </div>

                                            <div className='flex flex-col'>
                                                <Label htmlFor='toDate' className='font-medium'>
                                                    To Date:
                                                </Label>
                                                <input
                                                    id='toDate'
                                                    type='date'
                                                    onChange={(e) =>
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            toDate: e.target.value ? new Date(e.target.value) : null
                                                        }))
                                                    }
                                                    className='rounded border px-3 py-1'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    {/* ==================== ACTION BUTTONS ==================== */}
                                    {/* <div className='flex justify-end gap-4 border-t pt-8'>
                                    <Button size='lg' variant='outline' className='px-8' onClick={() => window.location.reload()}>
                                        Cancel
                                    </Button>

                                    <Button
                                        size='lg'
                                        className='px-12'
                                        onClick={handleSubmit}
                                        disabled={
                                            reportLoading ||
                                            !filters.academicYearId ||
                                            filters.feeGroupIds.length === 0 ||
                                            filters.termIds.length === 0
                                        }>
                                        {reportLoading ? (
                                            <>
                                                <div className='mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                                                Generating Report...
                                            </>
                                        ) : (
                                            'Generate Report'
                                        )}
                                    </Button>
                                </div> */}

                                    <div className='flex justify-center gap-4 border-t pt-6'>
                                        <Button type='submit' disabled={isSubmitting} className='min-w-32'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>

                                        <Button type='button' variant='outline' onClick={handleReset}>
                                            Cancel
                                        </Button>
                                    </div>

                                    {/* ==================== REPORT SECTION ==================== */}
                                    {/* ==================== REPORT SECTION ==================== */}
                                    {showReport && (
                                        <div className='-mx-8 mt-12 overflow-hidden rounded-lg bg-white shadow-xl'>
                                            {/* Loading State */}
                                            {reportLoading ? (
                                                <div className='p-24 text-center'>
                                                    <div className='inline-block h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                                                    <p className='mt-6 text-lg text-muted-foreground'>Generating report, please wait...</p>
                                                </div>
                                            ) : (
                                                /* Table Inside CollapsibleSection */
                                                <CollapsibleSection
                                                    defaultOpen={true}
                                                    variant='default'
                                                    size='lg'
                                                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                                    <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                        <h2 className='font-bold text-2xl text-primary'>Yearly Fee Collection Report</h2>

                                                        <div className='flex gap-3'>
                                                            <div className='mb-4 flex justify-end gap-2'>
                                                                <Button
                                                                    size='sm'
                                                                    className='h-8 w-auto px-3 text-xs'
                                                                    onClick={exportToExcel}>
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

                                                    {/* <div className='flex items-center justify-between border-b bg-muted/40 px-8 py-4'>


                                                            <div className='flex gap-3'>
                                                                <Button variant='outline' onClick={handlePrint}>
                                                                    🖨 Print
                                                                </Button>

                                                                <Button variant='outline' onClick={handleExportExcel}>
                                                                    📊 Export Excel
                                                                </Button>
                                                            </div>
                                                        </div> */}
                                                    <GenericDataTable
                                                        data={tableData}
                                                        columns={getDynamicColumns(filters.breakdown as 'FGW' | 'INMW')}
                                                        isLoading={reportLoading}
                                                        isPaginationRequired={false}
                                                        isSearchRequired={false}
                                                    />
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
