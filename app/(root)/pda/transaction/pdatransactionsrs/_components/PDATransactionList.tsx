'use client';

import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Eye,
    Pencil,
    Trash2,
    Printer,
    Download,
    XCircle,
    Calendar as CalendarIcon
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { format } from 'date-fns';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    searchTransactions,
    deletePDATransaction,
    deleteMultiplePDATransactions,
    getHeadDetails
} from '@/server/pda/transaction/pdatransactionsrs';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/extension/field';

interface PDATransactionListProps {
    transactions: any[];
    academicYearId: number;
    onEdit: (id: number, amstId: number) => void;
    onRefresh: () => void;
    roleName?: string;
}

export default function PDATransactionList({
    transactions: initialTransactions,
    academicYearId,
    onEdit,
    onRefresh,
    roleName
}: PDATransactionListProps) {
    const [searchType, setSearchType] = useState('');
    const [searchText, setSearchText] = useState('');
    const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
    const [searchAmount, setSearchAmount] = useState('');

    const [transactions, setTransactions] = useState(initialTransactions);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [viewingHeads, setViewingHeads] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchType) return toast.error('Select search field');
        setLoading(true);
        try {
            const data: any = {
                searchType,
                ASMAY_Id: academicYearId
            };
            if (searchType === '4') data.searchdate = searchDate ? format(searchDate, 'yyyy-MM-dd') : '';
            else if (searchType === '5') data.searchnumber = Number(searchAmount);
            else data.searchtext = searchText;

            const response = await searchTransactions(data);
            if (response.success && response.data?.searcharray?.$values) {
                setTransactions(response.data.searcharray.$values);
                if (response.data.searcharray.$values.length === 0) toast.info('No records found');
            }
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            const response = await deletePDATransaction({ PDAE_ID: id });
            if (response.success) {
                toast.success('Record deleted');
                onRefresh();
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} records?`)) return;
        try {
            const response = await deleteMultiplePDATransactions({ PDAE_Ids: selectedIds });
            if (response.success) {
                toast.success('Records deleted');
                setSelectedIds([]);
                onRefresh();
            }
        } catch (error) {
            toast.error('Bulk delete failed');
        }
    };

    const handleViewHeads = async (id: number) => {
        try {
            const response = await getHeadDetails({ PDAE_ID: id });
            if (response.success && response.data?.pdaheadlist?.$values) {
                setViewingHeads(response.data.pdaheadlist.$values);
            }
        } catch (error) {
            toast.error('Failed to load details');
        }
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
            'Student Name': `${t.amsT_FirstName} ${t.amsT_LastName}`,
            'Class': t.classname,
            'Section': t.sectionname,
            'Adm No': t.amsT_AdmNo,
            'Transaction No': t.transactionno,
            'Voucher No': t.voucherno,
            'Date': format(new Date(t.pdaE_Date), 'dd-MM-yyyy'),
            'Mode': t.pdaR_ModeOfPayment,
            'Amount': t.pdaE_TotAmount
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
        XLSX.writeFile(workbook, "PDA_Transactions.xlsx");
    };

    const totalAmount = transactions.reduce((sum, t) => sum + (t.pdaE_TotAmount || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="border-none shadow-sm bg-gray-50/30">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-700">Search Field</Label>
                            <Select value={searchType} onValueChange={setSearchType}>
                                <SelectTrigger className="h-11 rounded-xl bg-white">
                                    <SelectValue placeholder="Select Field" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="0">Student Name</SelectItem>
                                    <SelectItem value="1">Class Name</SelectItem>
                                    <SelectItem value="6">Section Name</SelectItem>
                                    <SelectItem value="2">Adm No.</SelectItem>
                                    <SelectItem value="3">Transaction No.</SelectItem>
                                    <SelectItem value="4">Transaction Date</SelectItem>
                                    <SelectItem value="7">Transaction Mode</SelectItem>
                                    <SelectItem value="8">Voucher No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-700">Search Value</Label>
                            {searchType === '4' ? (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full h-11 justify-start text-left font-normal rounded-xl bg-white border-gray-200">
                                            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                            {searchDate ? format(searchDate, "dd-MM-yyyy") : <span>Pick date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                        <Calendar mode="single" selected={searchDate} onSelect={setSearchDate} />
                                    </PopoverContent>
                                </Popover>
                            ) : searchType === '5' ? (
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={searchAmount}
                                    onChange={(e) => setSearchAmount(e.target.value)}
                                    className="h-11 rounded-xl bg-white border-gray-200"
                                />
                            ) : (
                                <Input
                                    placeholder="Enter search text..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="h-11 rounded-xl bg-white border-gray-200"
                                />
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleSearch}
                                disabled={loading}
                                className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-md hover:scale-105 active:scale-95 transition-all"
                            >
                                <Search className="mr-2 h-4 w-4" />
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => { setSearchType(''); setSearchText(''); setTransactions(initialTransactions); }}
                                className="h-11 px-4 rounded-xl bg-white border-gray-200 hover:bg-gray-50"
                            >
                                <XCircle className="h-4 w-4 text-gray-400" />
                            </Button>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                                className="h-11 px-6 rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm transition-all hover:scale-105 active:scale-95"
                            >
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                            <Button
                                variant="outline"
                                onClick={exportToExcel}
                                className="h-11 px-6 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 shadow-sm transition-all hover:scale-105 active:scale-95"
                            >
                                <Download className="mr-2 h-4 w-4" /> Excel
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-12 text-center">
                                    <Checkbox
                                        checked={selectedIds.length === transactions.length && transactions.length > 0}
                                        onCheckedChange={(v) => setSelectedIds(!!v ? transactions.map(t => t.pdaE_ID) : [])}
                                    />
                                </TableHead>
                                <TableHead className="w-12 text-center font-bold">#</TableHead>
                                <TableHead className="font-bold">Student Name</TableHead>
                                <TableHead className="font-bold">Class / Section</TableHead>
                                <TableHead className="font-bold">Adm No</TableHead>
                                <TableHead className="font-bold">Trans No</TableHead>
                                <TableHead className="font-bold">Voucher No</TableHead>
                                <TableHead className="text-right font-bold">Amount</TableHead>
                                <TableHead className="text-center font-bold">Date</TableHead>
                                <TableHead className="text-center font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((t, idx) => (
                                <TableRow key={t.pdaE_ID} className="hover:bg-gray-50/50 transition-colors group">
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={selectedIds.includes(t.pdaE_ID)}
                                            onCheckedChange={(v) => setSelectedIds(p => !!v ? [...p, t.pdaE_ID] : p.filter(id => id !== t.pdaE_ID))}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-gray-400">{idx + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{t.amsT_FirstName} {t.amsT_LastName}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{t.pdaR_ModeOfPayment}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500 font-medium">{t.classname} <span className="mx-1 text-gray-300">|</span> {t.sectionname}</TableCell>
                                    <TableCell className="font-mono text-xs text-indigo-600">{t.amsT_AdmNo}</TableCell>
                                    <TableCell className="text-[11px] text-gray-600 font-medium">{t.transactionno}</TableCell>
                                    <TableCell className="text-xs text-gray-500">{t.voucherno}</TableCell>
                                    <TableCell className="text-right font-bold text-primary">₹{t.pdaE_TotAmount?.toLocaleString()}</TableCell>
                                    <TableCell className="text-center text-[11px] font-medium text-gray-500">{format(new Date(t.pdaE_Date), 'dd-MM-yyyy')}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewHeads(t.pdaE_ID)} title="View Details" className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(t.pdaE_ID, t.amst_Id)} title="Edit" className="h-9 w-9 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(t.pdaE_ID)} title="Delete" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-40 text-center text-gray-400 italic">No transactions found matching your criteria</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {transactions.length > 0 && (
                    <div className="bg-gray-50/80 p-6 flex justify-between items-center border-t border-gray-100">
                        <div className="text-sm font-medium text-gray-500">Showing {transactions.length} transactions</div>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm">Total Amount:</span>
                            <span className="text-2xl font-black text-primary">₹{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>

            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 animate-in slide-in-from-bottom-10 duration-500 z-50">
                    <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        className="h-14 px-12 rounded-2xl shadow-2xl shadow-red-200 border-4 border-white hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Trash2 className="h-5 w-5" />
                        <span className="font-bold">Delete {selectedIds.length} Selected Records</span>
                    </Button>
                </div>
            )}

            {/* View Modal */}
            <Dialog open={!!viewingHeads} onOpenChange={() => setViewingHeads(null)}>
                <DialogContent className="max-w-2xl rounded-[2rem] p-10 border-none shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Eye size={160} />
                    </div>
                    <DialogHeader className="mb-6 relative z-10">
                        <DialogTitle className="text-2xl font-black text-gray-800 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Eye size={20} />
                            </div>
                            Head Breakdown
                        </DialogTitle>
                    </DialogHeader>
                    <div className="relative z-10 bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/80">
                                <TableRow>
                                    <TableHead className="w-16 text-center font-bold">#</TableHead>
                                    <TableHead className="font-bold">Head Name</TableHead>
                                    <TableHead className="text-right font-bold pr-8">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {viewingHeads?.map((h, i) => (
                                    <TableRow key={i} className="hover:bg-white/50 transition-colors">
                                        <TableCell className="text-center font-medium text-gray-400">{i + 1}</TableCell>
                                        <TableCell className="font-bold text-gray-700">{h.PDAMH_HeadName}</TableCell>
                                        <TableCell className="text-right font-black text-primary pr-8">₹{h.pdaeH_Amount?.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-8 flex justify-end relative z-10">
                        <Button
                            onClick={() => setViewingHeads(null)}
                            className="rounded-xl px-10 h-11 bg-gray-900 hover:bg-black transition-all"
                        >
                            Close Details
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
