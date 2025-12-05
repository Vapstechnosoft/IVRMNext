'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';

import { toast } from 'sonner';

import { useClassDropdownDropdown } from '@/hooks/fees/useReports';
import { dailyFeeCollectionSchema } from '@/schemas/fees/reports';
import { getDailyFeeCollectionReport, getGroupsDropdown } from '@/server/fees/reports/daily_fee_collection_report';
import type { ApiSearchparams } from '@/types';
import type { IDailyFeeCollectionRequest } from '@/types/fees/reports/reports';

type FormFields = z.infer<typeof dailyFeeCollectionSchema>;

interface DailyFeeProps {
    onSuccess?: (payload: any, apiSearchParams?: ApiSearchparams) => void;
    apiSearchParams: ApiSearchparams;
}
const today = new Date().toISOString().split('T')[0];

export default function DailyFeeCollectionReportForm() {
    // ---------------------------- FORM ----------------------------
    const {
        control,
        handleSubmit,
        reset,
        register,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(dailyFeeCollectionSchema),
        mode: 'all',
        defaultValues: {
            report: 'students',
            rpttyp: 'Individual',
            reportdate: 'transdate',
            asmaY_Id: 0,
            groupIds: [],
            chequeDate: false,
            acdmyr: false,
            headwise: false,
            paymentwise: false,
            fromDate: today,
            toDate: today,
            enableAllClasses: false,
            Fmc_allorsudentorother: 'All',
            Fmc_allorcorddorop: 'All'
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
    const enableAllClasses = useWatch({ control, name: 'enableAllClasses' });
    const Fmc_allorcorddorop = useWatch({ control, name: 'Fmc_allorcorddorop' });
    const selectedGroupIds = useWatch({ control, name: 'groupIds' }) || [];
    const handleGroupChange = (values: string[]) => {
        const ids = values.map(Number);
        setValue('groupIds', ids, { shouldValidate: true });
    };
    // ---------------------------- DROPDOWNS ----------------------------
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [feeGroups, setFeeGroups] = useState<any[]>([]);
    const [groupManualLoading, setGroupManualLoading] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);

    const { data: academicData, error: academicError } = useAcademicYearDropdown();
    const { data: classData, error: classError } = useClassDropdownDropdown();

    useEffect(() => {
        if (academicError) toast.error('Failed to load academic years');
        if (academicData?.data) {
            setAcademicYears(
                academicData.data.map((i: any) => ({
                    asmaY_Id: i.asmaY_Id,
                    asmaY_Year: i.asmaY_Year
                }))
            );
        }
    }, [academicData, academicError]);

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

    // ---------------------------------------
    // LOAD GROUPS WHEN YEAR CHANGES
    // ---------------------------------------
    const onYearChange = async (yearId: number) => {
        try {
            setGroupManualLoading(true);
            const res = await getGroupsDropdown(yearId);

            setFeeGroups(
                res?.data?.map((i: any) => ({
                    fmG_Id: i.fmG_Id,
                    fmG_GroupName: i.fmG_GroupName
                })) ?? []
            );

            setValue('groupIds', []);
        } catch {
            toast.error('Failed to load groups');
        } finally {
            setGroupManualLoading(false);
        }
    };

    // ===================================================
    // SHOW/HIDE LOGIC
    // ===================================================
    const showHeadPaymentBlock =
        (report === 'All' && rpttyp === 'All' && reportdate === 'transdate') ||
        (report === 'students' && rpttyp === 'All' && reportdate === 'transdate');

    const isClassRequired = rpttyp === 'Individual' && !enableAllClasses;

    // ===================================================
    // TABLE STATES + API LOGIC
    // ===================================================
    const [loading, setLoading] = useState(false);
    const [tableColumns, setTableColumns] = useState<string[]>([]);
    const [tableRows, setTableRows] = useState<any[]>([]);
    const [showTable, setShowTable] = useState(false);

    async function fetchDailyReport(params: any) {
        const query = new URLSearchParams(params).toString();
        const url = `/FeeDailycollection/daily-fee-collection-report?${query}`;

        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error('API failed');

        return res.json();
    }

    // ===================================================
    // SUBMIT (REPORT CLICK)
    // ===================================================
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setSubmitClicked(true);

        if (isClassRequired && !data.asmcL_Id) {
            toast.error('Please select Class');
            return;
        }

        // -------------------------------
        // BASE PARAMS (ALWAYS SENT)
        // -------------------------------
        const params: IDailyFeeCollectionRequest = {
            AsmayId: data.asmaY_Id,
            FromDate: data.fromDate,
            ToDate: data.toDate,
            All_List: [{ columnID: '1' }]
        };

        // ===================================================
        // REPORT 1 → HEADWISE
        // ===================================================
        if (data.headwise === true && data.paymentwise === false) {
            params.Headwise = true;
            params.Paymentwise = false;

            console.log('REPORT 1 (HEADWISE) PARAMS', params);
        }

        // ===================================================
        // REPORT 2 → PAYMENTWISE
        // ===================================================
        if (data.paymentwise === true) {
            params.Paymentwise = true;
            params.Headwise = false;

            console.log('REPORT 2 (PAYMENTWISE) PARAMS', params);
        }

        // ===================================================
        // REPORT 3 → MULTIPLE PAYMENT (students only)
        // Trigger:
        // Fmc_allorsudentorother === "stud"
        // Fmc_allorcorddorop === "multiplepaymentmode"
        // ===================================================
        if (data.Fmc_allorsudentorother === 'stud' && data.Fmc_allorcorddorop === 'All') {
            params.regornamedetails = 'students';
            params.allorstdorothersflag = 'multiplepaymentmode';

            console.log('REPORT 3 (MULTIPLE PAYMENT STUDENTS) PARAMS', params);
        }

        // ===================================================
        // REPORT 4 → STUDENTS / ALL (NOT multiplepaymentmode)
        // Trigger:
        // Fmc_allorsudentorother = "stud" OR "All"
        // AND Fmc_allorcorddorop != "multiplepaymentmode"
        // ===================================================
        if ((data.Fmc_allorsudentorother === 'stud' || data.Fmc_allorsudentorother === 'All') && data.Fmc_allorcorddorop !== 'All') {
            params.regornamedetails = data.Fmc_allorsudentorother.toLowerCase();
            params.allorstdorothersflag = 'all';
            params.allorindivflag = data.rpttyp === 'All' ? 'all' : 'individual';
            params.allorcorchoronlineflag = data.Fmc_allorcorddorop.toLowerCase();

            params.ClassFlag = data.enableAllClasses ? '0' : '1';
            params.GroupFlag = data.groupIds.length > 0 ? '1' : '0';
            params.Cheque = data.chequeDate ? '1' : '0';
            params.TempararyArrayListstring = 'all';

            console.log('REPORT 4 (STUDENTS/ALL) PARAMS', params);
        }

        // ===================================================
        // REPORT 5 → STAFF / OTHERS
        // Trigger: Fmc_allorsudentorother = "staff" | "other"
        // ===================================================
        if (data.Fmc_allorsudentorother === 'Trpt' || data.Fmc_allorsudentorother === 'other') {
            params.regornamedetails = data.Fmc_allorsudentorother;
            params.allorstdorothersflag = 'all';
            params.ClassFlag = data.enableAllClasses ? '0' : '1';

            console.log('REPORT 5 (STAFF / OTHERS) PARAMS', params);
        }

        console.log('FINAL PARAM SENT:', params);

        // ===================================================
        // API CALL
        // ===================================================
        try {
            setLoading(true);
            const tempParams: IDailyFeeCollectionRequest = {
                AsmayId: 176,
                FromDate: '2025-01-01',
                ToDate: '2025-01-31',
                Headwise: true,
                Paymentwise: false
            };

            const { data: resp } = await getDailyFeeCollectionReport(tempParams);

            const list = resp?.data?.list ?? [];

            if (list.length > 0) {
                setTableColumns(Object.keys(list[0]));
                setTableRows(list);
            } else {
                setTableColumns([]);
                setTableRows([]);
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

    // ===================================================
    // CANCEL BUTTON
    // ===================================================
    const handleReset = () => {
        reset();
        setSubmitClicked(false);
        setTableColumns([]);
        setTableRows([]);
        setShowTable(false);
    };

    // ===================================================
    // MAIN UI
    // ===================================================
    return (
        <div className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                {/* -------------------- FORM CONTENT (NO CHANGES) -------------------- */}
                <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                    {/* ================= LEFT BLOCK ================= */}
                    <div className='space-y-6'>
                        {/* REPORT TYPE */}
                        <div className='space-y-3 rounded-lg border p-4'>
                            <Label className='font-semibold'>Report For</Label>
                            <div className='flex flex-wrap gap-6'>
                                {['All', 'students', 'staff', 'others'].map((val) => (
                                    <label key={val} className='flex items-center gap-2'>
                                        <input type='radio' value={val} {...register('report')} />
                                        <span className='capitalize'>{val}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* CATEGORY */}
                        <div className='rounded-lg border p-4'>
                            <Label className='mb-2 block font-semibold'>
                                Report Category <span className='text-red-500'>*</span>
                            </Label>
                            <div className='flex gap-6'>
                                <label className='flex items-center gap-2'>
                                    <input type='radio' value='All' {...register('rpttyp')} />
                                    <span>All</span>
                                </label>
                                <label className='flex items-center gap-2'>
                                    <input type='radio' value='Individual' {...register('rpttyp')} />
                                    <span>Individual</span>
                                </label>
                            </div>
                        </div>

                        {/* DATE TYPE */}
                        <div className='space-y-2 rounded-lg border p-4'>
                            <Label className='font-semibold'>Date Basis</Label>
                            <label className='flex items-center gap-2'>
                                <input type='radio' value='transdate' {...register('reportdate')} />
                                <span>Transaction Date</span>
                            </label>
                            <label className='flex items-center gap-2'>
                                <input type='radio' value='settdate' {...register('reportdate')} />
                                <span>Overall Settled Details</span>
                            </label>
                            <label className='flex items-center gap-2'>
                                <input type='radio' value='SettledOnline' {...register('reportdate')} />
                                <span>Online Settled Details</span>
                            </label>
                        </div>

                        {/* ACADEMIC YEAR */}
                        <Controller
                            name='asmaY_Id'
                            control={control}
                            render={({ field, fieldState }) => (
                                <div className='flex items-center gap-4'>
                                    <Label className='w-40 font-medium'>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </Label>

                                    <div className='flex-1'>
                                        <Select
                                            value={field.value?.toString()}
                                            onValueChange={(v) => {
                                                const num = Number(v);
                                                field.onChange(num);
                                                onYearChange(num);
                                            }}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((y) => (
                                                    <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                </div>
                            )}
                        />

                        <div className='flex items-start gap-4'>
                            {/* LABEL */}
                            <Label className='mt-[6px] whitespace-nowrap font-medium'>
                                Group <span className='text-red-500'>*</span>
                            </Label>

                            {/* MULTI SELECT */}
                            <div className='flex-1'>
                                <CustomMultiSelectBox
                                    options={feeGroups.map((g) => ({
                                        label: g.fmG_GroupName,
                                        value: String(g.fmG_Id)
                                    }))}
                                    value={selectedGroupIds.map(String)}
                                    onChange={handleGroupChange}
                                    placeholder='Select Fee Groups'
                                    height='200px'
                                    isSearchRequired
                                    isLoading={groupManualLoading}
                                />

                                {errors.groupIds && <FormError>{errors.groupIds.message}</FormError>}
                            </div>
                        </div>

                        {/* SPECIAL CHECKBOXES */}
                        <div className='space-y-3 text-sm'>
                            <div className='flex items-center gap-2'>
                                <Checkbox id='acdmyr-1' checked={acdmyr} onCheckedChange={(v) => setValue('acdmyr', !!v)} />
                                <label htmlFor='acdmyr-1'>Cheque Date</label>
                            </div>

                            <div className='flex items-center gap-2'>
                                <Checkbox id='acdmyr-2' checked={acdmyr} onCheckedChange={(v) => setValue('acdmyr', !!v)} />
                                <label htmlFor='acdmyr-2'>Acd Year Wise Report</label>
                            </div>

                            {showHeadPaymentBlock && (
                                <>
                                    <label htmlFor='headwise-checkbox' className='flex items-center gap-2'>
                                        <Checkbox
                                            id='headwise-checkbox'
                                            checked={headwise}
                                            onCheckedChange={(v) => setValue('headwise', !!v)}
                                        />
                                        <span>Head Wise Report</span>
                                    </label>

                                    <label htmlFor='paymentwise-checkbox' className='flex items-center gap-2'>
                                        <Checkbox
                                            id='paymentwise-checkbox'
                                            checked={paymentwise}
                                            onCheckedChange={(v) => setValue('paymentwise', !!v)}
                                        />
                                        <span>Payment Mode</span>
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ================= RIGHT BLOCK ================= */}
                    <div className='space-y-6'>
                        {/* DETAILS FOR */}
                        {reportdate === 'transdate' && (
                            <div className='space-y-2 rounded-lg border p-4'>
                                <Label className='font-semibold'>Details For</Label>

                                <div className='flex flex-wrap gap-4 text-sm'>
                                    {['All', 'stud', 'preadm', 'other', 'Trpt', 'thirdparty', 'multiplepaymentmode'].map((val) => (
                                        <label key={val} className='flex items-center gap-2'>
                                            <input type='radio' value={val} {...register('Fmc_allorsudentorother')} />
                                            <span>
                                                {val === 'stud'
                                                    ? 'Student'
                                                    : val === 'preadm'
                                                      ? 'Preadmission'
                                                      : val === 'other'
                                                        ? 'Others'
                                                        : val === 'Trpt'
                                                          ? 'Transport'
                                                          : val === 'thirdparty'
                                                            ? 'Third Party'
                                                            : 'Multiple Payment'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PAYMENT MODE */}
                        {reportdate === 'transdate' && (
                            <div className='space-y-2 rounded-lg border p-4'>
                                <Label className='font-semibold'>Payment Mode</Label>

                                <div className='grid grid-cols-3 gap-3 text-sm'>
                                    {['All', 'C', 'B', 'O', 'Ecs', 'S', 'R', 'BT', 'U'].map((val) => (
                                        <label key={val} className='flex items-center gap-2'>
                                            <input type='radio' value={val} {...register('Fmc_allorcorddorop')} />
                                            <span>
                                                {val === 'C'
                                                    ? 'Cash'
                                                    : val === 'B'
                                                      ? 'Cheque/DD'
                                                      : val === 'O'
                                                        ? 'Online'
                                                        : val === 'Ecs'
                                                          ? 'ECS'
                                                          : val === 'S'
                                                            ? 'Card'
                                                            : val === 'R'
                                                              ? 'RTGS'
                                                              : val === 'BT'
                                                                ? 'Bank Transfer'
                                                                : 'UPI'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* DATES & CLASS */}
                        <div className='space-y-5 rounded-lg border p-4'>
                            {/* FROM DATE */}
                            <div className='flex items-center gap-4'>
                                <Label className='w-32'>
                                    From Date <span className='text-red-500'>*</span>
                                </Label>
                                <input type='date' className='flex-1 rounded-md border px-3 py-2' {...register('fromDate')} />
                                {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                            </div>

                            {/* TO DATE */}
                            <div className='flex items-center gap-4'>
                                <Label className='w-32'>
                                    To Date <span className='text-red-500'>*</span>
                                </Label>
                                <input type='date' className='flex-1 rounded-md border px-3 py-2' {...register('toDate')} />
                                {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                            </div>

                            {/* CLASS */}
                            <div className='flex items-center gap-4'>
                                <Label>Class {isClassRequired && <span className='text-red-500'>*</span>}</Label>

                                {/* <label className='flex w-32 items-center gap-2'>
                                    <Checkbox checked={enableAllClasses} onCheckedChange={(v) => setValue('enableAllClasses', !!v)} />
                                    <Label>Class {isClassRequired && <span className='text-red-500'>*</span>}</Label>
                                </label> */}

                                <Select
                                    disabled={enableAllClasses}
                                    onValueChange={(v) => setValue('asmcL_Id', Number(v))}
                                    value={!enableAllClasses ? useWatch({ control, name: 'asmcL_Id' })?.toString() : undefined}>
                                    <SelectTrigger className='flex-1'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {classes.map((c) => (
                                            <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===================== BUTTONS ===================== */}
                <div className='flex justify-center gap-4 border-t pt-6'>
                    <Button type='submit' disabled={isSubmitting} className='min-w-32'>
                        {isSubmitting ? 'Generating...' : 'Report'}
                    </Button>

                    <Button type='button' variant='outline' onClick={handleReset}>
                        Cancel
                    </Button>
                </div>
            </form>

            {/* =====================================================
                DYNAMIC RESULT TABLE AFTER REPORT CLICK
            ====================================================== */}
            {/* {showTable && (
                <div className='mt-10'>
                    {loading && <p className='py-6 text-center font-semibold'>Loading Report...</p>}

                    {!loading && tableRows.length > 0 && (
                        <div className='overflow-auto rounded-md border'>
                            <table className='w-full border-collapse text-sm'>
                                <thead className='bg-gray-200'>
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
                                                <td key={col} className='border px-3 py-2'>
                                                    {row[col] ?? ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && tableRows.length === 0 && <p className='py-6 text-center text-gray-500'>No Records Found</p>}
                </div>
            )} */}

            {showTable && (
                <div className='mt-10'>
                    {/* REPORT TITLE */}
                    <h2 className='mb-6 text-center font-bold text-2xl text-gray-800 tracking-wide'>DAILY FEE COLLECTION REPORT</h2>

                    {/* Glass Card Container */}
                    <div className='overflow-auto rounded-2xl border bg-white/60 shadow-xl backdrop-blur-lg'>
                        <table className='w-full border-collapse text-sm'>
                            {/* Table Header (Improved UI) */}
                            <thead className='sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'>
                                <tr>
                                    <th className='border px-3 py-2 font-semibold'>Student Name</th>
                                    <th className='border px-3 py-2 font-semibold'>Adm No</th>
                                    <th className='border px-3 py-2 font-semibold'>Class</th>
                                    <th className='border px-3 py-2 font-semibold'>Section</th>
                                    <th className='border px-3 py-2 font-semibold'>MobileNo</th>
                                    <th className='border px-3 py-2 font-semibold'>EmailId</th>
                                    <th className='border px-3 py-2 font-semibold'>Gender</th>
                                    <th className='border px-3 py-2 font-semibold'>DOB</th>
                                    <th className='border px-3 py-2 font-semibold'>TermName</th>
                                    <th className='border px-3 py-2 font-semibold'>ReceiptNo</th>
                                    <th className='border px-3 py-2 font-semibold'>Bank</th>
                                    <th className='border px-3 py-2 font-semibold'>Mode Of Payment</th>
                                    <th className='border px-3 py-2 font-semibold'>Reference Id</th>
                                    <th className='border px-3 py-2 font-semibold'>Cheque/DD Details</th>
                                    <th className='border px-3 py-2 font-semibold'>Transaction Id</th>
                                    <th className='border px-3 py-2 font-semibold'>Date</th>
                                    <th className='border px-3 py-2 font-semibold'>Cheque Date</th>
                                    <th className='border px-3 py-2 font-semibold'>Remarks</th>
                                    <th className='border px-3 py-2 font-semibold'>AccName</th>
                                    <th className='border px-3 py-2 font-semibold'>FYP</th>
                                </tr>
                            </thead>

                            {/* Alternating Rows */}
                            <tbody className='[&>tr:nth-child(odd)]:bg-gray-50/60'>
                                {[
                                    'Rahul Sharma',
                                    'Anjali Verma',
                                    'Karan Patel',
                                    'Neha Gupta',
                                    'Rohan Mehta',
                                    'Simran Kaur',
                                    'Arjun Reddy',
                                    'Pooja Singh',
                                    'Manish Kumar',
                                    'Sneha Nair',
                                    'Vikas Rao',
                                    'Divya Jain',
                                    'Harsh Thakur',
                                    'Meena Yadav',
                                    'Jay Shah'
                                ].map((name, index) => (
                                    <tr key={index} className='backdrop-blur-sm transition hover:bg-blue-50/60'>
                                        <td className='border px-3 py-2'>{name}</td>
                                        <td className='border px-3 py-2'>20{100 + index}</td>
                                        <td className='border px-3 py-2'>{6 + (index % 6)}</td>
                                        <td className='border px-3 py-2'>{['A', 'B', 'C', 'D'][index % 4]}</td>
                                        <td className='border px-3 py-2'>98{Math.floor(100000 + index * 321)}</td>
                                        <td className='border px-3 py-2'>{name.split(' ')[0].toLowerCase()}@example.com</td>
                                        <td className='border px-3 py-2'>{index % 2 === 0 ? 'Male' : 'Female'}</td>
                                        <td className='border px-3 py-2'>201{index}-01-10</td>
                                        <td className='border px-3 py-2'>Term {index % 2 === 0 ? '1' : '2'}</td>
                                        <td className='border px-3 py-2'>RCPT40{index + 20}</td>
                                        <td className='border px-3 py-2'>{['HDFC', 'SBI', 'ICICI', 'Axis'][index % 4]}</td>
                                        <td className='border px-3 py-2'>{['Cash', 'Online', 'UPI', 'Cheque'][index % 4]}</td>
                                        <td className='border px-3 py-2'>REF99{index + 300}</td>
                                        <td className='border px-3 py-2'>{index % 4 === 3 ? 'Cheque No: 55' + index : '---'}</td>
                                        <td className='border px-3 py-2'>TXN23{index + 555}</td>
                                        <td className='border px-3 py-2'>2025-01-{(index % 28) + 1}</td>
                                        <td className='border px-3 py-2'>{index % 4 === 3 ? '2025-01-10' : '---'}</td>
                                        <td className='border px-3 py-2'>Paid</td>
                                        <td className='border px-3 py-2'>General Account</td>
                                        <td className='border px-3 py-2'>2024-25</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
