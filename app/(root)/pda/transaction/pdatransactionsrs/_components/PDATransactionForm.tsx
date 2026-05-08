'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Calendar as CalendarIcon,
    Plus,
    Trash2,
    Save,
    XCircle,
    Check,
    ChevronsUpDown,
    Search
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { toast } from 'sonner';
import {
    searchStudents,
    getStudentDetails,
    getSections,
    getStudentsByClassSection,
    savePDATransaction,
    saveAndUpdatePDATransaction
} from '@/server/pda/transaction/pdatransactionsrs';
import type {
    IPDATransactionHead,
    IPDATransactionStudent
} from '@/types/pda/transaction/pdatransactionsrs';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface PDATransactionFormProps {
    academicYears: { asmaY_Id: number; asmaY_Year: string }[];
    classes: { asmcL_Id: number; asmcL_ClassName: string }[];
    heads: IPDATransactionHead[];
    initialStudents: IPDATransactionStudent[];
    onSuccess: () => void;
    editData?: any;
}

export default function PDATransactionForm({
    academicYears,
    classes,
    heads,
    initialStudents,
    onSuccess,
    editData
}: PDATransactionFormProps) {
    const [filterData, setFilterData] = useState<'indivstd' | 'multiplestd' | 'multipleallstd'>('indivstd');
    const [studentFilter, setStudentFilter] = useState<'NameAdmno' | 'AdmNo' | 'regno' | 'Admnoname' | 'NameRegNo' | 'RegNoName' | 'left' | 'inactive'>('NameAdmno');

    const [selectedAsmayId, setSelectedAsmayId] = useState<string>('');
    const [selectedAmstId, setSelectedAmstId] = useState<string>('');
    const [transactionDate, setTransactionDate] = useState<Date>(new Date());
    const [trnType, setTrnType] = useState<'Debit' | 'Credit' | 'Cash'>('Debit');
    const [voucherNo, setVoucherNo] = useState('');

    const [students, setStudents] = useState<IPDATransactionStudent[]>(initialStudents);
    const [searchStudentList, setSearchStudentList] = useState('');
    const [studentSearchOpen, setStudentSearchOpen] = useState(false);
    const [selectedStudentInfo, setSelectedStudentInfo] = useState<any>(null);

    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [bulkStudents, setBulkStudents] = useState<any[]>([]);
    const [allSelected, setAllSelected] = useState(false);

    const [singleStudentRows, setSingleStudentRows] = useState<any[]>([
        { pdamH_Id: '', PDAEH_Amount: '', PDAE_Remarks: '' }
    ]);

    const [bulkCommon, setBulkCommon] = useState({
        headId: '',
        amount: '',
        remarks: '',
        voucher: ''
    });

    const [bulkApplyFlags, setBulkApplyFlags] = useState({
        head: false,
        amount: false,
        remarks: false,
        voucher: false
    });

    const isEdit = !!editData;

    useEffect(() => {
        if (!isEdit) {
            setSelectedAmstId('');
            setSelectedStudentInfo(null);
            setStudents([]);
        }
    }, [studentFilter, filterData]);

    useEffect(() => {
        if (editData) {
            setFilterData('indivstd');
            setSelectedAsmayId(editData.asmay_Id?.toString() || '');
            setVoucherNo(editData.voucher_No || '');
            setTransactionDate(new Date(editData.pdaE_Date));
            setTrnType(editData.pdaR_ModeOfPayment || 'Debit');
            setSelectedStudentInfo(editData.studentInfo);
            setSelectedAmstId(editData.amst_Id?.toString() || '');
            setSingleStudentRows(editData.rows || []);
        }
    }, [editData]);

    const handleStudentSearch = async (query: string) => {
        let minLength = 2;
        if (studentFilter === 'regno') minLength = 6;
        else if (['AdmNo', 'Admnoname', 'RegNoName'].includes(studentFilter)) minLength = 4;
        else if (['NameAdmno', 'NameRegNo', 'left'].includes(studentFilter)) minLength = 3;

        if (query.length < minLength) return;

        try {
            const response = await searchStudents({
                filterinitialdata: studentFilter,
                searchfilter: query,
                ASMAY_ID: Number(selectedAsmayId)
            });
            if (response.success && response.data?.fillstudent?.$values) {
                setStudents(response.data.fillstudent.$values);
            }
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    const handleStudentSelect = async (amstId: string) => {
        setSelectedAmstId(amstId);
        setStudentSearchOpen(false);
        try {
            const response = await getStudentDetails({
                Amst_Id: Number(amstId),
                ASMAY_ID: Number(selectedAsmayId)
            });
            if (response.success && response.data?.fillstudent?.$values?.[0]) {
                setSelectedStudentInfo(response.data.fillstudent.$values[0]);
            }
        } catch (error) {
            console.error('Fetch student details failed', error);
        }
    };

    const handleClassToggle = async (classId: number) => {
        const newSelected = selectedClasses.includes(classId)
            ? selectedClasses.filter(id => id !== classId)
            : [...selectedClasses, classId];

        setSelectedClasses(newSelected);

        if (newSelected.length > 0) {
            try {
                const response = await getSections({
                    ASMAY_Id: Number(selectedAsmayId),
                    classlsttwo: newSelected.map(id => ({ ASMCL_Id: id }))
                });
                if (response.success && response.data?.sectionlist?.$values) {
                    setSections(response.data.sectionlist.$values);
                }
            } catch (error) {
                console.error('Fetch sections failed', error);
            }
        } else {
            setSections([]);
            setSelectedSections([]);
        }
    };

    const handleSectionToggle = async (sectionId: number) => {
        const newSelected = selectedSections.includes(sectionId)
            ? selectedSections.filter(id => id !== sectionId)
            : [...selectedSections, sectionId];

        setSelectedSections(newSelected);

        if (newSelected.length > 0) {
            try {
                const response = await getStudentsByClassSection({
                    ASMAY_Id: Number(selectedAsmayId),
                    classlsttwo: selectedClasses.map(id => ({ ASMCL_Id: id })),
                    sectionlistarray: newSelected.map(id => ({ AMSC_Id: id }))
                });
                if (response.success && response.data?.admsudentslist?.$values) {
                    const mapped = response.data.admsudentslist.$values.map((s: any) => ({
                        ...s,
                        isSelected: false,
                        pdamH_Id: '',
                        PDAEH_Amount: '',
                        PDAE_Remarks: '',
                        voucher_No: ''
                    }));
                    setBulkStudents(mapped);
                }
            } catch (error) {
                console.error('Fetch students failed', error);
            }
        } else {
            setBulkStudents([]);
        }
    };

    const handleAddRow = () => {
        setSingleStudentRows([...singleStudentRows, { pdamH_Id: '', PDAEH_Amount: '', PDAE_Remarks: '' }]);
    };

    const handleRemoveRow = (index: number) => {
        const newRows = [...singleStudentRows];
        newRows.splice(index, 1);
        setSingleStudentRows(newRows);
    };

    const handleBulkApply = () => {
        setBulkStudents(prev => prev.map(s => {
            if (!s.isSelected) return s;
            return {
                ...s,
                pdamH_Id: bulkApplyFlags.head ? bulkCommon.headId : s.pdamH_Id,
                PDAEH_Amount: bulkApplyFlags.amount ? bulkCommon.amount : s.PDAEH_Amount,
                PDAE_Remarks: bulkApplyFlags.remarks ? bulkCommon.remarks : s.PDAE_Remarks,
                voucher_No: bulkApplyFlags.voucher ? bulkCommon.voucher : s.voucher_No
            };
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAsmayId) {
            toast.error('Please select Academic Year');
            return;
        }

        try {
            let response;
            if (isEdit) {
                const data = {
                    ASMAY_Id: Number(selectedAsmayId),
                    PDAE_ID: editData.pdae_id,
                    savetmpdata: singleStudentRows.map(r => ({
                        PDAE_ID: editData.pdae_id,
                        pdaeH_Id: r.pdaeH_Id,
                        PDAMH_Id: Number(r.pdamH_Id),
                        PDAEH_Amount: Number(r.PDAEH_Amount),
                        PDAE_Remarks: r.PDAE_Remarks
                    })),
                    Amst_Id: Number(selectedAmstId),
                    amount: singleStudentRows.reduce((sum, r) => sum + Number(r.PDAEH_Amount || 0), 0),
                    PDAE_Date: format(transactionDate, 'yyyy-MM-dd'),
                    PDAR_ModeOfPayment: trnType,
                    voucherno: voucherNo
                };
                response = await saveAndUpdatePDATransaction(data);
            } else {
                let data: any = {
                    ASMAY_Id: Number(selectedAsmayId),
                    PDAE_Date: format(transactionDate, 'yyyy-MM-dd'),
                    type: filterData,
                    PDAR_ModeOfPayment: trnType,
                    voucherno: voucherNo
                };

                if (filterData === 'indivstd') {
                    if (!selectedAmstId) return toast.error('Select Student');
                    data.Amst_Id = Number(selectedAmstId);
                    data.savetmpdata = singleStudentRows.map(r => ({
                        pdamH_Id: Number(r.pdamH_Id),
                        PDAEH_Amount: Number(r.PDAEH_Amount),
                        PDAE_Remarks: r.PDAE_Remarks
                    }));
                    data.amount = singleStudentRows.reduce((sum, r) => sum + Number(r.PDAEH_Amount || 0), 0);
                } else if (filterData === 'multiplestd') {
                    const selected = bulkStudents.filter(s => s.isSelected);
                    if (selected.length === 0) return toast.error('Select at least one student');
                    data.savetmpdata = selected.map(s => ({
                        ...s,
                        pdamH_Id: Number(s.pdamH_Id),
                        PDAEH_Amount: Number(s.PDAEH_Amount)
                    }));
                    data.amount = selected.reduce((sum, s) => sum + Number(s.PDAEH_Amount || 0), 0);
                } else if (filterData === 'multipleallstd') {
                    const selected = students.filter(s => s.selected);
                    if (selected.length === 0) return toast.error('Select at least one student');

                    data.studentlistarray = selected.map(s => ({ Amst_Id: s.amst_Id }));
                    data.savetmpdata = singleStudentRows.map(r => ({
                        pdamH_Id: Number(r.pdamH_Id),
                        PDAEH_Amount: Number(r.PDAEH_Amount),
                        PDAE_Remarks: r.PDAE_Remarks
                    }));
                    data.amount = singleStudentRows.reduce((sum, r) => sum + Number(r.PDAEH_Amount || 0), 0);
                }

                response = await savePDATransaction(data);
            }

            if (response.success) {
                toast.success('Transaction saved successfully');
                onSuccess();
            } else {
                toast.error(response.message || 'Failed to save');
            }
        } catch (error) {
            console.error('Save failed', error);
            toast.error('An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            {/* Mode Selection */}
            <div className="flex justify-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <RadioGroup
                    value={filterData}
                    onValueChange={(val) => setFilterData(val as any)}
                    className="flex flex-wrap gap-8"
                    disabled={isEdit}
                >
                    <div className="flex items-center space-x-2 group">
                        <RadioGroupItem value="indivstd" id="indivstd" className="border-primary text-primary" />
                        <Label htmlFor="indivstd" className="font-semibold cursor-pointer group-hover:text-primary transition-colors">Single Student</Label>
                    </div>
                    <div className="flex items-center space-x-2 group">
                        <RadioGroupItem value="multiplestd" id="multiplestd" className="border-primary text-primary" />
                        <Label htmlFor="multiplestd" className="font-semibold cursor-pointer group-hover:text-primary transition-colors">Multiple Students</Label>
                    </div>
                    <div className="flex items-center space-x-2 group">
                        <RadioGroupItem value="multipleallstd" id="multipleallstd" className="border-primary text-primary" />
                        <Label htmlFor="multipleallstd" className="font-semibold cursor-pointer group-hover:text-primary transition-colors">Multiple All Students</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column - Filters */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="border-none bg-gray-50/30">
                        <CardContent className="p-6 space-y-6">
                            {/* Left column now only has Date and Mode */}

                            {/* Date Picker */}
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-700">Transaction Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-11 justify-start text-left font-normal rounded-xl">
                                            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                            {transactionDate ? format(transactionDate, "PPP") : <span>Pick date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-xl">
                                        <Calendar mode="single" selected={transactionDate} onSelect={(d) => d && setTransactionDate(d)} />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Transaction Type */}
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-700">Transaction Mode</Label>
                                <RadioGroup value={trnType} onValueChange={(v) => setTrnType(v as any)} className="flex flex-col gap-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Debit" id="trn-debit" />
                                        <Label htmlFor="trn-debit" className="text-xs font-medium">Deduct from PDA (Debit)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Credit" id="trn-credit" />
                                        <Label htmlFor="trn-credit" className="text-xs font-medium">Credit</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Cash" id="trn-cash" />
                                        <Label htmlFor="trn-cash" className="text-xs font-medium">Cash</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Student Search Filters (Moved from Right Column) */}
                            {filterData === 'indivstd' && (
                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search Criteria</Label>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex flex-col gap-3">
                                            <RadioGroup value={studentFilter} onValueChange={(v) => setStudentFilter(v as any)} className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="regno" id="sf-regno" />
                                                    <Label htmlFor="sf-regno" className="text-xs font-medium cursor-pointer">Reg No.</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="AdmNo" id="sf-admno" />
                                                    <Label htmlFor="sf-admno" className="text-xs font-medium cursor-pointer">Adm No.</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="NameAdmno" id="sf-nameadm" />
                                                    <Label htmlFor="sf-nameadm" className="text-xs font-medium cursor-pointer">Name:Adm.No.</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Admnoname" id="sf-admname" />
                                                    <Label htmlFor="sf-admname" className="text-xs font-medium cursor-pointer">Adm.No.:Name</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="NameRegNo" id="sf-namereg" />
                                                    <Label htmlFor="sf-namereg" className="text-xs font-medium cursor-pointer">Name:Reg.No.</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="RegNoName" id="sf-regname" />
                                                    <Label htmlFor="sf-regname" className="text-xs font-medium cursor-pointer">Reg.No.:Name</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="left" id="sf-left" />
                                                    <Label htmlFor="sf-left" className="text-xs font-medium cursor-pointer">Left</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="inactive" id="sf-inactive" />
                                                    <Label htmlFor="sf-inactive" className="text-xs font-medium cursor-pointer">Deactivate</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Entry Form */}
                <div className="md:col-span-8 space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Academic Year <span className="text-red-500">*</span></Label>
                                    <Select value={selectedAsmayId} onValueChange={setSelectedAsmayId} disabled={isEdit}>
                                        <SelectTrigger className="h-11 rounded-xl">
                                            <SelectValue placeholder="Select Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map(y => (
                                                <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {filterData === 'indivstd' && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">
                                            {studentFilter === 'regno' ? 'Reg No.' :
                                                studentFilter === 'AdmNo' ? 'Adm No.' :
                                                    studentFilter === 'NameAdmno' ? 'Name:Adm.No.' :
                                                        studentFilter === 'Admnoname' ? 'Adm.No.:Name' :
                                                            studentFilter === 'NameRegNo' ? 'Name:Reg.No.' :
                                                                studentFilter === 'RegNoName' ? 'Reg.No.:Name' :
                                                                    studentFilter === 'left' ? 'Left Student' :
                                                                        studentFilter === 'inactive' ? 'Deactivated Student' : 'Student Name'}
                                            <span className="text-red-500"> *</span>
                                        </Label>
                                        <Popover open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={studentSearchOpen}
                                                    className="w-full h-11 justify-between rounded-xl"
                                                    disabled={isEdit || !selectedAsmayId}
                                                >
                                                    {selectedStudentInfo
                                                        ? `${selectedStudentInfo.amsT_FirstName} (${selectedStudentInfo.amsT_AdmNo})`
                                                        : "Search Student..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0 rounded-xl" align="start">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Type at least 2 chars..."
                                                        onValueChange={handleStudentSearch}
                                                    />
                                                    <CommandEmpty>No student found.</CommandEmpty>
                                                    <CommandGroup className="max-h-[300px] overflow-auto">
                                                        {students.map((student) => (
                                                            <CommandItem
                                                                key={student.amst_Id}
                                                                value={student.amst_Id.toString()}
                                                                onSelect={() => handleStudentSelect(student.amst_Id.toString())}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", selectedAmstId === student.amst_Id.toString() ? "opacity-100" : "opacity-0")} />
                                                                {student.amsT_FirstName} :: {student.amsT_AdmNo}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            </div>

                            {/* Bulk Mode Selectors */}
                            {filterData === 'multiplestd' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 border-t pt-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold">Select Classes</Label>
                                        <div className="h-32 overflow-auto border rounded-xl p-3 space-y-2 bg-gray-50/30">
                                            {classes.map(c => (
                                                <div key={c.asmcL_Id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`cls-${c.asmcL_Id}`}
                                                        checked={selectedClasses.includes(c.asmcL_Id)}
                                                        onCheckedChange={() => handleClassToggle(c.asmcL_Id)}
                                                    />
                                                    <Label htmlFor={`cls-${c.asmcL_Id}`} className="text-xs font-medium cursor-pointer">{c.asmcL_ClassName}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold">Select Sections</Label>
                                        <div className="h-32 overflow-auto border rounded-xl p-3 space-y-2 bg-gray-50/30">
                                            {sections.length > 0 ? sections.map(s => (
                                                <div key={s.AMSC_Id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`sec-${s.AMSC_Id}`}
                                                        checked={selectedSections.includes(s.AMSC_Id)}
                                                        onCheckedChange={() => handleSectionToggle(s.AMSC_Id)}
                                                    />
                                                    <Label htmlFor={`sec-${s.AMSC_Id}`} className="text-xs font-medium cursor-pointer">{s.asmc_sectionname}</Label>
                                                </div>
                                            )) : <p className="text-xs text-gray-400 italic">Select class first</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Multiple All Students Selector */}
                            {filterData === 'multipleallstd' && (
                                <div className="space-y-3 animate-in slide-in-from-top-2 border-t pt-6">
                                    <Label className="text-sm font-bold">Select Students</Label>
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search in student list..."
                                            value={searchStudentList}
                                            onChange={(e) => setSearchStudentList(e.target.value)}
                                            className="pl-9 h-10 rounded-xl bg-gray-50/50 border-gray-200"
                                        />
                                    </div>
                                    <div className="h-48 overflow-auto border rounded-xl p-4 space-y-2 bg-gray-50/30">
                                        <div className="flex items-center space-x-2 border-b pb-2 mb-2">
                                            <Checkbox
                                                id="select-all-students"
                                                checked={students.length > 0 && students.every(s => s.selected)}
                                                onCheckedChange={(v) => setStudents(prev => prev.map(s => ({ ...s, selected: !!v })))}
                                            />
                                            <Label htmlFor="select-all-students" className="text-sm font-bold cursor-pointer">Select All Students</Label>
                                        </div>
                                        {students
                                            .filter(s =>
                                                `${s.amsT_FirstName} ${s.amsT_LastName} ${s.amsT_AdmNo}`
                                                    .toLowerCase()
                                                    .includes(searchStudentList.toLowerCase())
                                            )
                                            .map((s, idx) => (
                                                <div key={s.amst_Id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`std-all-${s.amst_Id}`}
                                                        checked={!!s.selected}
                                                        onCheckedChange={(v) => {
                                                            setStudents(prev => prev.map(item =>
                                                                item.amst_Id === s.amst_Id ? { ...item, selected: !!v } : item
                                                            ));
                                                        }}
                                                    />
                                                    <Label htmlFor={`std-all-${s.amst_Id}`} className="text-xs font-medium cursor-pointer">
                                                        {s.amsT_AdmNo} :: {s.amsT_FirstName} {s.amsT_LastName}
                                                    </Label>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardContent className="p-8 space-y-8">

                            {/* Single Student Mode Rows OR Multiple All Student Mode Rows */}
                            {(filterData === 'indivstd' || filterData === 'multipleallstd') && (
                                <div className="space-y-4 animate-in slide-in-from-top-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end pb-4">
                                        <div className="space-y-2 max-w-xs">
                                            <Label className="text-sm font-bold">Voucher No.</Label>
                                            <Input
                                                value={voucherNo}
                                                onChange={(e) => setVoucherNo(e.target.value)}
                                                placeholder="Enter Voucher No"
                                                className="h-11 rounded-xl"
                                                disabled={isEdit}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-lg font-bold text-gray-80">Expenditure Details</h4>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleAddRow}
                                                className="group cursor-pointer select-none gap-2 duration-300 ease-linear active:scale-95 w-fit inline-flex items-center justify-center text-nowrap whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none text-secondary-foreground h-8 rounded-lg px-3 py-1 text-xs bg-primary hover:bg-primary/90 shadow transition-all"
                                            >
                                                <Plus className="mr-1 h-3 w-3" />Add
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="overflow-auto border rounded-2xl">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-bold w-12">#</th>
                                                    <th className="px-4 py-3 text-left font-bold">Expenditure Head</th>
                                                    <th className="px-4 py-3 text-left font-bold w-32">Amount</th>
                                                    <th className="px-4 py-3 text-left font-bold">Remarks</th>
                                                    <th className="px-4 py-3 text-center font-bold w-16">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {singleStudentRows.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-gray-500 font-medium">{idx + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <Select
                                                                value={row.pdamH_Id.toString()}
                                                                onValueChange={(v) => {
                                                                    const newRows = [...singleStudentRows];
                                                                    newRows[idx].pdamH_Id = v;
                                                                    setSingleStudentRows(newRows);
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-9 rounded-lg">
                                                                    <SelectValue placeholder="Select Head" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {heads.map(h => (
                                                                        <SelectItem key={h.pdamH_Id} value={h.pdamH_Id.toString()}>{h.pdamH_HeadName}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Input
                                                                type="number"
                                                                value={row.PDAEH_Amount}
                                                                onChange={(e) => {
                                                                    const newRows = [...singleStudentRows];
                                                                    newRows[idx].PDAEH_Amount = e.target.value;
                                                                    setSingleStudentRows(newRows);
                                                                }}
                                                                className="h-9 rounded-lg"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Input
                                                                value={row.PDAE_Remarks}
                                                                onChange={(e) => {
                                                                    const newRows = [...singleStudentRows];
                                                                    newRows[idx].PDAE_Remarks = e.target.value;
                                                                    setSingleStudentRows(newRows);
                                                                }}
                                                                className="h-9 rounded-lg"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {singleStudentRows.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleRemoveRow(idx)}
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Bulk Mode Grid */}
                            {filterData === 'multiplestd' && bulkStudents.length > 0 && (
                                <div className="space-y-6 animate-in fade-in duration-700">
                                    <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-4">
                                        <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                            Bulk Application Tool
                                            <span className="text-xs font-normal text-blue-600">(Apply to selected students)</span>
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox checked={bulkApplyFlags.head} onCheckedChange={(v) => setBulkApplyFlags(p => ({ ...p, head: !!v }))} />
                                                    <Label className="text-xs">Head</Label>
                                                </div>
                                                <Select value={bulkCommon.headId} onValueChange={(v) => setBulkCommon(p => ({ ...p, headId: v }))}>
                                                    <SelectTrigger className="h-9 rounded-lg bg-white"><SelectValue placeholder="Head" /></SelectTrigger>
                                                    <SelectContent>{heads.map(h => <SelectItem key={h.pdamH_Id} value={h.pdamH_Id.toString()}>{h.pdamH_HeadName}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox checked={bulkApplyFlags.amount} onCheckedChange={(v) => setBulkApplyFlags(p => ({ ...p, amount: !!v }))} />
                                                    <Label className="text-xs">Amount</Label>
                                                </div>
                                                <Input type="number" placeholder="Amount" value={bulkCommon.amount} onChange={(e) => setBulkCommon(p => ({ ...p, amount: e.target.value }))} className="h-9 rounded-lg bg-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox checked={bulkApplyFlags.remarks} onCheckedChange={(v) => setBulkApplyFlags(p => ({ ...p, remarks: !!v }))} />
                                                    <Label className="text-xs">Remarks</Label>
                                                </div>
                                                <Input placeholder="Remarks" value={bulkCommon.remarks} onChange={(e) => setBulkCommon(p => ({ ...p, remarks: e.target.value }))} className="h-9 rounded-lg bg-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox checked={bulkApplyFlags.voucher} onCheckedChange={(v) => setBulkApplyFlags(p => ({ ...p, voucher: !!v }))} />
                                                    <Label className="text-xs">Voucher</Label>
                                                </div>
                                                <Input placeholder="Voucher" value={bulkCommon.voucher} onChange={(e) => setBulkCommon(p => ({ ...p, voucher: e.target.value }))} className="h-9 rounded-lg bg-white" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button type="button" onClick={handleBulkApply} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6">Apply</Button>
                                        </div>
                                    </div>

                                    <div className="overflow-auto border rounded-2xl">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 text-center">
                                                        <Checkbox checked={allSelected} onCheckedChange={(v) => {
                                                            setAllSelected(!!v);
                                                            setBulkStudents(prev => prev.map(s => ({ ...s, isSelected: !!v })));
                                                        }} />
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-bold">Student Name</th>
                                                    <th className="px-4 py-3 text-left font-bold">Class/Section</th>
                                                    <th className="px-4 py-3 text-left font-bold">Roll No</th>
                                                    <th className="px-4 py-3 text-left font-bold">Head</th>
                                                    <th className="px-4 py-3 text-left font-bold">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {bulkStudents.map((s, idx) => (
                                                    <tr key={s.amst_Id} className={cn("hover:bg-gray-50 transition-colors", s.isSelected && "bg-blue-50/30")}>
                                                        <td className="px-4 py-3 text-center">
                                                            <Checkbox checked={s.isSelected} onCheckedChange={(v) => {
                                                                const newArr = [...bulkStudents];
                                                                newArr[idx].isSelected = !!v;
                                                                setBulkStudents(newArr);
                                                                setAllSelected(newArr.every(x => x.isSelected));
                                                            }} />
                                                        </td>
                                                        <td className="px-4 py-3 font-medium">{s.amsT_FirstName} {s.amsT_LastName}</td>
                                                        <td className="px-4 py-3 text-xs text-gray-500">{s.asmcL_Classname} / {s.asmc_sectionname}</td>
                                                        <td className="px-4 py-3">{s.amaY_RollNo}</td>
                                                        <td className="px-4 py-3">
                                                            <Select value={s.pdamH_Id.toString()} onValueChange={(v) => {
                                                                const newArr = [...bulkStudents];
                                                                newArr[idx].pdamH_Id = v;
                                                                setBulkStudents(newArr);
                                                            }}>
                                                                <SelectTrigger className="h-8 text-xs rounded-md w-32"><SelectValue placeholder="Head" /></SelectTrigger>
                                                                <SelectContent>{heads.map(h => <SelectItem key={h.pdamH_Id} value={h.pdamH_Id.toString()}>{h.pdamH_HeadName}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Input type="number" value={s.PDAEH_Amount} onChange={(e) => {
                                                                const newArr = [...bulkStudents];
                                                                newArr[idx].PDAEH_Amount = e.target.value;
                                                                setBulkStudents(newArr);
                                                            }} className="h-8 text-xs rounded-md w-24" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex justify-center gap-6 pt-6 border-t">
                                <Button
                                    type="submit"
                                    className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-sm"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEdit ? 'Update' : 'Save'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                    className="h-10 px-6 rounded-xl border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-all hover:scale-105 active:scale-95 text-sm"
                                >
                                    <XCircle className="mr-2 h-4 w-4 text-gray-400" />
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
