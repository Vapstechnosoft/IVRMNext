'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    RotateCcw,
    PlusCircle,
    MinusCircle,
    FileSpreadsheet,
    Printer,
    Mail,
    Phone,
    MapPin,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useAlumniSearchDropdownData, usePerformAlumniSearch } from '@/hooks/alumni/useAlumniSearch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import type { IAlumniSearchResultItem, IAlumniAcademicYear, IAlumniClass } from '@/types/alumni/alumni-search';


const FIELD_OPTIONS = [
    { value: "StudentName", name: "Alumni Name" },
    { value: "ALMST_MobileNo", name: "MobileNo" },
    { value: "ALMST_emailId", name: "Email id" },
    { value: "IVRMMC_CountryName", name: "Country" },
    { value: "IVRMMS_Name", name: "State" },
    { value: "ALMST_PerCity", name: "City" },
    { value: "ALSPR_Designation", name: "Profession" },
    { value: "ALMST_BloodGroup", name: "Blood Group" },
    { value: "ALMST_FatherName", name: "Father Name" },
    { value: "ALMST_FullAddess", name: "FullAddess" },
    { value: "ASMCL_Id_Join", name: "Class Joined" },
    { value: "ASMCL_Id_Left", name: "Class Left" },
    { value: "ASMAY_Id_Join", name: "Year Joined" },
    { value: "ASMAY_Id_Left", name: "Year Left" },
    { value: "ALMST_MembershipId", name: "Membership ID" },
    { value: "ALMMC_MembershipCategory", name: "Membership Category" },
];

const getOperators = (field: string) => {
    if (['ASMCL_Id_Join', 'ASMCL_Id_Left', 'ASMAY_Id_Join', 'ASMAY_Id_Left'].includes(field)) {
        return [
            { value: "=", name: "Equal to" },
            { value: "!=", name: "Not Equal to" },
        ];
    }
    return [
        { value: "=", name: "Equal to" },
        { value: "!=", name: "Not Equal to" },
        { value: "like", name: "Like" },
    ];
};

const CONDITION_OPTIONS = [

    { value: "AND", name: "AND" },
    { value: "OR", name: "OR" },
];

interface FilterRow {
    field: string;
    operator: string;
    value: string;
    condition: string;
}

