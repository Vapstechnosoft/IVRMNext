'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { feeReceiptLogo, useFeeClassListDefaulterreport, useFeeSectionListDefaulterreport } from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { cn } from '@/lib/utils';
import { feeReceiptReportsSchema } from '@/schemas/fees/reports';
import { getFeesSectionListByClassId } from '@/server/fees/reports/fee_DefaulterReport';
import {
    getFeeReceiptReportHeadDropdown,
    getFeeReceiptReportReceiptDropdown,
    getFeeReceiptReportStudentDropdown
} from '@/server/fees/reports/fee_receipt_report';
import type {
    IFeeClassDropdownList,
    IFeeSectionDropdownList,
    InstallmentReportHeadDropdownList,
    ReceiptReportReceiptDropdownList,
    ReceiptReportStudentDropdownList
} from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { ExporttoPrint } from './print';

type FormFields = z.infer<typeof feeReceiptReportsSchema>;

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

export default function FeeReceiptReport() {
    type UserType = 'All' | 'indi';
    const userTypeOptions: { label: string; value: UserType }[] = [
        { label: 'All', value: 'All' },
        { label: 'Individual', value: 'indi' }
    ];

    const {
        handleSubmit,
        setValue,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeReceiptReportsSchema),
        defaultValues: {
            userType: 'All',

            academicYearId: undefined,

            classId: 0,
            sectionId: 0
        }
    });

    //const { data: masterHeads, isLoading: masterHeadsLoading, refetchAll: refetchMasterHeads } = feeReceiptReportHeadDROPDOWN();

    const [loading, setLoading] = useState(false);
    const [headSearch, setheadSearch] = useState('');

    const [receiptSearch, setReceiptSearch] = useState('');

    const [selectedHeadsItems, setSelectedHeadsItems] = useState<{ fmH_Id: string }[]>([]);

    const [selectedReceiptItems, setSelectedReceiptItems] = useState<{ fyp_Id: string }[]>([]);

    const [filters, setFilters] = useState({
        //userType: 'All' as 'All' | 'indi',

        academicYearId: '',
        classId: 0,
        sectionId: 0
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);

    const [reportData, setReportData] = useState<any[]>([]);
    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);

    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'feeGroup' | 'totalDue' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [sectionLoading, setSectionLoading] = useState(false);

    const [studentsloading, setstudentsloading] = useState(false);
    const [studentids, setstudentids] = useState<ReceiptReportStudentDropdownList[]>([]);

    const [receiptsloading, setreceiptsloading] = useState(false);
    const [headsdataloading, setheadsdataloading] = useState(false);

    const [receiptdsdata, setreceiptdsdata] = useState<ReceiptReportReceiptDropdownList[]>([]);

    const [headsdata, setheadsdata] = useState<InstallmentReportHeadDropdownList[]>([]);

    // ---------------- TYPES ----------------
    type FeeRow = {
        slNo: number;
        particulars: string;
        installment?: string;
        totalCharges?: number;
        concession?: number;
        paidAmount?: number;
        balance?: number;
    };

    type PaymentRow = {
        slNo: number;
        amount: number;
        bank?: string;
        ddNo?: string;
        date?: string;
    };

    // ---------------- STATE ----------------
    const [feeRows, setFeeRows] = useState<FeeRow[]>([]);
    const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([]);

    const [receiptNo, setReceiptNo] = useState('');
    const [admissionNo, setAdmissionNo] = useState('');
    const [studentName, setStudentName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [className, setClassName] = useState('');
    const [paymentMode, setPaymentMode] = useState('');
    const [amountInWords, setAmountInWords] = useState('');

    // Hooks
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();

    const [logodata, setlogodata] = useState('');

    const { data: logoResponse, isLoading: logoloading, error: logoerror } = feeReceiptLogo();

    useEffect(() => {
        if (logoerror) {
            toast.error(logoerror.message || 'Failed to load logo');
            return;
        }

        if (logoResponse) {
            try {
                // Convert to JSON in case it's a string
                const parsed = typeof logoResponse === 'string' ? JSON.parse(logoResponse) : logoResponse;

                if (parsed?.data) {
                    setlogodata(parsed.data);
                }
            } catch (err) {
                console.error('Failed to parse logo response', err);
            }
        }
    }, [logoResponse, logoerror]);

    const fmH_Ids = watch('heads') || [];
    const receipts = watch('receipts') || [];

    const {
        data: sectionListResponse,
        isLoading: loadingSections,
        error: sectionListError,
        refetch: refetchSections
    } = useFeeSectionListDefaulterreport();

    const headOptions =
        headsdata?.map((h) => ({
            id: h.fmH_Id.toString(),
            label: h.fmH_FeeName
        })) ?? [];

    const receiptOptions =
        receiptdsdata?.map((h) => ({
            id: h.fyp_id.toString(),
            label: h.fyp_receipt_no
        })) ?? [];

    const selectAllHeads = () => {
        const all = headOptions.map((h) => h.id);

        if (fmH_Ids.length === all.length) {
            // Option: clear selection → field becomes undefined
            setValue('heads', undefined as any);
            setSelectedHeadsItems([]);
        } else {
            setValue('heads', all as [string, ...string[]], {
                shouldValidate: true
            });
            setSelectedHeadsItems(all.map((x) => ({ fmH_Id: x })));
        }
    };

    const selectAllReceipts = () => {
        const all = receiptOptions.map((h) => h.id);

        if (receipts.length === all.length) {
            // Option: clear selection → field becomes undefined
            setValue('receipts', undefined as any);
            setSelectedReceiptItems([]);
        } else {
            setValue('receipts', all as [string, ...string[]], {
                shouldValidate: true
            });
            setSelectedReceiptItems(all.map((x) => ({ fyp_Id: x })));
        }
    };

    const toggleHead = (id: string) => {
        let updated = [];

        if (fmH_Ids.includes(id)) {
            updated = fmH_Ids.filter((v: string) => v !== id);
        } else {
            updated = [...fmH_Ids, id];
        }

        // MUST be tuple: at least 1 element
        if (updated.length === 0) {
            setValue('heads', undefined as any);
        } else {
            setValue('heads', updated as [string, ...string[]], {
                shouldValidate: true
            });
        }

        setSelectedHeadsItems(updated.map((x) => ({ fmH_Id: x })));
    };

    const toggleReceipt = (id: string) => {
        let updated = [];

        if (receipts.includes(id)) {
            updated = receipts.filter((v: string) => v !== id);
        } else {
            updated = [...receipts, id];
        }

        // MUST be tuple: at least 1 element
        if (updated.length === 0) {
            setValue('receipts', undefined as any);
        } else {
            setValue('receipts', updated as [string, ...string[]], {
                shouldValidate: true
            });
        }

        setSelectedReceiptItems(updated.map((x) => ({ fyp_Id: x })));
    };

    const filteredHeads = headsdata?.filter((h) => h.fmH_FeeName.toLowerCase().includes(headSearch.toLowerCase())) ?? [];

    const filteredReceipts = receiptdsdata.filter((h) => h.fyp_receipt_no.toLowerCase().includes(receiptSearch.toLowerCase())) ?? [];

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

    const sectionId = watch('sectionId');

    useEffect(() => {
        const fetchStudents = async () => {
            if (!academicYearId || !classId || !sectionId) {
                setstudentids([]);

                return;
            }

            setstudentsloading(true);

            try {
                const result = await getFeeReceiptReportStudentDropdown(Number(academicYearId), classId, sectionId);

                console.log('students', result);

                const data = Array.isArray(result?.data) ? result.data : [];
                setstudentids(data);

                if (data.length === 0) {
                    toast.info('No Students found ');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to load Students');
                setstudentids([]);
            } finally {
                setstudentsloading(false);
            }
        };

        fetchStudents();
    }, [academicYearId, classId, setValue, sectionId, setstudentids]);

    //
    const studentId = watch('studentid');

    const isStudentSelected = studentId !== undefined && studentId !== 0;

    useEffect(() => {
        setValue('studentid', undefined as any);
    }, [classId, sectionId]);

    useEffect(() => {
        const fetchReceipts = async () => {
            if (!academicYearId || !classId || !sectionId || studentId === undefined) {
                setreceiptdsdata([]);

                return;
            }

            console.log('studentId', studentId);

            const studentIdsPayload = studentId === 0 ? studentids.map((s) => s.amst_Id) : [studentId];

            setreceiptsloading(true);

            const payload = {
                asmaY_Id: Number(academicYearId),
                asmcL_Id: classId,
                amsC_Id: sectionId,
                amst_ids: studentIdsPayload
            };

            console.log('payload', payload);

            try {
                const result = await getFeeReceiptReportReceiptDropdown(payload);

                console.log('receipts', result);

                const data = Array.isArray(result?.data) ? result.data : [];
                setreceiptdsdata(data);

                if (data.length === 0) {
                    toast.info('No Receipts found ');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to load Receipts');
                setreceiptdsdata([]);
            } finally {
                setreceiptsloading(false);
            }
        };

        fetchReceipts();
    }, [academicYearId, classId, setValue, sectionId, studentId, setreceiptdsdata]);

    //

    useEffect(() => {
        const fetchHeadsData = async () => {
            if (!academicYearId || !classId || !sectionId || !studentId) {
                setheadsdata([]);

                return;
            }
            setheadsdataloading(true);
            try {
                const result = await getFeeReceiptReportHeadDropdown(Number(academicYearId), Number(studentId));
                console.log('receipts', result);
                const data = Array.isArray(result?.data) ? result.data : [];
                setheadsdata(data);

                if (data.length === 0) {
                    toast.info('No Receipts found ');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to load Receipts');
                setheadsdata([]);
            } finally {
                setheadsdataloading(false);
            }
        };

        fetchHeadsData();
    }, [academicYearId, classId, setValue, sectionId, studentId, setreceiptdsdata]);

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

    const selectedCatg = watch('userType');

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        ExporttoPrint({
            logodata,
            receiptNo,
            admissionNo,
            studentName,
            fatherName,
            academicYear,
            className,
            feeRows,
            paymentRows,
            amountInWords,
            paymentMode
        });
    };

    // const handleSubmit = async () => {
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setReportLoading(true);
        setShowReport(false);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        const selectedStudentIds =
            data.studentid === 0
                ? studentids.map((s) => s.amst_Id) // ALL students
                : data.studentid
                  ? [data.studentid] // Single student
                  : [];

        console.log('Selected Student IDs:', selectedStudentIds);

        // const response = await getFeeConsolidatedReportData(Number(data.academicYearId), data.classId, data.sectionId, '');

        // console.log('responsedata', JSON.stringify(response));

        // EXAMPLE mapping (adjust keys to API response)
        const firstReceiptNo =
            data.receipts && data.receipts.length > 0
                ? data.receipts[0] // pick first selected receipt (or you can loop all later)
                : 'VVS/2025/001';

        setReceiptNo(firstReceiptNo);
        setAdmissionNo('2025-007');
        setStudentName('AARNA CHUGH');
        setFatherName('MANISH ASHU');
        setAcademicYear('2025-2026');
        setClassName('PREKG A');
        setPaymentMode('ONLINE');
        setAmountInWords('TWENTY FOUR THOUSAND FIVE HUNDRED AND FIFTY NINE ONLY');

        setFeeRows([
            {
                slNo: 1,
                particulars: 'Caution Deposit',
                installment: '-',
                totalCharges: 2000,
                concession: 0,
                paidAmount: 2000,
                balance: 0
            },
            {
                slNo: 2,
                particulars: 'Fine',
                installment: '-',
                totalCharges: 10,
                concession: 0,
                paidAmount: 10,
                balance: 0
            },
            {
                slNo: 3,
                particulars: 'Special Dev Fees',
                installment: '-',
                totalCharges: 2500,
                concession: 0,
                paidAmount: 2500,
                balance: 0
            },
            {
                slNo: 4,
                particulars: 'Tuition Fees',
                installment: 'TERM 1',
                totalCharges: 20049,
                concession: 0,
                paidAmount: 20049,
                balance: 0
            }
        ]);

        setPaymentRows([
            {
                slNo: 1,
                amount: 24559,
                bank: '--',
                ddNo: '--',
                date: '27/05/2025'
            }
        ]);

        setShowReport(true);
        setReportLoading(false);

        setReportData([]);

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
                                    <Controller
                                        name='userType'
                                        control={control}
                                        render={({ field }) => (
                                            <div className='flex flex-wrap items-center justify-center gap-10'>
                                                {userTypeOptions.map(({ label, value }) => (
                                                    <label key={value} className='flex cursor-pointer items-center gap-3'>
                                                        <input
                                                            type='radio'
                                                            value={value}
                                                            checked={field.value === value}
                                                            onChange={() => field.onChange(value)}
                                                            className='h-5 w-5 text-primary'
                                                        />
                                                        <span className='font-medium text-base'>{label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    />
                                </Card>
                                <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                    {/* Academic Year */}
                                    <div className='flex items-center gap-4'>
                                        <Label className='w-40 text-right'>
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

                                    {/* Class */}
                                    <div className='flex items-center gap-4'>
                                        <Label className='w-40 text-right'>
                                            Class <span className='text-red-500'>*</span>
                                        </Label>

                                        <div className='flex-1'>
                                            <Controller
                                                name='classId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value ? field.value.toString() : undefined}
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
                                </div>

                                <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                    {/* Section */}
                                    <div className='flex items-center gap-4'>
                                        <Label className='w-40 text-right'>
                                            Section <span className='text-red-500'>*</span>
                                        </Label>

                                        <div className='flex-1'>
                                            <Controller
                                                name='sectionId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value ? field.value.toString() : undefined}
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        disabled={!classId}>
                                                        <SelectTrigger className='w-full text-center'>
                                                            <SelectValue placeholder='--Select Section--' />
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

                                    {/* Student Name */}
                                    <div className='flex items-center gap-4'>
                                        <Label className='w-40 text-right'>
                                            Student Name <span className='text-red-500'>*</span>
                                        </Label>

                                        <div className='flex-1'>
                                            <Controller
                                                name='studentid'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value !== undefined ? field.value.toString() : undefined}
                                                        onValueChange={(v) => {
                                                            field.onChange(Number(v)); // 0 is valid
                                                        }}
                                                        disabled={!academicYearId || !classId || !sectionId}>
                                                        <SelectTrigger className='w-full text-center'>
                                                            <SelectValue placeholder='--Select Student--' />
                                                        </SelectTrigger>

                                                        <SelectContent>
                                                            {/* ALL OPTION */}
                                                            {selectedCatg === 'All' && <SelectItem value='0'>All</SelectItem>}

                                                            {studentids.map((cls) => (
                                                                <SelectItem key={cls.amst_Id} value={cls.amst_Id.toString()}>
                                                                    {cls.studentName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />

                                            {errors.studentid && <FormError>{errors.studentid.message}</FormError>}
                                        </div>
                                    </div>
                                </div>
                                {selectedCatg === 'indi' && (
                                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                        <div className='flex items-start gap-4'>
                                            {/* Label */}
                                            <Label className='w-40 text-right'>
                                                Fee Head <span className='text-red-500'>*</span>
                                            </Label>

                                            {/* Field */}
                                            <div className='flex-1'>
                                                <div className='rounded-md border border-gray-300 bg-white p-3'>
                                                    <InputText
                                                        placeholder='Search Heads...'
                                                        value={headSearch}
                                                        onChange={(e) => setheadSearch(e.target.value)}
                                                        className='mb-3'
                                                    />

                                                    {headsdata && headsdata.length > 0 && (
                                                        <div
                                                            onClick={selectAllHeads}
                                                            className={cn(
                                                                'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                                                !isStudentSelected &&
                                                                    fmH_Ids.length === headOptions.length &&
                                                                    headOptions.length
                                                                    ? 'border-primary bg-primary/5 text-primary'
                                                                    : 'border-gray-300 hover:border-primary/40'
                                                            )}>
                                                            {fmH_Ids.length === headOptions.length && headOptions.length ? (
                                                                <CheckSquare className='h-4 w-4 text-primary' />
                                                            ) : (
                                                                <Square className='h-4 w-4 text-gray-400' />
                                                            )}
                                                            <span>Select All</span>
                                                        </div>
                                                    )}

                                                    <div className='max-h-40 overflow-y-auto rounded-md border border-gray-300 p-1'>
                                                        {headsdataloading ? (
                                                            <div className='py-4 text-center text-gray-500 text-sm'>Loading heads...</div>
                                                        ) : headsdata.length === 0 ? (
                                                            <div className='py-4 text-center text-gray-500 text-sm'>No heads found</div>
                                                        ) : (
                                                            filteredHeads.map((u) => {
                                                                const id = u.fmH_Id.toString();
                                                                const selected = fmH_Ids.includes(id);

                                                                return (
                                                                    <div
                                                                        key={u.fmH_Id}
                                                                        onClick={() => toggleHead(id)}
                                                                        className={cn(
                                                                            'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                                            selected
                                                                                ? 'border-primary bg-primary/5 text-primary'
                                                                                : 'border-gray-300 hover:border-primary/40'
                                                                        )}>
                                                                        {selected ? (
                                                                            <CheckSquare className='h-4 w-4 text-primary' />
                                                                        ) : (
                                                                            <Square className='h-4 w-4 text-gray-400' />
                                                                        )}
                                                                        <span>{u.fmH_FeeName}</span>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>

                                                {errors.heads && <FormError>{errors.heads.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedCatg === 'All' && (
                                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                        <div className='flex items-start gap-4'>
                                            {/* Label */}
                                            <Label className='w-40 text-right'>
                                                Receipt No <span className='text-red-500'>*</span>
                                            </Label>

                                            {/* Field */}
                                            <div className='flex-1'>
                                                <div className='rounded-md border border-gray-300 bg-white p-3'>
                                                    <InputText
                                                        placeholder='Search Receipt No...'
                                                        value={headSearch}
                                                        onChange={(e) => setReceiptSearch(e.target.value)}
                                                        className='mb-3'
                                                    />

                                                    {receiptOptions.length > 0 && (
                                                        <div
                                                            onClick={selectAllReceipts}
                                                            className={cn(
                                                                'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                                                receipts.length === receiptOptions.length && receiptOptions.length
                                                                    ? 'border-primary bg-primary/5 text-primary'
                                                                    : 'border-gray-300 hover:border-primary/40'
                                                            )}>
                                                            {receipts.length === receiptOptions.length && receiptOptions.length ? (
                                                                <CheckSquare className='h-4 w-4 text-primary' />
                                                            ) : (
                                                                <Square className='h-4 w-4 text-gray-400' />
                                                            )}
                                                            <span>Select All</span>
                                                        </div>
                                                    )}

                                                    <div className='max-h-40 overflow-y-auto rounded-md border border-gray-300 p-1'>
                                                        {receiptsloading ? (
                                                            <div className='py-4 text-center text-gray-500 text-sm'>
                                                                Loading Receipts...
                                                            </div>
                                                        ) : receiptdsdata.length === 0 ? (
                                                            <div className='py-4 text-center text-gray-500 text-sm'>No Receipts found</div>
                                                        ) : (
                                                            filteredReceipts.map((u) => {
                                                                const id = u.fyp_id.toString();
                                                                const selected = receipts.includes(id);

                                                                return (
                                                                    <div
                                                                        key={u.fyp_id}
                                                                        onClick={() => toggleReceipt(id)}
                                                                        className={cn(
                                                                            'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                                            selected
                                                                                ? 'border-primary bg-primary/5 text-primary'
                                                                                : 'border-gray-300 hover:border-primary/40'
                                                                        )}>
                                                                        {selected ? (
                                                                            <CheckSquare className='h-4 w-4 text-primary' />
                                                                        ) : (
                                                                            <Square className='h-4 w-4 text-gray-400' />
                                                                        )}
                                                                        <span>{u.fyp_receipt_no}</span>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>

                                                {errors.receipts && <FormError>{errors.receipts.message}</FormError>}
                                            </div>
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
                                        <div ref={printRef}>
                                            <CollapsibleSection defaultOpen={true}>
                                                <div className='mt-10 rounded-lg border bg-white shadow-xl'>
                                                    <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                        <div className='mb-6 text-center'>
                                                            <h2 className='font-bold text-2xl text-primary'>Fee Receipt Report</h2>
                                                        </div>

                                                        <div className='flex gap-2'>
                                                            <Button size='sm' onClick={handlePrint} className='h-8 px-3 text-xs'>
                                                                Print
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className='mx-auto max-w-6xl bg-white p-6 text-black print:p-0'>
                                                        {/* HEADER */}
                                                        <div className='flex items-center gap-4 border-b pb-4'>
                                                            <div className='text-center'>
                                                                {logodata && (
                                                                    <img src={logodata} alt='Institute Logo' className='mx-auto' />
                                                                )}
                                                            </div>
                                                            {/* <div className='flex-1 text-center'>
                                                                <h1 className='font-bold text-3xl'>
                                                                    Baldwin Girls&apos; High School
                                                                </h1>
                                                                <p className="text-sm">
                                                                    90, Richmond Road, Bengaluru, Karnataka 560025
                                                                </p>
                                                            </div> */}
                                                        </div>

                                                        {/* RECEIPT META */}
                                                        <div className='mt-4 grid grid-cols-2 text-sm'>
                                                            <div className='space-y-1'>
                                                                <p>
                                                                    <b>Receipt No:</b> {receiptNo}
                                                                </p>
                                                                <p>
                                                                    <b>Admission No:</b> {admissionNo}
                                                                </p>
                                                                <p>
                                                                    <b>Name:</b> {studentName}
                                                                </p>
                                                                <p>
                                                                    <b>Father:</b> {fatherName}
                                                                </p>
                                                            </div>
                                                            <div className='space-y-1 text-right'>
                                                                <p>
                                                                    <b>Date:</b>{' '}
                                                                </p>
                                                                <p>
                                                                    <b>Academic Year:</b> {academicYear}
                                                                </p>
                                                                <p>
                                                                    <b>Class/Sec:</b> {className}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <h2 className='my-4 text-center font-bold'>FEE RECEIPT</h2>

                                                        {/* FEE TABLE */}
                                                        <table className='w-full border-collapse border text-xs'>
                                                            <thead className='bg-gray-100'>
                                                                <tr>
                                                                    <th className='border p-1'>SL.NO</th>
                                                                    <th className='border p-1'>PARTICULARS</th>
                                                                    <th className='border p-1'>INSTALLMENT</th>
                                                                    <th className='border p-1'>TOTAL CHARGES</th>
                                                                    <th className='border p-1'>CONCESSION</th>
                                                                    <th className='border p-1'>PAID AMOUNT</th>
                                                                    <th className='border p-1'>BALANCE</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {feeRows.map((row) => (
                                                                    <tr key={row.slNo}>
                                                                        <td className='border p-1 text-center'>{row.slNo}</td>
                                                                        <td className='border p-1'>{row.particulars}</td>
                                                                        <td className='border p-1 text-center'>{row.installment ?? '-'}</td>
                                                                        <td className='border p-1 text-right'>{row.totalCharges ?? '-'}</td>
                                                                        <td className='border p-1 text-right'>{row.concession ?? '-'}</td>
                                                                        <td className='border p-1 text-right'>{row.paidAmount ?? '-'}</td>
                                                                        <td className='border p-1 text-right'>{row.balance ?? '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>

                                                        {/* CURRENT PAYMENT */}
                                                        <h3 className='mt-6 font-bold text-sm'>CURRENT PAYMENT DETAIL</h3>

                                                        <table className='mt-2 w-full border-collapse border text-xs'>
                                                            <thead className='bg-gray-100'>
                                                                <tr>
                                                                    <th className='border p-1'>SL.NO</th>
                                                                    <th className='border p-1'>AMOUNT</th>
                                                                    <th className='border p-1'>BANK</th>
                                                                    <th className='border p-1'>DD.NO</th>
                                                                    <th className='border p-1'>DATE</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {paymentRows.map((p) => (
                                                                    <tr key={p.slNo}>
                                                                        <td className='border p-1 text-center'>{p.slNo}</td>
                                                                        <td className='border p-1 text-right'>{p.amount}</td>
                                                                        <td className='border p-1 text-center'>{p.bank ?? '-'}</td>
                                                                        <td className='border p-1 text-center'>{p.ddNo ?? '-'}</td>
                                                                        <td className='border p-1 text-center'>{p.date ?? '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>

                                                        {/* FOOTER */}
                                                        <div className='mt-4 text-sm'>
                                                            <p>
                                                                <b>Amount Received:</b> {amountInWords}
                                                            </p>
                                                            <p>
                                                                <b>Payment Mode:</b> {paymentMode}
                                                            </p>
                                                        </div>

                                                        <div className='mt-10 flex justify-end'>
                                                            <p className='border-t pt-2 text-sm'>AUTHORIZED SIGNATORY</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleSection>
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
