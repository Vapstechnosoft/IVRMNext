'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentPortalAcademic } from '@/hooks/fees/useReports';
import { useStudentInformation } from '@/hooks/staff-portal/useFeeOnlinePayment';
import type { FeeStructure, IGroupTermMapping } from '@/types/student-portal/masters/fee_online_payment';
import { Loader2 } from 'lucide-react';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getAmountDetails, savePayment } from '../actions';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function FeeOnlinePaymentClient() {
    const { data: response, isLoading: isAcademicLoading } = useStudentPortalAcademic();
    const [academicYear, setAcademicYear] = useState<number | undefined>();
    const [groupTermList, setGroupTermList] = useState<IGroupTermMapping[]>([]);
    const [feeDetails, setFeeDetails] = useState<FeeStructure[]>([]);
    const [paymentGateWay, setPaymentGateWay] = useState<any[]>([]);
    const [totalAmt, setTotalAmt] = useState(0);
    const [rebate, setRebate] = useState(0);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [gateway, setGateway] = useState<string>('');
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);

    // Set academic year when response loads
    useEffect(() => {
        if (response?.data?.[0]?.asmaY_Id) {
            setAcademicYear(response.data[0].asmaY_Id);
        }
    }, [response]);

    const {
        data: studentInfoDetails,
        isLoading: isStudentLoading,
        isFetching: isStudentFetching
    } = useStudentInformation(academicYear || null, 'T', 0);

    const isStudentDataLoading = (isStudentLoading || isStudentFetching) && !!academicYear;

    // Populate group-term list and initial payment gateways when studentInfoDetails loads
    useEffect(() => {
        if (studentInfoDetails?.groupTermMappings?.length) {
            setGroupTermList(studentInfoDetails.groupTermMappings);
        }
        if (studentInfoDetails?.fillpaymentgateway?.length && paymentGateWay.length === 0) {
            const initialGateways = studentInfoDetails.fillpaymentgateway;
            setPaymentGateWay(initialGateways);
            const firstGw =
                initialGateways[0]?.fpgD_PGName || initialGateways[0]?.FPGD_PGName || initialGateways[0]?.paymentgateway || 'RAZORPAY';
            setGateway(firstGw);
        }
    }, [studentInfoDetails, paymentGateWay.length]);

    // Calculate Fee Summary figures based on studentInfoDetails
    const feeGrid = studentInfoDetails?.filonlinepaymentgrid || [];

    const charges =
        studentInfoDetails?.feeSummary?.charges ||
        (feeGrid.length > 0 ? feeGrid.reduce((sum: number, item: any) => sum + (Number(item.fsS_NetAmount) || 0), 0) : 0);

    const paid =
        studentInfoDetails?.feeSummary?.paid ??
        (feeGrid.length > 0 ? feeGrid.reduce((sum: number, item: any) => sum + (Number(item.fsS_PaidAmount) || 0), 0) : 0);

    const outstanding =
        studentInfoDetails?.feeSummary?.outstanding ||
        (feeGrid.length > 0 ? feeGrid.reduce((sum: number, item: any) => sum + (Number(item.fsS_ToBePaid) || 0), 0) : 0);

    const concession =
        studentInfoDetails?.feeSummary?.concession ||
        (feeGrid.length > 0 ? feeGrid.reduce((sum: number, item: any) => sum + (Number(item.fsS_ConcessionAmount) || 0), 0) : 0);

    const formatCurrency = (val: number) => `₹ ${Number(val || 0).toLocaleString('en-IN')}`;

    // Show loading state
    if (isAcademicLoading) {
        return (
            <div className='flex items-center justify-center p-8'>
                <div className='text-center'>
                    <div className='mb-4 text-lg'>Loading...</div>
                </div>
            </div>
        );
    }

    // Show error/empty state
    if (!response) {
        return (
            <div className='flex items-center justify-center p-8'>
                <div className='text-center text-red-500'>No data available. Please try again later.</div>
            </div>
        );
    }

    const handleGroupCheck = (grpIndex: number, checked: boolean) => {
        const newList = [...groupTermList];
        newList[grpIndex].grp.checkedgrplst = checked;
        newList[grpIndex].trm_list.forEach((trm) => {
            if (typeof trm === 'object' && !trm.termdisablechk) {
                trm.checkedheadlst = checked;
            }
        });
        setGroupTermList(newList);
    };

    const handleTermCheck = (grpIndex: number, trmIndex: number, checked: boolean) => {
        const newList = [...groupTermList];
        if (typeof newList[grpIndex].trm_list[trmIndex] === 'object') {
            newList[grpIndex].trm_list[trmIndex].checkedheadlst = checked;
        }

        const someTermsChecked = newList[grpIndex].trm_list.some((t) => t.checkedheadlst);

        if (someTermsChecked) {
            newList[grpIndex].grp.checkedgrplst = true;
        } else {
            newList[grpIndex].grp.checkedgrplst = false;
        }

        setGroupTermList(newList);
    };

    const handleShowDetails = async () => {
        const selectedList = groupTermList
            .filter((g) => g.grp.checkedgrplst)
            .map((g) => ({
                grp: g.grp,
                trm_list: g.trm_list.filter((t) => t.checkedheadlst)
            }));

        if (selectedList.length === 0 || selectedList.some((g) => g.trm_list.length === 0)) {
            toast.warning('Please select at least one Group and Term');
            return;
        }

        try {
            setIsDetailsLoading(true);
            const result = await getAmountDetails({
                MI_Id: 0,
                configset: 'T',
                ASMAY_Id: academicYear,
                AMST_Id: 0,
                ASMCL_Id: studentInfoDetails?.studentInfo?.asmcL_ID,
                selected_list: selectedList
            });
            if (result?.success && result?.data) {
                setFeeDetails(result.data.fillstudentviewdetails || []);
                const gateways = result.data.fillpaymentgateway || [];
                setPaymentGateWay(gateways);
                if (gateways.length > 0) {
                    const firstGw = gateways[0].fpgD_PGName || gateways[0].FPGD_PGName || gateways[0].paymentgateway || 'RAZORPAY';
                    setGateway(firstGw);
                } else {
                    setGateway('RAZORPAY');
                }
                setShowPaymentDetails(true);
                const total = (result.data.fillstudentviewdetails || []).reduce(
                    (acc: number, curr: any) => acc + (curr.fsS_ToBePaid || 0),
                    0
                );
                const totalRebate = result.data.fsS_RebateAmount || 0;
                setTotalAmt(total);
                setRebate(totalRebate);
            }
        } catch (error) {
            console.error('Error fetching amount details:', error);
            toast.error('Failed to load fee details');
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!gateway) {
            toast.warning('Please select a payment gateway');
            return;
        }

        const payload = {
            topayamount: totalAmt,
            students: feeDetails,
            onlinepaygteway: gateway
        };

        const paymentResponse = await savePayment(payload);
        if (paymentResponse.success && paymentResponse.data && gateway === 'RAZORPAY') {
            const rzpData = paymentResponse.data;
            const options = {
                key: rzpData.merchantkey,
                amount: rzpData.fmA_Amount * 100,
                currency: 'INR',
                name: 'Edumeeting School',
                description: 'Fee Payment',
                image: '/assets/images/logo.png',
                order_id: rzpData.trans_id,
                handler: (response: any) => {
                    // biome-ignore lint/style/useTemplate: <explanation>
                    toast.success('Payment Successful: ' + response.razorpay_payment_id);
                },
                prefill: {
                    name: rzpData.fillstudent?.[0]?.amsT_FirstName || '',
                    email: rzpData.fillstudent?.[0]?.amst_email_id || '',
                    contact: rzpData.fillstudent?.[0]?.amst_mobile || ''
                },
                theme: {
                    color: '#3399cc'
                }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        }
    };

    return (
        <div className='space-y-6'>
            <Script src='https://checkout.razorpay.com/v1/checkout.js' strategy='lazyOnload' />

            <Card>
                <CardHeader>
                    <CardTitle>Fee Online Payment</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-center space-x-4'>
                        <label htmlFor='academic-year' className='w-1/4 font-semibold'>
                            Academic Year: <span className='text-red-500'>*</span>
                        </label>
                        <div className='flex w-1/3 items-center space-x-3'>
                            <Select
                                value={academicYear ? String(academicYear) : undefined}
                                onValueChange={(val) => {
                                    setAcademicYear(Number(val));
                                    setShowPaymentDetails(false);
                                }}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {response?.data?.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* {isStudentDataLoading && <Loader2 className='h-5 w-5 shrink-0 animate-spin text-primary' />} */}
                        </div>
                    </div>

                    <div className='relative space-y-6'>
                        {isStudentDataLoading && (
                            <div className='absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-white/75 backdrop-blur-[2px] transition-all dark:bg-card/75'>
                                <div className='flex items-center space-x-3 rounded-lg border bg-background px-4 py-3 shadow-md'>
                                    <Loader2 className='h-6 w-6 animate-spin text-primary' />
                                    <span className='font-medium text-foreground text-sm'>Loading academic year details...</span>
                                </div>
                            </div>
                        )}

                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='rounded-md border p-4'>
                                <h3 className='mb-4 font-bold text-primary'>Student Information</h3>
                                {studentInfoDetails?.studentInfo ? (
                                    <div className='space-y-2 text-sm'>
                                        <div className='grid grid-cols-3'>
                                            <span className='font-semibold'>Name</span>
                                            <span className='col-span-2'>
                                                : {studentInfoDetails.studentInfo.amsT_FirstName}{' '}
                                                {studentInfoDetails.studentInfo.amsT_LastName}
                                            </span>
                                        </div>
                                        <div className='grid grid-cols-3'>
                                            <span className='font-semibold'>Class/Section/Roll No</span>
                                            <span className='col-span-2'>
                                                : {studentInfoDetails.studentInfo.classname} / {studentInfoDetails.studentInfo.sectionname}{' '}
                                                / {studentInfoDetails.studentInfo.amaY_RollNo}
                                            </span>
                                        </div>
                                        <div className='grid grid-cols-3'>
                                            <span className='font-semibold'>Adm No</span>
                                            <span className='col-span-2'>: {studentInfoDetails.studentInfo.amsT_AdmNo}</span>
                                        </div>
                                        <div className='grid grid-cols-3'>
                                            <span className='font-semibold'>Reg No</span>
                                            <span className='col-span-2'>: {studentInfoDetails.studentInfo.amsT_RegistrationNo}</span>
                                        </div>
                                        <div className='grid grid-cols-3'>
                                            <span className='font-semibold'>Mobile No</span>
                                            <span className='col-span-2'>: {studentInfoDetails.studentInfo.amst_mobile || ''}</span>
                                        </div>
                                        <div className='grid grid-cols-3'>
                                            <span className='font-semibold'>Email Id</span>
                                            <span className='col-span-2'>: {studentInfoDetails.studentInfo.amst_email_id || ''}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='text-center text-gray-500'>No student information available</div>
                                )}
                            </div>

                            {/* Group Selection */}
                            <div className='h-64 overflow-y-auto rounded-md border p-4'>
                                <h3 className='mb-4 font-bold text-primary'>
                                    Group List <span className='text-red-500'>*</span>
                                </h3>
                                {groupTermList.length > 0 ? (
                                    <div className='space-y-2'>
                                        {groupTermList.map((grpItem, grpIndex) => (
                                            <div key={`${grpItem.grp.fmgG_Id}-${grpIndex}`} className='space-y-1'>
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        checked={grpItem.grp.checkedgrplst}
                                                        onCheckedChange={(checked) => handleGroupCheck(grpIndex, !!checked)}
                                                        disabled={grpItem.grp.grpdisable}
                                                    />
                                                    <span className='font-medium'>{grpItem.grp.fmgG_GroupName}</span>
                                                </div>
                                                <div className='ml-6 space-y-1'>
                                                    {grpItem.trm_list.map((trm, trmIndex) => (
                                                        <div key={`${trm.fmT_Id}-${trmIndex}`} className='flex items-center space-x-2'>
                                                            <Checkbox
                                                                checked={trm.checkedheadlst}
                                                                onCheckedChange={(checked) =>
                                                                    handleTermCheck(grpIndex, trmIndex, !!checked)
                                                                }
                                                                disabled={trm.termdisablechk}
                                                            />
                                                            <span>{trm.fmT_Name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='text-center text-gray-500'>No groups available</div>
                                )}
                            </div>
                        </div>

                        {/* Fee Summary */}
                        <div className='rounded-lg border bg-card p-4 shadow-sm'>
                            <h3 className='mb-4 font-bold text-primary'>Fee Summary</h3>
                            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                                {/* Current Year Charges */}
                                <div className='rounded-lg border border-sky-100/60 bg-[#EAF6FD] p-4 dark:border-sky-900/30 dark:bg-sky-950/30'>
                                    <span className='block font-medium text-slate-500 text-xs dark:text-slate-400'>
                                        Current Year Charges
                                    </span>
                                    <p className='mt-1.5 font-bold text-[#0284c7] text-xl'>{formatCurrency(charges)}</p>
                                </div>

                                {/* Current Year Paid */}
                                <div className='rounded-lg border border-emerald-100/60 bg-[#EAFBF3] p-4 dark:border-emerald-900/30 dark:bg-emerald-950/30'>
                                    <span className='block font-medium text-slate-500 text-xs dark:text-slate-400'>Current Year Paid</span>
                                    <p className='mt-1.5 font-bold text-[#16a34a] text-xl'>{formatCurrency(paid)}</p>
                                </div>

                                {/* Current Year Outstanding */}
                                <div className='rounded-lg border border-rose-100/60 bg-[#FEEFEF] p-4 dark:border-rose-900/30 dark:bg-rose-950/30'>
                                    <span className='block font-medium text-slate-500 text-xs dark:text-slate-400'>
                                        Current Year Outstanding
                                    </span>
                                    <p className='mt-1.5 font-bold text-[#dc2626] text-xl'>{formatCurrency(outstanding)}</p>
                                </div>

                                {/* Current Year Concession */}
                                <div className='rounded-lg border border-purple-100/60 bg-[#F8F2FF] p-4 dark:border-purple-900/30 dark:bg-purple-950/30'>
                                    <span className='block font-medium text-slate-500 text-xs dark:text-slate-400'>
                                        Current Year Concession
                                    </span>
                                    <p className='mt-1.5 font-bold text-[#9333ea] text-xl'>{formatCurrency(concession)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-6 flex flex-wrap items-center justify-center gap-4'>
                        <Button
                            type='button'
                            onClick={handleShowDetails}
                            disabled={isStudentDataLoading || isDetailsLoading}
                            className='h-10 min-w-[200px] max-w-[260px] flex-1 rounded-lg bg-[#F05A28] font-medium text-sm text-white shadow-sm transition-colors hover:bg-[#d94a1d] disabled:opacity-50'>
                            {isDetailsLoading ? (
                                <span className='flex items-center justify-center gap-2'>
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                    Loading...
                                </span>
                            ) : (
                                'Show'
                            )}
                        </Button>
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={() => window.location.reload()}
                            disabled={isDetailsLoading}
                            className='h-10 min-w-[200px] max-w-[260px] flex-1 rounded-lg bg-[#E53935] font-medium text-sm text-white shadow-sm transition-colors hover:bg-[#c62828] disabled:opacity-50'>
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isDetailsLoading && (
                <Card>
                    <CardContent className='flex flex-col items-center justify-center py-12'>
                        <Loader2 className='mb-3 h-8 w-8 animate-spin text-primary' />
                        <p className='font-medium text-muted-foreground text-sm'>Fetching fee details, please wait...</p>
                    </CardContent>
                </Card>
            )}

            {showPaymentDetails && !isDetailsLoading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Fee Details</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='rounded-md border'>
                            <table className='w-full text-sm'>
                                <thead className='bg-muted'>
                                    <tr>
                                        <th className='border p-2'>
                                            <Checkbox checked={true} disabled />
                                        </th>
                                        <th className='border p-2'>SLNO</th>
                                        <th className='border p-2'>Head Name</th>
                                        <th className='border p-2'>Installment</th>
                                        <th className='border p-2'>Opening Balance</th>
                                        <th className='border p-2'>Receivable</th>
                                        <th className='border p-2'>Charges</th>
                                        <th className='border p-2'>Concession</th>
                                        <th className='border p-2'>Fine</th>
                                        <th className='border p-2'>Payable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feeDetails.length > 0 ? (
                                        feeDetails.map((row, index) => (
                                            <tr key={index} className='border-b'>
                                                <td className='border p-2 text-center'>
                                                    <Checkbox checked={true} disabled />
                                                </td>
                                                <td className='border p-2 text-center'>{index + 1}</td>
                                                <td className='border p-2'>{row.fmH_FeeName}</td>
                                                <td className='border p-2'>{row.ftI_Name}</td>
                                                <td className='border p-2 text-right'>{row.fsS_OBArrearAmount || 0}</td>
                                                <td className='border p-2 text-right'>{row.fsS_NetAmount || 0}</td>
                                                <td className='border p-2 text-right'>{row.fsS_TotalToBePaid || 0}</td>
                                                <td className='border p-2 text-right'>{row.fsS_ConcessionAmount || 0}</td>
                                                <td className='border p-2 text-right'>{row.fsS_FineAmount || 0}</td>
                                                <td className='border p-2 text-right'>{row.fsS_ToBePaid || 0}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={10} className='p-4 text-center text-gray-500'>
                                                No fee details available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className='mt-4 flex flex-col items-center justify-center space-y-2'>
                            <div className='flex items-center space-x-4'>
                                <label htmlFor='' className='font-bold'>
                                    Total Rebate:
                                </label>
                                <Input value={rebate} readOnly className='w-32 font-bold' />
                                <label htmlFor='' className='font-bold'>
                                    Total Payable:
                                </label>
                                <Input value={totalAmt} readOnly className='w-32 font-bold' />
                            </div>

                            <div className='mt-4 flex flex-wrap gap-4'>
                                {paymentGateWay.length > 0 &&
                                    paymentGateWay.map((gatewayItem: any, idx: number) => {
                                        const gwName = gatewayItem.fpgD_PGName;
                                        return (
                                            <div
                                                key={gatewayItem.fpgD_Id || gwName || idx}
                                                className={`flex cursor-pointer items-center space-x-2 rounded border p-4 hover:bg-muted ${
                                                    gateway === gwName ? 'border-primary bg-muted' : ''
                                                }`}
                                                onClick={() => setGateway(gwName)}>
                                                <input type='radio' checked={gateway === gwName} readOnly />
                                                <span className='font-bold'>{gwName}</span>
                                            </div>
                                        );
                                    })}
                            </div>

                            <Button
                                size='lg'
                                className='mt-4 bg-green-600 hover:bg-green-700'
                                onClick={handlePayment}
                                disabled={!gateway || totalAmt === 0}>
                                CLICK HERE TO PAY NOW
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