export default function AlumniSearchPage() {
    // Queries & Mutations
    const { data: dropdownData, isLoading: isDropdownLoading } = useAlumniSearchDropdownData();
    const searchMutation = usePerformAlumniSearch();

    // UI States
    const [emailChecked, setEmailChecked] = useState(true);
    const [phoneChecked, setPhoneChecked] = useState(true);
    const [filters, setFilters] = useState<FilterRow[]>([
        { field: '', operator: '', value: '', condition: '' }
    ]);
    const [searchResults, setSearchResults] = useState<IAlumniSearchResultItem[]>([]);
    const [showGrid, setShowGrid] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedRows, setSelectedRows] = useState<IAlumniSearchResultItem[]>([]);
    const [allSelected, setAllSelected] = useState(false);
    const [printMode, setPrintMode] = useState<'standard' | 'address'>('standard');


    // Initial Data
    const yearList = dropdownData?.data?.yearList || [];
    const classList = dropdownData?.data?.classList || [];


    // Handlers
    const addNewFilter = () => {
        setFilters([...filters, { field: '', operator: '', value: '', condition: '' }]);
    };

    const removeFilter = (index: number) => {
        if (filters.length > 1) {
            const newFilters = [...filters];
            newFilters.splice(index, 1);
            setFilters(newFilters);
        }
    };

    const updateFilter = (index: number, key: keyof FilterRow, val: string) => {
        const newFilters = [...filters];
        newFilters[index][key] = val;

        // Reset operator and value if field changes
        if (key === 'field') {
            newFilters[index].operator = '';
            newFilters[index].value = '';
        }

        setFilters(newFilters);
    };

    const handleSearch = async () => {
        // Validation
        const isValid = filters.every((f, i) => {
            if (!f.field || !f.operator || !f.value) return false;
            if (i < filters.length - 1 && !f.condition) return false;
            return true;
        });

        if (!isValid) {
            toast.error("Please fill all required filter fields");
            return;
        }

        try {
            // Updated payload structure as per user request
            const payload = {
                field: filters.map(f => f.field),
                operator: filters.map(f => f.operator),
                value: filters.map(f => f.value),
                condition: filters.map(f => f.condition).filter(c => c !== '')
            };


            const res = await searchMutation.mutateAsync(payload);

            let resultData: IAlumniSearchResultItem[] = [];
            if (Array.isArray(res.data)) {
                resultData = res.data;
            } else if (res.data && 'searchResult' in res.data && Array.isArray(res.data.searchResult)) {
                resultData = res.data.searchResult;
            }

            if (resultData.length > 0) {
                setSearchResults(resultData);
                setShowGrid(true);
                setSelectedRows([]);
                setAllSelected(false);
            } else {
                toast.error(res?.message || "No Records Found!");
                setShowGrid(false);
            }

        } catch (error) {
            toast.error("Failed to perform search");
        }
    };

    const handleClear = () => {
        setFilters([{ field: '', operator: '', value: '', condition: '' }]);
        setSearchResults([]);
        setShowGrid(false);
        setSearchValue('');
        setSelectedRows([]);
        setAllSelected(false);
    };

    const toggleSelectAll = (checked: boolean) => {
        setAllSelected(checked);
        if (checked) {
            setSelectedRows([...filteredResults]);
        } else {
            setSelectedRows([]);
        }
    };

    const toggleRowSelection = (row: IAlumniSearchResultItem) => {
        const isSelected = selectedRows.some(r =>
            (row.almst_id && r.almst_id === row.almst_id) ||
            (row.amst_admno && r.amst_admno === row.amst_admno)
        );

        if (isSelected) {
            setSelectedRows(selectedRows.filter(r =>
                (row.almst_id ? r.almst_id !== row.almst_id : r.amst_admno !== row.amst_admno)
            ));
            setAllSelected(false);
        } else {
            setSelectedRows([...selectedRows, row]);
            if (selectedRows.length + 1 === filteredResults.length) {
                setAllSelected(true);
            }
        }
    };

    // Filter results based on search bar
    const filteredResults = useMemo(() => {
        if (!searchValue) return searchResults;
        return searchResults.filter(r =>
            Object.values(r).some(val =>
                String(val).toLowerCase().includes(searchValue.toLowerCase())
            )
        );
    }, [searchResults, searchValue]);

    // Export to Excel
    const exportToExcel = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select records to export");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(selectedRows.map((r, i) => ({
            "SL NO": i + 1,
            "Alumni Name": r.studentname || r.amsT_FirstName || 'N/A',
            "Reg. No": r.amst_registrationno || 'N/A',
            "Adm. No": r.amst_admno || 'N/A',
            "DOB": r.amst_dob ? new Date(r.amst_dob).toLocaleDateString() : (r.amsT_DOB || 'N/A'),
            "Mobile No": r.amst_mobileno || r.amsT_MobileNo || 'N/A',
            "Email Id": r.amst_emailid || r.amsT_emailId || 'N/A',
            "Class": r.asmcl_classname || r.ALMMC_MembershipCategory || 'N/A',
            "Joined Year": r.ASMAY_Id_Join || 'N/A',
            "Left Year": r.ASMAY_Id_Left || 'N/A',
            "Member Id": r.ALMST_MembershipId || 'N/A',
            "Profession": r.ALSPR_Designation || 'N/A',
            "City": r.ALMST_ConCity || 'N/A',
            "Full Address": r.ALMST_FullAddess || 'N/A'
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Alumni Search Results");
        XLSX.writeFile(workbook, "Alumni_Search_Report.xlsx");
    };

    const handlePrint = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select records to print");
            return;
        }
        setPrintMode('standard');
        // Small delay to ensure state update and DOM rendering
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const handleAddressBookPrint = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select records for address book");
            return;
        }
        setPrintMode('address');
        setTimeout(() => {
            window.print();
        }, 300);
    };


    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 print:bg-white print:p-0 print:min-h-0">
            <CollapsibleSection
                title="Alumni Search"
                description="Custom search with multiple criteria and reporting"
                defaultOpen={true}
                className="shadow-xl border-none bg-white rounded-2xl overflow-hidden print:hidden"
            >
                <div className="p-6 space-y-6">
                    {/* Channel Selection */}
                    <div className="flex justify-center">
                        <Card className="bg-slate-50/50 border-dashed border-2 border-slate-200 w-full max-w-md">
                            <CardContent className="p-4 flex justify-around items-center">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="email-check"
                                        checked={emailChecked}
                                        onCheckedChange={(c) => setEmailChecked(!!c)}
                                        className="h-5 w-5"
                                    />
                                    <Label htmlFor="email-check" className="text-sm font-semibold flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-blue-500" /> Email
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="phone-check"
                                        checked={phoneChecked}
                                        onCheckedChange={(c) => setPhoneChecked(!!c)}
                                        className="h-5 w-5"
                                    />
                                    <Label htmlFor="phone-check" className="text-sm font-semibold flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-green-500" /> Phone No.
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Dynamic Filter Table */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-slate-800">
                                <TableRow>
                                    <TableHead className="text-white font-bold">Field <span className="text-red-400">*</span></TableHead>
                                    <TableHead className="text-white font-bold">Like <span className="text-red-400">*</span></TableHead>
                                    <TableHead className="text-white font-bold">Value <span className="text-red-400">*</span></TableHead>
                                    <TableHead className="text-white font-bold">Condition</TableHead>
                                    <TableHead className="text-white font-bold text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filters.map((row, idx) => (
                                    <TableRow key={idx} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="w-[200px]">
                                            <Select value={row.field} onValueChange={(v) => updateFilter(idx, 'field', v)}>
                                                <SelectTrigger className="bg-white border-slate-300">
                                                    <SelectValue placeholder="--Select--" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FIELD_OPTIONS.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>{opt.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="w-[180px]">
                                            <Select value={row.operator} onValueChange={(v) => updateFilter(idx, 'operator', v)}>
                                                <SelectTrigger className="bg-white border-slate-300">
                                                    <SelectValue placeholder="--Select--" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getOperators(row.field).map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>{opt.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>

                                        <TableCell>
                                            {/* Dynamic Inputs based on field */}
                                            {row.field === 'ASMAY_Id_Join' || row.field === 'ASMAY_Id_Left' ? (
                                                <Select value={row.value} onValueChange={(v) => updateFilter(idx, 'value', v)}>
                                                    <SelectTrigger className="bg-white border-slate-300">
                                                        <SelectValue placeholder="--Select Year--" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">--All Year--</SelectItem>
                                                        {yearList.map((y: IAlumniAcademicYear) => (
                                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>
                                                        ))}

                                                    </SelectContent>
                                                </Select>
                                            ) : row.field === 'ASMCL_Id_Join' || row.field === 'ASMCL_Id_Left' ? (
                                                <Select value={row.value} onValueChange={(v) => updateFilter(idx, 'value', v)}>
                                                    <SelectTrigger className="bg-white border-slate-300">
                                                        <SelectValue placeholder="--Select Class--" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">--All Class--</SelectItem>
                                                        {classList.map((c: IAlumniClass) => (
                                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>{c.asmcL_ClassName}</SelectItem>
                                                        ))}

                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    className="bg-white border-slate-300"
                                                    placeholder="enter value"
                                                    value={row.value}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        // Basic allow-pattern implementation
                                                        if (row.field === 'ALMST_AadharNo' || row.field === 'PASR_Age') {
                                                            if (/^\d*$/.test(val)) updateFilter(idx, 'value', val);
                                                        } else {
                                                            updateFilter(idx, 'value', val);
                                                        }
                                                    }}
                                                    onPaste={(e) => e.preventDefault()}
                                                    maxLength={row.field === 'ALMST_AadharNo' ? 12 : row.field === 'PASR_Age' ? 2 : 50}
                                                />

                                            )}
                                        </TableCell>
                                        <TableCell className="w-[150px]">
                                            {idx < filters.length - 1 && (
                                                <Select value={row.condition} onValueChange={(v) => updateFilter(idx, 'condition', v)}>
                                                    <SelectTrigger className="bg-white border-slate-300">
                                                        <SelectValue placeholder="--Select--" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CONDITION_OPTIONS.map(opt => (
                                                            <SelectItem key={opt.value} value={opt.value}>{opt.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={addNewFilter}
                                                >
                                                    <PlusCircle className="h-5 w-5" />
                                                </Button>
                                                {idx > 0 && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => removeFilter(idx)}
                                                    >
                                                        <MinusCircle className="h-5 w-5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100">
                        <Button
                            className="min-w-[140px] bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                            onClick={handleSearch}
                            disabled={searchMutation.isPending}
                        >
                            {searchMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            SEARCH
                        </Button>
                        <Button variant="outline" className="min-w-[140px] border-slate-300" onClick={handleClear}>
                            <RotateCcw className="mr-2 h-4 w-4" /> CLEAR
                        </Button>
                        {showGrid && (
                            <>
                                <Button variant="secondary" className="min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white" onClick={exportToExcel}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> EXPORT
                                </Button>
                                <Button variant="secondary" className="min-w-[140px] bg-slate-700 hover:bg-slate-800 text-white" onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" /> PRINT
                                </Button>
                                <Button variant="secondary" className="min-w-[140px] bg-orange-500 hover:bg-orange-600 text-white" onClick={handleAddressBookPrint}>
                                    <MapPin className="mr-2 h-4 w-4" /> ADDRESS BOOK
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CollapsibleSection>

            {/* Results Grid */}
            {showGrid && (
                <Card className="shadow-xl border-none rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-700 print:hidden">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-bold text-slate-800">Search Results</h3>
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold px-3 py-1">
                                    Total: {searchResults.length}
                                </Badge>
                                {selectedRows.length > 0 && (
                                    <Badge className="bg-emerald-500 text-white font-bold px-3 py-1">
                                        Selected: {selectedRows.length}
                                    </Badge>
                                )}
                            </div>
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                    placeholder="Search in grid..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <ScrollArea className="h-[500px]">
                                <Table className="relative">
                                    <TableHeader className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                                        <TableRow>
                                            <TableHead className="w-12 text-center">
                                                <Checkbox
                                                    checked={allSelected}
                                                    onCheckedChange={(c) => toggleSelectAll(!!c)}
                                                />
                                            </TableHead>
                                            <TableHead className="w-16 font-bold text-slate-700">SL NO</TableHead>
                                            <TableHead className="font-bold text-slate-700 min-w-[150px]">Alumni Name</TableHead>
                                            <TableHead className="font-bold text-slate-700">Reg. No</TableHead>
                                            <TableHead className="font-bold text-slate-700">Adm. No</TableHead>
                                            <TableHead className="font-bold text-slate-700">DOB</TableHead>
                                            <TableHead className="font-bold text-slate-700">Mobile No</TableHead>
                                            <TableHead className="font-bold text-slate-700">Email Id</TableHead>
                                            <TableHead className="font-bold text-slate-700">Class</TableHead>
                                            <TableHead className="font-bold text-slate-700">Profession</TableHead>
                                            <TableHead className="font-bold text-slate-700">City</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredResults.map((row, idx) => {
                                            const rowKey = row.almst_id || row.amst_admno || `row-${idx}`;
                                            const isSelected = selectedRows.some(r => (row.almst_id && r.almst_id === row.almst_id) || (row.amst_admno && r.amst_admno === row.amst_admno));

                                            return (
                                                <TableRow
                                                    key={rowKey}
                                                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}
                                                >
                                                    <TableCell className="text-center">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleRowSelection(row)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-500">{idx + 1}</TableCell>
                                                    <TableCell className="font-bold text-slate-900">{row.studentname || row.amsT_FirstName}</TableCell>
                                                    <TableCell className="text-slate-600">{row.amst_registrationno || 'N/A'}</TableCell>
                                                    <TableCell className="text-slate-600 font-medium">{row.amst_admno || 'N/A'}</TableCell>
                                                    <TableCell className="text-slate-600">{row.amst_dob ? new Date(row.amst_dob).toLocaleDateString() : (row.amsT_DOB || 'N/A')}</TableCell>
                                                    <TableCell className="text-slate-600">{row.amst_mobileno || row.amsT_MobileNo || 'N/A'}</TableCell>
                                                    <TableCell className="text-slate-600">{row.amst_emailid || row.amsT_emailId || 'N/A'}</TableCell>
                                                    <TableCell className="text-slate-600">
                                                        <Badge variant="outline" className="bg-slate-50 text-[10px] uppercase font-bold">
                                                            {row.asmcl_classname || row.ALMMC_MembershipCategory || 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 italic">{row.ALSPR_Designation || 'N/A'}</TableCell>
                                                    <TableCell className="text-slate-600 font-semibold">{row.ALMST_ConCity || 'N/A'}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Print Templates (Only visible during print) */}
            <div className="print-only-container hidden print:block print:visible print:static w-full font-sans print:m-0 print:p-0" id="print-section">
                {/* Standard Table Print */}
                {printMode === 'standard' && (
                    <div className="print-section-standard w-full">
                        <div className="text-center mb-6">
                            <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 mb-1">Alumni Search Report</h1>
                            <div className="flex items-center justify-center gap-4 text-[10px] font-medium text-slate-500 italic">
                                <span>Generated: {new Date().toLocaleDateString()}</span>
                                <span>•</span>
                                <span>Total Records: {selectedRows.length}</span>
                            </div>
                        </div>
                        <table className="w-full border-collapse border-2 border-black">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="border border-black p-1.5 text-[9px] font-bold uppercase w-[30px]">SL</th>
                                    <th className="border border-black p-1.5 text-[9px] font-bold uppercase text-left min-w-[100px]">Alumni Name</th>
                                    <th className="border border-black p-1.5 text-[9px] font-bold uppercase w-[60px]">Reg. No</th>
                                    <th className="border border-black p-1.5 text-[9px] font-bold uppercase w-[50px]">Adm. No</th>
                                    <th className="border border-black p-1.5 text-[9px] font-bold uppercase w-[65px]">DOB</th>
                                    <th className="border border-black p-1.5 text-[9px] font-bold uppercase w-[75px]">Mobile</th>
                                    <th className="border border-black p-1.5 text-[9px] font-bold uppercase min-w-[80px]">Email</th>
                                    <th className="border border-black p-1.5 text-[9px] font-bold uppercase w-[50px]">Class</th>
                                    <th className="border border-black p-1.5 text-[9px] font-bold uppercase w-[70px]">Profession</th>
                                    <th className="border border-black p-1.5 text-[9px] font-bold uppercase min-w-[120px]">Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRows.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-black p-1.5 text-[9px] text-center font-medium">{idx + 1}</td>
                                        <td className="border border-black p-1.5 text-[9px] font-bold text-slate-900 uppercase">{row.studentname || row.amsT_FirstName}</td>
                                        <td className="border border-black p-1.5 text-[9px]">{row.amst_registrationno || 'N/A'}</td>
                                        <td className="border border-black p-1.5 text-[9px] font-medium">{row.amst_admno || 'N/A'}</td>
                                        <td className="border border-black p-1.5 text-[9px] whitespace-nowrap text-center">{row.amst_dob ? new Date(row.amst_dob).toLocaleDateString() : (row.amsT_DOB || 'N/A')}</td>
                                        <td className="border border-black p-1.5 text-[9px] font-mono text-center">{row.amst_mobileno || row.amsT_MobileNo || 'N/A'}</td>
                                        <td className="border border-black p-1.5 text-[9px] break-all">{row.amst_emailid || row.amsT_emailId || 'N/A'}</td>
                                        <td className="border border-black p-1.5 text-[9px] text-center font-medium uppercase">{row.asmcl_classname || row.ALMMC_MembershipCategory || 'N/A'}</td>
                                        <td className="border border-black p-1.5 text-[9px] text-center">{row.ALSPR_Designation || 'N/A'}</td>
                                        <td className="border border-black p-1.5 text-[8px] leading-tight font-medium text-slate-700">{row.ALMST_FullAddess || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Address Book Print Layout */}
                {printMode === 'address' && (
                    <div className="print-section-address grid grid-cols-2 gap-4 w-full">
                        {selectedRows.map((row, idx) => (
                            <div key={idx} className="border-2 border-black p-4 h-[180px] flex flex-col justify-between relative bg-white break-inside-avoid">
                                <div className="absolute top-1 right-2 text-[8px] font-mono text-slate-400">
                                    #{idx + 1}
                                </div>
                                <div>
                                    <div className="text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-tight">
                                        {row.ALMST_MembershipId || row.amst_admno || 'NO-ID'} • {row.ALMMC_MembershipCategory || 'ALUMNI'}
                                    </div>
                                    <div className="text-sm font-bold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-2">
                                        {row.studentname || row.amsT_FirstName}
                                    </div>
                                    <div className="text-[10px] text-slate-700 leading-snug font-medium min-h-[50px]">
                                        {row.ALMST_FullAddess || 'Address Not Available'}
                                        {(row.ALMST_District || row.ALMST_ConCity) && (
                                            <div className="mt-1">
                                                {[row.ALMST_ConCity, row.ALMST_District, row.ALMST_PerPincode].filter(Boolean).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-2 flex flex-col gap-0.5 border-t border-slate-100">
                                    {(row.amst_mobileno || row.amsT_MobileNo) && (
                                        <span className="text-[9px] font-bold text-slate-800 flex items-center gap-1">
                                            M: {row.amst_mobileno || row.amsT_MobileNo}
                                        </span>
                                    )}
                                    {(row.amst_emailid || row.amsT_emailId) && (
                                        <span className="text-[9px] font-medium text-slate-600 break-all">
                                            E: {row.amst_emailid || row.amsT_emailId}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait !important;
                        margin: 10mm !important;
                    }
                    html, body {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        visibility: hidden !important;
                        height: auto !important;
                        min-height: 0 !important;
                        width: 100% !important;
                    }
                    
                    #print-section, #print-section * {
                        visibility: visible !important;
                    }

                    #print-section {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 190mm !important; /* A4 (210mm) - 20mm margins */
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                    }

                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        page-break-inside: auto !important;
                    }
                    
                    th, td {
                        padding: 4px 6px !important;
                        border: 1px solid #000 !important;
                        word-break: break-word !important;
                        font-size: 8.5pt !important;
                        color: black !important;
                    }
                    
                    thead {
                        display: table-header-group !important;
                    }
                    
                    tr {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    .print-section-standard, .print-section-address {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    /* Avoid breaking address cards */
                    .print-section-address > div {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        margin-bottom: 10px;
                    }

                    * {
                        animation: none !important;
                        transition: none !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
