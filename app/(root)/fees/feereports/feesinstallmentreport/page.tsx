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
import { feesInstallmentReportSchema } from '@/schemas/fees/reports';
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
import { useEffect, useMemo, useRef, useState } from 'react';
import React from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { exportToExcelInstallmentReport, printTableInstallmentReport } from './print_excel';
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
        register,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feesInstallmentReportSchema),
        defaultValues: {
            catg: 'Category',
            academicYearId: undefined,
            classId: 0,
            sectionId: 0,
            con: 'Datewise',
            installmentIds: [],
            termIds: [],
            groupIds: [],
            headIds: [],
            busrouteid: 0,
            groupIdsNew: []
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

                console.log('heads', JSON.stringify(result));
                const data = Array.isArray(result?.data) ? result.data : [];

                setHeads(data);
                if (data.length === 0) {
                    setheadsloading(false);
                    // toast.info('No Heads found ');
                }
            } catch (error: any) {
                // toast.error(error.message);
                setHeads([]);
            } finally {
                setheadsloading(false);
            }
        };

        fetchHeads();
    }, [academicYearId, groupidnew, setValue]);

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
        if (selectedCatg === 'Consolidate') {
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

        selectedInstallmentData.forEach((inst: any) => {
            const name = inst.ftI_InstallmentName;
            cols.push(
                `${name} Net`,
                `${name} Paid`,
                `${name} Balance`,
                `${name} Concession`,
                `${name} Fine`,
                `${name} Waiver`,
                `${name} Opening`,
                `${name} Net 2`,
                `${name} Paid 2`,
                `${name} Balance 2`
            );
        });

        return cols;
    };

    const getRows = () => {
        // CONSOLIDATE
        if (selectedCatg === 'Consolidate') {
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

            selectedInstallmentData.forEach((inst: any) => {
                const instData = row.installments?.[inst.ftI_Id] || {};
                const name = inst.ftI_InstallmentName;

                data[`${name} Net`] = instData.net || 0;
                data[`${name} Paid`] = instData.paid || 0;
                data[`${name} Balance`] = instData.balance || 0;
                data[`${name} Concession`] = instData.concession || 0;
                data[`${name} Fine`] = instData.fine || 0;
                data[`${name} Waiver`] = instData.waiver || 0;
                data[`${name} Opening`] = instData.opening || 0;
                data[`${name} Net 2`] = instData.net2 || 0;
                data[`${name} Paid 2`] = instData.paid2 || 0;
                data[`${name} Balance 2`] = instData.balance2 || 0;
            });

            return data;
        });
    };

    const handleExportAlltype = () => {
        const rows = getRows();
        exportToExcelInstallmentReport(rows, `${selectedCatg}_Fee_Report`);
    };
    const handlePrintAlltype = () => {
        const columns = getColumns();
        const rows = getRows();

        printTableInstallmentReport(columns, rows);
    };

    const selectedCatg = watch('catg');

    const selectedCon = watch('con');

    const termwise = watch('termswise');

    // const toggleInstallment = (id: number) =>
    //     setFilters((prev) => ({
    //         ...prev,
    //         installmentIds: prev.installmentIds.includes(id) ? prev.installmentIds.filter((x) => x !== id) : [...prev.installmentIds, id]
    //     }));

    const installmentIds = watch('installmentIds');

    const toggleInstallment = (id: number) => {
        const current = installmentIds ?? [];

        const updated = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];

        setValue('installmentIds', updated, {
            shouldDirty: true,
            shouldValidate: true
        });
    };

    const selectedInstallmentData = useMemo(
        () => feeInstallments.filter((inst) => installmentIds?.includes(inst.ftI_Id)),
        [installmentIds, feeInstallments]
    );

    //    const toggleHeads = (id: number) =>
    //         setFilters((prev) => ({
    //             ...prev,
    //             headIds: prev.headIds.includes(id) ? prev.headIds.filter((x) => x !== id) : [...prev.headIds, id]
    //         }));

    const headIds = watch('headIds') ?? [];

    const toggleHeads = (id: number) => {
        const updated = headIds.includes(id) ? headIds.filter((x: number) => x !== id) : [...headIds, id];

        setValue('headIds', updated, { shouldValidate: true });
    };

    // const toggleterms = (id: number) =>
    //     setFilters((prev) => ({
    //         ...prev,
    //         termIds: prev.termIds.includes(id) ? prev.termIds.filter((x) => x !== id) : [...prev.termIds, id]
    //     }));

    const termIds = watch('termIds') ?? [];

    const toggleterms = (id: number) => {
        const updated = termIds.includes(id) ? termIds.filter((x) => x !== id) : [...termIds, id];

        setValue('termIds', updated, {
            shouldDirty: true,
            shouldValidate: true
        });
    };

    const allTermIds = feeTerms.map((t) => t.fmT_Id);

    //const isAllTermsSelected = feeTerms.length > 0 && filters.termIds.length === feeTerms.length;

    const isAllTermsSelected = feeTerms.length > 0 && termIds.length === feeTerms.length;

    // const toggleAllTerms = () => {
    //     setFilters((prev) => ({
    //         ...prev,
    //         termIds: isAllTermsSelected ? [] : allTermIds
    //     }));
    // };

    const toggleAllTerms = () => {
        setValue('termIds', isAllTermsSelected ? [] : feeTerms.map((t) => t.fmT_Id), { shouldDirty: true, shouldValidate: true });
    };
    /////====

    // const togglegroups = (id: number) =>
    //     setFilters((prev) => ({
    //         ...prev,
    //         groupIds: prev.groupIds.includes(id) ? prev.groupIds.filter((x) => x !== id) : [...prev.groupIds, id]
    //     }));

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

    const staticReportData = [
        {
            id: 1,
            rollNo: 1,
            studentName: 'AAMINA MIN',
            admNo: '2024-012',
            className: 'LKG',
            sectionName: 'A',
            balance: 2047,
            total: 4096,
            installment1: {
                net: 2009,
                paid: 2049,
                balance: 0,
                concession: 0,
                fine: 0,
                waiver: 0,
                opening: 2047,
                net2: 2047, // Second net? (image has two 'Net' cols per installment)
                paid2: 2047,
                balance2: 0
            },
            installment2: {
                net: 0, // Empty in image for II
                paid: 0,
                balance: 0,
                concession: 0,
                fine: 0,
                waiver: 0,
                opening: 0,
                net2: 0,
                paid2: 0,
                balance2: 0
            }
        },
        {
            id: 2,
            rollNo: 1,
            studentName: 'ADREETA DEBNATH',
            admNo: '2024-050',
            className: 'LKG',
            sectionName: 'D',
            balance: 40054, // Image shows 40054, but likely 4005? Using as-is
            total: 20049,
            installment1: {
                net: 2009,
                paid: 2049,
                balance: 0,
                concession: 0,
                fine: 0,
                waiver: 0,
                opening: 2047,
                net2: 0,
                paid2: 0,
                balance2: 2047
            },
            installment2: {
                net: 0,
                paid: 0,
                balance: 0,
                concession: 0,
                fine: 0,
                waiver: 0,
                opening: 0,
                net2: 0,
                paid2: 0,
                balance2: 0
            }
        },
        {
            id: 3,
            rollNo: 1,
            studentName: 'BHU KHATRI', // Likely "BHUMI KHATRI" from image
            admNo: '2024-065',
            className: 'LKG',
            sectionName: 'C',
            balance: 2047,
            total: 4096,
            installment1: {
                net: 2009,
                paid: 2049,
                balance: 0,
                concession: 0,
                fine: 0,
                waiver: 0,
                opening: 2047,
                net2: 2047,
                paid2: 2047,
                balance2: 0
            },
            installment2: {
                net: 0,
                paid: 0,
                balance: 0,
                concession: 0,
                fine: 0,
                waiver: 0,
                opening: 0,
                net2: 0,
                paid2: 0,
                balance2: 0
            }
        },
        {
            id: 4,
            rollNo: 1,
            studentName: 'AJAB HUSEN GHEWALA', // Likely "AJAB HUSEN GHEWALA"
            admNo: '2024-149',
            className: 'UKG',
            sectionName: 'C',
            balance: 2047,
            total: 4096,
            installment1: {
                net: 2009,
                paid: 2049,
                balance: 0,
                concession: 0,
                fine: 0,
                waiver: 0,
                opening: 2047,
                net2: 2047,
                paid2: 2047,
                balance2: 0
            },
            installment2: {
                net: 0,
                paid: 0,
                balance: 0,
                concession: 0,
                fine: 0,
                waiver: 0,
                opening: 0,
                net2: 0,
                paid2: 0,
                balance2: 0
            }
        },
        {
            id: 5,
            rollNo: 1,
            studentName: 'SINCHANA M',
            admNo: '2024-060',
            className: 'UKG',
            sectionName: 'D',
            balance: 60143, // Image shows 60143 for balance
            total: 0,
            installment1: {
                net: 2009,
                paid: 0,
                balance: 2049,
                concession: 0,
                fine: 0,
                waiver: 0,
                opening: 2047,
                net2: 2047,
                paid2: 0,
                balance2: 2047
            },
            installment2: {
                net: 0,
                paid: 0,
                balance: 0,
                concession: 0,
                fine: 0,
                waiver: 0,
                opening: 0,
                net2: 0,
                paid2: 0,
                balance2: 0
            }
        }
    ];

    // Installments data (for headers) - assuming 2 installments as per image
    const staticInstallments = [
        { ftI_Id: 1, ftI_Name: 'I Installment' },
        { ftI_Id: 2, ftI_Name: 'II Installment' }
    ];

    const staticConsolidateData = [
        {
            id: 1,
            slNo: 1,
            termsName: 'I Installment',
            todayPaidCount: 0,
            todayCollection: 0,
            stillNowPaidCount: 25,
            stillNowCollection: 0,
            totalStrength: 3297,
            defaulters: 2161
        },
        {
            id: 2,
            slNo: 2,
            termsName: 'II Installment',
            todayPaidCount: 0,
            todayCollection: 0,
            stillNowPaidCount: 0,
            stillNowCollection: 0,
            totalStrength: 3297,
            defaulters: 3041
        },
        {
            id: 3,
            slNo: 3,
            termsName: 'III Installment',
            todayPaidCount: 0,
            todayCollection: 0,
            stillNowPaidCount: 0,
            stillNowCollection: 0,
            totalStrength: 3297,
            defaulters: 3107
        },
        {
            id: 4,
            slNo: 4,
            termsName: 'IV Installment',
            todayPaidCount: 0,
            todayCollection: 0,
            stillNowPaidCount: 0,
            stillNowCollection: 0,
            totalStrength: 3297,
            defaulters: 0
        },
        {
            id: 5,
            slNo: 5,
            termsName: 'Pending Fee(21)',
            todayPaidCount: 0,
            todayCollection: 0,
            stillNowPaidCount: 0,
            stillNowCollection: 0,
            totalStrength: 3297,
            defaulters: 0
        },
        {
            id: 6,
            slNo: 6,
            termsName: 'Pending Fee(22)',
            todayPaidCount: 0,
            todayCollection: 0,
            stillNowPaidCount: 0,
            stillNowCollection: 0,
            totalStrength: 3297,
            defaulters: 0
        },
        {
            id: 7,
            slNo: 7,
            termsName: 'Pending Fee(23)',
            todayPaidCount: 0,
            todayCollection: 0,
            stillNowPaidCount: 0,
            stillNowCollection: 0,
            totalStrength: 3297,
            defaulters: 0
        },
        {
            id: 8,
            slNo: 8,
            termsName: 'Pending Fee(24)',
            todayPaidCount: 0,
            todayCollection: 0,
            stillNowPaidCount: 0,
            stillNowCollection: 0,
            totalStrength: 3297,
            defaulters: 0
        },
        {
            id: 9,
            slNo: 9,
            termsName: 'Pending Fee(25)',
            todayPaidCount: 0,
            todayCollection: 0,
            stillNowPaidCount: 0,
            stillNowCollection: 0,
            totalStrength: 3297,
            defaulters: 0
        }
    ];

    // const handleSubmit = async () => {
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setReportLoading(true);
        setShowReport(false);

        // await new Promise((resolve) => setTimeout(resolve, 1200));

        // const response = await getFeeConsolidatedReportData(Number(data.academicYearId), data.classId ? data.classId : 0, data.sectionId ? data.sectionId : 0, filters.catg);

        // console.log('responsedata', JSON.stringify(response));

        // const mapIndiResponseToTable = (data: any[]) => {
        //     return data.map((item, index) => ({
        //         id: index + 1,
        //         studentName: item.studentName?.trim(),
        //         admNo: item.amaY_RollNo,
        //         classSection: `${item.className} ${item.sectionName}`,
        //         paidAmount: item.paid,
        //         receiptNo: item.receiptNo,
        //         bankName: item.fyP_Bank_Name || '',
        //         date: item.date,
        //         chequeNo: item.chequeNo || '',
        //         chequeDate: item.fyP_DD_Cheque_Date || ''
        //     }));
        // };

        // if (filters.userType === 'indi') {
        //     const mappedData = mapIndiResponseToTable(response?.data || []);
        //     setReportData(mappedData);
        // } else {
        //     const pivoted = pivotReportData(response?.data || []);
        //     setReportData(pivoted);
        // }

        try {
            let payload: any = {};
            const albumNameArraygroupids: any[] = [];
            const header_list: any[] = [];
            const fillgrouparrayname: any[] = [];
            let FMH_Ids: number[] = [];
            let routename = '';

            // Get user ID from context or default to 1
            const userid = 1; // Get from your auth context

            // Handle different category types based on AngularJS logic
            switch (selectedCatg) {
                case 'Category': {
                    // Set header_list from selected installments
                    if (termwise !== 1) {
                        feeInstallments.forEach((inst) => {
                            if (installmentIds?.includes(inst.ftI_Id)) {
                                header_list.push(inst);
                                albumNameArraygroupids.push({
                                    columnID: inst.ftI_Id,
                                    columnName: inst.ftI_InstallmentName
                                });
                            }
                        });
                    }

                    // Get category name
                    const category = categorydropdowndata?.data?.find((cat) => cat.fmcC_Id === data.fmcc_id);
                    routename = category?.fmcC_ClassCategoryName || '';

                    payload = {
                        ASMAY_Id: Number(data.academicYearId),
                        FTI_Id: 0, // Not clear from AngularJS, defaulting to 0
                        ASMCL_Id: 0, // For category, class is 0
                        ASMS_Id: 0, // For category, section is 0
                        FMCC_Id: data.fmcc_id || 0,
                        reporttype: selectedCatg,
                        FMG_Id: 0,
                        TRMR_Id: 0,
                        temparrayinst1: albumNameArraygroupids,
                        FMGG_Ids: FMH_Ids,
                        termslistarray: termwise === 1 ? (data.termIds || []).map((termId) => ({ FMT_Id: termId })) : undefined,
                        fillgrouparray:
                            termwise === 1 ? (data.groupIds || []).map((groupId) => ({ FMG_Id: groupId, FMG_GroupName: '' })) : undefined,
                        active: data.Active || 0,
                        deactive: data.Deactive || 0,
                        left: data.left || 0,
                        termswise: termwise || 0,
                        userid: userid
                    };
                    break;
                }

                case 'Class': {
                    // Set header_list from all installments (arrlstinst1 in AngularJS)
                    if (termwise !== 1) {
                        feeInstallments.forEach((inst) => {
                            header_list.push(inst);
                        });
                    }

                    // Get class name
                    const className = classes.find((cls) => cls.asmcL_Id === data.classId)?.asmcL_ClassName || '';
                    routename = className;

                    payload = {
                        ASMAY_Id: Number(data.academicYearId),
                        FTI_Id: 0,
                        ASMCL_Id: data.classId || 0,
                        ASMS_Id: data.sectionId || 0,
                        FMCC_Id: 0,
                        reporttype: selectedCatg,
                        FMG_Id: 0,
                        TRMR_Id: 0,
                        temparrayinst1: albumNameArraygroupids,
                        FMGG_Ids: FMH_Ids,
                        termslistarray: termwise === 1 ? (data.termIds || []).map((termId) => ({ FMT_Id: termId })) : undefined,
                        fillgrouparray:
                            termwise === 1 ? (data.groupIds || []).map((groupId) => ({ FMG_Id: groupId, FMG_GroupName: '' })) : undefined,
                        active: data.Active || 0,
                        deactive: data.Deactive || 0,
                        left: data.left || 0,
                        termswise: termwise || 0,
                        userid: userid
                    };
                    break;
                }

                case 'transport': {
                    // Set header_list from all installments
                    feeInstallments.forEach((inst) => {
                        header_list.push(inst);
                    });

                    // Get selected heads (FMH_Ids)
                    FMH_Ids = data.headIds || [];

                    // Get route name
                    const route = busroutedata?.data?.find((r) => r.trmR_Id === data.busrouteid);
                    routename = route ? `${route.trmR_RouteNo} : ${route.trmR_RouteName}` : '';

                    payload = {
                        ASMAY_Id: Number(data.academicYearId),
                        FTI_Id: 0,
                        ASMCL_Id: 0,
                        ASMS_Id: 0,
                        FMCC_Id: 0,
                        reporttype: selectedCatg,
                        FMG_Id: data.fmg_id || 0,
                        TRMR_Id: data.busrouteid || 0,
                        temparrayinst1: albumNameArraygroupids,
                        FMGG_Ids: FMH_Ids,
                        termslistarray: undefined,
                        fillgrouparray: undefined,
                        active: 0,
                        deactive: 0,
                        left: 0,
                        termswise: 0,
                        userid: userid
                    };
                    break;
                }

                case 'GroupWise': {
                    // Set fillgrouparrayname from selected groups
                    feeGroups.forEach((group) => {
                        if (data.groupIdsNew?.includes(group.fmG_Id)) {
                            fillgrouparrayname.push({
                                FMG_Id: group.fmG_Id,
                                FMG_GroupName: group.fmg_groupname
                            });
                        }
                    });

                    payload = {
                        ASMAY_Id: Number(data.academicYearId),
                        FTI_Id: 0,
                        ASMCL_Id: data.classId || 0,
                        ASMS_Id: data.sectionId || 0,
                        FMCC_Id: 0,
                        reporttype: selectedCatg,
                        FMG_Id: 0,
                        TRMR_Id: 0,
                        temparrayinst1: albumNameArraygroupids,
                        FMGG_Ids: FMH_Ids,
                        termslistarray: undefined,
                        fillgrouparray: fillgrouparrayname,
                        active: data.Active || 0,
                        deactive: data.Deactive || 0,
                        left: data.left || 0,
                        termswise: 0,
                        userid: userid
                    };
                    break;
                }

                case 'Consolidate': {
                    // Handle classarray and sectionarray
                    const classarray: { ASMCL_Id: number }[] = [];
                    const sectionarray: { ASMS_Id: number }[] = [];

                    if (!data.classId || data.classId === 0) {
                        // Include all classes
                        classes.forEach((cls) => {
                            classarray.push({ ASMCL_Id: cls.asmcL_Id });
                        });
                    } else {
                        classarray.push({ ASMCL_Id: data.classId });
                    }

                    if (!data.sectionId || data.sectionId === 0) {
                        // Include all sections
                        sections.forEach((sec) => {
                            sectionarray.push({ ASMS_Id: sec.asmS_Id });
                        });
                    } else {
                        sectionarray.push({ ASMS_Id: data.sectionId });
                    }

                    // Format dates
                    const todate1 = filters.toDate.toISOString().split('T')[0];
                    const fromdate1 = filters.fromDate.toISOString().split('T')[0];

                    payload = {
                        ASMAY_Id: Number(data.academicYearId),
                        classarray: classarray,
                        sectionarray: sectionarray,
                        reporttype: selectedCatg,
                        todate: todate1,
                        fromdate: fromdate1,
                        con: data.con,
                        userid: userid
                    };
                    break;
                }
            }

            console.log('Generated payload for', selectedCatg, ':', JSON.stringify(payload, null, 2));
            console.log('Route name:', routename);

            // Here you would make your API call with the payload
            // For example:
            // const response = await fetch('/api/fees/installment-report', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(payload)
            // });
            // const result = await response.json();

            // For demo, use static data
            if (selectedCatg === 'Consolidate') {
                setReportData(staticConsolidateData);
            } else {
                setReportData(staticReportData);
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');

            // Fallback to demo data on error
            if (selectedCatg === 'Consolidate') {
                setReportData(staticConsolidateData);
            } else {
                setReportData(staticReportData);
            }
        } finally {
            setShowReport(true);
            setReportLoading(false);

            toast.success('Report generated successfully');

            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);
        }

        // In onSubmit, set data based on catg:
        if (selectedCatg === 'Consolidate') {
            setReportData(staticConsolidateData);
        } else {
            const payload = {
                userid: 1, // Assuming user ID is 1, you might want to get this from context/auth
                active: data.Active, // Assuming termswise checkbox indicates active
                deactive: data.Deactive, // Adjust based on your logic
                left: data.left,
                termswise: watch('termswise') || 0,
                ASMAY_Id: Number(data.academicYearId),
                ASMCL_Id: data.classId || 0,
                ASMS_Id: data.sectionId || 0,
                termslistarray: (data.termIds || []).map((termId) => ({ fmT_Id: termId })),
                fillgrouparray: (data.groupIds || []).map((groupId) => ({ fmG_Id: groupId })),
                classarray: data.classId ? [{ asmcL_Id: data.classId }] : [{ asmcL_Id: 0 }]
            };

            console.log('payloaddatanotconsolidated', JSON.stringify(payload));

            setReportData(staticReportData); // Detailed
        }

        // setReportData(staticReportData);
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
                                                    name='Active'
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
                                                <input type='hidden' {...register('headIds')} />
                                                <Controller
                                                    name='Deactive'
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
                                                    name='left'
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
                                                <input type='hidden' {...register('headIds')} />
                                                <Card className={cn('w-[420px] border bg-gray-50 p-4', errors.headIds)}>
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
                                                                        // checked={filters.headIds.includes(hd.fmH_Id)}
                                                                        checked={headIds.includes(hd.fmH_Id)}
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
                                                {errors.headIds && <FormError className='mt-1'>{errors.headIds.message}</FormError>}
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
                                            {/* <Label className='w-36 text-right'>
                                                Group <span className='text-red-500'>*</span>
                                            </Label>
                                            <input type="hidden" {...register('groupIds')} />
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
                                                                    // checked={filters.groupIds.includes(grp.fmG_Id)}

                                                                    checked={groupIds.includes(grp.fmG_Id)}
                                                                    onCheckedChange={() => toggleInstallment(grp.fmG_Id)}
                                                                />
                                                                <span className='text-sm'>{grp.fmg_groupname}</span>
                                                            </Label>
                                                        ))
                                                    ) : (
                                                        <div className='py-4 text-center text-gray-500'>No Groups</div>
                                                    )}
                                                </div>
                                            </Card> */}

                                            <Label className='w-24 pt-2 text-right'>
                                                Group <span className='text-red-500'>*</span>
                                            </Label>
                                            <input type='hidden' {...register('groupIdsNew')} />
                                            <Card className={cn('w-[360px] border bg-gray-50 p-4', errors.groupIdsNew)}>
                                                <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                    {feeGroups.length > 0 && (
                                                        <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-100'>
                                                            <Checkbox
                                                                checked={isAllGroupsSelectedNew}
                                                                onCheckedChange={toggleAllGroupsnew}
                                                            />
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
                                                                    //checked={filters.groupIds.includes(grp.fmG_Id)}

                                                                    checked={groupIds.includes(grp.fmG_Id)}
                                                                    onCheckedChange={() => togglegroupsnew(grp.fmG_Id)}
                                                                />
                                                                <span className='text-sm'>{grp.fmg_groupname}</span>
                                                            </Label>
                                                        ))
                                                    ) : (
                                                        <div className='py-4 text-center text-gray-500'>No Groups</div>
                                                    )}
                                                </div>
                                            </Card>
                                            {errors.groupIdsNew && <FormError className='mt-1'>{errors.groupIdsNew.message}</FormError>}
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
                                                    name='busrouteid'
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
                                                {errors.busrouteid && <FormError>{errors.busrouteid.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(selectedCatg === 'Class' || selectedCatg === 'Category') && termwise !== 1 && (
                                    <div className='mt-4 flex items-start gap-6'>
                                        {/* Label */}
                                        <Label className='w-40 text-right'>
                                            Installment Name <span className='text-red-500'>*</span>
                                        </Label>

                                        {/* Card + Error (COLUMN) */}
                                        <div className='flex flex-col'>
                                            {/* Hidden register */}
                                            <input type='hidden' {...register('installmentIds')} />

                                            {/* Card */}
                                            <Card className={cn('w-[420px] border bg-gray-50 p-4', errors.installmentIds)}>
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
                                                                    checked={watch('installmentIds')?.includes(installment.ftI_Id)}
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

                                            {/* Error BELOW */}
                                            {errors.installmentIds && (
                                                <FormError className='mt-1'>{errors.installmentIds.message}</FormError>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {termwise === 1 && (
                                    <div className='mt-4 flex items-start gap-12'>
                                        {/* TERMS */}
                                        <div className='flex items-start gap-4'>
                                            <Label className='w-24 pt-2 text-right'>
                                                Terms <span className='text-red-500'>*</span>
                                            </Label>
                                            <input type='hidden' {...register('termIds')} />

                                            <Card className={cn('w-[360px] border bg-gray-50 p-4', errors.termIds)}>
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
                                                                    //checked={filters.termIds.includes(terms.fmT_Id)}
                                                                    checked={termIds.includes(terms.fmT_Id)}
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
                                            {errors.termIds && <FormError className='mt-1'>{errors.termIds.message}</FormError>}
                                        </div>

                                        {/* GROUP */}
                                        <div className='flex items-start gap-4'>
                                            <Label className='w-24 pt-2 text-right'>
                                                Group <span className='text-red-500'>*</span>
                                            </Label>
                                            <input type='hidden' {...register('groupIds')} />
                                            <Card className={cn('w-[360px] border bg-gray-50 p-4', errors.groupIds)}>
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
                                                                    //checked={filters.groupIds.includes(grp.fmG_Id)}

                                                                    checked={groupIds.includes(grp.fmG_Id)}
                                                                    onCheckedChange={() => togglegroups(grp.fmG_Id)}
                                                                />
                                                                <span className='text-sm'>{grp.fmg_groupname}</span>
                                                            </Label>
                                                        ))
                                                    ) : (
                                                        <div className='py-4 text-center text-gray-500'>No Groups</div>
                                                    )}
                                                </div>
                                            </Card>
                                            {errors.groupIds && <FormError className='mt-1'>{errors.groupIds.message}</FormError>}
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
                                                {/* Dynamic Sub-Header Based on Selection */}
                                                <div className='flex items-center justify-between border-b bg-gray-50 px-8 py-4'>
                                                    <h2 className='whitespace-nowrap font-bold text-2xl text-primary'>
                                                        {selectedCatg === 'Consolidate'
                                                            ? 'CONSOLIDATE REPORT'
                                                            : `REPORT FOR ${
                                                                  selectedCatg === 'Category'
                                                                      ? categorydropdowndata?.data?.find(
                                                                            (cat) => cat.fmcC_Id === watch('fmcc_id')
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

                                                {/* Detailed Student Table for Category/Class Wise (Non-Terms Wise) */}
                                                {showReport &&
                                                    (selectedCatg === 'Category' || selectedCatg === 'Class') &&
                                                    termwise !== 1 &&
                                                    selectedInstallmentData.length > 0 && (
                                                        <div className='overflow-x-auto px-8 pb-8'>
                                                            <table className='w-full border-collapse border border-gray-300 text-sm'>
                                                                <thead className='bg-primary text-white'>
                                                                    <tr>
                                                                        <th
                                                                            rowSpan={2}
                                                                            className='border px-2 py-2 text-center font-semibold'>
                                                                            SLNO
                                                                        </th>
                                                                        <th
                                                                            rowSpan={2}
                                                                            className='border px-2 py-2 text-center font-semibold'>
                                                                            Roll No
                                                                        </th>
                                                                        <th
                                                                            rowSpan={2}
                                                                            className='border px-2 py-2 text-left font-semibold'>
                                                                            Student Name
                                                                        </th>
                                                                        <th
                                                                            rowSpan={2}
                                                                            className='border px-2 py-2 text-center font-semibold'>
                                                                            Admission no
                                                                        </th>
                                                                        <th
                                                                            rowSpan={2}
                                                                            className='border px-2 py-2 text-center font-semibold'>
                                                                            Class
                                                                        </th>
                                                                        <th
                                                                            rowSpan={2}
                                                                            className='border px-2 py-2 text-center font-semibold'>
                                                                            Sect.
                                                                        </th>
                                                                        <th
                                                                            rowSpan={2}
                                                                            className='border px-2 py-2 text-center font-semibold'>
                                                                            Bala
                                                                        </th>
                                                                        <th
                                                                            rowSpan={2}
                                                                            className='border px-2 py-2 text-center font-semibold'>
                                                                            total
                                                                        </th>
                                                                        {selectedInstallmentData.map((inst) => (
                                                                            <th
                                                                                key={inst.ftI_Id}
                                                                                colSpan={10}
                                                                                className='border px-2 py-2 text-center font-semibold'>
                                                                                {inst.ftI_InstallmentName}
                                                                            </th>
                                                                        ))}
                                                                    </tr>
                                                                    <tr>
                                                                        {selectedInstallmentData.map((inst) => (
                                                                            <React.Fragment key={`${inst.ftI_Id}-sub`}>
                                                                                <th className='border px-2 py-2 text-center font-semibold'>
                                                                                    Net
                                                                                </th>
                                                                                <th className='border px-2 py-2 text-center font-semibold'>
                                                                                    Paid
                                                                                </th>
                                                                                <th className='border px-2 py-2 text-center font-semibold'>
                                                                                    Bala
                                                                                </th>
                                                                                <th className='border px-2 py-2 text-center font-semibold'>
                                                                                    Conc
                                                                                </th>
                                                                                <th className='border px-2 py-2 text-center font-semibold'>
                                                                                    Fine
                                                                                </th>
                                                                                <th className='border px-2 py-2 text-center font-semibold'>
                                                                                    Wav
                                                                                </th>
                                                                                <th className='border px-2 py-2 text-center font-semibold'>
                                                                                    Ope
                                                                                </th>
                                                                                <th className='border px-2 py-2 text-center font-semibold'>
                                                                                    Net
                                                                                </th>
                                                                                <th className='border px-2 py-2 text-center font-semibold'>
                                                                                    Paid
                                                                                </th>
                                                                                <th className='border px-2 py-2 text-center font-semibold'>
                                                                                    Bala
                                                                                </th>
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
                                                                            <td className='border px-2 py-2 text-left'>
                                                                                {row.studentName}
                                                                            </td>
                                                                            <td className='border px-2 py-2 text-center'>{row.admNo}</td>
                                                                            <td className='border px-2 py-2 text-center'>
                                                                                {row.className}
                                                                            </td>
                                                                            <td className='border px-2 py-2 text-center'>
                                                                                {row.sectionName}
                                                                            </td>
                                                                            <td className='border px-2 py-2 text-right'>
                                                                                {row.balance?.toLocaleString() || '-'}
                                                                            </td>
                                                                            <td className='border px-2 py-2 text-right'>
                                                                                {row.total?.toLocaleString() || '-'}
                                                                            </td>
                                                                            {selectedInstallmentData.map((inst) => {
                                                                                const instData = row.installments?.[inst.ftI_Id];
                                                                                return (
                                                                                    <React.Fragment key={`${row.id}-${inst.ftI_Id}`}>
                                                                                        <td className='border px-2 py-2 text-right'>
                                                                                            {instData?.net?.toLocaleString() || '-'}
                                                                                        </td>
                                                                                        <td className='border px-2 py-2 text-right'>
                                                                                            {instData?.paid?.toLocaleString() || '-'}
                                                                                        </td>
                                                                                        <td className='border px-2 py-2 text-right'>
                                                                                            {instData?.balance?.toLocaleString() || '-'}
                                                                                        </td>
                                                                                        <td className='border px-2 py-2 text-right'>
                                                                                            {instData?.concession?.toLocaleString() || '-'}
                                                                                        </td>
                                                                                        <td className='border px-2 py-2 text-right'>
                                                                                            {instData?.fine?.toLocaleString() || '-'}
                                                                                        </td>
                                                                                        <td className='border px-2 py-2 text-right'>
                                                                                            {instData?.waiver?.toLocaleString() || '-'}
                                                                                        </td>
                                                                                        <td className='border px-2 py-2 text-right'>
                                                                                            {instData?.opening?.toLocaleString() || '-'}
                                                                                        </td>
                                                                                        <td className='border px-2 py-2 text-right'>
                                                                                            {instData?.net2?.toLocaleString() || '-'}
                                                                                        </td>
                                                                                        <td className='border px-2 py-2 text-right'>
                                                                                            {instData?.paid2?.toLocaleString() || '-'}
                                                                                        </td>
                                                                                        <td className='border px-2 py-2 text-right'>
                                                                                            {instData?.balance2?.toLocaleString() || '-'}
                                                                                        </td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            })}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}

                                                {/* Consolidate Summary Table */}
                                                {showReport && selectedCatg === 'Consolidate' && (
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
