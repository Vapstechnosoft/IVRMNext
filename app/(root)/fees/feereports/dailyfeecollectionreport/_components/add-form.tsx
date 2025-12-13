// 'use client';

// import { zodResolver } from '@hookform/resolvers/zod';
// import { useEffect, useState } from 'react';
// import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
// import { z } from 'zod';

// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
// import { FormError, Label } from '@/components/ui/extension/field';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
// import { toast } from 'sonner';

// import { useClassDropdownDropdown } from '@/hooks/fees/useReports';
// import { getGroupsDropdown } from '@/server/fees/reports/daily_fee_collection_report';
// import type { ApiSearchparams } from '@/types';

// // ===================================================
// // ZOD SCHEMA
// // ===================================================
// const dailyFeeCollectionSchema = z.object({
//     report: z.enum(['All', 'students', 'staff', 'others']).default('students'),
//     rpttyp: z.enum(['All', 'Individual']).default('Individual'),
//     reportdate: z.enum(['transdate', 'settdate', 'SettledOnline']).default('transdate'),

//     asmaY_Id: z.number().min(0, { message: 'Academic Year is required' }),

//     groupIds: z.array(z.number()).min(1, { message: 'Select at least one Group' }),

//     chequeDate: z.boolean().default(false),
//     acdmyr: z.boolean().default(false),
//     headwise: z.boolean().default(false),
//     paymentwise: z.boolean().default(false),

//     fromDate: z.string().min(1, { message: 'From Date is required' }),
//     toDate: z.string().min(1, { message: 'To Date is required' }),

//     enableAllClasses: z.boolean().default(false),
//     asmcL_Id: z.number().optional(),

//     Fmc_allorsudentorother: z.enum(['All', 'stud', 'preadm', 'other', 'Trpt', 'thirdparty', 'multiplepaymentmode']).default('All'),

//     Fmc_allorcorddorop: z.enum(['All', 'C', 'B', 'O', 'Ecs', 'S', 'R', 'BT', 'U']).default('All'),

//     storedTrans: z.boolean().default(false),
//     thirdPartyTrans: z.boolean().default(false),
//     pdaTrans: z.boolean().default(false)
// });

// type FormFields = z.infer<typeof dailyFeeCollectionSchema>;

// // ===================================================
// // PROPS
// // ===================================================
// interface DailyFeeProps {
//     onSuccess?: (payload: any, apiSearchParams?: ApiSearchparams) => void;
//     apiSearchParams: ApiSearchparams;
// }

// // ===================================================
// // MAIN COMPONENT (RESTRUCTURED)
// // ===================================================
// export default function DailyFeeCollectionReportForm({ onSuccess, apiSearchParams }: DailyFeeProps) {
//     // ---------------------------- FORM ----------------------------
//     const {
//         control,
//         handleSubmit,
//         reset,
//         register,
//         setValue,
//         formState: { errors, isSubmitting }
//     } = useForm<FormFields>({
//         resolver: zodResolver(dailyFeeCollectionSchema),
//         mode: 'all',
//         defaultValues: {
//             report: 'students',
//             rpttyp: 'Individual',
//             reportdate: 'transdate',
//             asmaY_Id: 0,
//             groupIds: [],
//             chequeDate: false,
//             acdmyr: false,
//             headwise: false,
//             paymentwise: false,
//             fromDate: '',
//             toDate: '',
//             enableAllClasses: false,
//             Fmc_allorsudentorother: 'All',
//             Fmc_allorcorddorop: 'All'
//         }
//     });

//     const [submitClicked, setSubmitClicked] = useState(false);

