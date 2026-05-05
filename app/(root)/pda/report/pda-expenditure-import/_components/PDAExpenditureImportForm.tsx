'use client';

import React, { useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { IPDAExpenditureImportRow } from '@/types/pda/report/pda-expenditure-import';

interface PDAExpenditureImportFormProps {
    academicYears: { asmaY_Id: number; asmaY_Year: string }[];
    selectedAsmayId: number | null;
    setSelectedAsmayId: (id: number | null) => void;
    trnType: 'Debit' | 'Credit';
    setTrnType: (type: 'Debit' | 'Credit') => void;
    onImport: (data: IPDAExpenditureImportRow[]) => void;
}

export default function PDAExpenditureImportForm({
    academicYears,
    selectedAsmayId,
    setSelectedAsmayId,
    trnType,
    setTrnType,
    onImport
}: PDAExpenditureImportFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                        file.name.endsWith('.xlsx');

        if (!isExcel) {
            toast.error('Please select a valid Excel file (.xlsx)');
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFileName(null);
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = evt.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json<IPDAExpenditureImportRow>(worksheet);

                if (jsonData.length === 0) {
                    toast.error('Excel sheet is empty');
                    setFileName(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                // Basic structure check
                const requiredFields = ['RollNumber', 'Date', 'Amount', 'StudentName', 'Particulars', 'VoucherNo'];
                const firstRow = jsonData[0];
                const missingFields = requiredFields.filter(field => !(field in firstRow));

                if (missingFields.length > 0) {
                    toast.error(`Missing required columns: ${missingFields.join(', ')}`);
                    setFileName(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                onImport(jsonData);
            } catch (error) {
                console.error('Error parsing Excel:', error);
                toast.error('Failed to parse Excel file');
                setFileName(null);
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="space-y-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <p className="text-amber-800 text-sm font-medium">
                    Kindly select only one Excel sheet to import. Ensure the columns follow the required format: 
                    <span className="font-bold ml-1 italic">RollNumber, Date (DD/MM/YYYY), Amount, StudentName, Particulars, VoucherNo</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Transaction Type</Label>
                    <RadioGroup 
                        value={trnType} 
                        onValueChange={(val) => setTrnType(val as 'Debit' | 'Credit')}
                        className="flex gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                        <div className="flex items-center space-x-2 cursor-pointer group">
                            <RadioGroupItem value="Debit" id="debit" className="border-primary text-primary" />
                            <Label htmlFor="debit" className="font-medium cursor-pointer group-hover:text-primary transition-colors">
                                Deduct from PDA (Debit)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 cursor-pointer group">
                            <RadioGroupItem value="Credit" id="credit" className="border-primary text-primary" />
                            <Label htmlFor="credit" className="font-medium cursor-pointer group-hover:text-primary transition-colors">
                                Credit
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="academic-year" className="text-sm font-semibold text-gray-700">Academic Year</Label>
                    <Select 
                        value={selectedAsmayId?.toString()} 
                        onValueChange={(val) => setSelectedAsmayId(Number(val))}
                    >
                        <SelectTrigger className="h-12 border-gray-200 rounded-xl shadow-sm hover:border-primary transition-all">
                            <SelectValue placeholder="Select Academic Year" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
                            {academicYears.map((year) => (
                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()} className="cursor-pointer">
                                    {year.asmaY_Year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Choose Excel File</Label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
                        ${fileName ? 'border-green-400 bg-green-50/30' : 'border-gray-200 hover:border-primary hover:bg-primary/5'}
                    `}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx"
                        className="hidden"
                    />
                    {fileName ? (
                        <>
                            <div className="bg-green-100 p-2 rounded-full mb-2">
                                <FileCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="text-sm font-semibold text-green-700">{fileName}</span>
                            <span className="text-xs text-green-600 mt-1">Click to change file</span>
                        </>
                    ) : (
                        <>
                            <div className="bg-primary/10 p-2 rounded-full mb-2">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-gray-600">Click to upload Excel file</span>
                            <span className="text-xs text-gray-400 mt-1">Only .xlsx files are supported</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
