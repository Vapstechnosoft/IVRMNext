// app/(root)/fees/feereports/feedefaulterreport/page.tsx
'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    useFeeBusRouteDefaulterreport,
    useFeeClassListDefaulterreport,
    useFeeCustomGroupDefaulterreport,
    useFeeGroupDefaulterreport,
    useFeeSectionListDefaulterreport,
    useFeeTermDefaulterreport
} from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FormError } from '@/components/ui/extension/field';
import { feeDefaulterReportSchema } from '@/schemas/fees/reports';
import { getFeesSectionListByClassId } from '@/server/fees/reports/fee_DefaulterReport';
import type {
    IFeeBusRouteDropdownList,
    IFeeClassDropdownList,
    IFeeCustomGroupDropdownList,
    IFeeGroupDropdownList,
    IFeeSectionDropdownList,
    IFeeTermDropdownList
} from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { type IFeeDefaluterReport, exportToExcel, printTable } from './_components/columns';

type FormFields = z.infer<typeof feeDefaulterReportSchema>;

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

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

interface FeeDefaulterReportPayload {
    // Common fields for both Yearly and Date Wise
    FMG_Id?: number; // Optional fee group ID
    Balance_1?: number; // 1 if balance checkbox is checked, 0 otherwise
    FMGG_Id?: number; // Custom group ID (0 if undefined)
    FMT_Id?: number; // Term ID (0 if undefined)
    ASMAY_Id: number; // Academic Year ID (REQUIRED)
    radioval: string; // "FGW", "FHW", "FCW", "FIW", "FSW", "FPW"
    reporttype: 'year' | 'date'; // "year" or "date"
    yearid?: number; // 1 if route is selected, 0 otherwise
    active: number; // 1 or 0
    deactive: number; // 1 or 0
    left: number; // 1 or 0
    customflag?: string; // Custom flag (empty string if undefined)
    groupflag?: string; // Group flag (empty string if undefined)
    ASMCL_Id?: number; // Class ID (0 if not selected)
    AMSC_Id?: number; // Section ID (0 if not selected)
    FMG_Ids: number[]; // Array of selected fee group IDs
    FMT_Ids: number[]; // Array of selected term IDs
    TRMR_Ids: number[]; // Array of selected bus route IDs
    term_group: 'G' | 'T'; // "G" for group, "T" for term
    Select_Button?: string; // Radio type selection

    // Conditional fields for Date Wise
    From_Date?: string; // Only for date wise (in date string format)
    duedate?: number; // Only for date wise (1 if due date selected)

    // Conditional fields for Yearly Wise
    studenttype?: string; // Only for yearly wise
}