//     // ---------------------------- WATCH ----------------------------
//     const report = useWatch({ control, name: 'report' });
//     const rpttyp = useWatch({ control, name: 'rpttyp' });
//     const reportdate = useWatch({ control, name: 'reportdate' });
//     const chequeDate = useWatch({ control, name: 'chequeDate' });
//     const acdmyr = useWatch({ control, name: 'acdmyr' });
//     const headwise = useWatch({ control, name: 'headwise' });
//     const paymentwise = useWatch({ control, name: 'paymentwise' });
//     const enableAllClasses = useWatch({ control, name: 'enableAllClasses' });
//     const Fmc_allorcorddorop = useWatch({ control, name: 'Fmc_allorcorddorop' });
//     const selectedGroupIds = useWatch({ control, name: 'groupIds' }) || [];

//     // ---------------------------- DROPDOWNS ----------------------------
//     const [academicYears, setAcademicYears] = useState<any[]>([]);
//     const [feeGroups, setFeeGroups] = useState<any[]>([]);
//     const [groupManualLoading, setGroupManualLoading] = useState(false);
//     const [classes, setClasses] = useState<any[]>([]);

//     const { data: academicData, error: academicError } = useAcademicYearDropdown();
//     const { data: classData, error: classError } = useClassDropdownDropdown();

//     useEffect(() => {
//         if (academicError) {
//             toast.error(academicError.message || 'Failed to load academic years');
//             setAcademicYears([]);
//         } else if (academicData?.data) {
//             const formatted = academicData.data.map((i: any) => ({
//                 asmaY_Id: i.asmaY_Id ?? 0,
//                 asmaY_Year: i.asmaY_Year ?? ''
//             }));
//             setAcademicYears(formatted);
//         }
//     }, [academicData, academicError]);

//     useEffect(() => {
//         if (classError) {
//             toast.error(classError.message || 'Failed to load Class dropdown');
//             setClasses([]);
//         } else if (classData?.data) {
//             const formatted = classData.data.map((i: any) => ({
//                 asmcL_Id: i.asmcL_Id ?? 0,
//                 asmcL_ClassName: i.asmcL_ClassName ?? ''
//             }));
//             setClasses(formatted);
//         }
//     }, [classData, classError]);

//     // mock

//     const onYearChange = async (yearId: number) => {
//         try {
//             setGroupManualLoading(true);

//             const res = await getGroupsDropdown(yearId);

//             const formatted =
//                 res?.data?.map((i: any) => ({
//                     fmG_Id: i.fmG_Id ?? 0,
//                     fmG_GroupName: i.fmG_GroupName ?? ''
//                 })) ?? [];

//             setFeeGroups(formatted); // update dropdown
//             setValue('groupIds', []); // reset selected groups
//         } catch (err: any) {
//             toast.error('Failed to load groups');
//             setFeeGroups([]);
//         } finally {
//             setGroupManualLoading(false);
//         }
//     };

//     // ---------------------------- CONDITIONS ----------------------------
//     const showHeadPaymentBlock =
//         (report === 'All' && rpttyp === 'All' && reportdate === 'transdate') ||
//         (report === 'students' && rpttyp === 'All' && reportdate === 'transdate');

//     const showChequeDateCheckbox = Fmc_allorcorddorop === 'B';

//     const showHeadPaymentError = submitClicked && showHeadPaymentBlock && !chequeDate && !acdmyr && !headwise && !paymentwise;

//     const isClassRequired = rpttyp === 'Individual' && !enableAllClasses;

//     // ---------------------------- AUTO-RESET ----------------------------
//     useEffect(() => {
//         if (!showHeadPaymentBlock) {
//             setValue('headwise', false);
//             setValue('paymentwise', false);
//         }
//     }, [showHeadPaymentBlock]);

//     useEffect(() => {
//         if (Fmc_allorcorddorop !== 'B') {
//             setValue('chequeDate', false);
//         }
//     }, [Fmc_allorcorddorop]);

//     useEffect(() => {
//         if (enableAllClasses) {
//             setValue('asmcL_Id', undefined);
//         }
//     }, [enableAllClasses]);

