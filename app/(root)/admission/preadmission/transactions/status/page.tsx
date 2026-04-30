'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useActivePreadmissionDetails } from '@/hooks/admission/preadmission/useTransactions';
import { useStatusInitialData, useSearchStatusData, useSaveStatusData, useForgotOTP, useVerifyOTP } from '@/hooks/admission/preadmission/useStatus';
import type { IStatusStudent } from '@/types/admission/preadmission/status';
import { format } from 'date-fns';
import { Calendar, FileDown, Printer, Search, X, CheckSquare, RefreshCw, Book } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getStatusColumns } from './_components/columns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useReactToPrint } from 'react-to-print';
import StatusPrintView from './_components/status-print-view';
import AddressBookView from './_components/address-book-view';
import * as XLSX from 'xlsx';

export default function PreadmissionStatusPage() {
    const { data: activePreadmission } = useActivePreadmissionDetails();
    const { data: initialData, isLoading: initialLoading } = useStatusInitialData();
    const searchMutation = useSearchStatusData();
    const saveMutation = useSaveStatusData();
    const forgotOTPMutation = useForgotOTP();
    const verifyOTPMutation = useVerifyOTP();

    // Form State
    const [statusType, setStatusType] = useState('Appsts');
    const [asmayId, setAsmayId] = useState<number>(0);
    const [asmclId, setAsmclId] = useState<number>(0);
    const [pamstId, setPamstId] = useState<number>(0);
    
    // Grid State
    const [studentList, setStudentList] = useState<IStatusStudent[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<IStatusStudent[]>([]);
    const [bulkStudentStatus, setBulkStudentStatus] = useState<string>('786');
    const [globalSearch, setGlobalSearch] = useState('');
    const [rptStatus, setRptStatus] = useState(false);

    // Communication State
    const [sendEmail, setSendEmail] = useState(false);
    const [sendSms, setSendSms] = useState(false);
    const [sendDefault, setSendDefault] = useState(false);
    
    const [emailSubject, setEmailSubject] = useState('');
    const [emailHeader, setEmailHeader] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [emailFooter, setEmailFooter] = useState('');
    const [smsContent, setSmsContent] = useState('');

    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [otpType, setOtpType] = useState('Appsts'); // M or E
    const [otpValue, setOtpValue] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpRequired, setOtpRequired] = useState(false);
    const [maskedMobile, setMaskedMobile] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');

    const tableRef = useRef<DataTableRef>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const addressBookRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
    });

    const handleAddressBookPrint = useReactToPrint({
        contentRef: addressBookRef,
    });

    const handleExportExcel = () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select records to be exported');
            return;
        }

        const exportData = selectedStudents.map((user, index) => ({
            'SL.No': index + 1,
            'Name': user.name,
            'Class': user.className,
            'RegNo': user.pasR_RegistrationNo,
            'Status': user.statusName,
            'Father Name': user.pasR_FatherName,
            'Mobile No.': user.pasR_MobileNo,
            'Email': user.pasR_emailId,
            'Address': `${user.pasR_ConStreet || ''} ${user.pasR_ConArea || ''} ${user.pasR_ConCity || ''} ${user.pasR_ConPincode || ''}`.trim()
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Status Report');
        XLSX.writeFile(wb, 'Status_Report.xlsx');
    };

    // Initialize from active preadmission
    useEffect(() => {
        if (activePreadmission?.data) {
            setAsmayId(activePreadmission.data.asmaY_Id);
        }
    }, [activePreadmission]);

    // Config for OTP from localStorage (simulating AngularJS behavior)
    useEffect(() => {
        const config = localStorage.getItem('ivrmgeneralconfiglist');
        if (config) {
            const parsed = JSON.parse(config);
            if (parsed && parsed.length > 0) {
                const c = parsed[0];
                setOtpRequired(c.ivrmgC_emailValOTPFlag === 1 || c.ivrmgC_MobileValOTPFlag === 1);
                
                if (c.ivrmgC_OTPMobileNo) {
                    const mob = String(c.ivrmgC_OTPMobileNo);
                    setMaskedMobile(mob.substring(mob.length - 4));
                }
                if (c.ivrmgC_OTPMailId) {
                    setMaskedEmail(c.ivrmgC_OTPMailId.substring(0, 4));
                }
            }
        }
    }, []);

    const statusOptions: { pamsT_Id: number; pamsT_Status: string }[] = useMemo(() => {
        if (statusType === 'Appsts') {
            return [
                { pamsT_Id: 787926, pamsT_Status: 'APP WAITING' },
                { pamsT_Id: 787927, pamsT_Status: 'APP REJECTED' },
                { pamsT_Id: 787928, pamsT_Status: 'APP ACCEPTED' }
            ];
        }
        return initialData?.data?.statuslist || [];
    }, [statusType, initialData]);

    const handleSearch = async () => {
        if (!asmayId) {
            toast.error('Please select Academic Year');
            return;
        }

        const payload = {
            ASMAY_Id: asmayId,
            ASMCL_Id: asmclId,
            PAMST_Id: pamstId,
            status_type: statusType
        };

        try {
            const response = await searchMutation.mutateAsync(payload);
            if (response?.data?.studentlist) {
                const list = response.data.studentlist.map((s: any) => ({
                    ...s,
                    name: `${s.pasR_FirstName || ''} ${s.pasR_MiddleName || ''} ${s.pasR_LastName || ''}`.trim(),
                    selected: false,
                    remarks: ''
                }));
                setStudentList(list);
                if (list.length === 0) {
                    toast.info('No records found');
                }
            } else {
                toast.error('Failed to fetch student list');
            }
        } catch (error) {
            toast.error('An error occurred during search');
        }
    };

    const handleBulkStatusChange = (val: string) => {
        setBulkStudentStatus(val);
        if (val !== '786') {
            const newList = studentList.map(s => {
                const isSelected = selectedStudents.some(sel => sel.pasR_Id === s.pasR_Id);
                if (isSelected) {
                    return { ...s, pamsT_Id: Number(val) };
                }
                return s;
            });
            setStudentList(newList);
        }
    };

    const handleIndividualStatusChange = (studentId: number, statusId: number) => {
        setStudentList(prev => prev.map(s => s.pasR_Id === studentId ? { ...s, pamsT_Id: statusId } : s));
    };

    const handleIndividualRemarkChange = (studentId: number, remark: string) => {
        setStudentList(prev => prev.map(s => s.pasR_Id === studentId ? { ...s, remarks: remark } : s));
    };

    const handleUpdateStatus = () => {
        if (selectedStudents.length === 0) {
            toast.error('Kindly select at least one student');
            return;
        }

        if (otpRequired && (sendEmail || sendSms || sendDefault)) {
            setShowOtpModal(true);
        } else {
            setShowConfirmModal(true);
        }
    };

    const handleFinalSave = async () => {
        const payload = {
            data_array: selectedStudents.map(s => ({
                ...s,
                pamsT_Id: studentList.find(sl => sl.pasR_Id === s.pasR_Id)?.pamsT_Id || s.pamsT_Id,
                remarks: studentList.find(sl => sl.pasR_Id === s.pasR_Id)?.remarks || ''
            })),
            _type: statusType,
            smscontent: smsContent,
            header: emailHeader,
            Subject: emailSubject,
            Message: emailMessage,
            Footer: emailFooter,
            smscheck: sendSms,
            emailcheck: sendEmail,
            defaultsmsemail: sendDefault
        };

        try {
            await saveMutation.mutateAsync(payload);
            toast.success('Status updated successfully');
            setShowConfirmModal(false);
            handleSearch(); // Refresh grid
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleSendOtp = async () => {
        try {
            await forgotOTPMutation.mutateAsync({
                clickedlinkname: otpType === 'M' ? 'Mobile' : 'Email',
                Mobile: '', // Backend should use configured mobile
                Email: ''   // Backend should use configured email
            });
            setShowOtpModal(false);
            setShowConfirmModal(true); // Confirmation modal has OTP input in AngularJS code
        } catch (error) {
            toast.error('Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await verifyOTPMutation.mutateAsync({ EMAILOTP: otpValue });
            if (res?.data === 'Success') {
                setOtpVerified(true);
                toast.success('OTP verified');
            } else {
                toast.error('OTP mismatch');
            }
        } catch (error) {
            toast.error('OTP verification failed');
        }
    };

    const columns = useMemo(() => {
        const allColumns = getStatusColumns(
            statusOptions, 
            handleIndividualStatusChange, 
            handleIndividualRemarkChange, 
            bulkStudentStatus, 
            rptStatus
        );

        return allColumns.filter(col => {
            if (col.id === 'updateStatus' && rptStatus) return false;
            if ((col as any).accessorKey === 'repeat_Class_Id' && !rptStatus) return false;
            return true;
        });
    }, [statusOptions, bulkStudentStatus, rptStatus]);

    return (
        <div className='flex flex-col gap-6 p-4'>
            {/* Active Preadmission Header */}
            {activePreadmission?.data && (
                <div className='flex flex-wrap items-center justify-between gap-6 rounded-lg border bg-muted/50 p-4 shadow-sm'>
                    <div className='flex items-center gap-3'>
                        <div className='rounded-full bg-primary/10 p-2'>
                            <Calendar className='h-5 w-5 text-primary' />
                        </div>
                        <div>
                            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Active Academic Year</p>
                            <p className='text-lg font-bold text-foreground'>{activePreadmission.data.asmaY_Year}</p>
                        </div>
                    </div>
                    <div className='flex gap-8'>
                        <div className='flex flex-col'>
                            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Start Date</p>
                            <p className='font-semibold'>{format(new Date(activePreadmission.data.asmaY_PreAdm_F_Date), 'dd-MM-yyyy')}</p>
                        </div>
                        <div className='flex flex-col border-l pl-8'>
                            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>End Date</p>
                            <p className='font-semibold'>{format(new Date(activePreadmission.data.asmaY_PreAdm_T_Date), 'dd-MM-yyyy')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Section */}
            <CollapsibleSection title="Preadmission Status Search" defaultOpen>
                <div className="flex flex-col gap-6">
                    {/* Status Type */}
                    <div className="flex justify-center mb-2">
                        <div className="flex gap-8 rounded-full border bg-muted/30 px-8 py-3 shadow-inner">
                            <RadioGroup value={statusType} onValueChange={(v) => { setStatusType(v); setStudentList([]); }} className="flex gap-10">
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="Appsts" id="appsts" className="h-5 w-5 border-2 border-primary" />
                                    <Label htmlFor="appsts" className="font-bold text-base cursor-pointer">Application Status</Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="admsts" id="admsts" className="h-5 w-5 border-2 border-primary" />
                                    <Label htmlFor="admsts" className="font-bold text-base cursor-pointer">Admission Status</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-2xl space-y-4 rounded-xl border bg-background p-8 shadow-sm">
                        {/* Academic Year */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label className="text-right font-semibold">Academic Year <span className="text-destructive">*</span></Label>
                            <div className="col-span-2">
                                <Select value={String(asmayId)} onValueChange={(v) => setAsmayId(Number(v))}>
                                    <SelectTrigger className="bg-muted/10">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialData?.data?.academicList?.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>{y.asmaY_Year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Class */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label className="text-right font-semibold">Class <span className="text-destructive">*</span></Label>
                            <div className="col-span-2">
                                <Select value={String(asmclId)} onValueChange={(v) => setAsmclId(Number(v))}>
                                    <SelectTrigger className="bg-muted/10">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">ALL</SelectItem>
                                        {initialData?.data?.classlist?.map((c: any) => (
                                            <SelectItem key={c.asmcl_Id} value={String(c.asmcl_Id)}>{c.asmcL_ClassName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label className="text-right font-semibold">Status <span className="text-destructive">*</span></Label>
                            <div className="col-span-2">
                                <Select value={String(pamstId)} onValueChange={(v) => setPamstId(Number(v))}>
                                    <SelectTrigger className="bg-muted/10">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Select</SelectItem>
                                        {statusOptions.map((s: any) => (
                                            <SelectItem key={s.pamsT_Id} value={String(s.pamsT_Id)}>{s.pamsT_Status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 pt-6">
                            <Button onClick={handleSearch} disabled={searchMutation.isPending} className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-8 uppercase shadow-md transition-all active:scale-95">
                                <Search className="mr-2 h-4 w-4" /> Search
                            </Button>
                            <Button variant="destructive" onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 uppercase shadow-md transition-all active:scale-95">
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Post-Search Actions (Export/Print) */}
            {studentList.length > 0 && (
                <div className="flex justify-center gap-4 rounded-lg border bg-muted/20 p-4 shadow-sm">
                    <Button variant="secondary" onClick={handleExportExcel} disabled={selectedStudents.length === 0} className="font-bold border-indigo-200 hover:bg-indigo-50">
                        <FileDown className="mr-2 h-4 w-4" /> Export to Excel
                    </Button>
                    <Button variant="secondary" onClick={() => handlePrint()} disabled={selectedStudents.length === 0} className="font-bold border-indigo-200 hover:bg-indigo-50">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Button variant="secondary" onClick={() => handleAddressBookPrint()} disabled={selectedStudents.length === 0} className="font-bold border-indigo-200 hover:bg-indigo-50">
                        <Book className="mr-2 h-4 w-4" /> Address Book
                    </Button>
                </div>
            )}

            {/* Results Section */}
            {studentList.length > 0 && (
                <CollapsibleSection title="Status Details" defaultOpen>
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs text-muted-foreground">Total Grid Records</Label>
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                                    {studentList.length}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Update Status All</Label>
                            <Select value={bulkStudentStatus} onValueChange={handleBulkStatusChange}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="786">None</SelectItem>
                                    {statusOptions.map((s: any) => (
                                        <SelectItem key={s.pamsT_Id} value={String(s.pamsT_Id)}>{s.pamsT_Status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[300px]">
                            <Input 
                                placeholder="Search here..." 
                                value={globalSearch} 
                                onChange={(e) => setGlobalSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <GenericDataTable<IStatusStudent>
                        columns={columns}
                        data={studentList.filter(s => 
                            s.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
                            s.pasR_RegistrationNo.toLowerCase().includes(globalSearch.toLowerCase())
                        )}
                        isLoading={searchMutation.isPending}
                        onRowSelectionChange={setSelectedStudents}
                        ref={tableRef}
                        isSearchRequired={false}
                    />

                    {/* Communication Config */}
                    <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex justify-center gap-8 mb-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="email" checked={sendEmail} onCheckedChange={(v) => { setSendEmail(!!v); if (v) setSendDefault(false); }} />
                                <Label htmlFor="email" className="font-bold cursor-pointer">EMAIL</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="sms" checked={sendSms} onCheckedChange={(v) => { setSendSms(!!v); if (v) setSendDefault(false); }} />
                                <Label htmlFor="sms" className="font-bold cursor-pointer">SMS</Label>
                            </div>
                            {statusType === 'admsts' && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="default" checked={sendDefault} onCheckedChange={(v) => { setSendDefault(!!v); if (v) { setSendEmail(false); setSendSms(false); } }} />
                                    <Label htmlFor="default" className="font-bold cursor-pointer">Default SMS & E-mail (Confirmed Status)</Label>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Email Form */}
                            {sendEmail && (
                                <div className="space-y-4 border-r pr-4">
                                    <h4 className="font-bold border-b pb-2">Email Configuration</h4>
                                    <div className="flex flex-col gap-2">
                                        <Label>Email Subject <span className="text-destructive">*</span></Label>
                                        <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Subject" maxLength={50} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Email Header <span className="text-destructive">*</span></Label>
                                        <Input value={emailHeader} onChange={(e) => setEmailHeader(e.target.value)} placeholder="Header" maxLength={50} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Email Message <span className="text-destructive">*</span></Label>
                                        <Textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Type your message..." />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Email Footer <span className="text-destructive">*</span></Label>
                                        <Input value={emailFooter} onChange={(e) => setEmailFooter(e.target.value)} placeholder="Footer" maxLength={50} />
                                    </div>
                                </div>
                            )}

                            {/* SMS Form */}
                            {sendSms && (
                                <div className="space-y-4">
                                    <h4 className="font-bold border-b pb-2">SMS Configuration</h4>
                                    <div className="flex flex-col gap-2">
                                        <Label>SMS Content <span className="text-destructive">*</span></Label>
                                        <Textarea value={smsContent} onChange={(e) => setSmsContent(e.target.value)} placeholder="Type SMS content..." rows={5} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-center">
                            <Button size="lg" className="h-12 px-8" onClick={handleUpdateStatus}>
                                <CheckSquare className="mr-2 h-5 w-5" /> Update Status
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}

            {/* OTP Selection Modal */}
            <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center text-destructive">OTP Selection</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 text-center">
                        <RadioGroup value={otpType} onValueChange={setOtpType} className="flex justify-center gap-8 mb-6">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="M" id="otp-m" />
                                <Label htmlFor="otp-m">Mobile OTP</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="E" id="otp-e" />
                                <Label htmlFor="otp-e">Email OTP</Label>
                            </div>
                        </RadioGroup>

                        {otpType === 'M' ? (
                            <div className="space-y-2">
                                <p className="text-destructive font-bold uppercase tracking-tight">OTP will be sent to Authorized Mobile No!!</p>
                                <p className="text-xl font-mono">******{maskedMobile}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-destructive font-bold uppercase tracking-tight">OTP will be sent to Authorized Email Id!!</p>
                                <p className="text-xl font-mono lowercase">{maskedEmail}******</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="justify-center sm:justify-center">
                        <Button onClick={handleSendOtp}>SEND OTP</Button>
                        <Button variant="outline" onClick={() => setShowOtpModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation & Selected Students Modal */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="text-center text-destructive">Selected Students for Status Update</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-auto py-4">
                        <table className="w-full border-collapse border text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="border p-2">SL.NO</th>
                                    <th className="border p-2 text-left">Name</th>
                                    <th className="border p-2 text-left">Class Name</th>
                                    <th className="border p-2">Application No</th>
                                    <th className="border p-2">Gender</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedStudents.map((s: any, i) => (
                                    <tr key={s.pasR_Id}>
                                        <td className="border p-2 text-center">{i + 1}</td>
                                        <td className="border p-2">{s.name}</td>
                                        <td className="border p-2">{s.className}</td>
                                        <td className="border p-2 text-center">{s.pasR_RegistrationNo}</td>
                                        <td className="border p-2 text-center">{s.pasR_Sex}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-4 py-4 border-t">
                        {(sendEmail || sendSms) && (
                            <div className="space-y-2 bg-muted/30 p-4 rounded-lg text-sm">
                                {sendSms && (
                                    <div className="grid grid-cols-4 gap-4">
                                        <span className="font-bold text-right">SMS Content:</span>
                                        <span className="col-span-3">{smsContent}</span>
                                    </div>
                                )}
                                {sendEmail && (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-4 gap-4">
                                            <span className="font-bold text-right">Email Subject:</span>
                                            <span className="col-span-3">{emailSubject}</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4">
                                            <span className="font-bold text-right">Email Header:</span>
                                            <span className="col-span-3">{emailHeader}</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4">
                                            <span className="font-bold text-right">Email Message:</span>
                                            <span className="col-span-3 whitespace-pre-wrap">{emailMessage}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {otpRequired && (sendEmail || sendSms || sendDefault) && !otpVerified && (
                            <div className="flex items-center justify-center gap-4 py-4 border-y bg-primary/5">
                                <Label className="font-bold">Enter OTP:</Label>
                                <Input 
                                    type="password" 
                                    className="w-48 text-center tracking-widest" 
                                    placeholder="ENTER OTP"
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value)}
                                />
                                <Button size="sm" onClick={handleVerifyOtp}>Submit</Button>
                                <Button size="sm" variant="outline" onClick={() => { setShowConfirmModal(false); setShowOtpModal(true); }}>Resend OTP</Button>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="justify-center sm:justify-center">
                        <Button 
                            disabled={otpRequired && (sendEmail || sendSms || sendDefault) && !otpVerified} 
                            onClick={handleFinalSave}
                        >
                            Update Status
                        </Button>
                        <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hidden Printable Views */}
            <div className="hidden">
                <StatusPrintView ref={printRef} data={selectedStudents} userName={localStorage.getItem('username') || ''} />
                <AddressBookView ref={addressBookRef} data={selectedStudents} />
            </div>
        </div>
    );
}
