// app/(root)/fees/feereports/feedefaulterreport/page.tsx
'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    useFeeClassListDefaulterreport,
    useFeeCustomGroupDefaulterreport,
    useFeeGroupDefaulterreport,
    useFeeSectionListDefaulterreport,
    useFeeTermDefaulterreport
} from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type {
    IFeeBusRouteDropdownList,
    IFeeClassDropdownList,
    IFeeCustomGroupDropdownList,
    IFeeDefaulterReportRow,
    IFeeGroupDropdownList,
    IFeeInstallmentDropdownList,
    IFeeSectionDropdownList,
    IFeeTermDropdownList
} from '@/types/fees/reports/reports';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FeeConcessionReportColumns } from './_components/columns';

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

export default function FeeConcessionReport() {
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        userType: 'Students' as 'Students' | 'Staff' | 'Others',
        viewMode: 'year' as 'year' | 'date',

        breakdown: 'Fee Group Wise',
        academicYearId: '',
        classId: 0,
        sectionId: 0,
        includeClassSection: false,
        status: {
            active: false,
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

    const [reportData, setReportData] = useState<IFeeDefaulterReportRow[]>([]);
    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);
    const [feeInstallments, setfeeInstallments] = useState<IFeeInstallmentDropdownList[]>([]);

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
    const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermDefaulterreport();

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

    const selectAllCustomGroups = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, customGroupIds: checked ? customGroups.map((g) => g.fmgG_Id) : [] }));
    };

    const selectAllFeeGroups = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, feeGroupIds: checked ? feeGroups.map((g) => g.fmG_Id) : [] }));
    };

    const selectAllTerms = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, termIds: checked ? feeTerms.map((t) => t.fmT_Id) : [] }));
    };

    const selectAllInstallments = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, installmentIds: checked ? feeInstallments.map((t) => t.fmI_Id) : [] }));
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
        // STATIC MOCK DATA - Looks 100% real!
        const mockData: IFeeDefaulterReportRow[] = [];
    };

    const showBalancecheckbox = filters.userType === 'Students' && filters.breakdown === 'Student/Staff Wise';

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
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

                            <div className='flex flex-wrap gap-8'>
                                <Card className='min-w-[400px] flex-1 border bg-gray-50 p-5 shadow-sm'>
                                    <div className='flex justify-center'>
                                        <div className='flex flex-wrap justify-center gap-6'>
                                            {[
                                                { label: 'Fee Group Wise', value: 'FGW' },
                                                { label: 'Fee Head Wise', value: 'FHW' },
                                                { label: 'Class Wise', value: 'FCW' },
                                                { label: 'Student Wise', value: 'FSW' }
                                            ].map((option) => (
                                                <label
                                                    key={option.value}
                                                    className='flex cursor-pointer items-center gap-2 whitespace-nowrap'>
                                                    <input
                                                        type='radio'
                                                        name='breakdown'
                                                        checked={filters.breakdown === option.value}
                                                        onChange={() =>
                                                            setFilters((prev) => ({
                                                                ...prev,
                                                                breakdown: option.value
                                                            }))
                                                        }
                                                        className='h-5 w-5 text-primary'
                                                    />
                                                    <span className='font-medium text-sm'>{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
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
                                        Custom Group<span className='text-red-500'>*</span>
                                    </Label>
                                    <Card className='border bg-gray-50 p-4'>
                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                            <label
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
                                            </label>

                                            {loadingCustomGroup ? (
                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                            ) : customGroups.length > 0 ? (
                                                customGroups.map((group) => (
                                                    <label
                                                        key={group.fmgG_Id}
                                                        htmlFor={`customGroup-${group.fmgG_Id}`}
                                                        className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                        <Checkbox
                                                            id={`customGroup-${group.fmgG_Id}`}
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

                                {/* Column 2: Fee Group */}
                                <div className='space-y-3'>
                                    <Label className='font-semibold text-lg'>
                                        Fee Group <span className='text-red-500'>*</span>
                                    </Label>
                                    <Card className='border bg-gray-50 p-4'>
                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                            <label
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
                                            </label>

                                            {loadingfeegroup ? (
                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                            ) : feeGroups.length > 0 ? (
                                                feeGroups.map((group) => (
                                                    <label
                                                        key={group.fmG_Id}
                                                        htmlFor={`feeGroup-${group.fmG_Id}`}
                                                        className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                        <Checkbox
                                                            id={`feeGroup-${group.fmG_Id}`}
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

                                {/* Column 3: Term OR Installment */}
                                <div className='space-y-3'>
                                    <>
                                        <Label className='font-semibold text-lg'>
                                            Term Name <span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                <label
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
                                                </label>

                                                {loadingfeeterm ? (
                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                ) : feeTerms.length > 0 ? (
                                                    feeTerms.map((term) => (
                                                        <label
                                                            key={term.fmT_Id}
                                                            htmlFor={`term-${term.fmT_Id}`}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                            <Checkbox
                                                                id={`term-${term.fmT_Id}`}
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
                                    </>
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
                                            <Checkbox checked={filters.status.deactive} onCheckedChange={() => toggleStatus('deactive')} />
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
                                </div>
                            </div>

                            {filters.viewMode === 'date' && (
                                <div className='mt-4 flex items-center justify-center rounded border bg-gray-50 p-4 shadow-sm'>
                                    <div className='flex items-center gap-6'>
                                        <div className='flex flex-col'>
                                            <label htmlFor='fromDate' className='font-medium'>
                                                From Date:
                                            </label>
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
                                            <label htmlFor='toDate' className='font-medium'>
                                                To Date:
                                            </label>
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
                                                    columns={FeeConcessionReportColumns}
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
