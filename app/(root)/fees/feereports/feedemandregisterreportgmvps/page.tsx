'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useFeeClassListDefaulterreport,
    useFeeCustomGroupDefaulterreport,
    useFeeDefaulterReport,
    useFeeGroupDefaulterreport,
    useFeeSectionListDefaulterreport,
    useFeeTermDropDownDataForReports
} from '@/hooks/fees/useReports';
import { feeDemandRegisterReportGMVPSSchema } from '@/schemas/fees/reports';
import { getDailyFeeCollectionReport, getGroupsDropdown } from '@/server/fees/reports/daily_fee_collection_report';
import type { IFeeCustomGroupDropdownList, IFeeGroupDropdownList, IFeeTermDropdownList } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeDemandRegisterReportGMVPSSchema>;

const today = new Date().toISOString().split('T')[0];

export default function FeeDemandRegisterReportGMVPS() {
    const {
        control,
        handleSubmit,
        reset,
        register,
        setValue,
        formState: { isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeDemandRegisterReportGMVPSSchema),
        mode: 'all',
        defaultValues: {
            report: 'All',
            rpttyp: 'Individual',
            reportdate: 'As On Date',
            asmaY_Id: 0,
            asmcL_Id: 0,
            asms_Id: 0,
            groupIds: [],
            chequeDate: false,
            acdmyr: false,
            headwise: false,
            paymentwise: false,
            fromDate: today,
            toDate: today
        }
    });

    const [submitClicked, setSubmitClicked] = useState(false);

    // ---------------------------- WATCH ----------------------------
    const report = useWatch({ control, name: 'report' });
    const rpttyp = useWatch({ control, name: 'rpttyp' });
    const reportdate = useWatch({ control, name: 'reportdate' });
    const chequeDate = useWatch({ control, name: 'chequeDate' });
    const acdmyr = useWatch({ control, name: 'acdmyr' });
    const headwise = useWatch({ control, name: 'headwise' });
    const paymentwise = useWatch({ control, name: 'paymentwise' });
    const detailed = useWatch({ control, name: 'detailed' });
    const grandTotal = useWatch({ control, name: 'grandTotal' });
    const active = useWatch({ control, name: 'active' });
    const left = useWatch({ control, name: 'left' });
    const deactive = useWatch({ control, name: 'deactive' });
    const total = useWatch({ control, name: 'total' });
    const userSelection = useWatch({ control, name: 'userSelection' });
    const newAdmissionStudent = useWatch({
        control,
        name: 'newAdmissionStudent'
    });

    const [refreshAY, setRefreshAY] = useState(0);
    const [tableSumRow, setTableSumRow] = useState<any>(null);

    const [reporttype, setReportType] = useState('');

    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [feeGroups, setFeeGroups] = useState<IFeeGroupDropdownList[]>([]);
    const [feeTerms, setFeeTerms] = useState<IFeeTermDropdownList[]>([]);
    const [groupManualLoading, setGroupManualLoading] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [section, setSection] = useState<any[]>([]);
    const [customGroups, setCustomGroups] = useState<IFeeCustomGroupDropdownList[]>([]);

    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [filters, setFilters] = useState({
        customGroupIds: [] as number[],
        feeGroupIds: [] as number[],
        termIds: [] as number[],
        dueDate: new Date(),
        fromDate: new Date(),
        toDate: new Date()
    });

    const { data: academicData, error: academicError, isLoading: loadingAcademic, refetch: refetchAcademicYears } = useFeeDefaulterReport();
    const { data: classData, error: classError, isLoading: loadingClasses1 } = useFeeClassListDefaulterreport();

    const { data: sectionListResponse, error: sectionListError, isLoading: loadingSection } = useFeeSectionListDefaulterreport();

    useEffect(() => {
        if (academicError) toast.error('Failed to load academic years');
        if (!loadingAcademic && academicData?.data?.length && selectedAsmayId === null) {
            const years = academicData.data.map((i: any) => ({
                asmaY_Id: i.asmaY_Id,
                asmaY_Year: i.asmaY_Year
            }));
            setAcademicYears(years);
            const firstYearId = years[0].asmaY_Id;
            setValue('asmaY_Id', firstYearId, {
                shouldValidate: true,
                shouldDirty: false
            });
            if (years.length > 0) {
                const firstYearId = years[0].asmaY_Id;
                setValue('asmaY_Id', firstYearId, { shouldValidate: true });
                onYearChange(firstYearId);
            }
        }
    }, [academicData, academicError, refreshAY]);

    useEffect(() => {
        if (classError) toast.error('Failed to load Class dropdown');
        if (classData?.data) {
            setClasses(
                classData.data.map((i: any) => ({
                    asmcL_Id: i.asmcL_Id,
                    asmcL_ClassName: i.asmcL_ClassName
                }))
            );
        }
    }, [classData, classError]);

    useEffect(() => {
        if (sectionListError) toast.error('Failed to load Section dropdown');
        if (sectionListResponse?.data) {
            setSection(
                sectionListResponse.data.map((i: any) => ({
                    asmS_Id: i.asmS_Id,
                    asmC_SectionName: i.asmC_SectionName
                }))
            );
        }
    }, [sectionListResponse, sectionListError]);
    const selectAllCustomGroups = (checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            customGroupIds: checked ? customGroups.map((g) => g.fmgG_Id) : []
        }));
    };

    const selectAllFeeGroups = (checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            feeGroupIds: checked ? feeGroups.map((g) => g.fmG_Id) : []
        }));
    };

    const selectAllTerms = (checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            termIds: checked ? feeTerms.map((t) => t.fmT_Id) : []
        }));
    };

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
    const { data: customGroupResponse, isLoading: loadingCustomGroup, error: customGroupError } = useFeeCustomGroupDefaulterreport();

    const { data: feegroupData, isLoading: loadingfeegroup, error: feegroupError } = useFeeGroupDefaulterreport();
    const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermDropDownDataForReports();

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

    useEffect(() => {
        if (feegroupError) toast.error(feegroupError?.message || 'Failed to load fee groups');
        else if (feegroupData?.data) setFeeGroups(feegroupData.data);
    }, [feegroupData, feegroupError]);

    useEffect(() => {
        if (feetermError) toast.error(feetermError?.message || 'Failed to load terms');
        else if (feetermData?.data) setFeeTerms(feetermData.data);
    }, [feetermData, feetermError]);

    const onYearChange = async (yearId: number) => {
        try {
            setGroupManualLoading(true);
            const res = await getGroupsDropdown(yearId);

            const groups =
                res?.data?.map((i: any) => ({
                    fmG_Id: i.fmG_Id,
                    fmG_GroupName: i.fmG_GroupName
                })) ?? [];

            setFeeGroups(groups);

            setValue(
                'groupIds',
                groups.map((g) => g.fmG_Id),
                { shouldValidate: true }
            );
        } catch {
            toast.error('Failed to load groups');
        } finally {
            setGroupManualLoading(false);
        }
    };

    const [loading, setLoading] = useState(false);
    const [tableColumns, setTableColumns] = useState<string[]>([]);
    const [tableRows, setTableRows] = useState<any[]>([]);
    const [showTable, setShowTable] = useState(false);

    const handlePrint = () => {
        //  printTable(tableColumns, tableRows, tableSumRow);
    };

    const handleExportExcel = () => {
        //  exportToExcel(
        //      [...tableRows, tableSumRow], // include TOTAL row
        //      'Daily_Fee_Collection_Report'
        //  );
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setSubmitClicked(true);

        if (rpttyp === 'All' && report === 'All' && !chequeDate && !acdmyr && !headwise && !paymentwise) {
            toast.error('Please select at least one checkbox Cheque Date/Add Year Wise Report/Headwise/Paymentwise');
            return;
        }

        try {
            setShowTable(false);
            setLoading(true);
            setTableRows([]);

            const payload = {};

            const response = await getDailyFeeCollectionReport(payload);

            const rawData: any = response?.data;

            if (!Array.isArray(rawData?.list) || rawData.list.length === 0) {
                toast.error('No data found');
                setShowTable(false);
                setTableRows([]);
                return;
            }

            const currentReportType = rawData?.listName || '';
            setReportType(currentReportType);

            if (currentReportType === 'Headwise') {
                const list = Array.isArray(rawData?.list) ? rawData.list : [];

                toast.success('Report Data Fetched Successfully');

                // 🔹 Collect all fee heads
                const feeHeadSet = new Set<string>();

                list.forEach((item: any) => {
                    Object.keys(item.feeHeadAmounts || {}).forEach((head) => feeHeadSet.add(head));
                });

                const allFeeHeads = Array.from(feeHeadSet);
                const rows = list.map((item: any, index: number) => {
                    const row: any = {
                        SLNO: index + 1,
                        Date: new Date(item.date).toLocaleDateString('en-GB')
                    };

                    allFeeHeads.forEach((head) => {
                        row[head] = Number(item.feeHeadAmounts?.[head] ?? 0); // 🔥 force number
                    });

                    row.Total = Number(item.totalPaidAmount ?? 0); // 🔥 force number

                    return row;
                });

                const columns = ['SLNO', 'Date', ...allFeeHeads, 'Total'];

                setTableColumns(columns);
                setTableRows(rows);

                const sumRow: any = {
                    SLNO: '',
                    Date: 'Total'
                };

                // First columns
                sumRow.SLNO = '';
                sumRow.Date = 'Total';

                // Initialize sums
                columns.forEach((col) => {
                    if (col !== 'SLNO' && col !== 'Date') {
                        sumRow[col] = 0;
                    }
                });

                rows.forEach((row: any) => {
                    columns.forEach((col) => {
                        if (col !== 'SLNO' && col !== 'Date') {
                            sumRow[col] += Number(row[col]); // 🔥 GUARANTEED NUMBER
                        }
                    });
                });

                setTableSumRow(sumRow);
            } else if (currentReportType === 'Paymentwise') {
                const list = Array.isArray(rawData?.list) ? rawData.list : [];
                toast.success('Report Data Fetched Successfully');
                // 🔹 Collect payment modes
                const paymentModeSet = new Set<string>();
                list.forEach((item: any) => {
                    if (item.paymentMode) {
                        paymentModeSet.add(item.paymentMode);
                    }
                });

                const paymentModes = Array.from(paymentModeSet);
                // Example: ['Bank', 'Cash', 'RTGS/NEFT', 'Swipe/Card', 'UPI']

                // 🔹 Group by Date + HeadName
                const grouped: Record<string, any> = {};

                list.forEach((item: any) => {
                    const date = new Date(item.date).toLocaleDateString('en-GB');
                    const headName = item.headName;
                    const key = `${date}_${headName}`;

                    if (!grouped[key]) {
                        grouped[key] = {
                            Date: date,
                            HeadName: headName
                        };

                        // Initialize payment columns
                        paymentModes.forEach((mode) => {
                            grouped[key][mode] = 0;
                        });
                    }

                    const mode = item.paymentMode;
                    const amount = Number(item.amount ?? 0);

                    grouped[key][mode] += amount;
                });

                // 🔹 Convert to rows
                const rows = Object.values(grouped).map((row: any, index: number) => ({
                    SLNO: index + 1,
                    ...row
                }));

                const columns = ['SLNO', 'Date', 'HeadName', ...paymentModes];

                setTableColumns(columns);
                setTableRows(rows);

                // 🔹 Sum row
                const sumRow: any = {
                    SLNO: '',
                    Date: '',
                    HeadName: 'Total'
                };

                columns.forEach((col) => {
                    if (!['SLNO', 'Date', 'HeadName'].includes(col)) {
                        sumRow[col] = 0;
                    }
                });

                rows.forEach((row: any) => {
                    columns.forEach((col) => {
                        if (!['SLNO', 'Date', 'HeadName'].includes(col)) {
                            sumRow[col] += Number(row[col] || 0);
                        }
                    });
                });

                setTableSumRow(sumRow);
            } else if (currentReportType === 'Student') {
                const list = Array.isArray(rawData?.list) ? rawData.list : [];
                toast.success('Report Data Fetched Successfully');
                const rows = list.map((item: any, index: number) => ({
                    SLNO: index + 1,
                    StudentName: item.name ?? '',
                    AdmissionNo: item.amsT_AdmNo ?? '',
                    ClassName: item.asmcL_ClassName ?? '',
                    SectionName: item.asmC_SectionName ?? '',
                    MobileNo: item.mobileNo ?? '',
                    ReceiptNo: item.fyP_Receipt_No ?? '',
                    BankName: item.fyppM_BankName ?? '',
                    ChequeNo: item.fyP_DD_Cheque_No ?? '',
                    Date: item.date ?? '',

                    Bank: Number(item.bank ?? 0),
                    Cash: Number(item.cash ?? 0),
                    Online: Number(item.online ?? 0),
                    Card: Number(item.card ?? 0),
                    RTGS: Number(item.rtgs ?? 0),
                    ECS: Number(item.ecs ?? 0),
                    Total: Number(item.total ?? 0)
                }));

                const columns = [
                    'SLNO',
                    'StudentName',
                    'AdmissionNo',
                    'ClassName',
                    'SectionName',
                    'MobileNo',
                    'ReceiptNo',
                    'BankName',
                    'ChequeNo',
                    'Date',
                    'Bank',
                    'Cash',
                    'Online',
                    'Card',
                    'RTGS',
                    'ECS',
                    'Total'
                ];

                setTableColumns(columns);
                setTableRows(rows);

                // 🔹 SUM ROW
                const sumRow: any = {
                    SLNO: '',
                    StudentName: '',
                    AdmissionNo: '',
                    ClassName: '',
                    SectionName: '',
                    MobileNo: '',
                    ReceiptNo: '',
                    BankName: '',
                    ChequeNo: '',
                    Date: 'Total'
                };

                // Initialize numeric sums
                columns.forEach((col) => {
                    if (
                        ![
                            'SLNO',
                            'StudentName',
                            'AdmissionNo',
                            'ClassName',
                            'SectionName',
                            'MobileNo',
                            'ReceiptNo',
                            'BankName',
                            'ChequeNo',
                            'Date'
                        ].includes(col)
                    ) {
                        sumRow[col] = 0;
                    }
                });

                // Calculate totals
                rows.forEach((row: any) => {
                    columns.forEach((col) => {
                        if (typeof sumRow[col] === 'number') {
                            sumRow[col] += Number(row[col] || 0);
                        }
                    });
                });

                setTableSumRow(sumRow);
            }

            setShowTable(true);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch report');
            setTableColumns([]);
            setTableRows([]);
            setShowTable(true);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        reset();
        setSubmitClicked(false);
        setTableColumns([]);
        setTableRows([]);
        setShowTable(false);
        refetchAcademicYears();
        setRefreshAY((n) => n + 1);
    };

    return (
        <div className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                    <div className='space-y-6'>
                        <div className='space-y-3 rounded-lg border p-4'>
                            <div className='flex flex-wrap gap-6'>
                                <div>
                                    Select Radio Button:<span className='text-red-500'>*</span>
                                </div>
                                {['All', 'Individual'].map((val) => (
                                    <label key={val} className='flex items-center gap-2'>
                                        <input type='radio' value={val} {...register('report')} />
                                        <span className='capitalize'>{val}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='w-40 font-medium'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value?.toString()}
                                        onValueChange={(v) => {
                                            const num = Number(v);
                                            field.onChange(num);
                                            onYearChange(num);
                                        }}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder={loadingAcademic ? 'Loading...' : 'Select Academic Year'} />
                                        </SelectTrigger>

                                        <SelectContent>
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
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='w-40 font-medium'>
                                Section <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='asms_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value?.toString()}
                                        onValueChange={(v) => {
                                            const num = Number(v);
                                            field.onChange(num);
                                            onYearChange(num);
                                        }}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder={loadingClasses1 ? 'Loading...' : 'Select Section'} />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {loadingSection ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : sectionListError ? (
                                                <SelectItem value='error' disabled>
                                                    Failed to load Section
                                                </SelectItem>
                                            ) : (
                                                section.map((item) => (
                                                    <SelectItem key={item.asmS_Id} value={item.asmS_Id}>
                                                        {item.asmC_SectionName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
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
                                                checked={customGroups.length > 0 && filters.customGroupIds.length === customGroups.length}
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

                            <div className='space-y-3'>
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
                                                    // indeterminate={
                                                    //     filters.termIds.length > 0 && filters.termIds.length < feeTerms.length
                                                    // }
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
                            </div>
                        </div>
                    </div>
                    <div className='space-y-6'>
                        <div className='rounded-lg border p-4'>
                            <div className='flex gap-6'>
                                Select Check Box:<span className='text-red-500'>*</span>
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='active' checked={active} onCheckedChange={(v) => setValue('active', !!v)} />
                                    <Label htmlFor='active'>Active</Label>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='deactive' checked={deactive} onCheckedChange={(v) => setValue('deactive', !!v)} />
                                    <Label htmlFor='deactive'>Deactive</Label>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='left' checked={left} onCheckedChange={(v) => setValue('left', !!v)} />
                                    <Label htmlFor='left'>Left</Label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className='flex items-center gap-4'>
                                <Label className='w-40 font-medium'>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString()}
                                            onValueChange={(v) => {
                                                const num = Number(v);
                                                field.onChange(num);
                                                onYearChange(num);
                                            }}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={loadingClasses1 ? 'Loading...' : 'Select class Name'} />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {/* <SelectItem value='all'>All</SelectItem> */}
                                                {loadingClasses1 ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : classError ? (
                                                    <SelectItem value='error' disabled>
                                                        Failed to load Class
                                                    </SelectItem>
                                                ) : (
                                                    classes.map((item) => (
                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className='mt-5 flex items-center gap-4'>
                                <Label className='w-40 font-medium'>
                                    Student <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString()}
                                            onValueChange={(v) => {
                                                const num = Number(v);
                                                field.onChange(num);
                                                onYearChange(num);
                                            }}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={loadingAcademic ? 'Loading...' : 'Select Student Name'} />
                                            </SelectTrigger>

                                            <SelectContent>
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
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                        <div className='rounded-lg border p-4'>
                            <div className='flex gap-6'>
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='detailed' checked={detailed} onCheckedChange={(v) => setValue('detailed', !!v)} />
                                    <Label htmlFor='detailed'>Detailed</Label>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='grandTotal' checked={grandTotal} onCheckedChange={(v) => setValue('grandTotal', !!v)} />
                                    <Label htmlFor='grandTotal'>Grand Total</Label>
                                </div>
                            </div>
                        </div>
                        <div className='rounded-lg border p-4'>
                            <div className='flex gap-6'>
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='total' checked={total} onCheckedChange={(v) => setValue('total', !!v)} />
                                    <Label htmlFor='total'>Total</Label>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        id='userSelection'
                                        checked={userSelection}
                                        onCheckedChange={(v) => setValue('userSelection', !!v)}
                                    />
                                    <Label htmlFor='userSelection'>User Selection</Label>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        id='newAdmissionStudent'
                                        checked={newAdmissionStudent}
                                        onCheckedChange={(v) => setValue('newAdmissionStudent', !!v)}
                                    />
                                    <Label htmlFor='newAdmissionStudent'>New Admission Student</Label>
                                </div>
                            </div>
                        </div>
                        <div className='space-y-3 rounded-lg border p-4'>
                            <div className='flex flex-wrap gap-6'>
                                {['As On Date', 'Between Date'].map((val) => (
                                    <label key={val} className='flex items-center gap-2'>
                                        <input type='radio' value={val} {...register('reportdate')} />
                                        <span className='capitalize'>{val}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {reportdate === 'As On Date' && (
                            <div>
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
                            </div>
                        )}
                        {reportdate === 'Between Date' && (
                            <div className='flex flex-wrap gap-6'>
                                <div className='flex items-center gap-2'>
                                    <Label className='min-w-32 font-medium'>
                                        From Date <span className='text-red-500'>*</span>
                                    </Label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant='outline' className='w-[240px] justify-start text-left font-normal'>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {format(filters.fromDate, 'dd-MM-yyyy')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={filters.fromDate}
                                                onSelect={(date) => date && setFilters((prev) => ({ ...prev, fromDate: date }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Label className='min-w-32 font-medium'>
                                        To Date <span className='text-red-500'>*</span>
                                    </Label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant='outline' className='w-[240px] justify-start text-left font-normal'>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {format(filters.toDate, 'dd-MM-yyyy')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={filters.toDate}
                                                onSelect={(date) => date && setFilters((prev) => ({ ...prev, toDate: date }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex justify-center gap-4 border-t pt-6'>
                    <Button type='submit' disabled={isSubmitting} className='min-w-32'>
                        {isSubmitting ? 'Generating...' : 'Report'}
                    </Button>

                    <Button type='button' variant='outline' onClick={handleReset}>
                        Cancel
                    </Button>
                </div>
            </form>
            <div className='my-6 border-gray-300 border-t' />

            {!loading && tableRows.length > 0 && (
                <CollapsibleSection defaultOpen={true}>
                    <div className='mt-10'>
                        {/* 🔹 REPORT HEADER */}
                        <div className='mb-6 text-center'>
                            <h2 className='font-bold text-2xl text-primary'>Daily Fee Collection Report</h2>
                            {/* <div className="mt-1 text-sm text-gray-600">
                 From {formatDate(fromDate)} To {formatDate(toDate)}
             </div> */}
                        </div>
                        <div className='my-6 border-gray-300 border-t' />

                        <div className='flex items-center justify-between border-b bg-muted/40 px-8 py-4'>
                            <div className='flex gap-3'>
                                <Button variant='outline' onClick={handlePrint}>
                                    🖨 Print
                                </Button>

                                <Button variant='outline' onClick={handleExportExcel}>
                                    📊 Export Excel
                                </Button>
                            </div>
                        </div>

                        {/* 🔹 TABLE */}
                        <div className='overflow-auto rounded-md border'>
                            <table className='w-full border-collapse text-sm'>
                                <thead className='bg-primary text-white'>
                                    <tr>
                                        {tableColumns.map((col) => (
                                            <th key={col} className='border px-3 py-2 text-left'>
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {tableRows.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {tableColumns.map((col) => (
                                                <td key={col} className='border px-3 py-2 text-right'>
                                                    {row[col]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}

                                    {/* 🔹 SUM ROW */}
                                    {tableSumRow && (
                                        <tr className='bg-gray-100 font-semibold'>
                                            {tableColumns.map((col) => (
                                                <td key={col} className='border px-3 py-2 text-right'>
                                                    {col === 'SLNO' ? '' : col === 'Date' ? 'Total' : `Sum: ${tableSumRow[col] ?? 0}`}
                                                </td>
                                            ))}
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
