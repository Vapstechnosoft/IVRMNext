'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { exportToExcel } from '@/lib/export-to-file';
import { usePFChallan, usePFChallanOnload } from '@/hooks/hrms/useReports';
import { Loader2, Search, Download, Printer, X } from 'lucide-react';
import { toast } from 'sonner';

const MONTH_LIST = [
    { id: 1, name: 'January' }, { id: 2, name: 'February' }, { id: 3, name: 'March' },
    { id: 4, name: 'April' }, { id: 5, name: 'May' }, { id: 6, name: 'June' },
    { id: 7, name: 'July' }, { id: 8, name: 'August' }, { id: 9, name: 'September' },
    { id: 10, name: 'October' }, { id: 11, name: 'November' }, { id: 12, name: 'December' }
];

interface FilterFormValues {
    year: string;
    month: string;
}

export default function PFChallanPage() {
    return (
        <FormProvider>
            <PFChallanContent />
        </FormProvider>
    );
}

function CharBox({ char }: { char: string }) {
    return (
        <div className="w-5 h-5 border border-gray-600 flex items-center justify-center font-mono font-bold text-[10px] -ml-[1px] bg-white text-black">
            {char !== ' ' ? char : ''}
        </div>
    );
}

function CharBoxes({ value, length }: { value: string; length: number }) {
    const chars = value.padEnd(length, ' ').slice(0, length).split('');
    return (
        <div className="flex">
            {chars.map((c, i) => (
                <CharBox key={i} char={c} />
            ))}
        </div>
    );
}

function StaticDateBoxes({ showLabels = false }: { showLabels?: boolean }) {
    const labels = showLabels ? ['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'] : ['', '', '', '', '', '', '', ''];
    return (
        <div className="flex gap-2">
            <div className="flex">
                <CharBox char={labels[0]} />
                <CharBox char={labels[1]} />
            </div>
            <div className="flex">
                <CharBox char={labels[2]} />
                <CharBox char={labels[3]} />
            </div>
            <div className="flex">
                <CharBox char={labels[4]} />
                <CharBox char={labels[5]} />
                <CharBox char={labels[6]} />
                <CharBox char={labels[7]} />
            </div>
        </div>
    );
}