//     // ---------------------------- GROUP SELECT ----------------------------
//     const handleGroupChange = (values: string[]) => {
//         const ids = values.map(Number);
//         setValue('groupIds', ids, { shouldValidate: true });
//     };

//     // ===================================================
//     // SUBMIT
//     // ===================================================
//     const onSubmit: SubmitHandler<FormFields> = (data) => {
//         setSubmitClicked(true);

//         if (showHeadPaymentBlock && !data.chequeDate && !data.acdmyr && !data.headwise && !data.paymentwise) {
//             toast.error('Select at least one: Cheque Date / Acd Year Wise / Head Wise / Payment Mode');
//             return;
//         }

//         if (isClassRequired && !data.asmcL_Id) {
//             toast.error('Please select Class');
//             return;
//         }

//         const payload = {
//             mI_Id: 30,
//             ...data,
//             chequeDate: data.chequeDate ? 1 : 0,
//             acdmyr: data.acdmyr ? 1 : 0,
//             headwise: data.headwise ? 1 : 0,
//             paymentwise: data.paymentwise ? 1 : 0,
//             asmcL_Id: data.enableAllClasses ? 0 : (data.asmcL_Id ?? 0),
//             storedTrans: data.storedTrans ? 1 : 0,
//             thirdPartyTrans: data.thirdPartyTrans ? 1 : 0,
//             pdaTrans: data.pdaTrans ? 1 : 0
//         };

//         console.log('Submitting Daily Fee Collection Report with payload:', payload);
//     };

//     const handleReset = () => {
//         reset();
//         setSubmitClicked(false);
//     };

//     // ===================================================
//     // UI STRUCTURE (MATCHES YOUR SAMPLE STYLE)
//     // ===================================================
//     return (
//         <div className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'>
//             <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
//                 <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
//                     {/* LEFT BLOCK */}
//                     <div className='space-y-6'>
//                         {/* REPORT TYPE */}
//                         <div className='space-y-3 rounded-lg border p-4'>
//                             <Label className='font-semibold'>Report For</Label>
//                             <div className='flex flex-wrap gap-6'>
//                                 {['All', 'students', 'staff', 'others'].map((val) => (
//                                     <label key={val} className='flex items-center gap-2'>
//                                         <input type='radio' value={val} {...register('report')} />
//                                         <span className='capitalize'>{val}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* CATEGORY */}
//                         <div className='rounded-lg border p-4'>
//                             <Label className='mb-2 block font-semibold'>
//                                 Report Category <span className='text-red-500'>*</span>
//                             </Label>
//                             <div className='flex gap-6'>
//                                 <label className='flex items-center gap-2'>
//                                     <input type='radio' value='All' {...register('rpttyp')} />
//                                     <span>All</span>
//                                 </label>
//                                 <label className='flex items-center gap-2'>
//                                     <input type='radio' value='Individual' {...register('rpttyp')} />
//                                     <span>Individual</span>
//                                 </label>
//                             </div>
//                         </div>

//                         {/* DATE TYPE */}
//                         <div className='space-y-2 rounded-lg border p-4'>
//                             <Label className='font-semibold'>Date Basis</Label>

//                             <label className='flex items-center gap-2'>
//                                 <input type='radio' value='transdate' {...register('reportdate')} />
//                                 <span>Transaction Date</span>
//                             </label>

//                             <label className='flex items-center gap-2'>
//                                 <input type='radio' value='settdate' {...register('reportdate')} />
//                                 <span>Overall Settled Details</span>
//                             </label>

//                             <label className='flex items-center gap-2'>
//                                 <input type='radio' value='SettledOnline' {...register('reportdate')} />
//                                 <span>Online Settled Details</span>
//                             </label>
//                         </div>

