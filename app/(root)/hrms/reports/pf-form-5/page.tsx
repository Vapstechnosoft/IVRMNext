'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { usePFForm5 } from '@/hooks/hrms/useReports';
import { getMasterInstitution } from '@/server/hrms/master-dropdown';
import { format } from 'date-fns';
import { Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { printPFForm5 } from './_components/pf-form5-print';

const MONTH_LIST = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'December' }
];

interface FilterFormValues {
    year: string;
    month: string;
}

export default function PFForm5Page() {
    return (
        <FormProvider>
            <PFForm5Content />
        </FormProvider>
    );
}

function PFForm5Content() {
    const [reportData, setReportData] = useState<any>(null);
    const [institution, setInstitution] = useState<any>(null);
    const [reportMonth, setReportMonth] = useState('');
    const [reportYear, setReportYear] = useState('');

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const res = await getMasterInstitution();
                if (res?.data) {
                    setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
                }
            } catch (error) {
                console.error('Error fetching institution:', error);
            }
        };
        fetchInstitution();
    }, []);
    const { control, handleSubmit, reset } = useForm<FilterFormValues>({
        defaultValues: {
            year: '',
            month: ''
        }
    });

    const handleCancel = () => {
        reset();
        setReportData(null);
    };

    const { data: yearsData } = useLeaveYearDropdown();
    const { mutate: generateReport, isPending } = usePFForm5();

    const onSubmit = (data: FilterFormValues) => {
        if (!data.year || !data.month) {
            toast.error('Please select Year and Month');
            return;
        }

        const selectedYearObj = yearsData?.data?.find((y: any) => y.hrmlY_Id.toString() === data.year);
        const yearString = selectedYearObj?.hrmlY_LeaveYear?.split('-')[0] || data.year;

        const selectedMonthObj = MONTH_LIST.find((m) => m.id.toString() === data.month);
        const monthName = selectedMonthObj?.name || '';

        generateReport(
            {
                hreS_Year: yearString,
                hreS_Month: monthName
            },
            {
                onSuccess: (res) => {
                    if (res.success && res.data) {
                        setReportData(res.data);
                        setReportMonth(monthName);
                        setReportYear(yearString);
                        toast.success('Report generated successfully');
                    } else {
                        toast.error(res.message || 'No data found');
                    }
                }
            }
        );
    };

    const handlePrint = () => {
        if (!reportData || !reportData.pfreportdetails || reportData.pfreportdetails.length === 0) {
            toast.error('No data to print');
            return;
        }

        printPFForm5(reportData, institution, reportMonth, reportYear);
    };

    const columns = [
        {
            id: 'slNo',
            header: 'SL.No',
            cell: ({ row }: any) => row.index + 1
        },
        {
            accessorKey: 'hrmE_PFAccNo',
            header: 'PF Acc No'
        },
        {
            header: 'Employee Name',
            cell: ({ row }: any) => {
                const e = row.original;
                return `${e.hrmE_EmployeeFirstName || ''} ${e.hrmE_EmployeeMiddleName || ''} ${e.hrmE_EmployeeLastName || ''}`.trim();
            }
        },
        {
            accessorKey: 'fatherHusbandName',
            header: 'Father/Husband Name'
        },
        {
            header: 'Date of Birth',
            cell: ({ row }: any) => (row.original.hrmE_DOB ? format(new Date(row.original.hrmE_DOB), 'dd-MM-yyyy') : '')
        },
        {
            accessorKey: 'ivrmmG_GenderName',
            header: 'Gender'
        },
        {
            header: 'PF Joining Date',
            cell: ({ row }: any) => (row.original.hrmE_PFDate ? format(new Date(row.original.hrmE_PFDate), 'dd-MM-yyyy') : '')
        }
    ];

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight'>PF Form 5</h2>
            </div>

            <CollapsibleSection defaultOpen={true} title='Report Criteria' variant='outline' className='shadow-sm'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                Year <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='year'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearsData?.data?.map((y: any) => (
                                                <SelectItem key={y.hrmlY_Id} value={y.hrmlY_Id.toString()}>
                                                    {y.hrmlY_LeaveYear}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Month <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='month'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Month' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTH_LIST.map((m) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className='flex justify-end gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleCancel}
                            disabled={isPending}
                            className='w-32 rounded-xl border-orange-500 text-orange-600 transition-all hover:bg-orange-50'>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button type='submit' disabled={isPending} className='w-32 rounded-xl transition-all'>
                            {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Generate
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData && (
                <CollapsibleSection
                    title='Report Details'
                    defaultOpen={true}
                    className='border shadow-md'
                    rightElement={
                        <div className='flex gap-2'>
                            <Button variant='outline' size='sm' onClick={handlePrint} className='gap-2'>
                                <Printer className='h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    }>
                    <div className='text-right'>
                        <h4 className='font-semibold text-lg'>Form 5</h4>
                    </div>
                    <div className='space-y-1 text-center'>
                        <h4 className='font-semibold text-lg'>The Employees&apos; Provident Fund Scheme, 1952</h4>
                        <h6 className='font-medium'> Paragraph 36 (2) (a) and (b)</h6>
                        <h4 className='font-semibold text-lg'> Employees&apos; Pension Scheme, 1995</h4>
                        <h6 className='font-medium'> Paragraph 20 (4)</h6>
                    </div>
                    <hr className='my-4' />
                    <div className='mt-5 mb-2.5'>
                        <div className='col-span-12 space-y-2'>
                            <p>
                                Return of Employees&apos; qualifying for membership of the Employees&apos; Provident Fund, Employees&apos;
                                Pension Scheme & Employees&apos; Deposit Linked Insurance Fund for the first time during the month of{' '}
                                <span className='border-b font-semibold'>
                                    {reportMonth} - {reportYear}
                                </span>
                            </p>
                            <p>To be sent to the Commissioner with Form 2 (EPF & EPS)</p>
                        </div>
                        <div className='mt-4 grid grid-cols-12 gap-4'>
                            <div className='col-span-8'>
                                <table className='mt-2.5 table w-full'>
                                    <tbody>
                                        <tr>
                                            <td className='w-1/3 py-1 font-medium'>Name of Establishment :</td>
                                            <td className='border-b py-1 text-left'>{institution?.mI_Name}</td>
                                        </tr>
                                        <tr>
                                            <td className='w-1/3 py-1 font-medium'> Address of the Factory/ Establishment :</td>
                                            <td className='border-b py-1 text-left'>
                                                {reportData?.currentInstuteAddress || institution?.mI_Address1}, {institution?.ivrmmcT_Name}{' '}
                                                - {institution?.mI_Pincode}.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className='col-span-4'>
                                <table className='mt-2.5 table w-full'>
                                    <tbody>
                                        <tr>
                                            <td className='py-1 font-medium'>Code No. of Factory/ Establishment :</td>
                                            <td className='border-b py-1 text-left'>
                                                {reportData?.payrollStandard?.[0]?.hrC_PFAccNoPrefix ||
                                                    reportData?.payrollstandard?.[0]?.hrC_PFAccNoPrefix ||
                                                    ''}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='py-1' />
                                            <td className='py-1' />
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className='mt-8'>
                        <GenericDataTable
                            data={reportData.alldata || reportData.pfreportdetails || []}
                            columns={columns}
                            totalItems={(reportData.alldata || reportData.pfreportdetails || []).length}
                            isPaginationRequired={false}
                            isSearchRequired={false}
                            isLoading={isPending}
                        />
                    </div>

                    <div className='mt-8 grid grid-cols-12 gap-4'>
                        <div className='col-span-12 flex justify-end'>
                            <div className='mt-12 text-center'>
                                <label className='clearfix border-black border-t px-8 pt-2 font-medium'>
                                    Signature of the employer with Official Seal
                                </label>
                            </div>
                        </div>
                        <div className='col-span-12'>
                            <div className='mt-4 text-gray-700 text-sm'>
                                <p>
                                    Note: Please furnish details of the membership in remarks column if the employee was a member of
                                    Employees&apos; Provident Fund and Employees&apos; Pension scheme before joining yourself/ factory. i.e.
                                    Account No. and/ or the name and particulars of the last employer.
                                </p>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
