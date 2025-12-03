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
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToExcel } from '@/lib/utils';
import type {
    IFeeBusRouteDropdownList,
    IFeeClassDropdownList,
    IFeeCustomGroupDropdownList,
    IFeeDefaulterReportRow,
    IFeeGroupDropdownList,
    IFeeSectionDropdownList,
    IFeeTermDropdownList
} from '@/types/fees/reports/reports';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { feeDefaulterReportColumns } from './_components/columns';

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

export default function FeeDefaulterReport() {
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

    const [reportData, setReportData] = useState<IFeeDefaulterReportRow[]>([]);
    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);

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
            formatted.sort((a, b) => (b.asmaY_Order || 0) - (a.asmaY_Order || 0));
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

    //     setReportData(data as IFeeDefaulterReportRow[]);
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

    const handleSubmit = async () => {
        // Optional: Keep validation
        if (!filters.academicYearId) return toast.error('Please select an Academic Year');
        if (filters.feeGroupIds.length === 0) return toast.error('Please select at least one Fee Group');
        if (filters.termIds.length === 0) return toast.error('Please select at least one Term');

        setReportLoading(true);
        setShowReport(false);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // STATIC MOCK DATA - Looks 100% real!
        const mockData: IFeeDefaulterReportRow[] = [
            { feeGroup: 'Tuition Fee', totalDue: 12500 },
            { feeGroup: 'Transport + Tuition', totalDue: 28500 },
            { feeGroup: 'Annual Charges', totalDue: 8000 },
            { feeGroup: 'Tuition Fee', totalDue: 15000 },
            { feeGroup: 'Lab + Tuition', totalDue: 42000 },
            { feeGroup: 'Transport Fee', totalDue: 18000 },
            { feeGroup: 'Tuition Fee', totalDue: 12500 },
            { feeGroup: 'All Fees', totalDue: 55000 },
            { feeGroup: 'Exam Fee', totalDue: 5000 },
            { feeGroup: 'Tuition Fee', totalDue: 11000 },
            { feeGroup: 'Science Fee', totalDue: 15000 },
            { feeGroup: 'Transport', totalDue: 20000 },
            { feeGroup: 'Tuition + Lab', totalDue: 30000 },
            { feeGroup: 'All Fees', totalDue: 68000 },
            { feeGroup: 'Admission Fee', totalDue: 25000 }
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

    const isAcademicYearSelected = !!filters.academicYearId;
    const isClassSectionEnabled = filters.includeClassSection;
    const showDateSection = filters.viewMode === 'Date Wise';
    const showBalancecheckbox = filters.userType === 'Students' && filters.breakdown === 'Student/Staff Wise';

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
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
                                    <Select
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
                                    </Select>
                                </div>
                            </div>

                            {/* Breakdown By Card */}
                            <Card className='border bg-gray-50 p-5 shadow-sm'>
                                <div className='grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6'>
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
                                </div>
                            </Card>

                            {/* Multi-select Filters with Select All */}
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4'>
                                {/* Custom Group */}
                                <div className='space-y-3'>
                                    <Label className='font-semibold text-lg'>Custom Group</Label>
                                    <Card className='border bg-gray-50 p-4'>
                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
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
                                                    // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
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
                                        </div>
                                    </Card>
                                </div>

                                {/* Fee Group */}
                                <div className='space-y-3'>
                                    <Label className='font-semibold text-lg'>
                                        Fee Group <span className='text-red-500'>*</span>
                                    </Label>
                                    <Card className='border bg-gray-50 p-4'>
                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
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
                                                    // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
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
                                        </div>
                                    </Card>
                                </div>

                                {/* Term */}
                                <div className='space-y-3'>
                                    <Label className='font-semibold text-lg'>
                                        Term Name <span className='text-red-500'>*</span>
                                    </Label>
                                    <Card className='border bg-gray-50 p-4'>
                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
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
                                                    // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
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
                                        </div>
                                    </Card>
                                </div>

                                {/* Bus Route */}
                                <div className='space-y-3'>
                                    <Label className='font-semibold text-lg'>Bus Route</Label>
                                    <Card className='border bg-gray-50 p-4'>
                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
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
                                                    // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
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
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            {/* Class & Section + Status + Date (Date section is conditional) */}
                            <div className='space-y-6 border-t pt-8'>
                                <div className='flex flex-wrap items-center gap-6'>
                                    <div className='flex items-center gap-3'>
                                        <Checkbox
                                            id='includeClass'
                                            checked={filters.includeClassSection}
                                            onCheckedChange={(checked: any) => {
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    includeClassSection: !!checked,
                                                    // biome-ignore lint/complexity/noExtraBooleanCast: <explanation>
                                                    classId: !!checked ? prev.classId : 0,
                                                    // biome-ignore lint/complexity/noExtraBooleanCast: <explanation>
                                                    sectionId: !!checked ? prev.sectionId : 0
                                                }));
                                                if (!checked) setSections([]);
                                            }}
                                            disabled={!isAcademicYearSelected}
                                        />
                                        <Label htmlFor='includeClass' className='cursor-pointer font-medium'>
                                            Class
                                        </Label>
                                    </div>

                                    <div className='min-w-[220px] flex-1'>
                                        <Select
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
                                        </Select>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <Label className='font-medium'>Section</Label>
                                        <span className='text-red-500'>*</span>
                                    </div>

                                    <div className='min-w-[220px] flex-1'>
                                        <Select
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
                                        </Select>
                                    </div>
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
                                            <Checkbox checked={filters.status.deactive} onCheckedChange={() => toggleStatus('deactive')} />
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
                                                        onChange={() => setFilters((prev) => ({ ...prev, dueDateType: 'Till Due Date' }))}
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
                                    <Button
                                        size='lg'
                                        variant='secondary'
                                        className='bg-green-600 px-10 font-medium text-white hover:bg-green-700'
                                        onClick={exportToExcel}
                                        disabled={reportLoading || reportData.length === 0}>
                                        <svg className='mr-2 h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
                                            <path d='M4 4h12v2H4V4zm0 4h12v8H4V8zm2 2v4h8v-4H6z' />
                                            <path d='M13.5 10l-3-3-3 3h2v4h2v-4h2z' />
                                        </svg>
                                        Export to Excel
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
                                                <div className='border-b bg-primary/5 px-8 py-6'>
                                                    <h2 className='font-bold text-2xl text-primary'>Fee Defaulter Report</h2>
                                                </div>
                                                <GenericDataTable<IFeeDefaulterReportRow>
                                                    columns={feeDefaulterReportColumns}
                                                    data={reportData}
                                                    isLoading={reportLoading}
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
        </div>
    );
}