//                         {/* ACADEMIC YEAR */}
//                         <Controller
//                             name='asmaY_Id'
//                             control={control}
//                             render={({ field, fieldState }) => (
//                                 <div className='flex items-center gap-4'>
//                                     <Label className='w-40 font-medium'>
//                                         Academic Year <span className='text-red-500'>*</span>
//                                     </Label>
//                                     <div className='flex-1'>
//                                         <Select
//                                             value={field.value?.toString()}
//                                             onValueChange={(v) => {
//                                                 const num = Number(v);
//                                                 field.onChange(num);
//                                                 onYearChange(num); // <-- HERE
//                                             }}>
//                                             <SelectTrigger className='w-full'>
//                                                 <SelectValue placeholder='Select Year' />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value='0'>All</SelectItem>
//                                                 {academicYears.map((y) => (
//                                                     <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
//                                                         {y.asmaY_Year}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                         {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
//                                     </div>
//                                 </div>
//                             )}
//                         />

//                         {/* GROUPS */}
//                         <div>
//                             <Label className='font-medium'>
//                                 Group <span className='text-red-500'>*</span>
//                             </Label>
//                             <div className='mt-2'>
//                                 <CustomMultiSelectBox
//                                     options={feeGroups.map((g) => ({
//                                         label: g.fmG_GroupName,
//                                         value: String(g.fmG_Id)
//                                     }))}
//                                     value={selectedGroupIds.map(String)}
//                                     onChange={handleGroupChange}
//                                     placeholder='Select Fee Groups'
//                                     height='200px'
//                                     isSearchRequired
//                                     isLoading={groupManualLoading}
//                                 />

//                                 {errors.groupIds && <FormError>{errors.groupIds.message}</FormError>}
//                             </div>
//                         </div>

//                         {/* SPECIAL CHECKBOXES */}
//                         <div className='space-y-3 text-sm'>
//                             {showChequeDateCheckbox && (
//                                 // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
//                                 <label className='flex items-center gap-2'>
//                                     <Checkbox checked={chequeDate} onCheckedChange={(v) => setValue('chequeDate', !!v)} />
//                                     <span>Cheque Date</span>
//                                 </label>
//                             )}

//                             {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
//                             <label className='flex items-center gap-2'>
//                                 <Checkbox checked={acdmyr} onCheckedChange={(v) => setValue('acdmyr', !!v)} />
//                                 <span>Acd Year Wise Report</span>
//                             </label>

//                             {showHeadPaymentBlock && (
//                                 <>
//                                     {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
//                                     <label className='flex items-center gap-2'>
//                                         <Checkbox checked={headwise} onCheckedChange={(v) => setValue('headwise', !!v)} />
//                                         <span>Head Wise Report</span>
//                                     </label>

//                                     {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
//                                     <label className='flex items-center gap-2'>
//                                         <Checkbox checked={paymentwise} onCheckedChange={(v) => setValue('paymentwise', !!v)} />
//                                         <span>Payment Mode</span>
//                                     </label>

//                                     {showHeadPaymentError && <FormError>Select at least one checkbox above</FormError>}
//                                 </>
//                             )}
//                         </div>
//                     </div>

//                     {/* RIGHT BLOCK */}
//                     <div className='space-y-6'>
//                         {/* DETAILS FOR */}
//                         {reportdate === 'transdate' && (
//                             <div className='space-y-2 rounded-lg border p-4'>
//                                 <Label className='font-semibold'>Details For</Label>

//                                 <div className='flex flex-wrap gap-4 text-sm'>
//                                     {['All', 'stud', 'preadm', 'other', 'Trpt', 'thirdparty', 'multiplepaymentmode'].map((val) => (
//                                         <label key={val} className='flex items-center gap-2'>
//                                             <input type='radio' value={val} {...register('Fmc_allorsudentorother')} />
//                                             <span>
//                                                 {val === 'stud'
//                                                     ? 'Student'
//                                                     : val === 'preadm'
//                                                       ? 'Preadmission'
//                                                       : val === 'Trpt'
//                                                         ? 'Transport'
//                                                         : val === 'thirdparty'
//                                                           ? 'Third Party'
//                                                           : val === 'multiplepaymentmode'
//                                                             ? 'Student Multiple Payment'
//                                                             : val}
//                                             </span>
//                                         </label>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         {/* PAYMENT MODE */}
//                         {reportdate === 'transdate' && (
//                             <div className='space-y-2 rounded-lg border p-4'>
//                                 <Label className='font-semibold'>Payment Mode</Label>

