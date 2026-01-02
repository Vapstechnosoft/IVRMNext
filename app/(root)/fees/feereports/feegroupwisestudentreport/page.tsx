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
import { cn } from '@/lib/utils';
import { feesGroupwiseStudentReportSchema } from '@/schemas/fees/reports';
import { getFeesSectionListByClassId } from '@/server/fees/reports/fee_DefaulterReport';
import { getInstallmentReportDetails } from '@/server/fees/reports/fee_installment_report';
import type {
    IFeeClassDropdownList,
    IFeeSectionDropdownList,
    IInstallmentReportFeeTermDropdownList,
    InstallmentReportGroupDropdownList
} from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feesGroupwiseStudentReportSchema>;

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

export default function FeeGroupwiseStudentReport() {
    type catg = 'all' | 'individual' | 'student_wise' | 'admCat' | 'unmapped' | 'Termwise';
    const userTypeOptions: { label: string; value: catg }[] = [
        { label: 'All', value: 'all' },
        { label: 'Individual', value: 'individual' },
        { label: 'Student Wise', value: 'student_wise' },
        { label: 'Admission Category', value: 'admCat' },
        { label: 'Unmapped', value: 'unmapped' },
        { label: 'Termwise Paid Details', value: 'Termwise' }
        // { label: 'Group Wise', value: 'group_wise' },
        // { label: 'Amount', value: 'amount' }
    ];

    type stud_sel = 'S' | 'L' | 'D' | 'N';
    const stud_selTypeOptions: { label: string; value: stud_sel }[] = [
        { label: 'Studying', value: 'S' },
        { label: 'TC Students', value: 'L' },
        { label: 'Deactivated', value: 'D' },
        { label: 'New Admission', value: 'N' }
    ];

    const {
        handleSubmit,
        setValue,
        control,
        watch,
        register,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feesGroupwiseStudentReportSchema),
        defaultValues: {
            radio_val: 'all',
            stud_sel: 'S',
            academicYearId: undefined,
            classId: 0,
            sectionId: 0,
            groupIds: [],
            groupIdsNew: [],
            group_wise: true
        }
    });

    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        catg: 'Category' as catg,
        fromDate: new Date(),
        toDate: new Date(),
        academicYearId: '',
        classId: 0,
        sectionId: 0
        //installmentIds: [] as number[],
        //termIds: [] as number[],
        // groupIds: [] as number[],
        //headIds: [] as number[]
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);

    const [reportData, setReportData] = useState<any[]>([]);
    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);

    const [feeTerms, setfeeTerms] = useState<IInstallmentReportFeeTermDropdownList[]>([]);

    const [feeGroups, setfeeGroups] = useState<InstallmentReportGroupDropdownList[]>([]);

    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'feeGroup' | 'totalDue' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [sectionLoading, setSectionLoading] = useState(false);

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

    const {
        data: busroutedata,
        isLoading: busrouteLoading,
        error: busrouteError,
        refetchAll: refetchBusRoute
    } = useFeeInstallmentreportBusRouteDropdown();

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

    //getInstallmentDropdownData

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

    //heads

    const groupidnew = watch('fmg_id');

    console.log('groupidnew', groupidnew);

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

    const getColumns = () => {
        // CONSOLIDATE
        if (selectedCatg === 'all') {
            return [
                'Sl No',
                'Terms Name',
                'Today Paid Count',
                'Today Collection',
                'Still Now Paid Count',
                'Still Now Collection',
                'Total Strength',
                'Defaulters'
            ];
        }

        // DETAILED
        const cols = ['Sl No', 'Roll No', 'Student Name', 'Admission No', 'Class', 'Section', 'Balance', 'Total'];

        // selectedInstallmentData.forEach((inst: any) => {
        //     const name = inst.ftI_InstallmentName;
        //     cols.push(
        //         `${name} Net`,
        //         `${name} Paid`,
        //         `${name} Balance`,
        //         `${name} Concession`,
        //         `${name} Fine`,
        //         `${name} Waiver`,
        //         `${name} Opening`,
        //         `${name} Net 2`,
        //         `${name} Paid 2`,
        //         `${name} Balance 2`
        //     );
        // });

        return cols;
    };

    const getRows = () => {
        // CONSOLIDATE
        if (selectedCatg === 'all') {
            return reportData.map((row: any) => ({
                'Sl No': row.slNo,
                'Terms Name': row.termsName,
                'Today Paid Count': row.todayPaidCount,
                'Today Collection': row.todayCollection,
                'Still Now Paid Count': row.stillNowPaidCount,
                'Still Now Collection': row.stillNowCollection,
                'Total Strength': row.totalStrength,
                Defaulters: row.defaulters
            }));
        }

        // DETAILED
        return reportData.map((row: any, index: number) => {
            const data: any = {
                'Sl No': index + 1,
                'Roll No': row.rollNo,
                'Student Name': row.studentName,
                'Admission No': row.admNo,
                Class: row.className,
                Section: row.sectionName,
                Balance: row.balance,
                Total: row.total
            };

            // selectedInstallmentData.forEach((inst: any) => {
            //     const instData = row.installments?.[inst.ftI_Id] || {};
            //     const name = inst.ftI_InstallmentName;

            //     data[`${name} Net`] = instData.net || 0;
            //     data[`${name} Paid`] = instData.paid || 0;
            //     data[`${name} Balance`] = instData.balance || 0;
            //     data[`${name} Concession`] = instData.concession || 0;
            //     data[`${name} Fine`] = instData.fine || 0;
            //     data[`${name} Waiver`] = instData.waiver || 0;
            //     data[`${name} Opening`] = instData.opening || 0;
            //     data[`${name} Net 2`] = instData.net2 || 0;
            //     data[`${name} Paid 2`] = instData.paid2 || 0;
            //     data[`${name} Balance 2`] = instData.balance2 || 0;
            // });

            return data;
        });
    };

    const handleExportAlltype = () => {
        const rows = getRows();
        // exportToExcelInstallmentReport(rows, `${selectedCatg}_Fee_Report`);
    };
    const handlePrintAlltype = () => {
        const columns = getColumns();
        const rows = getRows();

        // printTableInstallmentReport(columns, rows);
    };

    const selectedCatg = watch('radio_val');

    useEffect(() => {
        if (selectedCatg === 'all' || selectedCatg === 'individual' || selectedCatg === 'student_wise' || selectedCatg === 'admCat') {
            setValue('group_wise', true, { shouldDirty: true, shouldValidate: true });
        } else {
            // Optional: Uncheck when switching to other categories
            setValue('group_wise', false, { shouldDirty: true, shouldValidate: true });
        }
    }, [selectedCatg, setValue]);

    useEffect(() => {
        if (selectedCatg === 'student_wise' || selectedCatg === 'admCat') {
            setValue('amntchecked', true, { shouldDirty: true, shouldValidate: true });
        } else {
            // Optional: Uncheck when switching to other categories
            setValue('amntchecked', false, { shouldDirty: true, shouldValidate: true });
        }
    }, [selectedCatg, setValue]);

    const allTermIds = feeTerms.map((t) => t.fmT_Id);

    //const isAllTermsSelected = feeTerms.length > 0 && filters.termIds.length === feeTerms.length;

    const groupIds = watch('groupIds') ?? [];

    const togglegroups = (id: number) => {
        const updated = groupIds.includes(id) ? groupIds.filter((x) => x !== id) : [...groupIds, id];

        setValue('groupIds', updated, {
            shouldDirty: true,
            shouldValidate: true
        });
    };

    const groupIdsnew = watch('groupIdsNew') ?? [];

    const togglegroupsnew = (id: number) => {
        const updated = groupIdsnew.includes(id) ? groupIdsnew.filter((x) => x !== id) : [...groupIdsnew, id];

        setValue('groupIdsNew', updated, {
            shouldDirty: true,
            shouldValidate: true
        });
    };

    const allGroupIds = feeGroups.map((t) => t.fmG_Id);

    //const isAllGroupsSelected = feeGroups.length > 0 && filters.groupIds.length === feeGroups.length;

    const isAllGroupsSelected = feeGroups.length > 0 && groupIds.length === feeGroups.length;
    // const toggleAllGroups = () => {
    //     setFilters((prev) => ({
    //         ...prev,
    //         groupIds: isAllGroupsSelected ? [] : allGroupIds
    //     }));
    // };

    const toggleAllGroups = () => {
        setValue('groupIds', isAllGroupsSelected ? [] : feeGroups.map((g) => g.fmG_Id), { shouldDirty: true, shouldValidate: true });
    };
    const isAllGroupsSelectedNew = feeGroups.length > 0 && groupIdsnew.length === feeGroups.length;

    const toggleAllGroupsnew = () => {
        setValue('groupIdsNew', isAllGroupsSelectedNew ? [] : feeGroups.map((g) => g.fmG_Id), { shouldDirty: true, shouldValidate: true });
    };

    // const handleSubmit = async () => {
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setReportLoading(true);
        setShowReport(false);

        try {
            // Extract values from form
            const radioSelected = data.radio_val;
            const academicYearId = Number(data.academicYearId);
            const classId = data.classId || 0;
            const sectionId = data.sectionId || 0;
            const categoryId = data.fmcC_Id || 0;
            const studentId = data.studentids || 0;
            const groupId = data.fmg_id || 0;

            // Handle fee group selection (selectfeegroup array)
            const selectfeegroup: Array<{ fmG_Id: number }> = [];

            // For 'all' and 'individual' categories, use groupIdsNew
            if (radioSelected === 'all' || radioSelected === 'individual' || radioSelected === 'unmapped') {
                if (data.groupIdsNew && Array.isArray(data.groupIdsNew)) {
                    data.groupIdsNew.forEach((groupItemId: number) => {
                        selectfeegroup.push({ fmG_Id: groupItemId });
                    });
                }
            }
            // For 'admCat' category, use groupIds
            else if (radioSelected === 'admCat') {
                if (data.groupIds && Array.isArray(data.groupIds)) {
                    data.groupIds.forEach((groupItemId: number) => {
                        selectfeegroup.push({ fmG_Id: groupItemId });
                    });
                }
            }

            let payload: any = {};
            let validate = false;

            switch (radioSelected) {
                case 'all':
                    if (academicYearId && data.groupIdsNew && data.groupIdsNew.length > 0) {
                        validate = true;
                    }

                    payload = {
                        radio_selected: radioSelected,
                        ASMAY_Id: academicYearId,
                        selectfeegroup: selectfeegroup
                    };
                    break;

                case 'individual':
                    if (academicYearId && classId && sectionId) {
                        validate = true;
                    }

                    payload = {
                        radio_selected: radioSelected,
                        ASMAY_Id: academicYearId,
                        selectfeegroup: selectfeegroup,
                        ASMCL_Id: classId,
                        ASMS_Id: sectionId,
                        Stud_Sel: data.stud_sel
                    };
                    break;

                case 'student_wise':
                    // Validation from AngularJS
                    if (academicYearId && classId && sectionId && studentId) {
                        validate = true;
                    }

                    payload = {
                        radio_selected: radioSelected,
                        ASMAY_Id: academicYearId,
                        ASMCL_Id: classId,
                        ASMS_Id: sectionId,
                        Stud_Id: studentId
                    };
                    break;

                case 'Termwise': {
                    const termStudentId = data.studentids || 0;

                    if (academicYearId && termStudentId) {
                        validate = true;
                    }

                    payload = {
                        radio_selected: radioSelected,
                        ASMAY_Id: academicYearId,
                        Stud_Id: termStudentId
                    };
                    break;
                }

                case 'admCat':
                    if (academicYearId && classId && sectionId && categoryId) {
                        validate = true;
                    }

                    payload = {
                        radio_selected: radioSelected,
                        ASMAY_Id: academicYearId,
                        ASMCL_Id: classId,
                        ASMS_Id: sectionId,
                        FMCC_Id: categoryId
                    };
                    break;

                case 'unmapped':
                    if (academicYearId && data.groupIdsNew && data.groupIdsNew.length > 0) {
                        validate = true;
                    }

                    payload = {
                        radio_selected: radioSelected,
                        ASMAY_Id: academicYearId,
                        selectfeegroup: selectfeegroup
                    };
                    break;
            }

            // Add validation flag if needed
            if (!validate) {
                toast.error('Please fill all required fields');
                setReportLoading(false);
                return;
            }

            // Add additional flags from checkboxes
            if (data.group_wise) {
                payload.group_wise = data.group_wise;
            }

            if (data.amntchecked) {
                payload.amntchecked = data.amntchecked;
            }

            if (data.bulkdownload) {
                payload.bulkdownload = data.bulkdownload;
            }

            console.log('Generated payload:', payload);

            // Call API with the payload
            const apiData = await getInstallmentReportDetails(payload);

            // Process API response...
            // (Your existing transformation logic here)
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
            setShowReport(false);
            setReportLoading(false);
        }

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
                                            name='radio_val'
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
                                    {/* Checkboxes section - placed below */}

                                    <div className='mt-6 pt-6'>
                                        <div className='flex flex-wrap items-center justify-center gap-8'>
                                            {selectedCatg !== 'unmapped' && (
                                                <Label className='flex cursor-pointer items-center gap-3'>
                                                    <Controller
                                                        name='group_wise'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                disabled={selectedCatg === 'student_wise' || selectedCatg === 'admCat'}
                                                                checked={field.value || false}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        )}
                                                    />
                                                    <span className='font-medium text-base'>Group Wise</span>
                                                </Label>
                                            )}

                                            {selectedCatg !== 'unmapped' && (
                                                <Label className='flex cursor-pointer items-center gap-3'>
                                                    <Controller
                                                        name='amntchecked'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                disabled={selectedCatg === 'student_wise' || selectedCatg === 'admCat'}
                                                                checked={field.value || false}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        )}
                                                    />
                                                    <span className='font-medium text-base'>Amount</span>
                                                </Label>
                                            )}

                                            <Label className='flex cursor-pointer items-center gap-3'>
                                                <Controller
                                                    name='bulkdownload'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                                                    )}
                                                />
                                                <span className='font-medium text-base'>Bulk Download</span>
                                            </Label>
                                        </div>
                                    </div>
                                </Card>

                                <div className='flex items-center gap-12'>
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

                                    {(selectedCatg === 'all' || selectedCatg === 'individual' || selectedCatg === 'unmapped') && (
                                        <div className='flex items-center gap-12'>
                                            <>
                                                <Label className='w-24 pt-2 text-right'>
                                                    Fee Group <span className='text-red-500'>*</span>
                                                </Label>
                                                <input type='hidden' {...register('groupIdsNew')} />
                                                <Card className={cn('w-[360px] border bg-gray-50 p-4', errors.groupIdsNew)}>
                                                    {/* Search Input */}
                                                    <div className='mb-3'>
                                                        <Input
                                                            type='text'
                                                            placeholder='Search groups...'
                                                            value={search}
                                                            onChange={(e) => setSearch(e.target.value)}
                                                            className='w-full'
                                                        />
                                                    </div>

                                                    <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                        {feeGroups.length > 0 && (
                                                            <>
                                                                <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-100'>
                                                                    <Checkbox
                                                                        checked={isAllGroupsSelectedNew}
                                                                        onCheckedChange={toggleAllGroupsnew}
                                                                    />
                                                                    <span>Select All</span>
                                                                </Label>

                                                                {/* Filter groups based on search */}
                                                                {groupsloading ? (
                                                                    <div className='py-6 text-center text-gray-500'>Loading...</div>
                                                                ) : feeGroups.length > 0 ? (
                                                                    feeGroups
                                                                        .filter(
                                                                            (grp) =>
                                                                                search === '' ||
                                                                                grp.fmg_groupname
                                                                                    .toLowerCase()
                                                                                    .includes(search.toLowerCase())
                                                                        )
                                                                        .map((grp) => (
                                                                            <Label
                                                                                key={grp.fmG_Id}
                                                                                htmlFor={`group-${grp.fmG_Id}`}
                                                                                className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                                <Checkbox
                                                                                    id={`group-${grp.fmG_Id}`}
                                                                                    checked={groupIdsnew.includes(grp.fmG_Id)}
                                                                                    onCheckedChange={() => togglegroupsnew(grp.fmG_Id)}
                                                                                />
                                                                                <span className='text-sm'>{grp.fmg_groupname}</span>
                                                                            </Label>
                                                                        ))
                                                                ) : (
                                                                    <div className='py-4 text-center text-gray-500'>No Groups</div>
                                                                )}

                                                                {/* Show message if no results found */}
                                                                {search &&
                                                                    feeGroups.filter((g) =>
                                                                        g.fmg_groupname.toLowerCase().includes(search.toLowerCase())
                                                                    ).length === 0 && (
                                                                        <div className='py-4 text-center text-gray-500'>
                                                                            No groups found matching "{search}"
                                                                        </div>
                                                                    )}
                                                            </>
                                                        )}
                                                    </div>
                                                </Card>
                                                {errors.groupIdsNew && <FormError className='mt-1'>{errors.groupIdsNew.message}</FormError>}
                                            </>
                                        </div>
                                    )}
                                </div>

                                {(selectedCatg === 'individual' ||
                                    selectedCatg === 'student_wise' ||
                                    selectedCatg === 'admCat' ||
                                    selectedCatg === 'Termwise') && (
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

                                        {(selectedCatg === 'student_wise' || selectedCatg === 'Termwise') && (
                                            <div className='flex w-[420px] items-center gap-4'>
                                                <Label className='w-36 text-right'>
                                                    Student <span className='text-red-500'>*</span>
                                                </Label>

                                                <div className='flex-1'>
                                                    <Controller
                                                        name='studentids'
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
                                                    {errors.studentids && <FormError>{errors.studentids.message}</FormError>}
                                                </div>
                                            </div>
                                        )}

                                        {selectedCatg === 'admCat' && (
                                            <div className='flex w-[420px] items-center gap-4'>
                                                <Label className='w-36 text-right'>
                                                    Category <span className='text-red-500'>*</span>
                                                </Label>

                                                <div className='flex-1'>
                                                    <Controller
                                                        name='fmcC_Id'
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
                                                    {errors.fmcC_Id && <FormError>{errors.fmcC_Id.message}</FormError>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedCatg === 'individual' && (
                                    <div className='space-y-4'>
                                        {/* Label at the top */}
                                        <div className='flex items-center gap-4'>
                                            <Label className='font-semibold text-gray-700 text-lg'>Student Selection Options</Label>
                                        </div>

                                        {/* Radio buttons in card layout */}
                                        <Card className='border bg-gray-50 p-5 shadow-sm'>
                                            <Controller
                                                name='stud_sel'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex flex-wrap items-center justify-center gap-8'>
                                                        {stud_selTypeOptions.map(({ label, value }) => (
                                                            <label key={value} className='flex cursor-pointer items-center gap-3'>
                                                                <input
                                                                    type='radio'
                                                                    name={field.name}
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
                                        </Card>
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
                                                {/* Dynamic Sub-Header Based on Selection */}
                                                <div className='flex items-center justify-between border-b bg-gray-50 px-8 py-4'>
                                                    <h2 className='whitespace-nowrap font-bold text-2xl text-primary'>
                                                        {selectedCatg === 'all'
                                                            ? 'CONSOLIDATE REPORT'
                                                            : `REPORT FOR ${
                                                                  selectedCatg === 'student_wise'
                                                                      ? categorydropdowndata?.data?.find(
                                                                            (cat) => cat.fmcC_Id === watch('fmcC_Id')
                                                                        )?.fmcC_ClassCategoryName || ''
                                                                      : classes.find((cls) => cls.asmcL_Id === watch('classId'))
                                                                            ?.asmcL_ClassName || ''
                                                              }${
                                                                  watch('sectionId')
                                                                      ? ` ${
                                                                            sections.find((sec) => sec.asmS_Id === watch('sectionId'))
                                                                                ?.asmC_SectionName || ''
                                                                        }`
                                                                      : ''
                                                              }`}
                                                    </h2>

                                                    <div className='flex gap-2'>
                                                        <Button size='sm' onClick={handleExportAlltype} className='h-8 px-3 text-xs'>
                                                            Export Excel
                                                        </Button>

                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={handlePrintAlltype}
                                                            className='h-8 px-3 text-xs'>
                                                            Export PDF
                                                        </Button>
                                                    </div>
                                                </div>

                                                {showReport && selectedCatg === 'student_wise' && (
                                                    <div className='overflow-x-auto px-8 pb-8'>
                                                        <table className='w-full border-collapse border border-gray-300 text-sm'>
                                                            <thead className='bg-primary text-white'>
                                                                <tr>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>Sl No</th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Terms Name
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Today Paid Count
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Today Collection
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Still Now Paid Count
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Still Now Collection
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Total Strength
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Defaulters
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {reportData.map((row, index) => (
                                                                    <tr
                                                                        key={row.id}
                                                                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                        <td className='border px-2 py-2 text-center'>{row.slNo}</td>
                                                                        <td className='border px-2 py-2 text-left'>{row.termsName}</td>
                                                                        <td className='border px-2 py-2 text-right'>
                                                                            {row.todayPaidCount?.toLocaleString() || '-'}
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-right'>
                                                                            {row.todayCollection?.toLocaleString() || '-'}
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-right'>
                                                                            {row.stillNowPaidCount?.toLocaleString() || '-'}
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-right'>
                                                                            {row.stillNowCollection?.toLocaleString() || '-'}
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-right'>
                                                                            {row.totalStrength?.toLocaleString() || '-'}
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-right'>
                                                                            {row.defaulters?.toLocaleString() || '-'}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
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