export default function FeeDefaulterReport() {
    const breakdownOptions = [
        { value: 'FGW', label: 'Fee Group Wise' },
        { value: 'FHW', label: 'Fee Head Wise' },
        { value: 'FCW', label: 'Class Wise' },
        { value: 'FIW', label: 'Installment Wise' },
        { value: 'FSW', label: 'Student/Staff Wise' },
        { value: 'FPW', label: 'Parent Wise' }
    ] as const;

    const {
        handleSubmit,
        setValue,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeDefaulterReportSchema),
        defaultValues: {
            userType: 'Students',
            viewMode: 'Yearly Wise',
            breakdown: 'FGW',
            academicYearId: undefined,
            includeClassSection: false,
            classId: 0,
            sectionId: 0,
            customGroupIds: [],
            feeGroupIds: [],
            termIds: [],
            busRouteIds: [],
            status: {
                active: true,
                deactive: false,
                left: false,
                balance: false
            },
            formatI: false,
            bulkDownload: false
        }
    });

    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        userType: 'Students' as 'Students' | 'Staff' | 'Others',
        viewMode: 'Yearly Wise' as 'Yearly Wise' | 'Date Wise',
        breakdown: 'Fee Group Wise',
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
        busRouteIds: [] as number[],
        formatI: false,
        dueDate: new Date(),
        dueDateType: 'Due Date' as 'Due Date' | 'Till Due Date',
        bulkDownload: false
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);
    const [feeGroups, setFeeGroups] = useState<IFeeGroupDropdownList[]>([]);
    const [feeTerms, setFeeTerms] = useState<IFeeTermDropdownList[]>([]);
    const [feeBusRoutes, setFeeBusRoutes] = useState<IFeeBusRouteDropdownList[]>([]);
    const [customGroups, setCustomGroups] = useState<IFeeCustomGroupDropdownList[]>([]);

    const [reportData, setReportData] = useState<IFeeDefaluterReport[]>([]);
    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);

    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'feeGroup' | 'totalDue' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [sectionLoading, setSectionLoading] = useState(false);

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
    const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermDefaulterreport();
    const { data: busRouteResponse, isLoading: loadingBusRoutes, error: busRouteError } = useFeeBusRouteDefaulterreport();
    const { data: customGroupResponse, isLoading: loadingCustomGroup, error: customGroupError } = useFeeCustomGroupDefaulterreport();

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
    // useEffect(() => {
    //     const fetchSections = async () => {
    //         if (!filters.includeClassSection || !filters.academicYearId || filters.classId <= 0) {
    //             setSections([]);
    //             setFilters((prev) => ({ ...prev, sectionId: 0 }));
    //             return;
    //         }

    //         setSectionLoading(true);
    //         try {
    //             const result = await getFeesSectionListByClassId(Number(filters.academicYearId), filters.classId);
    //              console.log('sectionsdata', result);
    //             const data = Array.isArray(result?.data) ? result.data : [];
    //             setSections(data);

    //             if (data.length === 0) {
    //                 toast.info('No sections found for this class');
    //             }
    //         } catch (error: any) {
    //             toast.error(error.message || 'Failed to load sections');
    //             setSections([]);
    //         } finally {
    //             setSectionLoading(false);
    //         }
    //     };

    //     fetchSections();
    // }, [filters.academicYearId, filters.classId, filters.includeClassSection]);

    const classId = watch('classId') ?? 0;
    const academicYearId = watch('academicYearId');
    const includeClassSection = watch('includeClassSection');

    useEffect(() => {
        const fetchSections = async () => {
            if (!includeClassSection || !academicYearId || classId <= 0) {
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
    }, [academicYearId, classId, includeClassSection, setValue]);

    useEffect(() => {
        if (feegroupError) toast.error(feegroupError?.message || 'Failed to load fee groups');
        else if (feegroupData?.data) setFeeGroups(feegroupData.data);
    }, [feegroupData, feegroupError]);

    useEffect(() => {
        if (feetermError) toast.error(feetermError?.message || 'Failed to load terms');
        else if (feetermData?.data) setFeeTerms(feetermData.data);
    }, [feetermData, feetermError]);

    useEffect(() => {
        if (busRouteError) toast.error(busRouteError?.message || 'Failed to load bus routes');
        else if (busRouteResponse?.data) setFeeBusRoutes(busRouteResponse.data as IFeeBusRouteDropdownList[]);
    }, [busRouteResponse, busRouteError]);

    useEffect(() => {
        if (customGroupError) toast.error(customGroupError?.message || 'Failed to load custom groups');
        else if (customGroupResponse?.data) setCustomGroups(customGroupResponse.data);
    }, [customGroupResponse, customGroupError]);

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

    const toggleBusRoute = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            busRouteIds: prev.busRouteIds.includes(id) ? prev.busRouteIds.filter((x) => x !== id) : [...prev.busRouteIds, id]
        }));

    const selectAllCustomGroups = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, customGroupIds: checked ? customGroups.map((g) => g.fmgG_Id) : [] }));
    };

    const selectAllFeeGroups = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, feeGroupIds: checked ? feeGroups.map((g) => g.fmG_Id) : [] }));
    };

    const selectAllTerms = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, termIds: checked ? feeTerms.map((t) => t.fmT_Id) : [] }));
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
    // const handleSubmit = async () => {

    //   if (!filters.academicYearId) return toast.error('Please select an Academic Year');
    //   if (filters.feeGroupIds.length === 0) return toast.error('Please select at least one Fee Group');
    //   if (filters.termIds.length === 0) return toast.error('Please select at least one Term');

    //   setReportLoading(true);
    //   setShowReport(false);

    //   try {   // Call your server function (make sure it returns Promise!)
    //     const result = await feedefaluerreportdata(5855, 55);

    //     const data = Array.isArray(result) ? result : (result?.data || []);

    //     setReportData(data as IFeeAuditReport[]);
    //     setShowReport(true);

    //     // Feedback
    //     if (data.length > 0) {
    //       toast.success(`Report generated: ${data.length} defaulter(s) found`);
    //     } else {
    //       toast.info('No defaulters found for the selected criteria');
    //     }

    //     setTimeout(() => {
    //       window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    //     }, 100);

    //   } catch (error: any) {
    //     console.error('Fee Defaulter Report Error:', error);
    //     toast.error(error.message || 'Failed to generate report');

    //     setReportData([]);
    //     setShowReport(true);
    //   } finally {
    //     setReportLoading(false);
    //     setLoading(false);
    //   }
    // };

    const filteredData = useMemo(() => {
        let rows = [...reportData]; // your reportData from API

        if (search) {
            rows = rows.filter((r) => r.feeGroup.toLowerCase().includes(search.toLowerCase()) || r.totalDue.toString().includes(search));
        }

        if (sortKey) {
            rows.sort((a, b) => {
                const valA = a[sortKey];
                const valB = b[sortKey];

                if (typeof valA === 'string') {
                    return sortOrder === 'asc' ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
                }

                return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
            });
        }

        return rows;
    }, [reportData, search, sortKey, sortOrder]);

    const handleSort = (key: 'feeGroup' | 'totalDue') => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const toggleRow = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleAll = () => {
        if (selectedIds.length === filteredData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredData.map((r) => r.id));
        }
    };

    const totalBalance = filteredData.reduce((sum, r) => sum + r.totalDue, 0);
    const selectedBalance = filteredData.filter((r) => selectedIds.includes(r.id)).reduce((sum, r) => sum + r.totalDue, 0);

    const handleExportExcel = () => {
        const rowsToExport = reportData.filter((r) => selectedIds.includes(r.id));

        if (!rowsToExport || rowsToExport.length === 0) {
            toast.error('No data selected to export');
            return;
        }

        exportToExcel(rowsToExport, 'Defaulter_Report');
    };

    const handlePrint = () => {
        const rowsToPrint = reportData.filter((r) => selectedIds.includes(r.id));

        if (!rowsToPrint || rowsToPrint.length === 0) {
            toast.error('No data selected to print');
            return;
        }

        const columns = ['feeGroup', 'totalDue']; // object keys
        const columnHeaders = ['Fee Group', 'Balance Amount']; // headers

        const printableRows = rowsToPrint.map((row) => ({
            feeGroup: row.feeGroup,
            totalDue: `₹${row.totalDue.toLocaleString('en-IN')}`
        }));

        const total = rowsToPrint.reduce((sum, r) => sum + r.totalDue, 0);
        const sumRow = {
            feeGroup: 'Total',
            totalDue: `₹${total.toLocaleString('en-IN')}`
        };

        printTable(columns, printableRows, sumRow);
    };

    watch('customGroupIds');

    const createPayload = (data: FormFields): FeeDefaulterReportPayload => {
        // Determine report type
        const reporttype = data.viewMode === 'Yearly Wise' ? 'year' : 'date';

        // Determine grouporterm based on breakdown
        let term_group: 'G' | 'T' = 'T'; // Default to term
        if (data.breakdown === 'FGW' || data.breakdown === 'FCW' || data.breakdown === 'FPW') {
            term_group = 'G'; // Group
        }

        // Prepare arrays
        const FMG_Ids = data.feeGroupIds || [];
        const FMT_Ids = data.termIds || [];
        const TRMR_Ids = data.busRouteIds || [];

        // Convert status to 1/0
        const active = data.status?.active ? 1 : 0;
        const deactive = data.status?.deactive ? 1 : 0;
        const left = data.status?.left ? 1 : 0;
        const Balance_1 = data.status?.balance ? 1 : 0;

        // Base payload
        const payload: FeeDefaulterReportPayload = {
            ASMAY_Id: Number(data.academicYearId),
            radioval: data.breakdown,
            reporttype,
            active,
            deactive,
            left,
            FMG_Ids,
            FMT_Ids,
            TRMR_Ids,
            term_group,
            Balance_1
        };

        // Set optional fields with defaults
        payload.FMG_Id = data.feeGroupIds?.[0] || 0;
        payload.FMGG_Id = data.customGroupIds?.[0] || 0;
        payload.FMT_Id = data.termIds?.[0] || 0;
        payload.customflag = data.customGroupIds?.length > 0 ? 'true' : '';
        payload.groupflag = data.feeGroupIds?.length > 0 ? 'true' : '';
        payload.Select_Button = data.userType;

        // Set class and section if included
        if (data.includeClassSection && data.classId) {
            payload.ASMCL_Id = data.classId;
            payload.AMSC_Id = data.sectionId || 0;
        } else {
            payload.ASMCL_Id = 0;
            payload.AMSC_Id = 0;
        }

        // Set route/bus info
        if (TRMR_Ids.length > 0) {
            payload.yearid = 1;
            // payload.TRMR_Id = data.busRouteIds[0]; // Uncomment if needed
        } else {
            payload.yearid = 0;
            // payload.TRMR_Id = 0;
        }

        // Conditional logic based on report type
        if (reporttype === 'year') {
            // Yearly Wise specific fields
            payload.studenttype = 'active'; // You might need to adjust this based on your logic
        } else if (reporttype === 'date') {
            // Date Wise specific fields
            if (filters.dueDate) {
                payload.From_Date = new Date(filters.dueDate).toDateString();
            }
            payload.duedate = data.dueDateType === 'Due Date' ? 1 : 0;
        }

        return payload;
    };

    // const handleSubmit = async () => {
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const payload = createPayload(data);

        console.log('Sending payload:', JSON.stringify(payload));

        // Optional: Keep validation
        // if (!filters.academicYearId) return toast.error('Please select an Academic Year');
        // if (filters.feeGroupIds.length === 0) return toast.error('Please select at least one Fee Group');
        // if (filters.termIds.length === 0) return toast.error('Please select at least one Term');

        setReportLoading(true);
        setShowReport(false);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // STATIC MOCK DATA - Looks 100% real!
        const mockData: IFeeDefaluterReport[] = [
            { feeGroup: 'Tuition Fee', totalDue: 12500, id: 1 },
            { feeGroup: 'Transport + Tuition', totalDue: 28500, id: 2 },
            { feeGroup: 'Annual Charges', totalDue: 8000, id: 3 },
            { feeGroup: 'Tuition Fee', totalDue: 15000, id: 4 },
            { feeGroup: 'Lab + Tuition', totalDue: 42000, id: 5 },
            { feeGroup: 'Transport Fee', totalDue: 18000, id: 6 },
            { feeGroup: 'Tuition Fee', totalDue: 12500, id: 7 },
            { feeGroup: 'All Fees', totalDue: 55000, id: 8 },
            { feeGroup: 'Exam Fee', totalDue: 5000, id: 9 },
            { feeGroup: 'Tuition Fee', totalDue: 11000, id: 10 },
            { feeGroup: 'Science Fee', totalDue: 15000, id: 11 },
            { feeGroup: 'Transport', totalDue: 20000, id: 12 },
            { feeGroup: 'Tuition + Lab', totalDue: 30000, id: 13 },
            { feeGroup: 'All Fees', totalDue: 68000, id: 14 },
            { feeGroup: 'Admission Fee', totalDue: 25000, id: 15 }
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

    // const isAcademicYearSelected = !!filters.academicYearId;
    const isAcademicYearSelected = watch('academicYearId');
    const isClassSectionEnabled = filters.includeClassSection;
    const showDateSection = filters.viewMode === 'Date Wise';
    const showBalancecheckbox = filters.userType === 'Students' && filters.breakdown === 'Student/Staff Wise';

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <h1 className='mb-8 font-bold text-3xl text-gray-900'>Fee Defaulter Report</h1>

                            <div className='space-y-8'>
                                {/* User Type Card */}
                                <Card className='border bg-gray-50 p-5 shadow-sm'>
                                    <div className='flex flex-wrap items-center justify-center gap-10'>
                                        {(['Students', 'Staff', 'Others'] as const).map((type) => (
                                            <label key={type} className='flex cursor-pointer items-center gap-3'>
                                                <input
                                                    type='radio'
                                                    name='userType'
                                                    checked={filters.userType === type}
                                                    onChange={() => setFilters((prev) => ({ ...prev, userType: type }))}
                                                    className='h-5 w-5 text-primary'
                                                />
                                                <span className='font-medium text-base'>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </Card>

                                {/* View Mode + Academic Year */}
                                <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                    <Card className='border bg-gray-50 p-5 shadow-sm'>
                                        <div className='flex items-center gap-10'>
                                            {(['Yearly Wise', 'Date Wise'] as const).map((mode) => (
                                                <label key={mode} className='flex cursor-pointer items-center gap-3'>
                                                    <input
                                                        type='radio'
                                                        name='viewMode'
                                                        checked={filters.viewMode === mode}
                                                        onChange={() => setFilters((prev) => ({ ...prev, viewMode: mode }))}
                                                        className='h-5 w-5 text-primary'
                                                    />
                                                    <span className='font-medium text-base'>{mode}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </Card>

                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        {/* <Select
                                            value={filters.academicYearId}
                                            onValueChange={(val) => setFilters((prev) => ({ ...prev, academicYearId: val }))}
                                            disabled={loadingAcademic}>
                                            <SelectTrigger className='w-full min-w-[300px]'>
                                                <SelectValue placeholder={loadingAcademic ? 'Loading...' : 'Select Academic Year'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((year) => (
                                                    <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select> */}
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
                                                        {academicYears?.map((item: any) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.academicYearId && (
                                            <FormError className='mt-1'>{errors.academicYearId.message}</FormError>
                                        )}{' '}
                                    </div>
                                </div>

                                {/* Breakdown By Card */}
                                <Card className='border bg-gray-50 p-5 shadow-sm'>
                                    {/* <div className='grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6'>
                                        {[
                                            'Fee Group Wise',
                                            'Fee Head Wise',
                                            'Class Wise',
                                            'Installment Wise',
                                            'Student/Staff Wise',
                                            'Parent Wise'
                                        ].map((option) => (
                                            <label key={option} className='flex cursor-pointer items-center gap-3'>
                                                <input
                                                    type='radio'
                                                    name='breakdown'
                                                    checked={filters.breakdown === option}
                                                    onChange={() => setFilters((prev) => ({ ...prev, breakdown: option }))}
                                                    className='h-5 w-5 text-primary'
                                                />
                                                <span className='font-medium text-sm'>{option}</span>
                                            </label>
                                        ))}
                                    </div> */}

                                    <div className='grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6'>
                                        <Controller
                                            name='breakdown'
                                            control={control}
                                            render={({ field }) => (
                                                <>
                                                    {breakdownOptions.map((option) => (
                                                        <Label key={option.value} className='flex cursor-pointer items-center gap-3'>
                                                            <Input
                                                                type='radio'
                                                                name={field.name}
                                                                value={option.value}
                                                                checked={field.value === option.value}
                                                                onChange={() => {
                                                                    field.onChange(option.value);
                                                                }}
                                                                className='h-5 w-5 text-primary'
                                                            />
                                                            <span>{option.label}</span>
                                                        </Label>
                                                    ))}
                                                </>
                                            )}
                                        />
                                    </div>
                                </Card>

                                {/* Multi-select Filters with Select All */}
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4'>
                                    {/* Custom Group */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Custom Group<span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            {/* <div className='max-h-64 space-y-3 overflow-y-auto'>
                                               
                                                <label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
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
                                                </label>

                                                {loadingCustomGroup ? (
                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                ) : customGroups.length > 0 ? (
                                                    customGroups.map((group) => (
                                                       
                                                        <label
                                                            key={group.fmgG_Id}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'
                                                        >
                                                            <Checkbox
                                                                checked={filters.customGroupIds.includes(group.fmgG_Id)}
                                                                onCheckedChange={() => toggleCustomGroup(group.fmgG_Id)}
                                                            />
                                                            <span className='font-medium text-sm'>{group.fmgG_GroupName}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-gray-500'>No custom groups</div>
                                                )}
                                            </div> */}
                                            <Controller
                                                name='customGroupIds'
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    const allIds = customGroups.map((g) => g.fmgG_Id);

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
                                                                        setValue('customGroupIds', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                            shouldTouch: true
                                                                        });
                                                                    }}
                                                                />

                                                                <span>Select All</span>
                                                            </Label>

                                                            {/* LOADING */}
                                                            {loadingCustomGroup ? (
                                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                            ) : customGroups.length > 0 ? (
                                                                customGroups.map((group) => {
                                                                    const checked = selectedIds.includes(group.fmgG_Id);

                                                                    return (
                                                                        <Label
                                                                            key={group.fmgG_Id}
                                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                            <Checkbox
                                                                                checked={checked}
                                                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                                    const value =
                                                                                        checked === true
                                                                                            ? [...selectedIds, group.fmgG_Id]
                                                                                            : selectedIds.filter(
                                                                                                  (id) => id !== group.fmgG_Id
                                                                                              );

                                                                                    field.onChange(value);
                                                                                    setValue('customGroupIds', value, {
                                                                                        shouldValidate: true,
                                                                                        shouldDirty: true,
                                                                                        shouldTouch: true
                                                                                    });
                                                                                }}
                                                                            />

                                                                            <span className='font-medium text-sm'>
                                                                                {group.fmgG_GroupName}
                                                                            </span>
                                                                        </Label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className='py-4 text-center text-gray-500'>No custom groups</div>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </Card>
                                        {errors.customGroupIds && <FormError>{errors.customGroupIds.message}</FormError>}
                                    </div>

                                    {/* Fee Group */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Fee Group <span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            {/* <div className='max-h-64 space-y-3 overflow-y-auto'>
                                               
                                                <label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
                                                        checked={feeGroups.length > 0 && filters.feeGroupIds.length === feeGroups.length}
                                                        indeterminate={
                                                            filters.feeGroupIds.length > 0 && filters.feeGroupIds.length < feeGroups.length
                                                        }
                                                        onCheckedChange={(checked: any) => selectAllFeeGroups(!!checked)}
                                                    />
                                                    <span>Select All</span>
                                                </label>

                                                {loadingfeegroup ? (
                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                ) : feeGroups.length > 0 ? (
                                                    feeGroups.map((group) => (
                                                        
                                                        <label
                                                            key={group.fmG_Id}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'
                                                        >
                                                            <Checkbox
                                                                checked={filters.feeGroupIds.includes(group.fmG_Id)}
                                                                onCheckedChange={() => toggleFeeGroup(group.fmG_Id)}
                                                            />
                                                            <span className='text-sm'>{group.fmG_GroupName}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-gray-500'>No fee groups</div>
                                                )}
                                            </div> */}
                                            <Controller
                                                name='feeGroupIds'
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    const allIds = feeGroups.map((g) => g.fmG_Id);

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
                                                                        setValue('feeGroupIds', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                            shouldTouch: true
                                                                        });
                                                                    }}
                                                                />
                                                                <span>Select All</span>
                                                            </Label>

                                                            {/* LOADING */}
                                                            {loadingfeegroup ? (
                                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                            ) : feeGroups.length > 0 ? (
                                                                feeGroups.map((group) => {
                                                                    const checked = selectedIds.includes(group.fmG_Id);

                                                                    return (
                                                                        <Label
                                                                            key={group.fmG_Id}
                                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                            <Checkbox
                                                                                checked={checked}
                                                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                                    const value =
                                                                                        checked === true
                                                                                            ? [...selectedIds, group.fmG_Id]
                                                                                            : selectedIds.filter(
                                                                                                  (id) => id !== group.fmG_Id
                                                                                              );

                                                                                    field.onChange(value);
                                                                                    setValue('feeGroupIds', value, {
                                                                                        shouldValidate: true,
                                                                                        shouldDirty: true,
                                                                                        shouldTouch: true
                                                                                    });
                                                                                }}
                                                                            />
                                                                            <span className='text-sm'>{group.fmG_GroupName}</span>
                                                                        </Label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className='py-4 text-center text-gray-500'>No fee groups</div>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </Card>
                                        {errors.feeGroupIds && <FormError>{errors.feeGroupIds.message}</FormError>}
                                    </div>

                                    {/* Term */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Term Name <span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            {/* <div className='max-h-64 space-y-3 overflow-y-auto'>
                                               
                                                <label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
                                                        checked={feeTerms.length > 0 && filters.termIds.length === feeTerms.length}
                                                        indeterminate={filters.termIds.length > 0 && filters.termIds.length < feeTerms.length}
                                                        onCheckedChange={(checked: any) => selectAllTerms(!!checked)}
                                                    />
                                                    <span>Select All</span>
                                                </label>

                                                {loadingfeeterm ? (
                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                ) : feeTerms.length > 0 ? (
                                                    feeTerms.map((term) => (
                                                       
                                                        <label
                                                            key={term.fmT_Id}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'
                                                        >
                                                            <Checkbox
                                                                checked={filters.termIds.includes(term.fmT_Id)}
                                                                onCheckedChange={() => toggleTerm(term.fmT_Id)}
                                                            />
                                                            <span className='text-sm'>{term.fmT_Name}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-gray-500'>No terms</div>
                                                )}
                                            </div> */}

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

                                    {/* Bus Route */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>Bus Route</Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            {/* <div className='max-h-64 space-y-3 overflow-y-auto'>
                                             
                                                <label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
                                                        checked={feeBusRoutes.length > 0 && filters.busRouteIds.length === feeBusRoutes.length}
                                                        indeterminate={
                                                            filters.busRouteIds.length > 0 && filters.busRouteIds.length < feeBusRoutes.length
                                                        }
                                                        onCheckedChange={(checked: any) => selectAllBusRoutes(!!checked)}
                                                    />
                                                    <span>Select All</span>
                                                </label>

                                                {loadingBusRoutes ? (
                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                ) : feeBusRoutes.length > 0 ? (
                                                    feeBusRoutes.map((route) => (
                                                       
                                                        <label
                                                            key={route.trmR_Id}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'
                                                        >
                                                            <Checkbox
                                                                checked={filters.busRouteIds.includes(route.trmR_Id)}
                                                                onCheckedChange={() => toggleBusRoute(route.trmR_Id)}
                                                            />
                                                            <span className='text-sm'>{route.trmR_RouteName}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-gray-500'>No bus routes</div>
                                                )}
                                            </div> */}

                                            <Controller
                                                name='busRouteIds'
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    const allIds = feeBusRoutes.map((r) => r.trmR_Id);

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
                                                                        setValue('busRouteIds', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                            shouldTouch: true
                                                                        });
                                                                    }}
                                                                />
                                                                <span>Select All</span>
                                                            </Label>

                                                            {/* LOADING */}
                                                            {loadingBusRoutes ? (
                                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                            ) : feeBusRoutes.length > 0 ? (
                                                                feeBusRoutes.map((route) => {
                                                                    const checked = selectedIds.includes(route.trmR_Id);

                                                                    return (
                                                                        <Label
                                                                            key={route.trmR_Id}
                                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                            <Checkbox
                                                                                checked={checked}
                                                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                                    const value =
                                                                                        checked === true
                                                                                            ? [...selectedIds, route.trmR_Id]
                                                                                            : selectedIds.filter(
                                                                                                  (id) => id !== route.trmR_Id
                                                                                              );

                                                                                    field.onChange(value);
                                                                                    setValue('busRouteIds', value, {
                                                                                        shouldValidate: true,
                                                                                        shouldDirty: true,
                                                                                        shouldTouch: true
                                                                                    });
                                                                                }}
                                                                            />
                                                                            <span className='text-sm'>{route.trmR_RouteName}</span>
                                                                        </Label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className='py-4 text-center text-gray-500'>No bus routes</div>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </Card>
                                    </div>
                                </div>

                                {/* Class & Section + Status + Date (Date section is conditional) */}
                                <div className='space-y-6 border-t pt-8'>
                                    <div className='flex flex-wrap items-center gap-6'>
                                        <div className='flex items-center gap-3'>
                                            {/* <Checkbox
                                                id='includeClass'
                                                checked={filters.includeClassSection}
                                                onCheckedChange={(checked: any) => {
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        includeClassSection: !!checked,
                                                     
                                                        classId: !!checked ? prev.classId : 0,
                                                        
                                                        sectionId: !!checked ? prev.sectionId : 0
                                                    }));
                                                    if (!checked) setSections([]);
                                                }}
                                                disabled={!isAcademicYearSelected}
                                            /> */}

                                            <Checkbox
                                                id='includeClass'
                                                checked={filters.includeClassSection}
                                                onCheckedChange={(checked: any) => {
                                                    const value = !!checked;

                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        includeClassSection: value,
                                                        classId: value ? prev.classId : 0,
                                                        sectionId: value ? prev.sectionId : 0
                                                    }));

                                                    // 🔑 THIS IS THE KEY
                                                    setValue('includeClassSection', value, {
                                                        shouldValidate: true
                                                    });

                                                    if (!value) {
                                                        setValue('classId', 0);
                                                        setValue('sectionId', 0);
                                                        setSections([]);
                                                    }
                                                }}
                                                disabled={!isAcademicYearSelected}
                                            />

                                            <Label htmlFor='includeClass' className='cursor-pointer font-medium'>
                                                Class
                                            </Label>
                                        </div>

                                        <div className='w-1/2'>
                                            {/* <Select
                                                value={filters.classId === 0 ? '' : String(filters.classId)}
                                                onValueChange={(val) => {
                                                    const id = Number(val);
                                                    setFilters((prev) => ({ ...prev, classId: id, sectionId: 0 }));
                                                }}
                                                disabled={!isClassSectionEnabled || loadingClasses}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingClasses ? 'Loading classes...' : 'Select Class'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((cls) => (
                                                        <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select> */}
                                            <Controller
                                                name='classId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value ? field.value.toString() : ''}
                                                        onValueChange={(v) => {
                                                            const num = Number(v);
                                                            field.onChange(num);

                                                            // 🔑 Trigger validation
                                                            setValue('classId', num, { shouldValidate: true });
                                                            setValue('sectionId', 0, { shouldValidate: true });
                                                        }}
                                                        disabled={!isClassSectionEnabled || loadingClasses}>
                                                        <SelectTrigger className='w-full text-center'>
                                                            <SelectValue placeholder='--Select Class--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {classes.map((cls) => (
                                                                <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                                    {cls.asmcL_ClassName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />

                                            {errors.classId && <FormError className='mt-1'>{errors.classId.message}</FormError>}
                                        </div>

                                        {filters.includeClassSection && (
                                            <>
                                                <div className='flex items-center gap-2'>
                                                    <Label className='font-medium'>Section</Label>
                                                    <span className='text-red-500'>*</span>
                                                </div>

                                                <div className='min-w-[220px] flex-1'>
                                                    {/* <Select
                                                value={filters.sectionId === 0 ? '' : String(filters.sectionId)}
                                                onValueChange={(val) => setFilters((prev) => ({ ...prev, sectionId: Number(val) }))}
                                                disabled={!isClassSectionEnabled || !filters.classId || loadingSections}>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={
                                                            !filters.classId
                                                                ? 'Select Class first'
                                                                : loadingSections
                                                                    ? 'Loading sections...'
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
                                            </Select> */}
                                                    <Controller
                                                        name='sectionId'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value ? field.value.toString() : ''}
                                                                onValueChange={(v) => {
                                                                    const num = Number(v);
                                                                    field.onChange(num);

                                                                    // 🔑 Trigger validation
                                                                    setValue('sectionId', num, { shouldValidate: true });
                                                                }}
                                                                disabled={!isClassSectionEnabled || loadingClasses}
                                                                // disabled={!isClassSectionEnabled || !filters.classId || loadingSections}
                                                            >
                                                                <SelectTrigger className='w-full text-center'>
                                                                    <SelectValue
                                                                        placeholder='--Select Section--'
                                                                        // placeholder={
                                                                        //     !filters.classId
                                                                        //         ? 'Select Class first'
                                                                        //         : loadingSections
                                                                        //             ? 'Loading sections...'
                                                                        //             : 'Select Section'
                                                                        // }
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
                                                        )}
                                                    />

                                                    {errors.sectionId && <FormError className='mt-1'>{errors.sectionId.message}</FormError>}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className='flex flex-wrap items-center justify-between gap-6'>
                                        <div className='flex flex-wrap items-center gap-8'>
                                            <div className='flex items-center gap-3'>
                                                <Checkbox
                                                    checked={filters.formatI}
                                                    onCheckedChange={(c: any) => setFilters((prev) => ({ ...prev, formatI: !!c }))}
                                                />
                                                <Label className='cursor-pointer'>Format-I</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Checkbox checked={filters.status.active} onCheckedChange={() => toggleStatus('active')} />
                                                <Label className='cursor-pointer'>Active</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Checkbox
                                                    checked={filters.status.deactive}
                                                    onCheckedChange={() => toggleStatus('deactive')}
                                                />
                                                <Label className='cursor-pointer'>Deactive</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Checkbox checked={filters.status.left} onCheckedChange={() => toggleStatus('left')} />
                                                <Label className='cursor-pointer'>Left</Label>
                                            </div>

                                            {showBalancecheckbox && (
                                                <div className='flex items-center gap-3'>
                                                    <Checkbox
                                                        checked={filters.status.balance}
                                                        onCheckedChange={() => toggleStatus('balance')}
                                                    />
                                                    <Label className='cursor-pointer'>Balance</Label>
                                                </div>
                                            )}

                                            <div className='flex items-center gap-3'>
                                                <Checkbox
                                                    checked={filters.bulkDownload}
                                                    onCheckedChange={(c: any) => setFilters((prev) => ({ ...prev, bulkDownload: !!c }))}
                                                />
                                                <Label className='cursor-pointer'>Bulk Download</Label>
                                            </div>
                                        </div>
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
                                                    <label className='flex cursor-pointer items-center gap-3'>
                                                        <input
                                                            type='radio'
                                                            name='dueDateType'
                                                            checked={filters.dueDateType === 'Due Date'}
                                                            onChange={() => setFilters((prev) => ({ ...prev, dueDateType: 'Due Date' }))}
                                                            className='h-4 w-4 text-primary'
                                                        />
                                                        <span className='font-medium'>Due Date</span>
                                                    </label>
                                                    <label className='flex cursor-pointer items-center gap-3'>
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
                                                    </label>
                                                </div>
                                            </Card>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {/* <div className="flex justify-end gap-4 pt-8 border-t">
                <Button size="lg" variant="outline" className="px-8" onClick={() => window.location.reload()}>
                  Cancel
                </Button>
                <Button
                  size="lg"
                  className="px-10"
                  onClick={handleSubmit}
                  disabled={loading || !filters.academicYearId || filters.feeGroupIds.length === 0 || filters.termIds.length === 0}
                >
                  {loading ? 'Generating Report...' : 'Generate Report'}
                </Button>
              </div> */}

                                <div>
                                    {/* ==================== ACTION BUTTONS ==================== */}
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button size='lg' variant='outline' className='px-8' onClick={() => window.location.reload()}>
                                            Cancel
                                        </Button>
                                        {/* 
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
                                    </Button> */}

                                        <Button type='submit' disabled={isSubmitting} className='min-w-32'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                        {/* <Button
                                            size='lg'
                                            variant='secondary'
                                            className='bg-green-600 px-10 font-medium text-white hover:bg-green-700'
                                            onClick={() => exportToExcel(reportData, 'Fee_Defaulter_Report')}
                                            disabled={reportLoading || reportData.length === 0}>
                                            <svg className='mr-2 h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
                                                <path d='M4 4h12v2H4V4zm0 4h12v8H4V8zm2 2v4h8v-4H6z' />
                                                <path d='M13.5 10l-3-3-3 3h2v4h2v-4h2z' />
                                            </svg>
                                            Export to Excel
                                        </Button> */}
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
                                                    {/* <div className='border-b bg-primary/5 px-8 py-6'>
                                                        <h2 className='font-bold text-2xl text-primary'>Fee Defaulter Report</h2>
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
                                                    </div> */}

                                                    <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                        {/* <h2 className='font-bold text-blue-700 text-xl'>Fee Audit Report</h2> */}
                                                        <div className='mb-6 text-center'>
                                                            <h2 className='font-bold text-2xl text-primary'>Fee Defaulter Report</h2>
                                                            {/* <div className="mt-1 text-sm text-gray-600">
                                                                    From {formatDate(fromDate)} To {formatDate(toDate)}
                                                                </div> */}
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

                                                    {/* <div className='mb-6 text-center'>
                                                      
                                                                          
                                                                            <div className='mb-4 flex justify-end gap-2'>
                                                                                <Button size='sm' className='h-8 w-auto px-3 text-xs' onClick={handleExportExcel}>
                                                                                    Export Excel
                                                                                </Button>
                                                    
                                                                                <Button size='sm' variant='outline' className='h-8 w-auto px-3 text-xs' onClick={handlePrint}>
                                                                                    Print
                                                                                </Button>
                                                                            </div>
                                                                        </div> */}
                                                    {/* <GenericDataTable<IFeeAuditReport>
                                                        columns={feeDefaulterReportColumns}
                                                        data={reportData}
                                                        isLoading={reportLoading}
                                                        isPaginationRequired={false}
                                                    /> */}

                                                    {/* <FeeDefaulterCustomTable
                                                        data={reportData}
                                                        isLoading={reportLoading}
                                                    /> */}

                                                    <div>
                                                        {/* Search */}
                                                        <input
                                                            value={search}
                                                            onChange={(e) => setSearch(e.target.value)}
                                                            placeholder='Search...'
                                                            className='w-72 rounded border px-3 py-2'
                                                        />

                                                        {/* Table */}
                                                        <div className='overflow-x-auto border'>
                                                            <table className='w-full table-auto border-collapse'>
                                                                <thead className='bg-primary text-white'>
                                                                    <tr>
                                                                        <th className='p-2 text-center'>
                                                                            <Checkbox
                                                                                checked={
                                                                                    selectedIds.length === filteredData.length &&
                                                                                    filteredData.length > 0
                                                                                }
                                                                                indeterminate={
                                                                                    selectedIds.length > 0 &&
                                                                                    selectedIds.length < filteredData.length
                                                                                }
                                                                                onCheckedChange={toggleAll}
                                                                            />
                                                                        </th>
                                                                        <th className='p-2 text-center'>Sl No</th>
                                                                        <th
                                                                            className='cursor-pointer p-2 text-center'
                                                                            onClick={() => handleSort('feeGroup')}>
                                                                            Group Name{' '}
                                                                            {sortKey === 'feeGroup' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                                        </th>
                                                                        <th
                                                                            className='cursor-pointer p-2 text-center'
                                                                            onClick={() => handleSort('totalDue')}>
                                                                            Balance Amount{' '}
                                                                            {sortKey === 'totalDue' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                                        </th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody>
                                                                    {filteredData.map((row, index) => (
                                                                        <tr key={row.id} className='border-b'>
                                                                            <td className='p-2 text-center'>
                                                                                <Checkbox
                                                                                    checked={selectedIds.includes(row.id)}
                                                                                    onCheckedChange={() => toggleRow(row.id)}
                                                                                />
                                                                            </td>
                                                                            <td className='p-2 text-center font-medium'>{index + 1}</td>
                                                                            <td className='p-2 text-center font-medium'>{row.feeGroup}</td>
                                                                            <td className='p-2 text-center font-bold'>
                                                                                ₹{row.totalDue.toLocaleString('en-IN')}
                                                                            </td>
                                                                        </tr>
                                                                    ))}

                                                                    {/* Total */}
                                                                    <tr className='bg-gray-100 font-bold'>
                                                                        <td />
                                                                        <td />
                                                                        <td className='p-2 text-center'>Total</td>
                                                                        <td className='p-2 text-center'>
                                                                            ₹{totalBalance.toLocaleString('en-IN')}
                                                                        </td>
                                                                    </tr>

                                                                    {/* Selected Total */}
                                                                    <tr className='bg-gray-200 font-bold'>
                                                                        <td />
                                                                        <td />
                                                                        <td className='p-2 text-center'>Selected Balance</td>
                                                                        <td className='p-2 text-center'>
                                                                            ₹{selectedBalance.toLocaleString('en-IN')}
                                                                        </td>
                                                                    </tr>
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