//                                 <div className='grid grid-cols-3 gap-3 text-sm'>
//                                     {['All', 'C', 'B', 'O', 'Ecs', 'S', 'R', 'BT', 'U'].map((val) => (
//                                         <label key={val} className='flex items-center gap-2'>
//                                             <input type='radio' value={val} {...register('Fmc_allorcorddorop')} />
//                                             <span>
//                                                 {val === 'C'
//                                                     ? 'Cash'
//                                                     : val === 'B'
//                                                       ? 'Cheque/DD'
//                                                       : val === 'O'
//                                                         ? 'Online Paid'
//                                                         : val === 'Ecs'
//                                                           ? 'ECS'
//                                                           : val === 'S'
//                                                             ? 'Card'
//                                                             : val === 'R'
//                                                               ? 'RTGS'
//                                                               : val === 'BT'
//                                                                 ? 'Trans & Bank'
//                                                                 : val === 'U'
//                                                                   ? 'UPI'
//                                                                   : 'All'}
//                                             </span>
//                                         </label>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         {/* DATES + CLASS */}
//                         <div className='space-y-5 rounded-lg border p-4'>
//                             {/* FROM DATE */}
//                             <div className='flex items-center gap-4'>
//                                 <Label className='w-32'>
//                                     From Date <span className='text-red-500'>*</span>
//                                 </Label>
//                                 <input type='date' className='flex-1 rounded-md border px-3 py-2' {...register('fromDate')} />
//                                 {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
//                             </div>

//                             {/* TO DATE */}
//                             <div className='flex items-center gap-4'>
//                                 <Label className='w-32'>
//                                     To Date <span className='text-red-500'>*</span>
//                                 </Label>
//                                 <input type='date' className='flex-1 rounded-md border px-3 py-2' {...register('toDate')} />
//                                 {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
//                             </div>

//                             {/* CLASS */}
//                             <div className='flex items-center gap-4'>
//                                 {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
//                                 <label className='flex w-32 items-center gap-2'>
//                                     <Checkbox checked={enableAllClasses} onCheckedChange={(v) => setValue('enableAllClasses', !!v)} />
//                                     <Label>
//                                         Class
//                                         {isClassRequired && <span className='text-red-500'> *</span>}
//                                     </Label>
//                                 </label>

//                                 <Select
//                                     disabled={enableAllClasses}
//                                     onValueChange={(v) => setValue('asmcL_Id', Number(v))}
//                                     value={!enableAllClasses ? useWatch({ control, name: 'asmcL_Id' })?.toString() : undefined}>
//                                     <SelectTrigger className='flex-1'>
//                                         <SelectValue placeholder={enableAllClasses ? 'All Classes' : 'Select Class'} />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {classes.map((c) => (
//                                             <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
//                                                 {c.asmcL_ClassName}
//                                             </SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>

//                                 {submitClicked && isClassRequired && !useWatch({ control, name: 'asmcL_Id' }) && (
//                                     <FormError>Please select Class</FormError>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* BUTTONS */}
//                 <div className='flex justify-center gap-4 border-t pt-6'>
//                     <Button type='submit' disabled={isSubmitting} className='min-w-32'>
//                         {isSubmitting ? 'Generating...' : 'Report'}
//                     </Button>

//                     <Button type='button' variant='outline' onClick={handleReset}>
//                         Cancel
//                     </Button>
//                 </div>
//             </form>
//         </div>
//     );
// }