function PFChallanContent() {
    const [reportData, setReportData] = useState<any | null>(null);
    const [generatedYear, setGeneratedYear] = useState('');
    const [generatedMonth, setGeneratedMonth] = useState('');
    const { control, handleSubmit, reset, watch } = useForm<FilterFormValues>({
        defaultValues: {
            year: '',
            month: ''
        }
    });

    const watchedYear = watch('year');
    const watchedMonth = watch('month');

    const handleCancel = () => {
        reset();
        setReportData(null);
        setGeneratedYear('');
        setGeneratedMonth('');
    };


    // Queries - Using facade onload for ID sync
    const { data: onloadData } = usePFChallanOnload(30);

    // Using general master for Years as reference Cumulative Report
    const { data: yearsData } = useLeaveYearDropdown();
    console.log("yearsData", yearsData);
    const monthsData = { data: onloadData?.data?.monthdropdown || [] };

    const { mutate: generateReport, isPending } = usePFChallan();

    const onSubmit = (data: FilterFormValues) => {
        if (!data.year || !data.month) {
            toast.error('Please select Year and Month');
            return;
        }

        const selectedYearObj = yearsData?.data?.find((y: any) => y.hrmlY_Id.toString() === data.year);
        const yearString = selectedYearObj?.hrmlY_LeaveYear?.split('-')[0] || data.year;

        generateReport({
            hreS_Year: yearString,
            hreS_Month: data.month
        }, {
            onSuccess: (res) => {
                if (res.success && res.data) {
                    setReportData(res.data);
                    setGeneratedYear(yearString);
                    setGeneratedMonth(data.month);
                    toast.success('Report generated successfully');
                } else {
                    toast.error(res.message || 'No data found');
                }
            }
        });
    };

    const handleExport = () => {
        const detailsData = reportData?.data || reportData?.alldata || (Array.isArray(reportData) ? reportData : []);
        if (!detailsData || detailsData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const exportColumns = [
            { label: 'Wages', value: 'amountofWages' },
            { label: 'EPF', value: 'hreS_EPF' },
            { label: 'FPF', value: 'hreS_FPF' },
            { label: 'Ac 21', value: 'hreS_Ac21' },
            { label: 'Ac 22', value: 'hreS_Ac22' },
            { label: 'Ac 5', value: 'hreS_Ac5' },
            { label: 'Ac 10', value: 'hreS_Ac10' },
            { label: 'PF Amount', value: 'pfAmount' },
            { label: 'Father/Husband Name', value: 'fatherHusbandName' }
        ];

        exportToExcel('PF_Challan', JSON.stringify(exportColumns), JSON.stringify(detailsData));
    };

    const handlePrint = () => {
        window.print();
    };

    // Month Array computation using generatedMonth
    const monthDropdownList = onloadData?.data?.monthdropdown || [];
    const monthObj = monthDropdownList.find(
        (m: any) => (m.ivrM_Month_Name || m.IVRM_Month_Name || '').toLowerCase() === generatedMonth.toLowerCase()
    );
    let monthIdVal = monthObj?.IVRM_Month_Id || monthObj?.IVRM_Month_Id;
    if (!monthIdVal) {
        const staticMonthObj = MONTH_LIST.find(
            (m) => m.name.toLowerCase() === generatedMonth.toLowerCase()
        );
        monthIdVal = staticMonthObj?.id || 1;
    }
    const monthIdStr = String(monthIdVal).padStart(2, '0');
    const monthArray = generatedMonth ? monthIdStr.split('') : ['', ''];

    // Year Array computation using generatedYear
    const yearArray = generatedYear ? generatedYear.split('') : ['', '', '', ''];

    // Institution details
    const institution = reportData?.institutionDetails?.[0] || onloadData?.data?.institutionDetails?.[0] || {};
    const instName = institution.mI_Name || '';
    const instAddressParts = [
        institution.mI_Address1,
        institution.mI_Address2,
        institution.mI_Address3,
        institution.ivrmmcT_Name
    ].filter(Boolean);
    const CurrentInstuteAddress = instAddressParts.join(', ');
    const pincodeVal = institution.mI_Pincode || institution.MI_Pincode || '';
    const pincodeArray = String(pincodeVal).padEnd(6, ' ').slice(0, 6).split('');

    // PF values
    const pfItem = reportData ? (reportData.list || reportData.pfreport?.[0] || reportData.alldata?.[0] || (Array.isArray(reportData) ? reportData[0] : null)) : null;
    const epf = pfItem ? (pfItem.hreS_EPF ?? pfItem.HRES_EPF ?? 0) : 0;
    const fpf = pfItem ? (pfItem.hreS_FPF ?? pfItem.HRES_FPF ?? 0) : 0;
    const ac5 = pfItem ? (pfItem.hreS_Ac5 ?? pfItem.HRES_Ac5 ?? 0) : 0;
    const ac10 = pfItem ? (pfItem.hreS_Ac10 ?? pfItem.HRES_Ac10 ?? 0) : 0;
    const ac21 = pfItem ? (pfItem.hreS_Ac21 ?? pfItem.HRES_Ac21 ?? 0) : 0;
    const ac22 = pfItem ? (pfItem.hreS_Ac22 ?? pfItem.HRES_Ac22 ?? 0) : 0;

    const totalAc1 = epf + fpf;
    const totalAc5_10_21_22 = ac5 + ac10 + ac21 + ac22;

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-full-width {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 8mm 12mm;
                    }
                }
            `}</style>

            {/* <div className='flex items-center justify-between no-print'>
                <h2 className='text-2xl font-bold tracking-tight'>PF Challan Report</h2>
            </div> */}

            <CollapsibleSection defaultOpen={true} title="Report Criteria" variant='outline' className='shadow-sm no-print'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>Year <span className='text-destructive'>*</span></Label>
                            <Controller name='year' control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} key={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearsData?.data?.map((y: any) => (
                                            <SelectItem key={y.hrmlY_Id} value={y.hrmlY_Id.toString()}>
                                                {y.hrmlY_LeaveYear}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>

                        <div className='space-y-2'>
                            <Label>Month <span className='text-destructive'>*</span></Label>
                            <Controller name='month' control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} key={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthsData?.data?.length > 0 ? (
                                            monthsData.data.map((m: any) => (
                                                <SelectItem key={m.ivrM_Month_Id || m.IVRM_Month_Id} value={m.ivrM_Month_Name || m.IVRM_Month_Name}>
                                                    {m.ivrM_Month_Name || m.IVRM_Month_Name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            MONTH_LIST.map((m) => (
                                                <SelectItem key={m.id} value={m.name}>
                                                    {m.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                    </div>

                    <div className='flex justify-end gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleCancel}
                            disabled={isPending}
                            className='w-32 border-orange-500 text-orange-600 hover:bg-orange-50 transition-all rounded-xl'>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button type='submit' disabled={isPending} className='w-32 transition-all rounded-xl'>
                            {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Generate
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData && (
                <CollapsibleSection defaultOpen={true} title="PF Challan" variant='outline' 
                className='shadow-sm print:border-none print:shadow-none'
                headerClassName='print:hidden'
                contentClassName='print:p-0'
                rightElement={
                    <div className="no-print flex justify-end gap-2">
                        <Button variant='outline' size='sm' onClick={handleExport} className='gap-2 rounded-xl w-fit'>
                            <Download className='h-4 w-4' />
                            Export Excel
                        </Button>
                        <Button size='sm' onClick={handlePrint} className='gap-2 rounded-xl bg-primary hover:bg-primary/90 w-fit'>
                            <Printer className='h-4 w-4' />
                            Print Challan
                        </Button>
                    </div>
                }
                >
                <div className="space-y-4 print:space-y-0 printable-content">
                    

                    <div className="bg-white text-black p-6 rounded-none shadow-md  mx-auto print-full-width">
                        <div className="border border-black p-4 space-y-6">
                            {/* Header Section */}
                            <div className="text-center border-b border-black pb-4">
                                <h2 className="text-sm font-bold tracking-wider">EMPLOYEE'S PROVIDENT FUND ORGANISATION</h2>
                                <h3 className="text-xs font-semibold">(Combined Challan for A/c No.1, 2, 10, 21 & 22)</h3>
                            </div>

                            {/* Meta Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-black pb-4 text-xs">
                                {/* Business No */}
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-gray-800">Business No :</span>
                                    <CharBoxes value="" length={10} />
                                </div>

                                {/* For the Month of */}
                                <div className="flex items-center gap-2 md:justify-center">
                                    <span className="font-semibold text-xs text-gray-800">For the Month of :</span>
                                    <div className="flex gap-2">
                                        <div className="flex">
                                            <CharBox char={monthArray[0] || '0'} />
                                            <CharBox char={monthArray[1] || '1'} />
                                        </div>
                                        <div className="flex">
                                            <CharBox char={yearArray[0] || '2'} />
                                            <CharBox char={yearArray[1] || '0'} />
                                            <CharBox char={yearArray[2] || '2'} />
                                            <CharBox char={yearArray[3] || '6'} />
                                        </div>
                                    </div>
                                </div>

                                {/* VDR NO */}
                                <div className="flex items-center gap-2 md:justify-end">
                                    <span className="font-semibold text-xs text-gray-800">VDR NO:</span>
                                    <span className="border-b border-black w-28 h-5 inline-block"></span>
                                </div>
                            </div>

                            <div className="text-center font-bold text-xs uppercase tracking-wider">
                                (Amount in Rs.)
                            </div>

                            {/* Main Challan Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-black text-[11px] text-black">
                                    <thead>
                                        <tr className="bg-gray-100 text-center">
                                            <th className="border border-black px-2 py-1 font-bold" rowSpan={2}>SLNO</th>
                                            <th className="border border-black px-2 py-1 font-bold text-left" rowSpan={2}>Particulars</th>
                                            <th className="border border-black px-2 py-1 font-bold" colSpan={3}>A/C NO.1</th>
                                            <th className="border border-black px-2 py-1 font-bold" rowSpan={2}>A/C NO.2</th>
                                            <th className="border border-black px-2 py-1 font-bold" rowSpan={2}>A/C NO.10</th>
                                            <th className="border border-black px-2 py-1 font-bold" rowSpan={2}>A/C NO.21</th>
                                            <th className="border border-black px-2 py-1 font-bold" rowSpan={2}>A/C NO.22</th>
                                            <th className="border border-black px-2 py-1 font-bold" rowSpan={2}>Total</th>
                                        </tr>
                                        <tr className="bg-gray-100 text-center">
                                            <th className="border border-black px-2 py-1 font-bold">Employees' Share</th>
                                            <th className="border border-black px-2 py-1 font-bold">Employer's Share</th>
                                            <th className="border border-black px-2 py-1 font-bold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Row 1 */}
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center font-medium">1</td>
                                            <td className="border border-black px-2 py-1 font-medium text-left">Contribution, Administrative / Inspection Charges</td>
                                            <td className="border border-black px-2 py-1 text-right">{epf.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{fpf.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right font-bold">{totalAc1.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{ac5.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{ac10.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{ac21.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{ac22.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right font-bold">{totalAc5_10_21_22.toFixed(2)}</td>
                                        </tr>
                                        {/* Row 2(a) */}
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center">2(a)</td>
                                            <td className="border border-black px-2 py-1 text-left">Interest Under Section 7Q</td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                        </tr>
                                        {/* Row 2(b) */}
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center">2(b)</td>
                                            <td className="border border-black px-2 py-1 text-left">Damages Under Section 14B</td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                        </tr>
                                        {/* Row 3 */}
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center">3</td>
                                            <td className="border border-black px-2 py-1 text-left">Miscellaneous payments</td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1"></td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-100 font-bold">
                                            <td className="border border-black px-2 py-1"></td>
                                            <td className="border border-black px-2 py-1 text-left">Total</td>
                                            <td className="border border-black px-2 py-1 text-right">{epf.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{fpf.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{totalAc1.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{ac5.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{ac10.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{ac21.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{ac22.toFixed(2)}</td>
                                            <td className="border border-black px-2 py-1 text-right">{totalAc5_10_21_22.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Mode of Payment & Deposit Details Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs pt-4 border-t border-black">
                                {/* Left Column: Mode of Payment and Institution Details */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <span className="font-bold block uppercase text-xs tracking-wider">Mode of payment(Tick)</span>
                                        <div className="flex items-center justify-between border border-black p-2 bg-gray-50">
                                            {(['Cheque', 'Cash', 'DD', 'Transfer'] as const).map((mode) => (
                                                <div
                                                    key={mode}
                                                    className="flex items-center gap-1.5"
                                                >
                                                    <span className="text-[11px] font-semibold text-gray-800">{mode}</span>
                                                    <div className="w-4 h-4 border border-gray-600 flex items-center justify-center bg-white text-black"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <span className="w-44 font-semibold text-xs text-gray-700">Name of the Establishment:</span>
                                            <span className="flex-1 font-bold text-xs border-b border-black pb-0.5">{instName}</span>
                                        </div>

                                        <div className="flex items-start">
                                            <span className="w-44 font-semibold text-xs text-gray-700">Address:</span>
                                            <span className="flex-1 font-bold text-xs border-b border-black pb-0.5 leading-tight">{CurrentInstuteAddress}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="w-44 font-semibold text-xs text-gray-700">Pincode:</span>
                                            <div className="flex">
                                                {pincodeArray.map((char, idx) => (
                                                    <CharBox key={idx} char={char} />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-end w-full h-8">
                                            <span className="w-44 font-semibold text-xs text-gray-700 pb-1">Name of the Depositor:</span>
                                            <div className="flex-1 border-b border-black h-6"></div>
                                        </div>

                                        <div className="flex items-end w-full h-8">
                                            <span className="w-44 font-semibold text-xs text-gray-700 pb-1">Signature of the Depositor:</span>
                                            <div className="flex-1 border-b border-black h-6"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Deposit & Cheque details */}
                                <div className="space-y-3">
                                    {/* Date of the Deposit */}
                                    <div className="flex items-center gap-3">
                                        <span className="w-48 font-semibold text-xs text-gray-700">Date of the Deposit:</span>
                                        <StaticDateBoxes />
                                    </div>

                                    {/* Cheque/DD No */}
                                    <div className="flex items-center gap-3">
                                        <span className="w-48 font-semibold text-xs text-gray-700">Cheque/DD No.:</span>
                                        <CharBoxes value="" length={13} />
                                    </div>

                                    {/* Cheque DD / Date */}
                                    <div className="flex items-center gap-3">
                                        <span className="w-48 font-semibold text-xs text-gray-700">Cheque DD/ Date:</span>
                                        <StaticDateBoxes />
                                    </div>

                                    <div className="flex items-end w-full h-8">
                                        <span className="w-48 font-semibold text-xs text-gray-700 pb-1">Amount Received (Rs.):</span>
                                        <div className="flex-1 border-b border-black h-6"></div>
                                    </div>

                                    <div className="flex items-end w-full h-8">
                                        <span className="w-48 font-semibold text-xs text-gray-700 pb-1">Deposit Bank Code :</span>
                                        <div className="flex-1 border-b border-black h-6"></div>
                                    </div>

                                    <div className="flex items-end w-full h-8">
                                        <span className="w-48 font-semibold text-xs text-gray-700 pb-1">Deposit Branch Name :</span>
                                        <div className="flex-1 border-b border-black h-6"></div>
                                    </div>

                                    <div className="flex items-start w-full mt-2">
                                        <span className="w-48 font-semibold text-xs text-gray-700 pt-1">Bank Name (on Cheque/DD drawn):</span>
                                        <div className="flex-1 border-b border-black min-h-[3rem]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Employer Instructions */}
                            <div className="pt-4 border-t border-black text-[11px]">
                                <h4 className="font-bold text-xs uppercase mb-1">Instructions to the employer</h4>
                                <ul className="list-disc pl-5 space-y-0.5 text-gray-800 leading-relaxed font-medium">
                                    <li>Use separate challan for each month.</li>
                                    <li>Write legibly without any overwriting / correction / erasures.</li>
                                    <li>Include Interest U/S 7Q for all belated remittances.</li>
                                    <li>Pay the dues through local cheque only.</li>
                                </ul>
                            </div>

                            {/* Bank filling section (to be filled by the bank) */}
                            <div className="border border-black p-4 space-y-4 text-xs bg-gray-50/50 print:bg-transparent">
                                <div className="text-center font-bold text-xs uppercase tracking-wider border-b border-black pb-2">
                                    (to be filled by the bank)
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-xs text-gray-700 w-36">Challan Reference No.</span>
                                    <CharBoxes value="" length={15} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                    {/* Date of Presentation */}
                                    <div className="space-y-1">
                                        <div className="flex justify-end pr-4">
                                            <StaticDateBoxes showLabels={true} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-xs text-gray-700">Date of Presentation</span>
                                            <StaticDateBoxes />
                                        </div>
                                    </div>

                                    {/* Date of Realisation */}
                                    <div className="space-y-1">
                                        <div className="flex justify-end pr-4">
                                            <StaticDateBoxes showLabels={true} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-xs text-gray-700">Date of Realisation</span>
                                            <StaticDateBoxes />
                                        </div>
                                    </div>

                                    {/* Date of Credit */}
                                    <div className="space-y-1">
                                        <div className="flex justify-end pr-4">
                                            <StaticDateBoxes showLabels={true} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-xs text-gray-700">Date of Credit</span>
                                            <StaticDateBoxes />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
