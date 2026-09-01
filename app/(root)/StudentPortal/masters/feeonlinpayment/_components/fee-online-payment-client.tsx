'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentPortalAcademic } from '@/hooks/fees/useReports';
import { useStudentInformation } from '@/hooks/staff-portal/useFeeOnlinePayment';
import type { FeeStructure, GroupTermMapping } from '@/types/student-portal/masters/fee_online_payment';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { getAmountDetails, savePayment } from '../actions';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function FeeOnlinePaymentClient() {
    const { data: response, isLoading: isAcademicLoading } = useStudentPortalAcademic();
    const [academicYear, setAcademicYear] = useState<number | undefined>();
    const [groupTermList, setGroupTermList] = useState<GroupTermMapping[]>([]);
    const [feeDetails, setFeeDetails] = useState<FeeStructure[]>([]);
    const [totalAmt, setTotalAmt] = useState(0);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [gateway, setGateway] = useState<string>('');

    // Set academic year when response loads
    useEffect(() => {
        if (response?.data?.[0]?.asmaY_Id) {
            setAcademicYear(response.data[0].asmaY_Id);
        }
    }, [response]);

    const { data: studentInfoDetails, isLoading: isStudentLoading } = useStudentInformation(academicYear || null);

    // Fetch session details
    useEffect(() => {
        const fetchSession = async () => {
            //   const session = await getSession();
        };
        fetchSession();
    }, []);

    // Build group-term mapping when response loads
    //   useEffect(() => {
    //     if (response?.customgrplist && response?.termlst) {
    //       const mapping: GroupTermMapping[] = response.customgrplist.map(
    //         (grp: any) => ({
    //           grp: {
    //             ...grp,
    //             checkedgrplst: false,
    //             grpdisable: false,
    //           },
    //           trm_list: response.termlst
    //             .filter((trm: any) => trm.fmgG_Id === grp.fmgG_Id)
    //             .map((trm: any) => ({
    //               ...trm,
    //               checkedheadlst: false,
    //               termdisablechk: false,
    //             })),
    //         }),
    //       );
    //       setGroupTermList(mapping);
    //     }
    //   }, [response]);

    //   const groupList = response?.customgrplist || [];
    //   console.log("groupList Details latest ", groupList);

    // Show loading state
    if (isAcademicLoading || isStudentLoading) {
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
            alert('Please select at least one Group and Term');
            return;
        }

        const result = await getAmountDetails({ selected_list: selectedList });
        if (result.success && result.data) {
            setFeeDetails(result.data.fillstudentviewdetails || []);
            setShowPaymentDetails(true);
            const total = (result.data.fillstudentviewdetails || []).reduce((acc: number, curr: any) => acc + (curr.fsS_ToBePaid || 0), 0);
            setTotalAmt(total);
        }
    };

    const handlePayment = async () => {
        if (!gateway) {
            alert('Please select a payment gateway');
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
                    alert('Payment Successful: ' + response.razorpay_payment_id);
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
                        <Select
                            value={academicYear ? String(academicYear) : undefined}
                            onValueChange={(val) => setAcademicYear(Number(val))}>
                            <SelectTrigger className='w-1/3'>
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
                    </div>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='rounded-md border p-4'>
                            <h3 className='mb-4 font-bold text-primary'>Student Information</h3>
                            {studentInfoDetails?.studentInfo ? (
                                <div className='space-y-2 text-sm'>
                                    <div className='grid grid-cols-3'>
                                        <span className='font-semibold'>Name</span>
                                        <span className='col-span-2'>
                                            : {studentInfoDetails.studentInfo.amsT_FirstName} {studentInfoDetails.studentInfo.amsT_LastName}
                                        </span>
                                    </div>
                                    <div className='grid grid-cols-3'>
                                        <span className='font-semibold'>Class/Section/Roll No</span>
                                        <span className='col-span-2'>
                                            : {studentInfoDetails.studentInfo.classname} {studentInfoDetails.studentInfo.sectionname}{' '}
                                            {studentInfoDetails.studentInfo.amaY_RollNo}
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
                                        <span className='col-span-2'>: {studentInfoDetails.studentInfo.amst_mobile}</span>
                                    </div>
                                    <div className='grid grid-cols-3'>
                                        <span className='font-semibold'>Email Id</span>
                                        <span className='col-span-2'>: {studentInfoDetails.studentInfo.amst_email_id}</span>
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
                                                            onCheckedChange={(checked) => handleTermCheck(grpIndex, trmIndex, !!checked)}
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

                    <div className='flex justify-center space-x-4'>
                        <Button onClick={handleShowDetails}>Show</Button>
                        <Button variant='destructive' onClick={() => window.location.reload()}>
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {showPaymentDetails && (
                <Card>
                    <CardHeader>
                        <CardTitle>Fee Details</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='rounded-md border'>
                            <table className='w-full text-sm'>
                                <thead className='bg-muted'>
                                    <tr>
                                        <th className='border p-2'>Select</th>
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
                                                    <Checkbox checked={true} />
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
                                    Total Payable:
                                </label>
                                <Input value={totalAmt} readOnly className='w-32 font-bold' />
                            </div>

                            <div className='mt-4 flex space-x-6'>
                                <div
                                    className={`flex cursor-pointer items-center space-x-2 rounded border p-4 hover:bg-muted ${
                                        gateway === 'RAZORPAY' ? 'border-primary bg-muted' : ''
                                    }`}
                                    onClick={() => setGateway('RAZORPAY')}>
                                    <input type='radio' checked={gateway === 'RAZORPAY'} readOnly />
                                    <span className='font-bold'>Razorpay</span>
                                </div>
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
